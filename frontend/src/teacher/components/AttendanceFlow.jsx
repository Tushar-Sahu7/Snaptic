import { useState, useCallback, useEffect, useRef } from "react";
import { TODAY_CLASSES, CLASS_STUDENTS } from "../data/teacherData";

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTS & HELPERS
═══════════════════════════════════════════════════════════════════ */

// Grace period: 15 minutes after class start → "late"
const LATE_GRACE_MINUTES = 15;

// Palette for virtual face avatars (seed-based)
const SKIN_TONES  = ["#FDDBB4","#F1C27D","#E0A97A","#C68642","#8D5524","#F9D9C3","#FFE0BD"];
const HAIR_COLORS = ["#1a1a1a","#4a3728","#8B6914","#a0522d","#c4a35a","#2c1810","#6b4423"];
const SHIRT_COLS  = ["#00E5BE","#60a5fa","#a78bfa","#f472b6","#fb923c","#34d399","#e879f9"];

function seededRand(seed, max) {
  const x = Math.sin(seed + 1) * 10000;
  return Math.floor((x - Math.floor(x)) * max);
}

/** Deterministic SVG face built from student id seed */
function VirtualFace({ studentId, size = 40, status }) {
  const seed    = parseInt(studentId.replace(/\D/g, ""), 10) || 1;
  const skin    = SKIN_TONES[seededRand(seed, SKIN_TONES.length)];
  const hair    = HAIR_COLORS[seededRand(seed + 7, HAIR_COLORS.length)];
  const shirt   = SHIRT_COLS[seededRand(seed + 13, SHIRT_COLS.length)];
  const eyeX1   = 9 + seededRand(seed + 2, 3);
  const eyeX2   = 23 - seededRand(seed + 3, 3);
  const smile   = seededRand(seed + 4, 2) === 0;
  const glasses = seededRand(seed + 5, 5) === 0;

  const borderColor =
    status === "present" ? "#34d399" :
    status === "late"    ? "#fbbf24" :
    status === "absent"  ? "#f87171" : "transparent";

  return (
    <svg
      width={size} height={size}
      viewBox="0 0 40 40"
      style={{
        borderRadius: "50%",
        border: status && status !== "unmarked" ? `2px solid ${borderColor}` : "2px solid rgba(255,255,255,0.1)",
        display: "block",
        background: "#0a1828",
        flexShrink: 0,
      }}
    >
      {/* Shirt / body */}
      <ellipse cx="20" cy="52" rx="14" ry="12" fill={shirt} opacity="0.9" />
      {/* Neck */}
      <rect x="16" y="30" width="8" height="8" fill={skin} />
      {/* Head */}
      <ellipse cx="20" cy="22" rx="11" ry="12" fill={skin} />
      {/* Hair */}
      <ellipse cx="20" cy="11" rx="11" ry="6" fill={hair} />
      <rect x="9" y="11" width="22" height="5" fill={hair} />
      {/* Eyes */}
      <circle cx={eyeX1} cy="21" r="1.8" fill="#1a1a1a" />
      <circle cx={eyeX2} cy="21" r="1.8" fill="#1a1a1a" />
      <circle cx={eyeX1 + 0.6} cy="20.4" r="0.5" fill="white" />
      <circle cx={eyeX2 + 0.6} cy="20.4" r="0.5" fill="white" />
      {/* Glasses (occasional) */}
      {glasses && <>
        <rect x={eyeX1-3} y="18.5" width="6" height="5" rx="2" fill="none" stroke="#555" strokeWidth="0.8" />
        <rect x={eyeX2-3} y="18.5" width="6" height="5" rx="2" fill="none" stroke="#555" strokeWidth="0.8" />
        <line x1={eyeX1+3} y1="21" x2={eyeX2-3} y2="21" stroke="#555" strokeWidth="0.8" />
      </>}
      {/* Nose */}
      <ellipse cx="20" cy="25" rx="1.5" ry="1" fill={skin} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
      {/* Mouth */}
      {smile
        ? <path d="M17 28 Q20 31 23 28" stroke="#a0522d" strokeWidth="1" fill="none" strokeLinecap="round" />
        : <line x1="17.5" y1="28.5" x2="22.5" y2="28.5" stroke="#a0522d" strokeWidth="1" strokeLinecap="round" />
      }
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STEP 0 — CLASS SELECTOR  (unchanged from original)
═══════════════════════════════════════════════════════════════════ */
function ClassSelector({ onSelect, preSelected }) {
  return (
    <div style={{ animation: "fade-up 0.4s ease both" }}>
      <div className="mb-6">
        <p className="font-mono text-[10px] tracking-[0.22em] text-teal/60 mb-1">STEP 1 OF 3</p>
        <h2 className="font-sans text-2xl font-black text-white">Select Class</h2>
        <p className="font-sans text-sm text-white/35 mt-1">Choose the class to take attendance for.</p>
      </div>
      <div className="flex flex-col gap-3">
        {TODAY_CLASSES.map((cls, i) => {
          const isCompleted = cls.status === "completed";
          const isOngoing   = cls.status === "ongoing";
          const isSelected  = preSelected?.id === cls.id;
          return (
            <button key={cls.id} type="button" disabled={isCompleted}
              onClick={() => !isCompleted && onSelect(cls)}
              style={{ animation: `fade-up 0.4s ${i * 0.07}s ease both` }}
              className={[
                "relative flex w-full cursor-pointer items-center gap-5 border p-5 text-left transition-all duration-200",
                isCompleted ? "cursor-not-allowed border-white/[0.04] opacity-35"
                  : isSelected ? "border-teal bg-teal/[0.08]"
                  : isOngoing  ? "border-teal/40 bg-teal/[0.04] hover:border-teal"
                  : "border-white/[0.07] bg-dark-900/60 hover:border-teal/30 hover:bg-teal/[0.03]",
              ].join(" ")}>
              <div className="shrink-0 w-16 text-center">
                <p className="font-mono text-xs font-bold text-white/70">{cls.time}</p>
                <p className="font-mono text-[10px] text-white/25">{cls.end}</p>
              </div>
              <div className={`h-10 w-px shrink-0 ${isOngoing || isSelected ? "bg-teal/30" : "bg-white/10"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-sans text-base font-bold text-white">{cls.name}</p>
                  {isOngoing && (
                    <span className="flex items-center gap-1 border border-teal/30 bg-teal/10 px-2 py-0.5 font-mono text-[9px] text-teal">
                      <span className="h-1 w-1 rounded-full bg-teal animate-pulse" /> LIVE
                    </span>
                  )}
                  {isCompleted && (
                    <span className="border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 font-mono text-[9px] text-emerald-400">DONE</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-teal/50">{cls.code}</span>
                  <span className="font-mono text-[10px] text-white/25">{cls.room}</span>
                  <span className="font-mono text-[10px] text-white/25">{cls.students} students</span>
                </div>
              </div>
              {!isCompleted && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
                  className={`h-5 w-5 shrink-0 ${isSelected ? "text-teal" : "text-white/20"}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DETECTION TOAST — pops up when a face is recognised
═══════════════════════════════════════════════════════════════════ */
function DetectionToast({ student, status, confidence, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3200);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const cfg = {
    present: { bg: "bg-emerald-400/10 border-emerald-400/40", label: "PRESENT", icon: "✓", color: "text-emerald-400", dot: "bg-emerald-400" },
    late:    { bg: "bg-amber-400/10 border-amber-400/40",     label: "LATE",    icon: "L", color: "text-amber-400",   dot: "bg-amber-400"   },
    absent:  { bg: "bg-red-400/10 border-red-400/40",         label: "ABSENT",  icon: "✕", color: "text-red-400",     dot: "bg-red-400"     },
  }[status] || {};

  return (
    <div className={`pointer-events-none flex items-center gap-3 border px-4 py-3 shadow-2xl backdrop-blur-md ${cfg.bg}`}
      style={{ animation: "toast-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both" }}>
      <div className="relative shrink-0">
        <VirtualFace studentId={student.id} size={44} status={status} />
        <span className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-dark ${cfg.dot}`}>
          {cfg.icon}
        </span>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-sans text-sm font-bold text-white truncate">{student.name}</p>
          <span className={`font-mono text-[9px] font-bold tracking-widest ${cfg.color}`}>{cfg.label}</span>
        </div>
        <p className="font-mono text-[10px] text-white/35">{student.roll}</p>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className={`h-full rounded-full ${cfg.dot}`} style={{ width: `${confidence}%` }} />
          </div>
          <span className="font-mono text-[9px] text-white/30">{confidence}% match</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   BOUNDING BOX FLASH — overlay on video when face detected
═══════════════════════════════════════════════════════════════════ */
function BboxFlash({ bbox, name, status }) {
  const cfg = {
    present: "#34d399",
    late:    "#fbbf24",
    absent:  "#f87171",
  };
  const color = cfg[status] || "#00E5BE";

  return (
    <div className="pointer-events-none absolute"
      style={{
        left: `${bbox.x}%`, top: `${bbox.y}%`,
        width: `${bbox.w}%`, height: `${bbox.h}%`,
        animation: "bbox-in 0.2s ease both",
      }}>
      {/* Corners */}
      {[["top-0 left-0","border-t-2 border-l-2"],
        ["top-0 right-0","border-t-2 border-r-2"],
        ["bottom-0 left-0","border-b-2 border-l-2"],
        ["bottom-0 right-0","border-b-2 border-r-2"],
      ].map(([pos, brd], i) => (
        <span key={i} className={`absolute h-4 w-4 ${pos} ${brd}`} style={{ borderColor: color }} />
      ))}
      {/* Label */}
      <div className="absolute -top-6 left-0 flex items-center gap-1.5 px-1.5 py-0.5"
        style={{ background: color }}>
        <span className="font-mono text-[9px] font-bold text-dark leading-none">{name.split(" ")[0]}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FACE SCAN STEP — camera + live marking grid
═══════════════════════════════════════════════════════════════════ */

/** Parse "HH:MM AM/PM" → minutes since midnight */
function parseTime(timeStr) {
  const [time, meridiem] = timeStr.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (meridiem === "PM" && h !== 12) h += 12;
  if (meridiem === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

function nowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function FaceScanStep({ cls, attendance, setAttendance, onNext, onBack }) {
  const videoRef    = useRef(null);
  const streamRef   = useRef(null);
  const scanTimerRef= useRef(null);

  const [camState,   setCamState]   = useState("idle");   // idle|requesting|running|denied|unsupported
  const [toasts,     setToasts]     = useState([]);        // [{id, student, status, confidence}]
  const [bboxes,     setBboxes]     = useState([]);        // [{id, bbox, name, status}]
  const [scanning,   setScanning]   = useState(false);
  const [elapsed,    setElapsed]    = useState(0);         // seconds since scan started
  const [camFacing,  setCamFacing]  = useState("environment"); // environment | user
  const [modelsReady,setModelsReady]= useState(false);
  const [demoMsg,    setDemoMsg]    = useState("");
  const [availableCameras, setAvailableCameras] = useState([]);
  const [currentDeviceId, setCurrentDeviceId] = useState(null);

  const students   = CLASS_STUDENTS[cls.id] || [];
  const classStart = parseTime(cls.time);   // minutes since midnight
  const graceEnd   = classStart + LATE_GRACE_MINUTES;

  // ---------- derived stats ----------
  const present  = students.filter(s => attendance[s.id] === "present").length;
  const late     = students.filter(s => attendance[s.id] === "late").length;
  const absent   = students.filter(s => attendance[s.id] === "absent").length;
  const unmarked = students.filter(s => !attendance[s.id] || attendance[s.id] === "unmarked").length;
  const detected = present + late;
  const pct      = students.length ? Math.round((detected / students.length) * 100) : 0;

  // ---------- enumerate cameras on mount ----------
  useEffect(() => {
    async function getCameras() {
      try {
        // Request permission first to get device labels
        await navigator.mediaDevices.getUserMedia({ video: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === "videoinput");
        setAvailableCameras(videoDevices);
        
        // Find back camera by default
        const backCam = videoDevices.find(d => 
          d.label.toLowerCase().includes("back") || 
          d.label.toLowerCase().includes("rear") ||
          d.label.toLowerCase().includes("environment")
        );
        if (backCam) setCurrentDeviceId(backCam.deviceId);
        else if (videoDevices.length > 0) setCurrentDeviceId(videoDevices[0].deviceId);
      } catch (err) {
        console.error("Error enumerating cameras:", err);
      }
    }
    getCameras();
  }, []);

  // ---------- camera ----------
  const startCamera = useCallback(async (deviceId = null, facing = null) => {
    setCamState("requesting");
    try {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      // Build constraints
      let constraints = {
        video: {
          width:  { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      // Use specific device ID if provided
      if (deviceId) {
        constraints.video.deviceId = { exact: deviceId };
      } else if (facing) {
        // Fallback to facingMode if no device ID
        constraints.video.facingMode = { ideal: facing };
      } else if (currentDeviceId) {
        // Use current device ID if available
        constraints.video.deviceId = { exact: currentDeviceId };
      } else {
        // Default to environment
        constraints.video.facingMode = { ideal: "environment" };
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Get actual device info
      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();
      if (settings.deviceId) {
        setCurrentDeviceId(settings.deviceId);
        // Determine facing mode from device
        const device = availableCameras.find(d => d.deviceId === settings.deviceId);
        if (device) {
          const label = device.label.toLowerCase();
          const newFacing = (label.includes("back") || label.includes("rear") || label.includes("environment"))
            ? "environment" : "user";
          setCamFacing(newFacing);
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCamState("running");
          // Simulate model loading (in production: await faceapi.nets.tinyFaceDetector.loadFromUri('/models'))
          setTimeout(() => setModelsReady(true), 1200);
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCamState("denied");
      } else if (err.name === "NotFoundError" || err.name === "OverconstrainedError") {
        // Try fallback without device constraint
        if (deviceId || currentDeviceId) {
          // Retry with just facingMode
          try {
            const fallbackConstraints = {
              video: {
                facingMode: { ideal: facing || camFacing },
                width:  { ideal: 1280 },
                height: { ideal: 720 },
              },
              audio: false,
            };
            const stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
            streamRef.current = stream;
            
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.onloadedmetadata = () => {
                videoRef.current.play();
                setCamState("running");
                setTimeout(() => setModelsReady(true), 1200);
              };
            }
          } catch (fallbackErr) {
            setCamState("unsupported");
          }
        } else {
          setCamState("unsupported");
        }
      } else {
        setCamState("unsupported");
      }
    }
  }, [currentDeviceId, availableCameras, camFacing]);

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamState("idle");
    setModelsReady(false);
  }

  const switchCamera = useCallback(() => {
    if (availableCameras.length <= 1) return;
    
    // Find next camera
    const currentIndex = availableCameras.findIndex(d => d.deviceId === currentDeviceId);
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    const nextCamera = availableCameras[nextIndex];
    
    if (nextCamera) {
      startCamera(nextCamera.deviceId);
    }
  }, [availableCameras, currentDeviceId, startCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    };
  }, []);

  // ---------- elapsed timer ----------
  useEffect(() => {
    if (!scanning) return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [scanning]);

  // ---------- DEMO FACE SCANNER ----------
  function startDemoScan() {
    setScanning(true);
    setDemoMsg("Scanning for faces…");

    // Queue of unmarked students to detect
    let queue = students.filter(s => !attendance[s.id] || attendance[s.id] === "unmarked");

    const fire = () => {
      // Refresh queue
      queue = students.filter(s => !attendance[s.id] || attendance[s.id] === "unmarked");
      if (queue.length === 0) {
        setDemoMsg("✓ All students detected!");
        setScanning(false);
        clearInterval(scanTimerRef.current);
        return;
      }

      // Pick a random undetected student
      const student  = queue[Math.floor(Math.random() * queue.length)];
      const now      = nowMinutes();

      // Late logic
      let status;
      if (now >= graceEnd) {
        status = "late";
      } else if (Math.random() < 0.18) {
        status = "late";
      } else {
        status = "present";
      }

      const confidence = 87 + Math.floor(Math.random() * 12); // 87-98%

      // Fake bounding box
      const bbox = {
        x: 10 + Math.random() * 50,
        y: 10 + Math.random() * 40,
        w: 20 + Math.random() * 20,
        h: 25 + Math.random() * 20,
      };
      const bboxId = Date.now();

      // Mark attendance
      setAttendance(prev => ({ ...prev, [student.id]: status }));

      // Show bounding box briefly
      setBboxes(prev => [...prev, { id: bboxId, bbox, name: student.name, status }]);
      setTimeout(() => setBboxes(prev => prev.filter(b => b.id !== bboxId)), 1800);

      // Show toast
      const toastId = Date.now() + Math.random();
      setToasts(prev => [...prev.slice(-4), { id: toastId, student, status, confidence }]);

      setDemoMsg(`Detected: ${student.name}`);
    };

    // Fire first detection quickly, then every 1.8-3s
    setTimeout(fire, 600);
    scanTimerRef.current = setInterval(fire, 1800 + Math.random() * 1200);
  }

  function stopScan() {
    setScanning(false);
    if (scanTimerRef.current) {
      clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    setDemoMsg("Scan paused.");
  }

  function dismissToast(id) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  function fmtElapsed(s) {
    return `${String(Math.floor(s / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;
  }

  // ---------- Late logic legend ----------
  const lateAfter = new Date();
  lateAfter.setHours(Math.floor(graceEnd / 60), graceEnd % 60, 0);
  const lateStr = lateAfter.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ animation: "fade-up 0.35s ease both" }}>
      {/* Header */}
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.22em] text-teal/60 mb-1">STEP 2 OF 3 · FACE SCAN</p>
          <h2 className="font-sans text-2xl font-black text-white">{cls.name}</h2>
          <div className="flex flex-wrap items-center gap-3 mt-0.5">
            <span className="font-mono text-xs text-white/35">{cls.code} · {cls.room} · {cls.time}</span>
            <span className="flex items-center gap-1.5 border border-amber-400/25 bg-amber-400/[0.06] px-2 py-0.5 font-mono text-[9px] text-amber-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              LATE AFTER {lateStr}
            </span>
          </div>
        </div>
        <button onClick={onBack}
          className="flex cursor-pointer items-center gap-1.5 self-start font-mono text-[11px] tracking-wider text-white/30 transition-colors hover:text-white/60">
          ← CHANGE CLASS
        </button>
      </div>

      {/* Main layout: video left, grid right */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">

        {/* ── LEFT: Camera panel ── */}
        <div className="w-full lg:w-[420px] lg:shrink-0">

          {/* Video container */}
          <div className="relative overflow-hidden border border-white/[0.08] bg-dark-900" style={{ aspectRatio: "4/3" }}>

            {/* Grid overlay on video */}
            <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-[size:30px_30px] opacity-30 z-10" />

            {camState === "idle" && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-dark-900/95">
                <div className="flex h-16 w-16 items-center justify-center border-2 border-teal/30 bg-teal/5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8 text-teal/50">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                  </svg>
                </div>
                <p className="font-sans text-sm text-white/40 text-center px-6">
                  Enable camera to start face recognition
                </p>
                <button 
                  type="button"
                  onClick={() => startCamera()}
                  className="border border-teal bg-teal px-6 py-2.5 font-mono text-[11px] font-bold tracking-widest text-dark hover:opacity-90 cursor-pointer transition-all active:scale-95">
                  ENABLE CAMERA
                </button>
              </div>
            )}

            {camState === "requesting" && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-dark-900/95">
                <svg className="h-8 w-8 animate-spin text-teal" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                </svg>
                <p className="font-mono text-[11px] tracking-wider text-white/40">REQUESTING CAMERA…</p>
              </div>
            )}

            {camState === "denied" && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 px-6 text-center bg-dark-900/95">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-10 w-10 text-red-400/60">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <p className="font-sans text-sm text-red-400/80">Camera access denied</p>
                <p className="font-mono text-[10px] text-white/30">Allow camera in browser settings then retry</p>
                <button 
                  type="button"
                  onClick={() => startCamera()}
                  className="mt-2 border border-white/15 px-5 py-2 font-mono text-[11px] text-white/50 hover:border-teal/40 hover:text-teal cursor-pointer transition-all active:scale-95">
                  RETRY
                </button>
              </div>
            )}

            {camState === "unsupported" && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 px-6 text-center bg-dark-900/95">
                <p className="font-sans text-sm text-amber-400/80">No camera found</p>
                <p className="font-mono text-[10px] text-white/30">Switch to manual attendance marking</p>
              </div>
            )}

            {/* Video element — always rendered so ref works */}
            <video ref={videoRef} muted playsInline autoPlay
              className={`h-full w-full object-cover ${camState === "running" ? "opacity-100" : "opacity-0"}`}
              style={{ transform: camFacing === "user" ? "scaleX(-1)" : "none" }}
            />

            {/* Bounding boxes */}
            {camState === "running" && bboxes.map(b => (
              <BboxFlash key={b.id} bbox={b.bbox} name={b.name} status={b.status} />
            ))}

            {/* Scan overlay: corner brackets when scanning */}
            {scanning && (
              <div className="pointer-events-none absolute inset-0 z-20">
                <span className="absolute top-3 left-3 h-8 w-8 border-t-2 border-l-2 border-teal" style={{ animation: "bracket-pulse 2s ease-in-out infinite" }} />
                <span className="absolute top-3 right-3 h-8 w-8 border-t-2 border-r-2 border-teal" style={{ animation: "bracket-pulse 2s 0.5s ease-in-out infinite" }} />
                <span className="absolute bottom-3 left-3 h-8 w-8 border-b-2 border-l-2 border-teal" style={{ animation: "bracket-pulse 2s 1s ease-in-out infinite" }} />
                <span className="absolute bottom-3 right-3 h-8 w-8 border-b-2 border-r-2 border-teal" style={{ animation: "bracket-pulse 2s 1.5s ease-in-out infinite" }} />
                {/* Sweep line */}
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-teal to-transparent opacity-80"
                  style={{ animation: "sweep 2.5s linear infinite" }} />
              </div>
            )}

            {/* Top-left status bar */}
            {camState === "running" && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 border border-white/10 bg-dark/80 px-3 py-1.5 backdrop-blur-sm">
                <span className={`h-1.5 w-1.5 rounded-full ${scanning ? "bg-teal animate-pulse" : "bg-white/30"}`} />
                <span className="font-mono text-[10px] text-white/70">
                  {scanning ? `SCANNING · ${fmtElapsed(elapsed)}` : modelsReady ? "READY" : "LOADING MODELS…"}
                </span>
              </div>
            )}

            {/* Demo badge */}
            <div className="absolute bottom-3 right-3 z-30 border border-teal/20 bg-dark/70 px-2 py-1 backdrop-blur-sm">
              <span className="font-mono text-[8px] tracking-widest text-teal/50">DEMO MODE</span>
            </div>
          </div>

          {/* Camera controls */}
          {camState === "running" && (
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex gap-2">
                {/* Scan / Stop button */}
                {!scanning ? (
                  <button onClick={startDemoScan} disabled={!modelsReady}
                    className={`flex flex-1 items-center justify-center gap-2.5 py-3 font-mono text-[11px] font-bold tracking-widest text-dark transition-all ${
                      modelsReady ? "cursor-pointer bg-teal hover:opacity-90" : "cursor-not-allowed bg-teal/30 text-dark/50"
                    }`}>
                    {!modelsReady ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                        </svg>
                        LOADING MODELS
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
                          <circle cx="12" cy="12" r="3" />
                          <path strokeLinecap="round" d="M12 5v2M12 17v2M5 12H3M21 12h-2M7.05 7.05 5.636 5.636M18.364 18.364l-1.414-1.414M7.05 16.95l-1.414 1.414M18.364 5.636l-1.414 1.414" />
                        </svg>
                        START SCAN
                      </>
                    )}
                  </button>
                ) : (
                  <button onClick={stopScan}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2.5 border border-red-400/30 bg-red-400/10 py-3 font-mono text-[11px] font-bold tracking-widest text-red-400 transition-all hover:bg-red-400/20">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <rect x="6" y="6" width="12" height="12" rx="1" />
                    </svg>
                    STOP SCAN
                  </button>
                )}

                {/* Camera flip button - only show if multiple cameras available */}
                {availableCameras.length > 1 && (
                  <button onClick={switchCamera} title="Switch camera"
                    className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center border border-white/10 bg-white/[0.03] text-white/40 transition-all hover:border-teal/30 hover:text-teal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                  </button>
                )}

                {/* Stop camera */}
                <button onClick={stopCamera} title="Stop camera"
                  className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center border border-white/10 bg-white/[0.03] text-white/40 transition-all hover:border-red-400/30 hover:text-red-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15.75 10.5 21 7.5v9l-5.25-3v-3ZM3.375 7.5h13.5c.621 0 1.125.504 1.125 1.125v7.5c0 .621-.504 1.125-1.125 1.125h-13.5A1.125 1.125 0 0 1 2.25 16.125v-7.5A1.125 1.125 0 0 1 3.375 7.5Z" />
                  </svg>
                </button>
              </div>

              {/* Camera indicator */}
              {availableCameras.length > 1 && currentDeviceId && (
                <p className="font-mono text-[10px] text-center text-white/30">
                  Using: {availableCameras.find(d => d.deviceId === currentDeviceId)?.label.split('(')[0].trim() || 'Camera'}
                </p>
              )}

              {/* Status message */}
              {demoMsg && (
                <p className="font-mono text-[10px] text-center text-teal/60">{demoMsg}</p>
              )}
            </div>
          )}

          {/* Late logic explainer */}
          <div className="mt-4 border border-white/[0.06] bg-dark-900/60 p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/25 mb-3">MARKING LOGIC</p>
            <div className="flex flex-col gap-2">
              {[
                { dot:"bg-emerald-400", label:"Present", rule:`Face detected before ${lateStr}` },
                { dot:"bg-amber-400",   label:"Late",    rule:`Detected after ${lateStr} (${LATE_GRACE_MINUTES} min grace)` },
                { dot:"bg-red-400",     label:"Absent",  rule:"Not detected by end of session" },
              ].map(r => (
                <div key={r.label} className="flex items-start gap-2.5">
                  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${r.dot}`} />
                  <div>
                    <span className="font-sans text-xs font-semibold text-white/60">{r.label}</span>
                    <span className="font-mono text-[10px] text-white/28 ml-2">{r.rule}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Live stats + student grid ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

          {/* Live progress bar */}
          <div className="border border-white/[0.07] bg-dark-900/60 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] text-white/35">
                {detected}/{students.length} detected · {unmarked} remaining
              </span>
              <span className={`font-mono text-sm font-black ${pct >= 75 ? "text-teal" : "text-amber-400"}`}>{pct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/6">
              <div className="flex h-full rounded-full overflow-hidden transition-all duration-500">
                <div className="bg-emerald-400" style={{ width: `${(present/students.length)*100}%` }} />
                <div className="bg-amber-400"   style={{ width: `${(late/students.length)*100}%`    }} />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { label:"Present", count:present, cls:"border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-400" },
                { label:"Late",    count:late,    cls:"border-amber-400/25 bg-amber-400/[0.07] text-amber-400"       },
                { label:"Absent",  count:absent,  cls:"border-red-400/25 bg-red-400/[0.06] text-red-400"             },
                { label:"Pending", count:unmarked,cls:"border-white/10 bg-white/[0.03] text-white/40"                },
              ].map(p => (
                <span key={p.label} className={`border px-2.5 py-1 font-mono text-[10px] ${p.cls}`}>
                  {p.count} {p.label}
                </span>
              ))}
            </div>
          </div>

          {/* Bulk manual overrides */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] text-white/22 mr-1">MANUAL:</span>
            <button onClick={() => students.forEach(s => setAttendance(p => ({...p, [s.id]:"present"})))}
              className="border border-emerald-400/25 bg-emerald-400/[0.06] px-3 py-1.5 font-mono text-[10px] text-emerald-400 hover:bg-emerald-400/15 cursor-pointer transition-all">
              ✓ ALL PRESENT
            </button>
            <button onClick={() => students.forEach(s => setAttendance(p => ({...p, [s.id]:"absent"})))}
              className="border border-red-400/25 bg-red-400/[0.05] px-3 py-1.5 font-mono text-[10px] text-red-400 hover:bg-red-400/15 cursor-pointer transition-all">
              ✕ ALL ABSENT
            </button>
            <button onClick={() => students.forEach(s => setAttendance(p => ({...p, [s.id]:"unmarked"})))}
              className="border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] text-white/35 hover:border-white/20 cursor-pointer transition-all">
              RESET
            </button>
            <span className="ml-auto hidden font-mono text-[10px] text-white/18 md:block">
              Tap card to toggle · Right-click for options
            </span>
          </div>

          {/* Student grid with virtual faces */}
          <StudentGrid
            students={students}
            attendance={attendance}
            setAttendance={setAttendance}
          />

          {/* Proceed button */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-2">
            <p className="font-mono text-[11px] text-white/25">
              {unmarked > 0
                ? `${unmarked} student${unmarked > 1 ? "s" : ""} will be marked absent`
                : "✓ All students marked"}
            </p>
            <button onClick={onNext}
              className={`flex cursor-pointer items-center justify-center gap-2 border px-8 py-3 font-mono text-[11px] font-bold tracking-widest transition-all ${
                unmarked === 0
                  ? "border-teal bg-teal text-dark hover:opacity-90"
                  : "border-teal/50 bg-teal/10 text-teal hover:border-teal hover:bg-teal/15"
              }`}>
              {unmarked > 0 ? `REVIEW (${unmarked} PENDING)` : "REVIEW →"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Toast stack (fixed top-right) ── */}
      <div className="fixed right-4 top-20 z-50 flex flex-col gap-2 w-72 sm:w-80 pointer-events-none">
        {toasts.map(t => (
          <DetectionToast
            key={t.id}
            student={t.student}
            status={t.status}
            confidence={t.confidence}
            onDismiss={() => dismissToast(t.id)}
          />
        ))}
      </div>

      {/* Keyframes for this step */}
      <style>{`
        @keyframes sweep {
          0%   { top: 0%;   }
          50%  { top: 100%; }
          100% { top: 0%;   }
        }
        @keyframes bracket-pulse {
          0%,100% { opacity: 0.4; }
          50%     { opacity: 1;   }
        }
        @keyframes bbox-in {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1);    }
        }
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(40px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STUDENT GRID — virtual face avatars + tap toggle + right-click
═══════════════════════════════════════════════════════════════════ */
function StudentGrid({ students, attendance, setAttendance }) {
  const [ctx, setCtx] = useState(null);

  function toggle(id) {
    setAttendance(prev => {
      const cur = prev[id] || "unmarked";
      const next = cur === "unmarked" ? "present" : cur === "present" ? "absent" : cur === "absent" ? "late" : "unmarked";
      return { ...prev, [id]: next };
    });
  }

  function force(id, status) {
    setAttendance(prev => ({ ...prev, [id]: status }));
    setCtx(null);
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-5 xl:grid-cols-6">
        {students.map((s, i) => {
          const status = attendance[s.id] || "unmarked";
          const isPresent = status === "present";
          const isAbsent  = status === "absent";
          const isLate    = status === "late";

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              onContextMenu={e => { e.preventDefault(); setCtx({ id: s.id, x: e.clientX, y: e.clientY }); }}
              style={{ animation: `fade-up 0.25s ${Math.min(i * 0.02, 0.5)}s ease both` }}
              className={[
                "relative flex cursor-pointer flex-col items-center gap-1.5 border p-2 text-center transition-all duration-200 active:scale-95",
                isPresent ? "border-emerald-400/40 bg-emerald-400/[0.07]"
                : isAbsent  ? "border-red-400/35 bg-red-400/[0.06]"
                : isLate    ? "border-amber-400/35 bg-amber-400/[0.06]"
                : "border-white/[0.07] bg-dark-900/60 hover:border-white/15",
              ].join(" ")}
            >
              {/* Status badge */}
              {status !== "unmarked" && (
                <span className={[
                  "absolute -top-1.5 -right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black",
                  isPresent ? "bg-emerald-400 text-dark"
                  : isAbsent  ? "bg-red-400 text-white"
                  : "bg-amber-400 text-dark",
                ].join(" ")}
                  style={{ animation: "badge-pop 0.3s cubic-bezier(0.34,1.56,0.64,1) both" }}>
                  {isPresent ? "✓" : isAbsent ? "✕" : "L"}
                </span>
              )}

              {/* Virtual face */}
              <div className={`transition-all duration-300 ${status !== "unmarked" ? "opacity-100" : "opacity-70 hover:opacity-90"}`}>
                <VirtualFace studentId={s.id} size={48} status={status} />
              </div>

              {/* Name */}
              <p className={`w-full truncate font-sans text-[10px] font-medium leading-tight transition-colors ${
                isPresent ? "text-emerald-400"
                : isAbsent  ? "text-red-400/80"
                : isLate    ? "text-amber-400"
                : "text-white/50"
              }`}>
                {s.name.split(" ")[0]}
              </p>
              <p className="font-mono text-[8px] text-white/22 truncate w-full">{s.roll.slice(-5)}</p>
            </button>
          );
        })}
      </div>

      {/* Right-click context */}
      {ctx && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setCtx(null)} />
          <div className="fixed z-50 min-w-[170px] border border-white/[0.1] bg-dark-900 py-1 shadow-2xl"
            style={{ left: ctx.x, top: ctx.y }}>
            {[
              { label:"Mark Present", status:"present", color:"text-emerald-400", dot:"bg-emerald-400" },
              { label:"Mark Late",    status:"late",    color:"text-amber-400",   dot:"bg-amber-400"   },
              { label:"Mark Absent",  status:"absent",  color:"text-red-400",     dot:"bg-red-400"     },
              { label:"Reset",        status:"unmarked",color:"text-white/40",    dot:"bg-white/25"    },
            ].map(opt => (
              <button key={opt.status} type="button"
                onClick={() => force(ctx.id, opt.status)}
                className={`flex w-full cursor-pointer items-center gap-2.5 border-0 bg-transparent px-4 py-2.5 font-sans text-sm transition-colors hover:bg-white/[0.05] ${opt.color}`}>
                <span className={`h-2 w-2 rounded-full ${opt.dot}`} />
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}

      <style>{`
        @keyframes badge-pop {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   REVIEW STEP
═══════════════════════════════════════════════════════════════════ */
function ReviewStep({ cls, attendance, students, onBack, onSubmit, submitting }) {
  const present  = students.filter(s => attendance[s.id] === "present");
  const late     = students.filter(s => attendance[s.id] === "late");
  const absent   = students.filter(s => attendance[s.id] === "absent");
  const unmarked = students.filter(s => !attendance[s.id] || attendance[s.id] === "unmarked");
  const pct      = students.length ? Math.round(((present.length + late.length) / students.length) * 100) : 0;

  function Pill({ student, dot, color }) {
    return (
      <div className={`flex items-center gap-2 border px-2.5 py-1.5 ${color}`}>
        <VirtualFace studentId={student.id} size={24} status={attendance[student.id]} />
        <div className="min-w-0">
          <p className="font-sans text-xs font-medium text-white/70 truncate">{student.name.split(" ")[0]}</p>
          <p className="font-mono text-[8px] text-white/25">{student.roll.slice(-5)}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: "fade-up 0.35s ease both" }}>
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.22em] text-teal/60 mb-1">STEP 3 OF 3 · REVIEW</p>
          <h2 className="font-sans text-2xl font-black text-white">Confirm Attendance</h2>
          <p className="font-sans text-sm text-white/35 mt-0.5">{cls.name} · {cls.code}</p>
        </div>
        <button onClick={onBack}
          className="flex cursor-pointer items-center gap-1.5 font-mono text-[11px] tracking-wider text-white/30 hover:text-white/60">
          ← EDIT
        </button>
      </div>

      {/* Summary */}
      <div className="mb-5 border border-white/[0.07] bg-dark-900/60 p-5">
        <div className="flex flex-wrap gap-6 mb-4">
          {[
            { label:"Present", count:present.length,  color:"text-emerald-400" },
            { label:"Late",    count:late.length,     color:"text-amber-400"   },
            { label:"Absent",  count:absent.length+unmarked.length, color:"text-red-400" },
            { label:"Rate",    count:`${pct}%`, color: pct >= 75 ? "text-teal" : "text-amber-400" },
          ].map(s => (
            <div key={s.label}>
              <p className={`font-sans text-2xl font-black ${s.color}`}>{s.count}</p>
              <p className="font-mono text-[10px] text-white/30">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/6">
          <div className="flex h-full rounded-full overflow-hidden">
            <div className="bg-emerald-400 transition-all" style={{ width:`${(present.length/students.length)*100}%` }} />
            <div className="bg-amber-400 transition-all"   style={{ width:`${(late.length/students.length)*100}%`    }} />
            <div className="bg-red-400 transition-all"     style={{ width:`${((absent.length+unmarked.length)/students.length)*100}%` }} />
          </div>
        </div>
      </div>

      {/* Student groups */}
      <div className="flex flex-col gap-4 mb-6">
        {[
          { group:present,  label:"Present", border:"border-emerald-400/15 bg-emerald-400/[0.03]", pill:"border-emerald-400/20" },
          { group:late,     label:"Late",    border:"border-amber-400/15  bg-amber-400/[0.03]",    pill:"border-amber-400/20"   },
          { group:[...absent,...unmarked], label:"Absent", border:"border-red-400/15 bg-red-400/[0.03]", pill:"border-red-400/20" },
        ].filter(g => g.group.length > 0).map(({ group, label, border, pill }) => (
          <div key={label} className={`border p-4 ${border}`}>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-white/30">
              {label} <span className="text-white/20">({group.length})</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {group.map(s => <Pill key={s.id} student={s} color={pill} />)}
            </div>
          </div>
        ))}
      </div>

      {(absent.length + unmarked.length > 0) && (
        <div className="mb-5 flex items-start gap-3 border border-amber-400/20 bg-amber-400/[0.05] p-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4 shrink-0 text-amber-400 mt-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <p className="font-sans text-sm text-amber-400/80">
            {absent.length + unmarked.length} student{absent.length + unmarked.length > 1 ? "s" : ""} marked absent.
          </p>
        </div>
      )}

      <button type="button" onClick={onSubmit} disabled={submitting}
        className={`flex w-full cursor-pointer items-center justify-center gap-3 py-4 font-mono text-sm font-bold tracking-widest text-dark transition-all ${submitting ? "bg-teal/60 cursor-not-allowed" : "bg-teal hover:opacity-90"}`}>
        {submitting ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
            </svg>
            SUBMITTING…
          </>
        ) : "SUBMIT ATTENDANCE →"}
      </button>
      <p className="mt-2 text-center font-mono text-[10px] text-white/20">Cannot be undone after submission.</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DONE SCREEN
═══════════════════════════════════════════════════════════════════ */
function DoneScreen({ cls, attendance, students, onDone }) {
  const present = students.filter(s => attendance[s.id] === "present").length;
  const late    = students.filter(s => attendance[s.id] === "late").length;
  const absent  = students.filter(s => !["present","late"].includes(attendance[s.id])).length;
  const pct     = Math.round(((present + late) / students.length) * 100);

  return (
    <div className="flex flex-col items-center py-12 text-center" style={{ animation: "fade-up 0.5s ease both" }}>
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center border-2 border-teal bg-teal/10">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-10 w-10 text-teal">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <div className="absolute inset-0 -m-2 rounded-full border border-teal/20 animate-ping" style={{ animationDuration:"2s" }} />
      </div>
      <p className="font-mono text-[11px] tracking-[0.25em] text-teal/70 mb-2">ATTENDANCE SUBMITTED</p>
      <h2 className="font-sans text-3xl font-black text-white mb-1">{cls.name}</h2>
      <p className="font-mono text-sm text-white/35 mb-8">{cls.code} · {new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}</p>
      <div className="flex gap-8 mb-8">
        {[
          { label:"Present", value:present, color:"text-emerald-400" },
          { label:"Late",    value:late,    color:"text-amber-400"   },
          { label:"Absent",  value:absent,  color:"text-red-400"     },
          { label:"Rate",    value:`${pct}%`, color: pct>=75?"text-teal":"text-amber-400" },
        ].map(s => (
          <div key={s.label} className="text-center">
            <p className={`font-sans text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="font-mono text-[10px] text-white/30">{s.label}</p>
          </div>
        ))}
      </div>
      {pct < 75 && (
        <div className="mb-6 max-w-sm border border-amber-400/20 bg-amber-400/[0.05] px-5 py-3">
          <p className="font-sans text-sm text-amber-400/80">Attendance below 75%. Consider notifying students.</p>
        </div>
      )}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button onClick={onDone}
          className="border border-teal bg-teal/10 px-8 py-3 font-mono text-[11px] font-bold tracking-widest text-teal transition-all hover:bg-teal/20 cursor-pointer">
          BACK TO DASHBOARD
        </button>
        <button className="border border-white/10 bg-white/[0.03] px-8 py-3 font-mono text-[11px] tracking-wider text-white/40 hover:border-white/20 hover:text-white/60 cursor-pointer transition-all">
          DOWNLOAD REPORT
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ROOT ORCHESTRATOR
═══════════════════════════════════════════════════════════════════ */
export default function AttendanceFlow({ initialClass = null, onDone }) {
  const [step,        setStep]        = useState(initialClass ? "mark" : "select");
  const [selectedCls, setSelectedCls] = useState(initialClass);
  const [attendance,  setAttendance]  = useState({});
  const [submitting,  setSubmitting]  = useState(false);

  const students = selectedCls ? (CLASS_STUDENTS[selectedCls.id] || []) : [];

  function selectClass(cls) {
    setSelectedCls(cls);
    const init = {};
    (CLASS_STUDENTS[cls.id] || []).forEach(s => { init[s.id] = "unmarked"; });
    setAttendance(init);
    setStep("mark");
  }

  async function handleSubmit() {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1800));
    setSubmitting(false);
    setStep("done");
  }

  return (
    <div className="mx-auto max-w-6xl">
      {step === "select" && (
        <ClassSelector onSelect={selectClass} preSelected={selectedCls} />
      )}
      {step === "mark" && selectedCls && (
        <FaceScanStep
          key={selectedCls.id}
          cls={selectedCls}
          attendance={attendance}
          setAttendance={setAttendance}
          onNext={() => setStep("review")}
          onBack={() => setStep("select")}
        />
      )}
      {step === "review" && selectedCls && (
        <ReviewStep
          cls={selectedCls}
          attendance={attendance}
          students={students}
          onBack={() => setStep("mark")}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
      {step === "done" && selectedCls && (
        <DoneScreen
          cls={selectedCls}
          attendance={attendance}
          students={students}
          onDone={onDone}
        />
      )}
      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
}