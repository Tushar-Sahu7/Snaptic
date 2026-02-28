import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router";
import * as faceapi from "@vladmandic/face-api";
/* ══════════════════════════════════════════════════════════
   CONSTANTS & DATA
══════════════════════════════════════════════════════════ */

const PROGRAMS = [
  "B.Tech","M.Tech","BCA","MCA","B.Sc","M.Sc","MBA","BBA","Ph.D","B.Com","M.Com",
];
const DEPARTMENTS = [
  "Computer Science","Information Technology","Electronics & Communication",
  "Mechanical Engineering","Civil Engineering","Electrical Engineering",
  "Management Studies","Mathematics","Physics","Chemistry",
];
const YEARS     = ["1st Year","2nd Year","3rd Year","4th Year","5th Year"];
const SEMESTERS = [
  "Semester 1","Semester 2","Semester 3","Semester 4",
  "Semester 5","Semester 6","Semester 7","Semester 8",
];

const FACE_API_CDN = "./models";

const EMPTY_FORM = {
  fullName:"", email:"", gender:"", mobile:"", dob:"",
  admissionNo:"", program:"", department:"", year:"", semester:"",
  password:"", confirmPw:"",
  faceConsent: false, faceCapture: null,
};

const STEPS = [
  { id:1, code:"01", label:"Personal"  },
  { id:2, code:"02", label:"Academic"  },
  { id:3, code:"03", label:"Security"  },
  { id:4, code:"04", label:"Face Scan" },
  { id:5, code:"05", label:"Review"    },
];

/* ══════════════════════════════════════════════════════════
   VALIDATION
══════════════════════════════════════════════════════════ */

const EMAIL_RE  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[6-9]\d{9}$/;

function v1(f) {
  const e = {};
  if (!f.fullName.trim())             e.fullName = "Full name is required.";
  else if (f.fullName.trim().length < 3) e.fullName = "At least 3 characters required.";
  if (!f.email.trim())                e.email    = "Email is required.";
  else if (!EMAIL_RE.test(f.email))   e.email    = "Enter a valid email address.";
  if (!f.gender)                      e.gender   = "Please select a gender.";
  if (!f.mobile.trim())               e.mobile   = "Mobile number is required.";
  else if (!MOBILE_RE.test(f.mobile)) e.mobile   = "Enter a valid 10-digit Indian mobile number.";
  if (!f.dob)                         e.dob      = "Date of birth is required.";
  else {
    const ageYrs = (Date.now() - new Date(f.dob)) / (1000 * 60 * 60 * 24 * 365.25);
    if (ageYrs < 14) e.dob = "You must be at least 14 years old.";
    if (ageYrs > 80) e.dob = "Please enter a valid date of birth.";
  }
  return e;
}

function v2(f) {
  const e = {};
  if (!f.admissionNo.trim()) e.admissionNo = "Admission number is required.";
  if (!f.program)            e.program     = "Please select a program.";
  if (!f.department)         e.department  = "Please select a department.";
  if (!f.year)               e.year        = "Please select a year.";
  if (!f.semester)           e.semester    = "Please select a semester.";
  return e;
}

function pwRules(pw) {
  return {
    length:  pw.length >= 8,
    upper:   /[A-Z]/.test(pw),
    lower:   /[a-z]/.test(pw),
    number:  /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
}

function v3(f) {
  const e = {};
  const r = pwRules(f.password);
  if (!f.password)                          e.password  = "Password is required.";
  else if (!Object.values(r).every(Boolean)) e.password  = "Password does not meet all requirements.";
  if (!f.confirmPw)                         e.confirmPw = "Please confirm your password.";
  else if (f.password !== f.confirmPw)      e.confirmPw = "Passwords do not match.";
  return e;
}

function v4(f) {
  const e = {};
  if (!f.faceConsent) e.faceConsent = "You must consent to facial enrollment to proceed.";
  if (!f.faceCapture) e.faceCapture = "A face scan is required. Please capture your face.";
  return e;
}

const VALIDATORS = { 1: v1, 2: v2, 3: v3, 4: v4 };

/* ══════════════════════════════════════════════════════════
   SMALL REUSABLE ATOMS
══════════════════════════════════════════════════════════ */

function FieldErr({ msg }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1.5 font-mono text-[10px] text-red-400 mt-1.5">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3 shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75h.007v.008H12v-.008Z" />
      </svg>
      {msg}
    </p>
  );
}

function CheckIco({ cls = "h-3.5 w-3.5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className={cls}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function XIcon({ cls = "h-3 w-3" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className={cls}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function EyeToggle({ show, onToggle }) {
  return (
    <button type="button" tabIndex={-1} onClick={onToggle}
      className="mr-3.5 shrink-0 text-white/25 hover:text-teal/80 transition-colors cursor-pointer">
      {show ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
      )}
    </button>
  );
}

/* Shared input border wrapper */
function InputBox({ hasError, isValid, children }) {
  return (
    <div className={[
      "flex items-center border transition-all duration-200 focus-within:ring-1",
      hasError  ? "border-red-500/50 bg-red-500/3 focus-within:ring-red-500/20"
                : isValid
                ? "border-teal/50 bg-teal/2.5 focus-within:ring-teal/15"
                : "border-white/10 bg-white/2.5 focus-within:border-white/25 focus-within:ring-white/5",
    ].join(" ")}>
      {children}
    </div>
  );
}

