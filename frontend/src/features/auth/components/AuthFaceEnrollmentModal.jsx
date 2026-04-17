import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
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
} from "lucide-react";

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
      startSetup();
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

  async function startSetup() {
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

      // Start camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });

      if (!mountedRef.current) { stream.getTracks().forEach(t => t.stop()); return; }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setStage("camera");
      setGuide(GUIDE_MESSAGES.noFace);

      // Start detection loop
      runDetectionLoop();
    } catch (err) {
      if (!mountedRef.current) return;
      console.error("Face enrollment setup error:", err);
      if (err.name === "NotAllowedError") {
        setGuide("Camera access denied. Please allow camera permissions.");
      } else {
        setGuide("Failed to initialize. Please try again.");
      }
      setStage("idle");
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
  const qualityProgress = qualityOk && qualityStartRef.current
    ? Math.min((Date.now() - qualityStartRef.current) / QUALITY_HOLD_MS, 1)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={stage !== "enrolling"}
      >

        {/* Header */}
        <DialogHeader>
          <DialogTitle>Enroll your face</DialogTitle>
          <DialogDescription>
            Position your face inside the guide. Capture happens automatically.
          </DialogDescription>
        </DialogHeader>


        {/* Camera / Preview Area */}
        <div>
          {stage === "loading" && (
            <div>
              <Loader2 />
              <p>
                {guide}
              </p>
            </div>
          )}


          {/* Live Camera Feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ transform: "scaleX(-1)" }}
          />


          {/* Face Landmarks Overlay */}
          <canvas
            ref={overlayCanvasRef}
            style={{ transform: "scaleX(-1)" }}
          />


          {/* Captured Image Preview */}
          {(stage === "captured" || stage === "enrolling" || stage === "done") && capturedImage && (
            <img
              src={capturedImage}
              alt="Captured face"
            />
          )}


          {/* Done check overlay */}
          {stage === "done" && (
            <div>
              <div>
                <CheckCircle2 />
              </div>
            </div>
          )}


          {/* Enrolling overlay */}
          {stage === "enrolling" && (
            <div>
              <Loader2 />
            </div>
          )}


          {/* Live indicator */}
          {stage === "camera" && (
            <div>
              <div />
              <span>Live</span>
            </div>
          )}


          {/* Guide message bar */}
          {(stage === "camera" || stage === "loading") && (
            <div>
              <p>
                {!qualityOk && stage === "camera" && <AlertTriangle />}
                {qualityOk && <CheckCircle2 />}
                {guide}
              </p>
            </div>
          )}
        </div>


        {/* Action Buttons */}
        <div>
          {stage === "camera" && (
            <Button
              size="lg"
              onClick={() => captureFrame()}
            >
              <Camera />
              Capture Now
            </Button>
          )}


          {/* Captured ? confirm or retake */}
          {stage === "captured" && (
            <div>
              <Button
                variant="outline"
                size="lg"
                onClick={handleRetake}
              >
                <RefreshCcw />
                Retake
              </Button>
              <Button
                size="lg"
                onClick={handleConfirmEnroll}
                disabled={enrolling}
              >
                {enrolling ? (
                  <>
                    <Loader2 />
                    Enrolling…
                  </>
                ) : (
                  <>
                    <CheckCircle2 />
                    Confirm
                  </>
                )}
              </Button>
            </div>
          )}


          {/* Done */}
          {stage === "done" && (
            <div>
              <p>
                ✓ Face enrolled successfully
              </p>
            </div>
          )}
        </div>


        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} />
      </DialogContent>
    </Dialog>
  );
}
