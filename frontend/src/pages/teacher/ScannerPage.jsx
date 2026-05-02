import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Maximize2, Minimize2, Check, X, Camera, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import * as api from "@/features/attendance/api/attendance.api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// We use the start endpoint to fetch the full session, profiles, and records.
// The backend startSession logic handles finding the inprogress session and returning everything.
// Since the URL has sessionId, we need the classId to call startAttendance.
// Wait, the API takes classId for startSession: POST /api/attendance/start/:classId.
// We only have sessionId in the URL: `/teacher/attendance/scan/:sessionId`.
// Let's create a custom hook or fetch the session first to get classId.

export default function ScannerPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // We need to fetch the session to get classId, then start it
  const [classId, setClassId] = useState(null);
  const [initData, setInitData] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceApi, setFaceApi] = useState(null);

  // State for camera and scanning
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const faceMatcherRef = useRef(null);
  const markedInLoopRef = useRef(new Set());

  // Fetch session details to get classId
  useEffect(() => {
    async function init() {
      try {
        // Fetch session records to see if it's already started, or just to get the session info
        // Wait, fetchSessionRecords returns { records, session }
        const { session } = await api.fetchSessionRecords(sessionId);
        if (!session) {
          toast.error("Session not found");
          navigate("/teacher/attendance/select");
          return;
        }
        
        // Now call start Attendance which requires classId
        // This will transition it to inprogress if it was scheduled
        const data = await api.startAttendance(session.classId);
        setInitData(data); // { session, profiles, records }
      } catch (err) {
        console.error(err);
        toast.error("Failed to initialize session");
        navigate("/teacher/attendance/select");
      }
    }
    init();
  }, [sessionId, navigate]);

  // Load Models
  useEffect(() => {
    async function loadModels() {
      try {
        const faceapi = await import("@vladmandic/face-api");
        setFaceApi(faceapi);
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load biometric models");
      }
    }
    loadModels();
  }, []);

  // Sync Biometric Pool
  useEffect(() => {
    if (!modelsLoaded || !faceApi || !initData) return;
    
    const { profiles, records } = initData;
    const activeProfiles = profiles.filter(p => {
      const record = records.find(r => r.studentId === p.userId);
      return record?.status !== "present";
    });

    const descriptors = activeProfiles
      .filter(p => p.embedding && p.embedding.length === 128)
      .map(p => {
        const emb = p.embedding instanceof Float32Array ? p.embedding : new Float32Array(p.embedding);
        return new faceApi.LabeledFaceDescriptors(p.userId, [emb]);
      });

    if (descriptors.length > 0) {
      faceMatcherRef.current = new faceApi.FaceMatcher(descriptors, 0.6);
    } else {
      faceMatcherRef.current = null;
    }
  }, [modelsLoaded, faceApi, initData]);

  // Mark Attendance Mutation
  const markMutation = useMutation({
    mutationFn: (studentId) => api.markAttendance({ sessionId, studentId, status: "present", method: "facial" }),
    onSuccess: (record) => {
      // Update local state to remove them from the pool
      setInitData(prev => {
        if (!prev) return prev;
        const newRecords = prev.records.map(r => r.studentId === record.studentId ? { ...r, status: "present" } : r);
        return { ...prev, records: newRecords };
      });
      const profile = initData?.profiles.find(p => p.userId === record.studentId);
      toast.success(`Marked ${profile?.name || "Student"} as present`);
    }
  });

  // Camera Management
  useEffect(() => {
    if (modelsLoaded && initData) {
      startCamera();
    }
    return () => stopCamera();
  }, [modelsLoaded, initData]);

  async function startCamera() {
    if (streamRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      runTrackingLoop();
    } catch (err) {
      console.error(err);
      toast.error("Camera access denied");
    }
  }

  function stopCamera() {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }

  const runTrackingLoop = async () => {
    if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

    try {
      const detections = await faceApi.detectAllFaces(
        videoRef.current,
        new faceApi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
      ).withFaceLandmarks(true).withFaceDescriptors();

      if (faceMatcherRef.current && detections.length > 0) {
        const results = detections.map(d => faceMatcherRef.current.findBestMatch(d.descriptor));
        
        results.forEach(result => {
          if (result.label !== "unknown" && result.distance < 0.6) {
            const userId = result.label;
            if (!markedInLoopRef.current.has(userId)) {
              markedInLoopRef.current.add(userId);
              markMutation.mutate(userId);
            }
          }
        });
      }
    } catch (err) {
      console.error("Tracking Error:", err);
    }
    
    // Throttle loop slightly for performance
    setTimeout(() => {
      animFrameRef.current = requestAnimationFrame(runTrackingLoop);
    }, 300);
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const finishScanning = () => {
    navigate(`/teacher/attendance/review/${sessionId}`);
  };

  if (!initData || !modelsLoaded) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center space-y-4">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Initializing AI Scanner...</p>
      </div>
    );
  }

  const presentCount = initData.records.filter(r => r.status === "present").length;
  const totalCount = initData.profiles.length;
  const progress = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div>
          <h2 className="text-lg font-bold">Scanning...</h2>
          <p className="text-sm text-muted-foreground">{presentCount} of {totalCount} detected</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </Button>
          <Button onClick={finishScanning}>Review</Button>
        </div>
      </div>

      <Progress value={progress} className="h-1 rounded-none" />

      {/* Camera Area */}
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
        <video 
          ref={videoRef} 
          className="absolute min-w-full min-h-full object-cover"
          playsInline
          muted
        />
        
        {/* HUD Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] aspect-square border-2 border-white/30 rounded-full border-dashed animate-[spin_10s_linear_infinite]" />
        </div>

        {/* Recently Scanned List overlay on mobile/desktop */}
        <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto pb-2 pointer-events-auto">
          {initData.records.filter(r => r.status === "present").slice(-5).map(r => {
            const profile = initData.profiles.find(p => p.userId === r.studentId);
            return (
              <div key={r.studentId} className="flex items-center gap-2 bg-background/80 backdrop-blur-md p-2 rounded-full border shadow-sm shrink-0 pr-4">
                <Avatar className="size-8 border-2 border-green-500">
                  <AvatarImage src={profile?.avatar} />
                  <AvatarFallback><Check className="size-4 text-green-500" /></AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{profile?.name.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
