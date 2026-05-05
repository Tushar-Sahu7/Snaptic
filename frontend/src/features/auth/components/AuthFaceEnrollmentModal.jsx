import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Loader2,
  CheckCircle2,
  RefreshCcw,
  AlertTriangle,
  X,
  Scan,
} from "lucide-react";
import FaceScanningHUD from "@/components/FaceScanningHUD";
import { cn } from "@/lib/utils";

const QUALITY_HOLD_MS = 1500;
const MIN_FACE_FRACTION = 0.15;

// Guide messages for the user
const GUIDE_MESSAGES = {
  loading: "Loading face detection models…",
  noFace: "Position your face inside the circle",
  tooSmall: "Move closer to the camera",
  offCenter: "Center your face in the circle",
  lowConfidence: "Ensure good lighting on your face",
  holdStill: "Hold still…",
  captured: "Face captured!",
};

export default function FaceEnrollmentModal({ open, onOpenChange }) {
  const { enrollFace } = useAuth();

  const [stage, setStage] = useState("idle"); // idle | loading | camera | captured | enrolling | done
  const [guide, setGuide] = useState(GUIDE_MESSAGES.loading);
  const [qualityOk, setQualityOk] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedDescriptor, setCapturedDescriptor] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const faceApiRef = useRef(null);
  const qualityTimerRef = useRef(null);
  const qualityStartRef = useRef(null);
  const animFrameRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // When modal opens → start setup; when it closes → cleanup
  useEffect(() => {
    if (open) {
      loadModels();
    } else {
      cleanup();
      setStage("idle");
      setGuide(GUIDE_MESSAGES.loading);
      setQualityOk(false);
      setCapturedImage(null);
      setCapturedDescriptor(null);
    }
    return () => cleanup();
  }, [open]);

  async function loadModels() {
    setStage("loading");
    setGuide(GUIDE_MESSAGES.loading);

    try {
      // Dynamically import face-api
      const faceapi = await import("@vladmandic/face-api");
      faceApiRef.current = faceapi;

      // Load models from CDN / public
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      if (!mountedRef.current) return;
      
      // Models loaded, switch to camera stage to mount video element
      setStage("camera");
      setGuide(GUIDE_MESSAGES.noFace);
    } catch (err) {
      console.error("Setup failed:", err);
      toast.error("Biometric initialization failed");
      onOpenChange(false);
    }
  }

  // Camera startup effect
  useEffect(() => {
    if (stage === "camera" && !streamRef.current) {
      startCamera();
    }
  }, [stage]);

  async function startCamera() {
    try {
      const constraints = {
        video: { 
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false,
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        console.warn("Retrying with simple constraints:", err);
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      if (!mountedRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => resolve();
        });
        await videoRef.current.play();
        runDetectionLoop();
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      let message = "Camera access denied or unavailable";
      if (err.name === "NotAllowedError") message = "Permission denied. Please allow camera access.";
      if (err.name === "NotFoundError") message = "No camera found on this device.";
      if (err.name === "NotReadableError") message = "Camera is already in use by another app.";
      
      toast.error(message);
      onOpenChange(false);
    }
  }
  function runDetectionLoop() {
    const faceapi = faceApiRef.current;
    if (!faceapi || !videoRef.current) return;

    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });

    async function detect() {
      if (!mountedRef.current || !videoRef.current || videoRef.current.paused) return;

      try {
        const detection = await faceapi
          .detectSingleFace(videoRef.current, options)
          .withFaceLandmarks(true)
          .withFaceDescriptor();

        if (!mountedRef.current) return;

        const video = videoRef.current;
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        
        const canvas = overlayCanvasRef.current;
        if (canvas && video && vw > 0) {
          const displaySize = { width: vw, height: vh };
          if (canvas.width !== vw || canvas.height !== vh) {
            faceapi.matchDimensions(canvas, displaySize);
          }
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, vw, vh);

          if (detection) {
            const resizedDetections = faceapi.resizeResults(detection, displaySize);
            
            const box = detection.detection.box;
            const score = detection.detection.score;
            const faceFraction = (box.width * box.height) / (vw * vh);
            const centerX = box.x + box.width / 2;
            const centerY = box.y + box.height / 2;
            const offCenterX = Math.abs(centerX - vw / 2) / (vw / 2);
            const offCenterY = Math.abs(centerY - vh / 2) / (vh / 2);
            
            const isOk = !(score < 0.7 || faceFraction < MIN_FACE_FRACTION || offCenterX > 0.3 || offCenterY > 0.35);
            
            const drawOptions = {
              lineWidth: 2,
              drawLines: true,
              color: isOk ? "#22c55e" : "#f59e0b"
            };
            new faceapi.draw.DrawFaceLandmarks(resizedDetections.landmarks, drawOptions).draw(canvas);
          }
        }

        if (detection) {
          const box = detection.detection.box;
          const score = detection.detection.score;
          const faceFraction = (box.width * box.height) / (vw * vh);
          const centerX = box.x + box.width / 2;
          const centerY = box.y + box.height / 2;
          const offCenterX = Math.abs(centerX - vw / 2) / (vw / 2);
          const offCenterY = Math.abs(centerY - vh / 2) / (vh / 2);

          if (score < 0.7) {
            failQuality(GUIDE_MESSAGES.lowConfidence);
          } else if (faceFraction < MIN_FACE_FRACTION) {
            failQuality(GUIDE_MESSAGES.tooSmall);
          } else if (offCenterX > 0.3 || offCenterY > 0.35) {
            failQuality(GUIDE_MESSAGES.offCenter);
          } else {
            // All checks pass
            if (!qualityStartRef.current) {
              qualityStartRef.current = Date.now();
            }
            setQualityOk(true);
            setGuide(GUIDE_MESSAGES.holdStill);

            const elapsed = Date.now() - qualityStartRef.current;
            if (elapsed >= QUALITY_HOLD_MS) {
              // Auto-capture
              captureFrame(detection.descriptor);
              return; // Stop the loop
            }
          }
        } else {
          failQuality(GUIDE_MESSAGES.noFace);
        }
      } catch {
        // Skip frame errors silently
      }

      animFrameRef.current = requestAnimationFrame(() => {
        // Run at ~2fps as per PRD
        setTimeout(detect, 500);
      });
    }

    detect();
  }

  function failQuality(msg) {
    qualityStartRef.current = null;
    setQualityOk(false);
    setGuide(msg);
  }

  async function captureFrame(autoDescriptor = null) {
    if (!videoRef.current || !canvasRef.current || !faceApiRef.current) return;
    
    setGuide("Processing capture...");

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    // Mirror for selfie
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    stopCamera();

    try {
      let finalDescriptor = autoDescriptor;

      if (!finalDescriptor) {
        // Manual capture: we need to run detection on the canvas
        const options = new faceApiRef.current.TinyFaceDetectorOptions({ inputSize: 320 });
        const detection = await faceApiRef.current
          .detectSingleFace(canvas, options)
          .withFaceLandmarks(true)
          .withFaceDescriptor();
          
        if (detection) {
          finalDescriptor = detection.descriptor;
        } else {
          toast.error("Face not detected clearly. Please try again.");
          handleRetake();
          return;
        }
      }

      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      setCapturedImage(dataUrl);
      setCapturedDescriptor(Array.from(finalDescriptor));
      setStage("captured");
      setGuide(GUIDE_MESSAGES.captured);
    } catch (err) {
      toast.error("Failed to process face");
      handleRetake();
    }
  }

  function stopCamera() {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    qualityStartRef.current = null;
  }

  function cleanup() {
    stopCamera();
    faceApiRef.current = null;
    if (overlayCanvasRef.current) {
      const ctx = overlayCanvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
    }
  }

  function handleRetake() {
    setCapturedImage(null);
    setCapturedDescriptor(null);
    setQualityOk(false);
    startSetup();
  }

  async function handleConfirmEnroll() {
    if (!capturedImage || !capturedDescriptor) return;
    setEnrolling(true);
    setStage("enrolling");
    try {
      await enrollFace(capturedImage, capturedDescriptor);
      setStage("done");
      toast.success("Face enrolled successfully!");
      // Auto-close after a beat
      setTimeout(() => {
        if (mountedRef.current) onOpenChange(false);
      }, 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to enroll face");
      setStage("captured");
    } finally {
      setEnrolling(false);
    }
  }

  // Compute quality ring progress (0-1)
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval;
    if (qualityOk && qualityStartRef.current && stage === "camera") {
      interval = setInterval(() => {
        const p = Math.min((Date.now() - qualityStartRef.current) / QUALITY_HOLD_MS, 1);
        setProgress(p);
      }, 50);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [qualityOk, stage]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl p-0 overflow-hidden border-none bg-zinc-950/90 backdrop-blur-xl sm:rounded-3xl shadow-2xl"
        showCloseButton={false}
      >
        <div className="relative flex flex-col h-[600px] sm:h-[650px]">
          {/* Close Button */}
          {stage !== "enrolling" && (
            <button 
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Main Content Area */}
          <div className="relative flex-1 flex flex-col overflow-hidden">
            <AnimatePresence mode="wait">
              {stage === "loading" ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-zinc-950"
                >
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-primary/20 blur-xl rounded-full"
                    />
                  </div>
                  <p className="text-zinc-400 font-medium tracking-tight">{guide}</p>
                </motion.div>
              ) : stage === "camera" ? (
                <motion.div
                  key="camera"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative flex-1 flex flex-col"
                >
                  <div className="relative flex-1 overflow-hidden group">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover scale-x-[-1] z-0 bg-black"
                    />
                    
                    {/* HUD Overlay */}
                    <FaceScanningHUD 
                      active={true}
                      progress={progress}
                      status={qualityOk ? "success" : "scanning"}
                      guide={guide}
                    />

                    {/* Landmarks Canvas (Debug/Visual effect) */}
                    <canvas
                      ref={overlayCanvasRef}
                      className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1] opacity-50 z-20"
                    />

                    {/* Live Badge */}
                    <div className="absolute top-6 left-6 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 backdrop-blur-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Live Sensor</span>
                    </div>
                  </div>

                  {/* Header/Controls */}
                  <div className="p-6 bg-zinc-900/50 backdrop-blur-md border-t border-white/5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                          <Scan className="w-5 h-5 text-primary" />
                          Enroll Face Biometrics
                        </h3>
                        <p className="text-zinc-400 text-sm">Center your face in the frame for automatic capture.</p>
                      </div>
                      <Button
                        size="lg"
                        className="rounded-full px-6 bg-white text-black hover:bg-zinc-200"
                        onClick={() => captureFrame()}
                      >
                        <Camera className="w-5 h-5 mr-2" />
                        Manual Capture
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : (stage === "captured" || stage === "enrolling" || stage === "done") ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="absolute inset-0 flex flex-col bg-zinc-950"
                >
                  <div className="relative flex-1 overflow-hidden bg-black">
                    {capturedImage && (
                      <img
                        src={capturedImage}
                        alt="Captured face"
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    {/* Status Overlays */}
                    <AnimatePresence>
                      {stage === "enrolling" && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
                        >
                          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                          <p className="text-white font-medium">Securing Biometric Data...</p>
                        </motion.div>
                      )}
                      
                      {stage === "done" && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-green-500/10 backdrop-blur-md"
                        >
                          <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                            <CheckCircle2 className="w-10 h-10 text-white" />
                          </div>
                          <p className="text-white text-xl font-bold mt-6">Face Enrolled</p>
                          <p className="text-green-400/80 text-sm mt-1">Identity verified and secured.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="p-8 bg-zinc-900/50 backdrop-blur-md border-t border-white/5">
                    {stage === "captured" && (
                      <div className="flex flex-col gap-4">
                        <div className="text-center mb-2">
                          <h3 className="text-white font-semibold text-lg">Verify Identity</h3>
                          <p className="text-zinc-400 text-sm">Please confirm if the capture is clear and well-lit.</p>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            size="lg"
                            className="flex-1 rounded-full border-white/10 text-white hover:bg-white/5"
                            onClick={handleRetake}
                          >
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Retake
                          </Button>
                          <Button
                            size="lg"
                            className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                            onClick={handleConfirmEnroll}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Confirm Enrollment
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {stage === "done" && (
                      <div className="text-center py-4">
                        <p className="text-zinc-400 text-sm">Closing automatically...</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        {/* Hidden canvas for capture processing */}
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
