import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronRight,
  RefreshCw,
  Cpu,
  Database,
  SquarePen,
  Scan,
  Users,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty";
import FaceScanningHUD from "@/components/FaceScanningHUD";
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
  const isMobile = useIsMobile();

  const [facingMode, setFacingMode] = useState("environment");
  const [zoom, setZoom] = useState(1);
  const [capabilities, setCapabilities] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMatches, setActiveMatches] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDataSynced, setIsDataSynced] = useState(false);
  const [isCameraStarted, setIsCameraStarted] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
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
      setLoading(false);
    }
  }, [globalModelsLoaded, isDataSynced]);

  // 1.5 Fullscreen & Camera Setup
  useEffect(() => {
    if (globalModelsLoaded && isCameraStarted) {
      faceApiRef.current = globalFaceApi;
      startCamera(facingMode);
    }
  }, [globalModelsLoaded, isCameraStarted, facingMode]);

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
        console.log(
          `[Biometric] Pool updated: ${descriptors.length} identities remaining.`,
        );
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

    setIsCameraLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => resolve();
        });
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
    } finally {
      setIsCameraLoading(false);
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
      className={cn(
        "relative w-full overflow-hidden transition-all duration-500",
        isFullscreen ? "fixed inset-0 z-100" : "aspect-video rounded-3xl border border-border/40 shadow-2xl"
      )}
    >
      <div
        className="relative w-full h-full flex flex-col"
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
        <div className="w-full h-full flex flex-col">
          {!isCameraStarted ? (
            <div 
              key="empty"
              className="absolute inset-0 flex items-center justify-center p-6"
            >
              <Empty className="max-w-md border-none bg-transparent">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="bg-primary/10 text-primary mb-4">
                    <Camera className="" />
                  </EmptyMedia>
                  <EmptyTitle className="text-2xl font-bold text-white mb-1">Ready to Scan?</EmptyTitle>
                  <EmptyDescription className="text-zinc-400">
                    Point the camera towards students. The camera will automatically recognize and mark attendance in real-time.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <div className="flex flex-col sm:flex-row w-full gap-3 mt-6">
                    <Button 
                      onClick={() => {
                        setIsCameraStarted(true);
                        setIsCameraLoading(true);
                      }} 
                      size="lg"
                      className="flex-1 rounded-full h-12 bg-white text-black hover:bg-zinc-200"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Start Camera
                    </Button>
                    <Button 
                      onClick={onComplete} 
                      variant="outline" 
                      size="lg"
                      className="flex-1 rounded-full h-12 "
                    >
                      <SquarePen className="w-4 h-4 mr-2" />
                      Manual Entry
                    </Button>
                  </div>
                </EmptyContent>
              </Empty>
            </div>
          ) : (
            <div 
              key="camera"
              className="relative flex-1 flex flex-col overflow-hidden"
            >
              <div className="relative flex-1 overflow-hidden">
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover z-0"
                />
                
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none opacity-60 z-20"
                />

                {/* Detected Face Labels */}
                <div className="absolute inset-0 z-20 pointer-events-none">
                  <AnimatePresence>
                    {activeMatches.map((match) => (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, scale: 0.8, y: 0 }}
                        animate={{ opacity: 1, scale: 1, y: "-115%" }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute pointer-events-none flex flex-col items-center z-30"
                        style={{
                          left: `${(match.box.x / (videoRef.current?.videoWidth || 1)) * 100}%`,
                          top: `${(match.box.y / (videoRef.current?.videoHeight || 1)) * 100}%`,
                          width: `${(match.box.width / (videoRef.current?.videoWidth || 1)) * 100}%`,
                        }}
                      >
                        <div className="flex flex-col items-center">
                          <div className="p-0.5 rounded-full bg-white border-2 border-primary shadow-2xl">
                            <Avatar className="w-12 h-12 border-2 border-white">
                              {match.avatar && <AvatarImage src={match.avatar} />}
                              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                {match.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="mt-1 px-4 py-2 rounded-2xl bg-white border border-zinc-200 shadow-2xl flex flex-col items-center">
                            <p className="text-[11px] font-black text-zinc-900 whitespace-nowrap uppercase tracking-wider">{match.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                              <span className="text-[9px] text-green-600 font-bold uppercase tracking-tight">Present</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>



                {/* Overlays */}
                <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
                  {/* Live Badge */}
                  <div className="px-4 py-2 rounded-full border border-white/10 bg-zinc-950/40 backdrop-blur-md flex items-center gap-2 pointer-events-auto">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live</span>
                  </div>

                  <div className="flex gap-2 pointer-events-auto">
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-10 h-10 rounded-full border-white/10 bg-zinc-950/40 backdrop-blur-md text-white hover:bg-white/10"
                      onClick={() => setFacingMode((f) => (f === "user" ? "environment" : "user"))}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-10 h-10 rounded-full border-white/10 bg-zinc-950/40 backdrop-blur-md text-white hover:bg-white/10"
                      onClick={toggleFullscreen}
                    >
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Bottom Overlay */}
                <div className="absolute bottom-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
                  <div className="px-6 py-3 rounded-2xl border border-white/10 bg-zinc-950/40 backdrop-blur-md flex items-center gap-3 pointer-events-auto">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-white uppercase tracking-widest">
                      {markedCount} / {Object.keys(students || {}).length}
                    </span>
                  </div>

                  <Button
                    onClick={onComplete}
                    className="pointer-events-auto rounded-full px-8 h-12 bg-white text-black hover:bg-zinc-200 font-bold uppercase tracking-widest text-[10px] shadow-2xl"
                  >
                    Finish Scan
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Global Loading / Init State */}
        {(loading || isCameraLoading) && isCameraStarted && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-6 max-w-xs w-full px-6">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900/50 flex items-center justify-center border border-white/5">
                <Scan className="w-6 h-6 text-zinc-500" />
              </div>

              <div className="w-full space-y-4">
                <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white" 
                    style={{ width: `${initializationProgress}%` }}
                  />
                </div>
                
                <div className="text-center space-y-1">
                  <h3 className="text-sm font-medium text-white tracking-tight">
                    Initializing System
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Setting up face recognition sensor
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
