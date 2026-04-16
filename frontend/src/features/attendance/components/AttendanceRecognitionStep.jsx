import { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronRight,
  RefreshCw,
  Cpu,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const RECOGNITION_THRESHOLD = 0.6;

export default function RecognitionStep({
  students,
  profiles,
  attendanceState,
  onMarkPresent,
  onComplete,
  sessionData,
  modelsLoaded: globalModelsLoaded,
  faceApi: globalFaceApi,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const faceApiRef = useRef(globalFaceApi);
  const animFrameRef = useRef(null);

  const [facingMode, setFacingMode] = useState("environment");
  const [zoom, setZoom] = useState(1);
  const [capabilities, setCapabilities] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMatches, setActiveMatches] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDataSynced, setIsDataSynced] = useState(false);
  const [initializationProgress, setInitializationProgress] = useState(0);

  const labeledDescriptorsRef = useRef([]);
  const faceMatcherRef = useRef(null);
  const containerRef = useRef(null);
  const markedInLoopRef = useRef(new Set());
  const prevPinchDistRef = useRef(null);

  const markedCount = Object.values(attendanceState || {}).filter(
    (item) => item.status === "present",
  ).length;

  // 1. Progress Calculation
  useEffect(() => {
    let p = 0;
    if (globalModelsLoaded) p += 50;
    if (isDataSynced) p += 50;
    setInitializationProgress(p);

    if (globalModelsLoaded && isDataSynced) {
      setTimeout(() => setLoading(false), 800); // Smooth transition
    }
  }, [globalModelsLoaded, isDataSynced]);

  // 1.5 Fullscreen & Camera Setup
  useEffect(() => {
    if (globalModelsLoaded) {
      faceApiRef.current = globalFaceApi;
      startCamera(facingMode);
    }
  }, [globalModelsLoaded]);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      stopCamera();
    };
  }, []);

  // Biometric Sync (Optimized: Re-builds pool as students are marked)
  useEffect(() => {
    if (!globalFaceApi || !profiles) return;

    const faceapi = globalFaceApi;
    const profileList = Object.values(profiles);

    if (profileList.length === 0) return;

    try {
      // Filter the matching pool: Only search for students who aren't already marked present
      const activeProfiles = profileList.filter((p) => {
        const record = attendanceState?.[p.userId];
        return record?.status !== "present";
      });

      const descriptors = activeProfiles
        .filter(
          (p) =>
            p.embedding &&
            (Array.isArray(p.embedding) || p.embedding instanceof Float32Array),
        )
        .filter((p) => p.embedding.length === 128)
        .map((p) => {
          const emb =
            p.embedding instanceof Float32Array
              ? p.embedding
              : new Float32Array(p.embedding);
          return new faceapi.LabeledFaceDescriptors(p.userId, [emb]);
        });

      labeledDescriptorsRef.current = descriptors;
      
      if (descriptors.length > 0) {
        faceMatcherRef.current = new faceapi.FaceMatcher(
          descriptors,
          RECOGNITION_THRESHOLD,
        );
        if (!isDataSynced) setIsDataSynced(true);
        console.log(`[Biometric] Pool updated: ${descriptors.length} identities remaining.`);
      } else {
        faceMatcherRef.current = null;
        if (!isDataSynced) setIsDataSynced(true);
      }
    } catch (err) {
      console.error("[Biometric] Sync Error:", err);
    }
  }, [profiles, globalFaceApi, attendanceState]);

  // Camera Logic
  async function startCamera(mode) {
    if (streamRef.current)
      streamRef.current.getTracks().forEach((t) => t.stop());

    const constraints = {
      video: {
        facingMode: mode,
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        const track = stream.getVideoTracks()[0];
        const caps = track.getCapabilities();
        if (caps.zoom) {
          setCapabilities(caps);
          setZoom(caps.zoom.min || 1);
        }
      }
      runTrackingLoop();
    } catch (err) {
      toast.error("Sensor Initialisation Failed");
    }
  }

  function stopCamera() {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current)
      streamRef.current.getTracks().forEach((t) => t.stop());
  }

  const applyZoom = async (val) => {
    if (!capabilities?.zoom || !streamRef.current) return;
    const { min, max } = capabilities.zoom;
    const clamped = Math.max(min, Math.min(max, val));
    const track = streamRef.current.getVideoTracks()[0];
    try {
      await track.applyConstraints({ advanced: [{ zoom: clamped }] });
      setZoom(clamped);
    } catch (err) {}
  };

  const handleTouchMove = (e) => {
    if (
      e.touches.length === 2 &&
      prevPinchDistRef.current &&
      capabilities?.zoom
    ) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY,
      );
      const delta = (dist - prevPinchDistRef.current) * 0.01;
      applyZoom(zoom + delta);
      prevPinchDistRef.current = dist;
    }
  };

  const runTrackingLoop = useCallback(() => {
    const detectAndMatch = async () => {
      if (!videoRef.current || videoRef.current.paused || !faceApiRef.current)
        return;

      try {
        const faceapi = faceApiRef.current;
        // High Accuracy Mode
        const options = new faceapi.TinyFaceDetectorOptions({
          inputSize: 416,
          scoreThreshold: 0.5,
        });

        const detections = await faceapi
          .detectAllFaces(videoRef.current, options)
          .withFaceLandmarks(true)
          .withFaceDescriptors();

        const vw = videoRef.current.videoWidth;
        const vh = videoRef.current.videoHeight;
        const displaySize = { width: vw, height: vh };

        if (!canvasRef.current || !videoRef.current) return;
        if (canvasRef.current.width !== vw)
          faceapi.matchDimensions(canvasRef.current, displaySize);

        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, vw, vh);

        const currentMatches = [];
        if (detections.length > 0) {
          const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize,
          );
          faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);

          if (faceMatcherRef.current) {
            resizedDetections.forEach((det) => {
              const bestMatch = faceMatcherRef.current.findBestMatch(
                det.descriptor,
              );
              if (bestMatch.label !== "unknown") {
                const profile = profiles[bestMatch.label];
                if (profile) {
                  currentMatches.push({
                    id: profile.userId,
                    name: profile.name,
                    avatar: profile.avatar,
                    box: det.detection.box,
                  });
                  if (!markedInLoopRef.current.has(profile.userId)) {
                    onMarkPresent(profile.userId, "face");
                    markedInLoopRef.current.add(profile.userId);
                    setTimeout(
                      () => markedInLoopRef.current.delete(profile.userId),
                      5000,
                    );
                  }
                }
              }
            });
          }
        }
        setActiveMatches(currentMatches);
      } catch (err) {}
      animFrameRef.current = requestAnimationFrame(() =>
        setTimeout(detectAndMatch, 150),
      );
    };
    detectAndMatch();
  }, [profiles, onMarkPresent]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement)
      containerRef.current.requestFullscreen().catch(() => {});
    else document.exitFullscreen();
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden flex flex-col bg-black lg:rounded-3xl"
    >
      <div
        className="relative flex-1 touch-none overflow-hidden"
        onTouchStart={(e) =>
          e.touches.length === 2 &&
          (prevPinchDistRef.current = Math.hypot(
            e.touches[0].pageX - e.touches[1].pageX,
            e.touches[0].pageY - e.touches[1].pageY,
          ))
        }
        onTouchMove={handleTouchMove}
        onTouchEnd={() => (prevPinchDistRef.current = null)}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10 opacity-60"
        />

        <div className="absolute inset-0 pointer-events-none z-20">
          {activeMatches.map((match) => (
            <div
              key={match.id}
              className="absolute transition-all duration-200"
              style={{
                left: `${(match.box.x / (videoRef.current?.videoWidth || 1)) * 100}%`,
                top: `${(match.box.y / (videoRef.current?.videoHeight || 1)) * 100}%`,
                width: `${(match.box.width / (videoRef.current?.videoWidth || 1)) * 100}%`,
              }}
            >
              <div className="relative -top-14 left-1/2 -translate-x-1/2 flex flex-col items-center animate-in zoom-in-75 duration-300">
                <div className="bg-background/80 backdrop-blur-xl border-2 border-primary rounded-2xl p-1.5 shadow-2xl flex items-center gap-2 min-w-[120px]">
                  <Avatar className="size-7 border-2 border-background shadow-sm shrink-0">
                    <AvatarImage src={match.avatar} className="object-cover" />
                    <AvatarFallback className="text-[10px] bg-primary/20 text-primary font-black">
                      {match.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 pr-1">
                    <span className="text-[10px] font-black text-foreground truncate uppercase leading-none mb-1">
                      {match.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="size-1 bg-primary rounded-full" />
                      <span className="text-[8px] font-black text-primary uppercase">
                        Recognized
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-0.5 h-4 bg-primary/40 mt-1" />
              </div>
            </div>
          ))}
        </div>

        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-30">
          <div className="flex justify-between items-start pointer-events-auto">
            <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
              <div className="size-1.5 bg-primary rounded-full" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/90">
                Biometric Live
              </span>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="icon"
                className="size-11 rounded-2xl bg-black/40 border border-white/10 text-white"
                onClick={() =>
                  setFacingMode((f) => (f === "user" ? "environment" : "user"))
                }
              >
                <RefreshCw className="size-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="size-11 rounded-2xl bg-black/40 border border-white/10 text-white"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize2 className="size-5" />
                ) : (
                  <Maximize2 className="size-5" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-6 items-center">
            {capabilities?.zoom && (
              <div className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-[9px] font-black text-white/60 uppercase tracking-widest">
                Zoom {zoom.toFixed(1)}x
              </div>
            )}
            <div className="w-full flex items-center justify-between pointer-events-auto">
              <div className="flex flex-col">
                <span className="text-3xl font-black text-white shadow-black drop-shadow-lg tabular-nums">
                  {markedCount}
                  <span className="text-xs opacity-40 ml-1">
                    /{students.length}
                  </span>
                </span>
                <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">
                  Marked Present
                </span>
              </div>
              <Button
                onClick={onComplete}
                className="rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-[0.2em] shadow-2xl bg-white text-black hover:bg-white/90 active:scale-95 transition-all"
              >
                Finish Scan <ChevronRight className="size-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50 p-12">
            <div className="w-full max-w-[280px] space-y-8 animate-in fade-in duration-700">
              <div className="flex justify-center mb-4">
                <div className="size-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  {!isDataSynced ? (
                    <Database className="size-8 text-primary" />
                  ) : (
                    <Cpu className="size-8 text-primary" />
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                  <span>
                    {!isDataSynced
                      ? "Syncing Biometrics"
                      : "Calibrating Neural Net"}
                  </span>
                  <span>{initializationProgress}%</span>
                </div>
                <Progress
                  value={initializationProgress}
                  className="h-1.5 bg-white/5"
                />
              </div>

              <div className="text-center space-y-1.5 pt-4">
                <p className="text-[11px] font-black text-white uppercase tracking-[0.3em]">
                  {!isDataSynced
                    ? "Downloading Class Profiles"
                    : "Biometric Engine Ready"}
                </p>
                <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                  {!isDataSynced
                    ? "Establishing Secure Data Link..."
                    : "Sensor Calibration Complete"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