/* Native select styled */
function StyledSelect({ value, onChange, options, placeholder, hasError }) {
  return (
    <InputBox hasError={hasError} isValid={!!value}>
      <select
        value={value} onChange={onChange}
        className="w-full appearance-none bg-transparent px-4 py-3.5 font-sans text-sm text-white outline-none cursor-pointer"
        style={{ colorScheme: "dark" }}
      >
        <option value="" disabled className="bg-dark-900 text-white/40">{placeholder}</option>
        {options.map(o => (
          <option key={o} value={o} className="bg-dark-900 text-white">{o}</option>
        ))}
      </select>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
        className="mr-3.5 h-4 w-4 shrink-0 text-white/20 pointer-events-none">
        <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
      </svg>
    </InputBox>
  );
}

/* Field wrapper: label + input + error */
function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/30">{label}</label>
      {children}
      <FieldErr msg={error} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   STEP PROGRESS BAR
══════════════════════════════════════════════════════════ */

function ProgressBar({ current }) {
  return (
    <div className="mb-10 flex items-start">
      {STEPS.map((s, i) => {
        const done   = s.id < current;
        const active = s.id === current;
        return (
          <div key={s.id} className={["flex items-center", i < STEPS.length - 1 ? "flex-1" : ""].join(" ")}>
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              {/* Circle */}
              <div className={[
                "flex h-10 w-10 items-center justify-center border-2 font-mono text-[11px] font-bold transition-all duration-300",
                done   ? "border-teal bg-teal text-dark"
                : active ? "border-teal bg-teal/10 text-teal shadow-[0_0_12px_rgba(0,229,190,0.25)]"
                :          "border-white/10 text-white/20",
              ].join(" ")}>
                {done ? <CheckIco cls="h-4 w-4" /> : s.code}
              </div>
              {/* Label */}
              <span className={[
                "hidden sm:block font-mono text-[9px] tracking-[0.14em] uppercase whitespace-nowrap",
                active ? "text-teal" : done ? "text-teal/40" : "text-white/15",
              ].join(" ")}>{s.label}</span>
            </div>
            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div className="mx-1.5 mb-5 flex-1 relative h-px">
                <div className="absolute inset-0 bg-white/8" />
                <div className={[
                  "absolute inset-0 origin-left bg-teal/60 transition-all duration-500",
                  done ? "scale-x-100" : "scale-x-0",
                ].join(" ")} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   STEP 1 — PERSONAL INFO
══════════════════════════════════════════════════════════ */

function StepPersonal({ f, set, err }) {
  const emailOk  = EMAIL_RE.test(f.email);
  const mobileOk = MOBILE_RE.test(f.mobile);

  return (
    <div className="flex flex-col gap-5">
      {/* Full Name */}
      <Field label="Full Name *" error={err.fullName}>
        <InputBox hasError={!!err.fullName} isValid={f.fullName.trim().length >= 3}>
          <input type="text" value={f.fullName}
            onChange={e => set("fullName", e.target.value)}
            placeholder="e.g. Arjun Kumar Sharma"
            className="w-full bg-transparent px-4 py-3.5 font-sans text-sm text-white placeholder-white/20 outline-none"
            autoComplete="name"
          />
          {f.fullName.trim().length >= 3 && !err.fullName &&
            <CheckIco cls="mr-3.5 h-3.5 w-3.5 shrink-0 text-teal" />}
        </InputBox>
      </Field>

      {/* Email */}
      <Field label="Email Address *" error={err.email}>
        <InputBox hasError={!!err.email} isValid={emailOk && !err.email}>
          <input type="email" value={f.email}
            onChange={e => set("email", e.target.value)}
            placeholder="student@university.edu"
            className="w-full bg-transparent px-4 py-3.5 font-sans text-sm text-white placeholder-white/20 outline-none"
            autoComplete="email"
          />
          {emailOk && !err.email &&
            <CheckIco cls="mr-3.5 h-3.5 w-3.5 shrink-0 text-teal" />}
        </InputBox>
      </Field>

      {/* Gender + DOB */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Gender *" error={err.gender}>
          <StyledSelect value={f.gender}
            onChange={e => set("gender", e.target.value)}
            options={["Male","Female","Non-binary","Prefer not to say"]}
            placeholder="Select gender"
            hasError={!!err.gender}
          />
        </Field>
        <Field label="Date of Birth *" error={err.dob}>
          <InputBox hasError={!!err.dob} isValid={!!f.dob}>
            <input type="date" value={f.dob}
              max={new Date().toISOString().split("T")[0]}
              onChange={e => set("dob", e.target.value)}
              className="w-full bg-transparent px-4 py-3.5 font-sans text-sm text-white outline-none"
              style={{ colorScheme: "dark" }}
            />
          </InputBox>
        </Field>
      </div>

      {/* Mobile */}
      <Field label="Mobile Number *" error={err.mobile}>
        <InputBox hasError={!!err.mobile} isValid={mobileOk && !err.mobile}>
          <span className="ml-4 font-mono text-xs text-teal/60 shrink-0">+91</span>
          <div className="mx-3 h-4 w-px bg-white/10 shrink-0" />
          <input type="tel" value={f.mobile} maxLength={10}
            onChange={e => set("mobile", e.target.value.replace(/\D/g,""))}
            placeholder="9876543210"
            className="w-full bg-transparent py-3.5 pr-4 font-sans text-sm text-white placeholder-white/20 outline-none tracking-wider"
          />
          {mobileOk && !err.mobile &&
            <CheckIco cls="mr-3.5 h-3.5 w-3.5 shrink-0 text-teal" />}
        </InputBox>
      </Field>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   STEP 2 — ACADEMIC DETAILS
══════════════════════════════════════════════════════════ */

function StepAcademic({ f, set, err }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Admission No */}
      <Field label="Admission Number *" error={err.admissionNo}>
        <InputBox hasError={!!err.admissionNo} isValid={!!f.admissionNo.trim()}>
          <input type="text" value={f.admissionNo}
            onChange={e => set("admissionNo", e.target.value.toUpperCase())}
            placeholder="e.g. 2024CS001"
            className="w-full bg-transparent px-4 py-3.5 font-mono text-sm text-white placeholder-white/20 outline-none tracking-widest"
          />
        </InputBox>
      </Field>

      {/* Program + Department */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Program *" error={err.program}>
          <StyledSelect value={f.program}
            onChange={e => set("program", e.target.value)}
            options={PROGRAMS} placeholder="Select program" hasError={!!err.program}
          />
        </Field>
        <Field label="Department *" error={err.department}>
          <StyledSelect value={f.department}
            onChange={e => set("department", e.target.value)}
            options={DEPARTMENTS} placeholder="Select department" hasError={!!err.department}
          />
        </Field>
      </div>

      {/* Year + Semester */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Year *" error={err.year}>
          <StyledSelect value={f.year}
            onChange={e => set("year", e.target.value)}
            options={YEARS} placeholder="Select year" hasError={!!err.year}
          />
        </Field>
        <Field label="Semester *" error={err.semester}>
          <StyledSelect value={f.semester}
            onChange={e => set("semester", e.target.value)}
            options={SEMESTERS} placeholder="Select semester" hasError={!!err.semester}
          />
        </Field>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   STEP 3 — SECURITY / PASSWORD
══════════════════════════════════════════════════════════ */

function StepSecurity({ f, set, err }) {
  const [showPw,  setShowPw]  = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const rules = pwRules(f.password);
  const allOk = Object.values(rules).every(Boolean);
  const RULE_LIST = [
    { key:"length",  label:"Minimum 8 characters" },
    { key:"upper",   label:"One uppercase letter"  },
    { key:"lower",   label:"One lowercase letter"  },
    { key:"number",  label:"One number (0–9)"      },
    { key:"special", label:"One special character" },
  ];

  const match = f.password && f.confirmPw && f.password === f.confirmPw;

  return (
    <div className="flex flex-col gap-5">
      {/* Password */}
      <Field label="Password *" error={err.password}>
        <InputBox hasError={!!err.password} isValid={allOk}>
          <input type={showPw ? "text" : "password"} value={f.password}
            onChange={e => set("password", e.target.value)}
            placeholder="Create a strong password"
            className="w-full bg-transparent px-4 py-3.5 font-sans text-sm text-white placeholder-white/20 outline-none"
            autoComplete="new-password"
          />
          {allOk && <CheckIco cls="h-3.5 w-3.5 shrink-0 text-teal" />}
          <EyeToggle show={showPw} onToggle={() => setShowPw(v => !v)} />
        </InputBox>

        {/* Rule checklist — shows as soon as user starts typing */}
        {f.password.length > 0 && (
          <div className="mt-3 grid grid-cols-1 gap-1.5 border border-white/6 bg-white/1.5 p-3.5 sm:grid-cols-2">
            {RULE_LIST.map(r => (
              <div key={r.key} className="flex items-center gap-2">
                <span className={rules[r.key] ? "text-teal" : "text-white/20"}>
                  {rules[r.key]
                    ? <CheckIco cls="h-3 w-3" />
                    : <XIcon cls="h-3 w-3" />}
                </span>
                <span className={[
                  "font-mono text-[9.5px] tracking-wide",
                  rules[r.key] ? "text-teal/80" : "text-white/25",
                ].join(" ")}>{r.label}</span>
              </div>
            ))}
          </div>
        )}
      </Field>

      {/* Confirm Password */}
      <Field label="Confirm Password *" error={err.confirmPw}>
        <InputBox
          hasError={!!err.confirmPw || (!!f.confirmPw && !match)}
          isValid={match}
        >
          <input type={showCpw ? "text" : "password"} value={f.confirmPw}
            onChange={e => set("confirmPw", e.target.value)}
            placeholder="Re-enter your password"
            className="w-full bg-transparent px-4 py-3.5 font-sans text-sm text-white placeholder-white/20 outline-none"
            autoComplete="new-password"
          />
          {match && <CheckIco cls="h-3.5 w-3.5 shrink-0 text-teal" />}
          <EyeToggle show={showCpw} onToggle={() => setShowCpw(v => !v)} />
        </InputBox>
        {f.confirmPw && !match && !err.confirmPw && (
          <p className="flex items-center gap-1.5 font-mono text-[10px] text-amber-400 mt-1.5">
            <XIcon cls="h-3 w-3" /> Passwords do not match
          </p>
        )}
      </Field>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   STEP 4 — FACE SCAN (face-api.js)
══════════════════════════════════════════════════════════ */

function StepFaceScan({ f, set, err }) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef    = useRef(null);

  // model: idle | loading | ready | error
  const [modelState, setModelState] = useState("idle");
  // camera: off | starting | live | error
  const [camState,   setCamState]   = useState("off");
  const [faceFound,  setFaceFound]  = useState(false);
  const [liveMsg,    setLiveMsg]    = useState("");
  const [captured,   setCaptured]   = useState(f.faceCapture || null);

  /* Load models once on mount */
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setModelState("loading");
      try {
        const fa = faceapi;
        if (!fa) throw new Error("face-api not found");
        await Promise.all([
          fa.nets.tinyFaceDetector.loadFromUri(FACE_API_CDN),
          fa.nets.faceLandmark68TinyNet.loadFromUri(FACE_API_CDN),
        ]);
        if (!cancelled) setModelState("ready");
      } catch {
        if (!cancelled) setModelState("error");
      }
    }
    load();
    return () => { cancelled = true; stopCamera(); };
  }, []);

  async function startCamera() {
    try {
      setCamState("starting");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCamState("live");
      runDetection();
    } catch {
      setCamState("error");
    }
  }

  function stopCamera() {
    if (rafRef.current)    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCamState("off");
    setFaceFound(false);
    setLiveMsg("");
  }

  const runDetection = useCallback(async () => {
    const fa  = faceapi;
    const vid = videoRef.current;
    if (!fa || !vid || vid.readyState < 2) {
      rafRef.current = requestAnimationFrame(runDetection);
      return;
    }
    try {
      const det = await fa
        .detectSingleFace(vid, new fa.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
        .withFaceLandmarks(true);

      setFaceFound(!!det);

      if (det) {
        const pct = Math.round(det.detection.score * 100);
        setLiveMsg(pct >= 85 ? `Face detected  ${pct}% confidence` : "Move closer or improve lighting");

        /* Draw overlay */
        const cv = canvasRef.current;
        if (cv) {
          cv.width  = vid.videoWidth;
          cv.height = vid.videoHeight;
          fa.draw.drawDetections(cv, [det.detection]);
          fa.draw.drawFaceLandmarks(cv, [det]);
        }
      } else {
        setLiveMsg("No face detected — look straight at the camera");
        if (canvasRef.current) {
          const cv = canvasRef.current;
          cv.getContext("2d").clearRect(0, 0, cv.width, cv.height);
        }
      }
    } catch { /* silent */ }
    rafRef.current = requestAnimationFrame(runDetection);
  }, []);

  function capture() {
    const vid = videoRef.current;
    if (!vid || !faceFound) return;
    const cv = document.createElement("canvas");
    cv.width  = vid.videoWidth;
    cv.height = vid.videoHeight;
    cv.getContext("2d").drawImage(vid, 0, 0);
    const img = cv.toDataURL("image/jpeg", 0.88);
    setCaptured(img);
    set("faceCapture", img);
    stopCamera();
  }

  function retake() {
    setCaptured(null);
    set("faceCapture", null);
    startCamera();
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Consent Banner ── */}
      <div
        onClick={() => set("faceConsent", !f.faceConsent)}
        className={[
          "flex cursor-pointer items-start gap-4 border p-4 transition-all duration-200 select-none",
          err.faceConsent        ? "border-red-500/40 bg-red-500/2.5"
          : f.faceConsent        ? "border-teal/35 bg-teal/[0.035]"
          :                        "border-white/10 bg-white/1.5 hover:border-white/20",
        ].join(" ")}
      >
        {/* Custom checkbox */}
        <div className={[
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border-2 transition-all duration-200",
          f.faceConsent ? "border-teal bg-teal/15" : "border-white/25",
        ].join(" ")}>
          {f.faceConsent && <CheckIco cls="h-3 w-3 text-teal" />}
        </div>
        <div>
          <p className="font-sans text-sm leading-relaxed text-white/75">
            I consent to the collection and secure on-device processing of my facial biometric data
            for attendance verification on the Snaptic platform.
          </p>
          <p className="mt-1.5 font-mono text-[10px] text-white/25 tracking-wide">
            ◆  Encrypted &amp; stored on-device  ·  Never shared with third parties  ·  Deletable on request
          </p>
        </div>
      </div>
      <FieldErr msg={err.faceConsent} />

      {/* ── Face-api model status ── */}
      {modelState === "loading" && (
        <div className="flex items-center justify-center gap-3 border border-teal/20 bg-teal/2 p-5">
          <svg className="h-5 w-5 animate-spin text-teal" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
          </svg>
          <span className="font-mono text-[11px] tracking-widest text-teal/70">LOADING AI MODELS…</span>
        </div>
      )}

      {modelState === "error" && (
        <div className="border border-red-500/25 bg-red-500/3 p-4">
          <p className="font-mono text-[11px] text-red-400 mb-1.5">Failed to load face-api.js models.</p>
          <p className="font-mono text-[10px] text-white/30 leading-relaxed">
            Ensure this script is in your <code className="text-teal/60">index.html</code> before the app bundle:
          </p>
          <code className="mt-2 block font-mono text-[10px] text-teal/60 leading-relaxed break-all">
            {'<script src="https://cdn.jsdelivr.net/npm/@vladmandic/face-api"></script>'}
          </code>
        </div>
      )}

      {/* ── Camera area (only shown when consent given + models ready) ── */}
      {f.faceConsent && modelState === "ready" && (
        <div className="flex flex-col items-center gap-4">

          {!captured ? (
            <>
              {/* Viewfinder */}
              <div className="relative w-full max-w-sm overflow-hidden border border-white/10 bg-dark-900 aspect-4/3">

                {/* Teal corner brackets */}
                <span className="absolute top-0 left-0 z-20 h-7 w-7 border-t-2 border-l-2 border-teal" />
                <span className="absolute top-0 right-0 z-20 h-7 w-7 border-t-2 border-r-2 border-teal" />
                <span className="absolute bottom-0 left-0 z-20 h-7 w-7 border-b-2 border-l-2 border-teal" />
                <span className="absolute bottom-0 right-0 z-20 h-7 w-7 border-b-2 border-r-2 border-teal" />

                {/* Camera off placeholder */}
                {camState === "off" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={0.8}
                      className="h-20 w-20 text-white/8">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
                    </svg>
                    <p className="font-mono text-[10px] tracking-[0.18em] text-white/15">AWAITING CAMERA</p>
                  </div>
                )}

                {/* Starting spinner */}
                {camState === "starting" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="h-8 w-8 animate-spin text-teal/60" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                    </svg>
                  </div>
                )}

                {/* Camera error */}
                {camState === "error" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <p className="font-mono text-[11px] text-red-400">Camera access denied.</p>
                    <p className="font-mono text-[10px] text-white/25">Allow camera permission in your browser.</p>
                  </div>
                )}

                {/* Live video */}
                <video ref={videoRef} muted playsInline
                  className={["absolute inset-0 h-full w-full object-cover", camState === "live" ? "block" : "hidden"].join(" ")} />

                {/* Detection overlay canvas */}
                <canvas ref={canvasRef}
                  className={["absolute inset-0 h-full w-full z-10", camState === "live" ? "block" : "hidden"].join(" ")} />

                {/* Live status strip */}
                {camState === "live" && (
                  <div className="absolute bottom-0 inset-x-0 z-20 bg-dark/75 px-3 py-2 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <span className={[
                        "h-1.5 w-1.5 rounded-full shrink-0",
                        faceFound ? "bg-teal animate-pulse" : "bg-amber-400",
                      ].join(" ")} />
                      <p className={[
                        "font-mono text-[10px] tracking-wide",
                        faceFound ? "text-teal" : "text-amber-400",
                      ].join(" ")}>{liveMsg}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera controls */}
              <div className="flex w-full max-w-sm gap-3">
                {(camState === "off" || camState === "error") ? (
                  <button type="button" onClick={startCamera}
                    className="flex-1 border border-teal/35 bg-teal/5 py-3.5 font-mono text-[11px] font-bold tracking-widest text-teal transition-all hover:bg-teal/10 cursor-pointer">
                    ▶  START CAMERA
                  </button>
                ) : (
                  <>
                    <button type="button" onClick={stopCamera}
                      className="border border-white/10 bg-transparent px-5 py-3.5 font-mono text-[11px] tracking-widest text-white/35 hover:border-white/20 hover:text-white/55 transition-all cursor-pointer">
                      STOP
                    </button>
                    <button type="button" onClick={capture} disabled={!faceFound}
                      className={[
                        "flex-1 py-3.5 font-mono text-[11px] font-bold tracking-widest transition-all border-0",
                        faceFound
                          ? "bg-teal text-dark cursor-pointer hover:opacity-90"
                          : "bg-white/5 text-white/20 cursor-not-allowed",
                      ].join(" ")}>
                      ◎  CAPTURE FACE
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            /* ── Captured preview ── */
            <div className="w-full max-w-sm flex flex-col gap-4">
              <div className="relative overflow-hidden border-2 border-teal">
                <img src={captured} alt="Captured face" className="w-full object-cover" />
                {/* Success badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-teal px-2.5 py-1">
                  <CheckIco cls="h-3.5 w-3.5 text-dark" />
                  <span className="font-mono text-[10px] font-bold tracking-wider text-dark">ENROLLED</span>
                </div>
              </div>
              <div className="flex items-center justify-between border border-teal/20 bg-teal/3 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse" />
                  <span className="font-mono text-[10px] tracking-[0.16em] text-teal/75">
                    FACE SCAN COMPLETE
                  </span>
                </div>
                <button type="button" onClick={retake}
                  className="font-mono text-[10px] tracking-wider text-white/30 transition-colors hover:text-white/65 cursor-pointer">
                  RETAKE →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <FieldErr msg={err.faceCapture} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   EDIT MODAL (used in Review step)
══════════════════════════════════════════════════════════ */

function EditModal({ field, value, onSave, onClose }) {
  const [val, setVal]   = useState(value ?? "");
  const [err, setErr]   = useState("");

  const isSelect = !!field.options;
  const isDate   = field.type === "date";

  function save() {
    if (!val.toString().trim()) { setErr(`${field.label} cannot be empty.`); return; }
    onSave(field.key, val);
    onClose();
  }

  // close on backdrop click
  function onBackdrop(e) { if (e.target === e.currentTarget) onClose(); }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-dark/85 px-5 backdrop-blur-sm"
      onClick={onBackdrop}
    >
      <div className="w-full max-w-sm border border-teal/25 bg-dark-900"
        style={{ animation: "modal-in 0.2s ease both" }}>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <div>
            <p className="font-mono text-[9px] tracking-[0.2em] text-teal/50 uppercase">Edit Field</p>
            <p className="mt-0.5 font-sans text-sm font-bold">{field.label}</p>
          </div>
          <button type="button" onClick={onClose}
            className="text-white/25 hover:text-white/70 transition-colors cursor-pointer">
            <XIcon cls="h-4 w-4" />
          </button>
        </div>

        {/* Input */}
        <div className="px-5 py-5">
          {isSelect ? (
            <StyledSelect
              value={val}
              onChange={e => { setVal(e.target.value); setErr(""); }}
              options={field.options}
              placeholder={`Choose ${field.label}`}
              hasError={!!err}
            />
          ) : (
            <InputBox hasError={!!err} isValid={!!val}>
              <input
                autoFocus
                type={field.type || "text"}
                value={val}
                onChange={e => { setVal(e.target.value); setErr(""); }}
                className="w-full bg-transparent px-4 py-3.5 font-sans text-sm text-white outline-none"
                style={{ colorScheme: "dark" }}
                max={isDate ? new Date().toISOString().split("T")[0] : undefined}
              />
            </InputBox>
          )}
          <FieldErr msg={err} />
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t border-white/[0.07] px-5 py-4">
          <button type="button" onClick={onClose}
            className="flex-1 border border-white/12 py-2.5 font-mono text-[11px] tracking-widest text-white/35 hover:border-white/22 hover:text-white/55 transition-all cursor-pointer">
            CANCEL
          </button>
          <button type="button" onClick={save}
            className="flex-1 border-0 bg-teal py-2.5 font-mono text-[11px] font-bold tracking-widest text-dark hover:opacity-90 transition-all cursor-pointer">
            SAVE  ✓
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   STEP 5 — REVIEW & VERIFY
══════════════════════════════════════════════════════════ */

const REVIEW_SECTIONS = [
  {
    title: "Personal Information",
    step: 1,
    fields: [
      { key:"fullName",  label:"Full Name",     type:"text"  },
      { key:"email",     label:"Email",          type:"email" },
      { key:"gender",    label:"Gender",         type:"select", options:["Male","Female","Non-binary","Prefer not to say"] },
      { key:"dob",       label:"Date of Birth",  type:"date"  },
      { key:"mobile",    label:"Mobile",         type:"tel"   },
    ],
  },
  {
    title: "Academic Details",
    step: 2,
    fields: [
      { key:"admissionNo", label:"Admission No.", type:"text" },
      { key:"program",     label:"Program",       type:"select", options:PROGRAMS },
      { key:"department",  label:"Department",    type:"select", options:DEPARTMENTS },
      { key:"year",        label:"Year",          type:"select", options:YEARS },
      { key:"semester",    label:"Semester",      type:"select", options:SEMESTERS },
    ],
  },
];

function StepReview({ f, set, goTo }) {
  const [modal, setModal] = useState(null); // { field } or null

  function openEdit(field) { setModal({ field }); }
  function saveEdit(key, val) { set(key, val); }

  return (
    <div className="flex flex-col gap-5">

      {REVIEW_SECTIONS.map(sec => (
        <div key={sec.title} className="border border-white/8 overflow-hidden">
          {/* Section header */}
          <div className="flex items-center justify-between border-b border-white/8 bg-white/1.5 px-5 py-3">
            <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-teal/60">
              {sec.title}
            </span>
            <button type="button" onClick={() => goTo(sec.step)}
              className="font-mono text-[10px] tracking-wider text-white/25 hover:text-teal transition-colors cursor-pointer">
              EDIT SECTION →
            </button>
          </div>

          {/* Rows */}
          {sec.fields.map(field => (
            <div key={field.key}
              className="group flex items-center border-b border-white/4 last:border-0 px-5 py-3.5 hover:bg-teal/2 transition-colors cursor-pointer"
              onClick={() => openEdit(field)}
            >
              <span className="w-36 shrink-0 font-mono text-[10px] tracking-wide text-white/25">
                {field.label}
              </span>
              <span className="flex-1 truncate font-sans text-sm text-white/70 pl-3">
                {f[field.key] || <em className="text-white/18 text-xs not-italic">—</em>}
              </span>
              {/* Pencil */}
              <span className="ml-3 shrink-0 text-white/12 group-hover:text-teal transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-3.5 w-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                </svg>
              </span>
            </div>
          ))}
        </div>
      ))}

      {/* Security row — password masked */}
      <div className="border border-white/8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/8 bg-white/1.5 px-5 py-3">
          <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-teal/60">Security</span>
          <button type="button" onClick={() => goTo(3)}
            className="font-mono text-[10px] tracking-wider text-white/25 hover:text-teal transition-colors cursor-pointer">
            EDIT SECTION →
          </button>
        </div>
        <div className="flex items-center px-5 py-3.5">
          <span className="w-36 shrink-0 font-mono text-[10px] tracking-wide text-white/25">Password</span>
          <span className="font-mono text-sm tracking-widest text-white/40">
            {"•".repeat(Math.min(f.password.length, 12))}
          </span>
          <span className="ml-auto font-mono text-[10px] text-teal/50 pl-3">SET ✓</span>
        </div>
      </div>

      {/* Face scan row */}
      <div className="border border-white/8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/8 bg-white/1.5 px-5 py-3">
          <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-teal/60">Facial Enrollment</span>
          <button type="button" onClick={() => goTo(4)}
            className="font-mono text-[10px] tracking-wider text-white/25 hover:text-teal transition-colors cursor-pointer">
            RETAKE →
          </button>
        </div>
        <div className="flex items-center gap-4 px-5 py-4">
          {f.faceCapture ? (
            <>
              <img src={f.faceCapture} alt="face"
                className="h-14 w-14 shrink-0 rounded-full object-cover border-2 border-teal" />
              <div>
                <p className="font-sans text-sm text-white/70">Face scan enrolled</p>
                <p className="font-mono text-[10px] text-teal mt-0.5">◆ BIOMETRIC VERIFIED</p>
              </div>
            </>
          ) : (
            <p className="font-sans text-sm italic text-white/25">No face scan captured</p>
          )}
        </div>
      </div>

      {/* Consent summary */}
      <div className={[
        "flex items-center gap-3 border px-4 py-3",
        f.faceConsent ? "border-teal/20 bg-teal/3" : "border-red-500/20 bg-red-500/2",
      ].join(" ")}>
        {f.faceConsent
          ? <CheckIco cls="h-4 w-4 shrink-0 text-teal" />
          : <XIcon cls="h-4 w-4 shrink-0 text-red-400" />}
        <p className="font-mono text-[10px] tracking-wide text-white/40">
          Facial biometric consent — {f.faceConsent ? "ACCEPTED" : "NOT ACCEPTED"}
        </p>
      </div>

      {/* Edit modal */}
      {modal && (
        <EditModal
          field={modal.field}
          value={f[modal.field.key]}
          onSave={saveEdit}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   STEP HEADING
══════════════════════════════════════════════════════════ */

function StepHead({ code, title, sub }) {
  return (
    <div className="mb-7 pb-6 border-b border-white/6">
      <p className="mb-1.5 font-mono text-[10px] tracking-[0.22em] text-teal/45">STEP {code}</p>
      <h2 className="font-sans text-2xl font-black tracking-tight leading-tight">{title}</h2>
      {sub && <p className="mt-1.5 font-sans text-sm text-white/35">{sub}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ROOT PAGE
══════════════════════════════════════════════════════════ */

export default function SignupPage() {
  const [step,    setStep]   = useState(1);
  const [form,    setFormRaw] = useState(EMPTY_FORM);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  /* set a single field + clear its error */
  function set(key, val) {
    setFormRaw(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined }));
  }

  function next() {
    const validate = VALIDATORS[step];
    if (validate) {
      const e = validate(form);
      if (Object.keys(e).length) { setErrors(e); return; }
    }
    setErrors({});
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setStep(s => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goTo(n) {
    setErrors({});
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    setLoading(true);
    /* ← plug in your real API call here */
    await new Promise(r => setTimeout(r, 2200));
    setLoading(false);
    setDone(true);
  }

  const STEP_CONTENT = {
    1: { code:"01", title:"Personal Information",  sub:"Tell us about yourself."           },
    2: { code:"02", title:"Academic Details",       sub:"Your enrollment information."      },
    3: { code:"03", title:"Set Your Password",      sub:"Must meet all security rules."     },
    4: { code:"04", title:"Facial Enrollment",      sub:"Required for attendance scanning." },
    5: { code:"05", title:"Review & Confirm",       sub:"Verify all details before submitting. Click any row to edit." },
  };

  /* ── Success screen ── */
  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark px-5 font-sans">
        <div className="flex flex-col items-center gap-5 text-center" style={{ animation: "fade-up 0.5s ease both" }}>
          <div className="relative flex h-24 w-24 items-center justify-center border-2 border-teal bg-teal/8">
            <div className="absolute inset-0 border-2 border-teal/20 scale-110" />
            <CheckIco cls="h-10 w-10 text-teal" />
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.24em] text-teal mb-2">REGISTRATION COMPLETE</p>
            <h2 className="font-sans text-3xl font-black tracking-tight">
              Welcome, {form.fullName.split(" ")[0]}!
            </h2>
            <p className="mt-2 font-sans text-sm text-white/35 max-w-xs leading-relaxed">
              Your student account is pending admin approval. You'll receive an email once activated.
            </p>
          </div>
          <Link to="/login"
            className="mt-2 border border-teal/30 px-9 py-3 font-mono text-xs tracking-widest text-teal no-underline transition-all hover:bg-teal/8">
            GO TO LOGIN →
          </Link>
        </div>
      </div>
    );
  }

  const { code, title, sub } = STEP_CONTENT[step];

  return (
    <div className="relative min-h-screen bg-dark font-sans text-white overflow-x-hidden">

      {/* Subtle grid bg */}
      <div className="pointer-events-none fixed inset-0 bg-grid-faint bg-size-[40px_40px]" />

      {/* ── Top bar ── */}
      <header className="relative z-10 flex h-15 items-center justify-between border-b border-white/5 px-5 lg:px-12">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center border-2 border-teal">
            <div className="h-2 w-2 rounded-full bg-teal animate-pulse-dot" />
          </div>
          <span className="font-mono text-base font-bold tracking-wider">
            SNAP<span className="text-teal">TIC</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-white/25 text-center">Already registered?</span>
          <a href="/login"
            className="font-mono text-[11px] tracking-wider text-teal/65 no-underline transition-colors hover:text-teal">
            SIGN IN →
          </a>
        </div>
      </header>

      {/* ── Page body ── */}
      <main className="relative z-10 mx-auto max-w-2xl px-5 py-10 lg:py-14">

        {/* Title block */}
        <div className="mb-10 text-center">
          <p className="mb-2 font-mono text-[10px] tracking-[0.22em] text-teal/45">
            ◆ STUDENT REGISTRATION
          </p>
          <h1 className="font-sans text-3xl font-black tracking-tight">Create your account</h1>
          <p className="mt-1.5 font-sans text-sm text-white/30">
            Complete all 5 steps to register. Your data is encrypted and private.
          </p>
        </div>

        {/* Progress bar */}
        <ProgressBar current={step} />

        {/* Form card */}
        <div
          key={step}
          className="border border-white/[0.07] bg-dark-900/70 p-6 backdrop-blur-sm lg:p-9"
          style={{ animation: "fade-up 0.3s ease both" }}
        >
          <StepHead code={code} title={title} sub={sub} />

          {step === 1 && <StepPersonal f={form} set={set} err={errors} />}
          {step === 2 && <StepAcademic f={form} set={set} err={errors} />}
          {step === 3 && <StepSecurity f={form} set={set} err={errors} />}
          {step === 4 && <StepFaceScan f={form} set={set} err={errors} />}
          {step === 5 && <StepReview   f={form} set={set} goTo={goTo}  />}

          {/* Navigation row */}
          <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6 gap-4">

            {/* Back */}
            <button type="button" onClick={back}
              className={[
                "flex items-center gap-2 border px-3 py-2.5 sm:px-5 sm:py-3 font-mono text-[11px] tracking-widest transition-all",
                step === 1
                  ? "invisible pointer-events-none"
                  : "border-white/12 text-white/35 hover:border-white/22 hover:text-white/60 cursor-pointer",
              ].join(" ")}>
              ← BACK
            </button>

            {/* Dot indicators */}
            <div className="flex items-center gap-2">
              {STEPS.map(s => (
                <div key={s.id} className={[
                  "rounded-full transition-all duration-300",
                  s.id === step  ? "w-6 h-1.5 bg-teal"
                  : s.id < step  ? "w-1.5 h-1.5 bg-teal/35"
                  :                "w-1.5 h-1.5 bg-white/10",
                ].join(" ")} />
              ))}
            </div>

            {/* Next / Submit */}
            {step < 5 ? (
              <button type="button" onClick={next}
                className="flex items-center gap-2 border-0 bg-teal px-3 py-2.5 sm:px-7 sm:py-3 font-mono text-[11px] font-bold tracking-widest text-dark transition-opacity hover:opacity-88 cursor-pointer">
                NEXT
              </button>
            ) : (
              <button type="button" onClick={submit} disabled={loading}
                className={[
                  "flex items-center gap-2.5 border-0 px-3 py-2.5 sm:px-7 sm:py-3 font-mono text-[11px] font-bold tracking-widest text-dark transition-all",
                  loading ? "cursor-not-allowed bg-teal/55" : "cursor-pointer bg-teal hover:opacity-90",
                ].join(" ")}>
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                    </svg>
                    SUBMITTING…
                  </>
                ) : "SUBMIT  ✓"}
              </button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center font-mono text-[10px] tracking-wider text-white/15">
          By registering you agree to Snaptic's Terms of Service &amp; Privacy Policy.
        </p>
      </main>

      {/* Keyframes: the rest come from index.css */}
      <style>{`
        @keyframes fade-up {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0);   }
        }
        @keyframes modal-in {
          from { opacity:0; transform:scale(0.96) translateY(8px); }
          to   { opacity:1; transform:scale(1)    translateY(0);   }
        }
      `}</style>
    </div>
  );
}