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
  SquarePen,
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
    >

      <div
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
          style={{ display: isCameraStarted ? 'block' : 'none' }}
        />
        <canvas
          ref={canvasRef}
          style={{ display: isCameraStarted ? 'block' : 'none' }}
        />

        {!isCameraStarted && (
          <Empty className="my-4 border-2">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Camera />
              </EmptyMedia>
              <EmptyTitle className="text-xl">Face AI Scanner</EmptyTitle>
              <EmptyDescription>
                Zoom and pan across the class, pointing the camera towards students' faces.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex w-full max-w-[320px] gap-3 sm:flex-row mt-4">
                <Button 
                  onClick={() => setIsCameraStarted(true)} 
                  size={isMobile ? "default" : "lg"}
                  className="flex-1"
                >
                  <Camera data-icon="inline-start" />
                  Start Camera
                </Button>
                <Button 
                  onClick={onComplete} 
                  variant="outline" 
                  size={isMobile ? "default" : "lg"}
                  className="flex-1"
                >
                  <SquarePen data-icon="inline-start" />
                  Skip to Manual
                </Button>
              </div>
            </EmptyContent>
          </Empty>
        )}


        <div style={{ display: isCameraStarted ? 'block' : 'none' }}>
          {activeMatches.map((match) => (
            <div
              key={match.id}
              style={{
                left: `${(match.box.x / (videoRef.current?.videoWidth || 1)) * 100}%`,
                top: `${(match.box.y / (videoRef.current?.videoHeight || 1)) * 100}%`,
                width: `${(match.box.width / (videoRef.current?.videoWidth || 1)) * 100}%`,
              }}
            >
              <div>
                <div>

                  <Avatar>
                    {match.avatar && <AvatarImage src={match.avatar} />}
                    <AvatarFallback>
                      {match.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <span>
                      {match.name}
                    </span>
                    <div>
                      <div />
                      <span>
                        Recognized
                      </span>
                    </div>
                  </div>
                </div>
                <div />
              </div>
            </div>
          ))}
        </div>


        <div>
          <div>
            <div>
              <div />
              <span>
                Biometric Live
              </span>
            </div>

            <div>
              <Button
                variant="secondary"
                size="icon"
                onClick={() =>
                  setFacingMode((f) => (f === "user" ? "environment" : "user"))
                }
              >
                <RefreshCw />
              </Button>

              <Button
                variant="secondary"
                size="icon"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize2 />
                ) : (
                  <Maximize2 />
                )}
              </Button>
            </div>
          </div>


          <div>
            {capabilities?.zoom && (
              <div>
                Zoom {zoom.toFixed(1)}x
              </div>
            )}
            <div>
              <div>
                <span>
                  {markedCount}
                  <span>
                    /{students.length}
                  </span>
                </span>
                <span>
                  Marked Present
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={onComplete}
                  size={isMobile ? "icon" : "default"}
                  title="Skip to Manual"
                >
                  <SquarePen data-icon={!isMobile ? "inline-start" : undefined} />
                  {!isMobile && "Skip to Manual"}
                </Button>
                <Button
                  onClick={onComplete}
                >
                  Finish Scan <ChevronRight data-icon="inline-end" />
                </Button>
              </div>

            </div>
          </div>
        </div>

        {loading && (
          <div>
            <div>
              <div>
                <div>
                  {!isDataSynced ? (
                    <Database />
                  ) : (
                    <Cpu />
                  )}
                </div>
              </div>

              <div>
                <div>
                  <span>
                    {!isDataSynced
                      ? "Syncing Biometrics"
                      : "Calibrating Neural Net"}
                  </span>
                  <span>{initializationProgress}%</span>
                </div>
                <Progress
                  value={initializationProgress}
                />
              </div>


              <div>
                <p>
                  {!isDataSynced
                    ? "Downloading Class Profiles"
                    : "Biometric Engine Ready"}
                </p>
                <p>
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
