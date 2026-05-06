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
  DialogFooter,
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
        
        // Ensure canvases match the video display size
        updateCanvasDimensions();
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
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (detection) {
            const resizedDetections = faceapi.resizeResults(detection, displaySize);
            
            const isOk = !(detection.detection.score < 0.7 || 
                         (detection.detection.box.width * detection.detection.box.height) / (vw * vh) < MIN_FACE_FRACTION || 
                         Math.abs((detection.detection.box.x + detection.detection.box.width / 2) - vw / 2) / (vw / 2) > 0.3 || 
                         Math.abs((detection.detection.box.y + detection.detection.box.height / 2) - vh / 2) / (vh / 2) > 0.35);
            
            const drawOptions = {
              lineWidth: 1.5,
              drawLines: true,
              color: isOk ? "oklch(0.7 0.2 150)" : "oklch(0.7 0.2 40)"
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

  function updateCanvasDimensions() {
    if (!videoRef.current || !overlayCanvasRef.current) return;
    const video = videoRef.current;
    const canvas = overlayCanvasRef.current;
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    if (displaySize.width > 0) {
      faceApiRef.current?.matchDimensions(canvas, displaySize);
    }
  }

  function failQuality(msg) {
    qualityStartRef.current = null;
    setQualityOk(false);
    setGuide(msg);
  }

  async function captureFrame(autoDescriptor) {
    if (!videoRef.current || !canvasRef.current || !faceApiRef.current || !autoDescriptor) return;
    
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
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      setCapturedImage(dataUrl);
      setCapturedDescriptor(Array.from(autoDescriptor));
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
    loadModels();
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
        className="max-w-2xl p-0 overflow-hidden border-none bg-[oklch(0.12_0.02_250)] backdrop-blur-2xl sm:rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)]"
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
                  className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-[oklch(0.12_0.02_250)]"
                >
                  <div className="relative">
                    <Loader2 className="w-16 h-16 text-primary animate-spin" />
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"
                    />
                  </div>
                  <p className="text-white font-black tracking-tight text-xl">{guide}</p>
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative flex-1 flex flex-col"
                >
                  {/* Shared Header */}
                  <div className="flex-none p-8 bg-[oklch(0.15_0.02_250/0.5)] border-b border-white/5">
                    <DialogTitle className="text-white font-black text-2xl tracking-tight flex items-center gap-2">
                      <Scan className="w-6 h-6 text-primary" />
                      {stage === "camera" ? "Biometric Enrollment" : "Verify Identity"}
                    </DialogTitle>
                    <DialogDescription className="text-white/50 text-sm font-medium mt-1">
                      {stage === "camera" 
                        ? "Secure your identity with enterprise-grade face recognition."
                        : "Confirm your capture is clear for optimal recognition."}
                    </DialogDescription>
                  </div>

                  <div className="relative flex-1 overflow-hidden bg-black">
                    <AnimatePresence mode="wait">
                      {stage === "camera" ? (
                        <motion.div
                          key="camera-view"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0"
                        >
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                          />
                          <FaceScanningHUD 
                            active={true}
                            progress={progress}
                            status={qualityOk ? "success" : "scanning"}
                            guide={guide}
                          />
                          <canvas
                            ref={overlayCanvasRef}
                            className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1] object-cover opacity-70 z-20"
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="preview-view"
                          initial={{ opacity: 0, scale: 1.1 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute inset-0"
                        >
                          {capturedImage && (
                            <img
                              src={capturedImage}
                              alt="Captured face"
                              className="w-full h-full object-cover"
                            />
                          )}
                          
                          {/* Success/Error Overlays */}
                          <AnimatePresence>
                            {stage === "enrolling" && (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[oklch(0.1_0.02_250/0.8)] backdrop-blur-md"
                              >
                                <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
                                <p className="text-white font-black text-2xl tracking-tight">Securing Hash...</p>
                              </motion.div>
                            )}
                            
                            {stage === "done" && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[oklch(0.6_0.2_150/0.2)] backdrop-blur-xl"
                              >
                                <div className="w-24 h-24 rounded-full bg-[oklch(0.7_0.2_150)] flex items-center justify-center shadow-[0_0_40px_oklch(0.7_0.2_150/0.4)]">
                                  <CheckCircle2 className="w-12 h-12 text-white" />
                                </div>
                                <p className="text-white text-3xl font-black mt-8 tracking-tighter">Identity Verified</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <DialogFooter className="flex-none p-6 sm:p-8 bg-[oklch(0.15_0.02_250/0.8)] backdrop-blur-md border-t border-white/5">
                    {stage === "captured" ? (
                      <div className="flex items-center gap-4 w-full">
                        <Button
                          size="xl"
                          className="flex-1 rounded-2xl bg-[oklch(0.62_0.17_153)] hover:bg-[oklch(0.65_0.17_153)] text-white shadow-[0_0_30px_oklch(0.62_0.17_153/0.4)]"
                          onClick={handleConfirmEnroll}
                        >
                          <CheckCircle2 data-icon="inline-start" />
                          Confirm & Secure Enrollment
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon-xl"
                          className="rounded-2xl bg-white/10 hover:bg-white/20 text-white border-white/10"
                          onClick={handleRetake}
                          title="Retake Capture"
                        >
                          <RefreshCcw />
                        </Button>
                      </div>
                    ) : stage === "done" ? (
                      <div className="text-center py-2 w-full">
                        <p className="text-white/40 text-sm font-bold tracking-widest uppercase">System Secured</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center w-full gap-4">
                        <div className="flex flex-col items-center text-center">
                          <AnimatePresence mode="wait">
                            <motion.p
                              key={guide}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="text-white font-black text-lg tracking-tight"
                            >
                              {guide}
                            </motion.p>
                          </AnimatePresence>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-1 h-1 rounded-full bg-primary animate-ping" />
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Sensors Active</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogFooter>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Hidden canvas for capture processing */}
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
