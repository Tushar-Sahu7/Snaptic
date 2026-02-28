import { useState } from "react";
import { Link, useNavigate } from 'react-router';

/* ─────────────────────────── role data ─────────────────────────── */

const ROLES = [
  {
    id: "student",
    label: "Student",
    desc: "Access attendance records & personal analytics",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1
             8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0
             0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399
             5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12
             13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0
             0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12
             8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
      </svg>
    ),
  },
  {
    id: "teacher",
    label: "Teacher",
    desc: "Mark attendance & manage assigned classes",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5
             0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12
             21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
  },
  {
    id: "admin",
    label: "Admin",
    desc: "Full system access & school-wide oversight",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99
             11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332
             9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196
             0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
];

/* ─────────────────────────── face SVG illustration ─────────────────────────── */

/**
 * A detailed front-facing face SVG used in the decorative left panel.
 * All animation classes reference utilities defined in index.css.
 */
function FaceScanIllustration() {
  return (
    <div className="relative flex items-center justify-center">

      {/* Pulsing rings */}
      <div className="ring-outer absolute h-72 w-72 rounded-full border border-teal/15" />
      <div className="ring-inner absolute h-56 w-56 rounded-full border border-teal/20" />

      {/* Scan frame */}
      <div className="relative h-60 w-52 overflow-hidden">

        {/* Corner brackets */}
        <span className="bracket-tl absolute top-0 left-0 h-8 w-8 border-t-2 border-l-2 border-teal" />
        <span className="bracket-tr absolute top-0 right-0 h-8 w-8 border-t-2 border-r-2 border-teal" />
        <span className="bracket-bl absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-teal" />
        <span className="bracket-br absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-teal" />

        {/* Sweep line */}
        <div className="scan-face-line" />

        {/* 👤 Person SVG */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full p-8"
        >
          {/* Head */}
          <circle
            cx="12" cy="7" r="4.5"
            stroke="rgba(0,229,190,0.70)"
            strokeWidth="0.8"
            fill="rgba(0,229,190,0.06)"
          />
          {/* Shoulders / body */}
          <path
            d="M3.5 21c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5"
            stroke="rgba(0,229,190,0.55)"
            strokeWidth="0.8"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Detection dots */}
        <div className="dot-1 absolute top-6 left-6 h-1.5 w-1.5 rounded-full bg-teal" />
        <div className="dot-2 absolute top-6 right-6 h-1.5 w-1.5 rounded-full bg-teal" />
        <div className="dot-3 absolute bottom-6 left-6 h-1.5 w-1.5 rounded-full bg-teal" />
        <div className="dot-4 absolute bottom-6 right-6 h-1.5 w-1.5 rounded-full bg-teal" />

      </div>
    </div>
  );
}

/* ─────────────────────────── eye-toggle icon ─────────────────────────── */

function EyeIcon({ open }) {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12
           4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577
           16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12
           19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12
           4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293
           5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21
           21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}

/* ─────────────────────────── check icon ─────────────────────────── */

function CheckIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

/* ─────────────────────────── password strength ─────────────────────────── */

function strengthLevel(pw) {
  if (!pw) return 0;
  if (pw.length < 4) return 1;
  if (pw.length < 7) return 2;
  if (pw.length < 10) return 3;
  return 4;
}

const STRENGTH_LABELS = ["", "WEAK", "FAIR", "GOOD", "STRONG"];
const STRENGTH_COLOURS = ["", "#ef4444", "#f0c040", "#60a5fa", "#00E5BE"];

/* ─────────────────────────── page ─────────────────────────── */

export default function LoginPage() {
  const navigate = useNavigate();
  const [role,      setRole]      = useState("student");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [remember,  setRemember]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [errors,    setErrors]    = useState({});
  const [done,      setDone]      = useState(false);

  const selected = ROLES.find(r => r.id === role);
  const strength = strengthLevel(password);
  const emailOk  = /\S+@\S+\.\S+/.test(email);

  function validate() {
    const e = {};
    if (!email.trim())      e.email    = "Email is required.";
    else if (!emailOk)      e.email    = "Enter a valid email address.";
    if (!password)          e.password = "Password is required.";
    else if (password.length < 6) e.password = "Minimum 6 characters.";
    return e;
  }

  function submit(ev) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    setTimeout(() => {
  setLoading(false);
  const ROUTES = {
    student: '/dashboard/student',
    teacher: '/dashboard/teacher',
    admin:   '/dashboard/admin',
  };
  navigate(ROUTES[role] || '/');
}, 1800);
  }

  /* ── Success screen ── */
  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark px-5">
        <div className="anim-fade-in flex flex-col items-center gap-5 text-center">
          <div className="flex h-16 w-16 items-center justify-center border-2 border-teal bg-teal/10">
            <CheckIcon className="h-7 w-7 text-teal" />
          </div>
          <p className="font-mono text-xs tracking-[0.22em] text-teal">AUTH SUCCESSFUL</p>
          <p className="font-sans text-sm text-white/40">
            Redirecting to your{" "}
            <span className="text-white/70 capitalize">{role}</span> dashboard…
          </p>
        </div>
      </div>
    );
  }

  /* ── Main page ── */
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-dark font-sans text-white">

      {/* Global grid background */}
      <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-[size:40px_40px] opacity-100" />

      {/* ══════════════ LEFT PANEL (desktop only) ══════════════ */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-teal/10 bg-dark-900 px-10 py-14 lg:flex lg:w-[46%]">

        {/* Panel grid overlay */}
        <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-[size:40px_40px] opacity-60" />

        {/* Radial glows */}
        <div className="pointer-events-none absolute inset-0 bg-panel-radial-tr" />
        <div className="pointer-events-none absolute inset-0 bg-panel-radial-bl" />

        {/* ── Logo ── */}
        <Link to="/" className="relative z-10 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center border-2 border-teal">
            <div className="h-3 w-3 rounded-full bg-teal animate-pulse-dot" />
          </div>
          <span className="font-mono text-xl font-bold tracking-wider">
            SNAP<span className="text-teal">TIC</span>
          </span>
        </Link>

        {/* ── Centre — face scan illustration ── */}
        <div className="relative z-10 flex flex-col items-center gap-8">
          <FaceScanIllustration />

          {/* Status chip */}
          <div className="flex items-center gap-2.5 border border-teal/20 bg-teal/[0.05] px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse-dot" />
            <span className="font-mono text-[10px] tracking-[0.20em] text-teal/80">
              FACIAL RECOGNITION READY
            </span>
          </div>

          <div className="text-center">
            <h2 className="font-sans text-2xl font-black leading-tight tracking-tight">
              Zero-cost attendance.
              <br />
              <span className="text-teal">On your device.</span>
            </h2>
            <p className="mt-2.5 max-w-xs font-sans text-sm leading-relaxed text-white/35">
              98% accuracy · 50 students in under 5 min · no server required.
            </p>
          </div>
        </div>

        {/* ── Bottom stats strip ── */}
        <div className="relative z-10 grid grid-cols-3 gap-px border border-teal/10 bg-teal/10">
          {[
            { v: "98%",   l: "Accuracy"  },
            { v: "0$",    l: "Cost"      },
            { v: "<5min", l: "Per Class" },
          ].map(({ v, l }) => (
            <div key={l} className="flex flex-col gap-1 bg-dark-900 px-4 py-4">
              <span className="font-mono text-lg font-bold text-teal">{v}</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">{l}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ══════════════ RIGHT PANEL — form ══════════════ */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-16 sm:px-10">

        {/* Mobile logo */}
        <Link to="/" className="mb-10 flex items-center gap-3 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center border-2 border-teal">
            <div className="h-2.5 w-2.5 rounded-full bg-teal animate-pulse-dot" />
          </div>
          <span className="font-mono text-lg font-bold tracking-wider">
            SNAP<span className="text-teal">TIC</span>
          </span>
        </Link>

        {/* Form card */}
        <div className="panel-in w-full max-w-md">

          {/* ── Heading ── */}
          <div className="mb-8">
            <p className="mb-1.5 font-mono text-[10px] tracking-[0.22em] text-teal/60">◆ SECURE LOGIN</p>
            <h1 className="font-sans text-3xl font-black tracking-tight">Welcome back</h1>
            <p className="mt-1.5 font-sans text-sm text-white/35">
              Sign in to continue to your dashboard.
            </p>
          </div>

          {/* ── Role selector ── */}
          <div className="mb-7">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/30">
              Select Role
            </p>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(r => {
                const active = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={[
                      "relative flex cursor-pointer flex-col items-center gap-2 border px-3 py-4",
                      "transition-all duration-200 focus:outline-none",
                      active
                        ? "border-teal bg-teal/10 text-teal"
                        : "border-white/10 bg-white/[0.02] text-white/35 hover:border-white/20 hover:text-white/55",
                    ].join(" ")}
                  >
                    {/* Top accent line when active */}
                    {active && (
                      <span className="absolute inset-x-0 top-0 h-[2px] bg-teal" />
                    )}
                    <span>{r.icon}</span>
                    <span className="font-mono text-[10px] font-bold tracking-widest">
                      {r.label.toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>
            {/* Context description */}
            <p className="mt-2.5 min-h-[1.1rem] font-sans text-xs text-white/30 transition-all duration-200">
              {selected?.desc}
            </p>
          </div>

          {/* ── Form ── */}
          <form onSubmit={submit} className="flex flex-col gap-5" noValidate>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
                Email Address
              </label>
              <div className={[
                "flex items-center border transition-colors duration-200",
                errors.email
                  ? "border-red-500/60 bg-red-500/[0.04]"
                  : email && emailOk
                  ? "border-teal/45 bg-teal/[0.03]"
                  : email
                  ? "border-white/20 bg-white/[0.03]"
                  : "border-white/10 bg-white/[0.03]",
              ].join(" ")}>
                <span className="ml-4 shrink-0 text-white/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5
                         0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0
                         1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0
                         1-1.07-1.916V6.75" />
                  </svg>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    setErrors(v => ({ ...v, email: undefined }));
                  }}
                  placeholder={`${role}@school.edu`}
                  className="w-full bg-transparent px-3 py-3.5 font-sans text-sm text-white placeholder-white/20 outline-none"
                  autoComplete="email"
                />
                {email && emailOk && !errors.email && (
                  <span className="mr-4 text-teal">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
              {errors.email && (
                <p className="font-mono text-[10px] text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
                  Password
                </label>
                <button
                  type="button"
                  className="font-mono text-[10px] tracking-wider text-teal/60 transition-colors hover:text-teal"
                >
                  FORGOT PASSWORD?
                </button>
              </div>

              <div className={[
                "flex items-center border transition-colors duration-200",
                errors.password
                  ? "border-red-500/60 bg-red-500/[0.04]"
                  : password
                  ? "border-teal/45 bg-teal/[0.03]"
                  : "border-white/10 bg-white/[0.03]",
              ].join(" ")}>
                <span className="ml-4 shrink-0 text-white/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0
                         2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0
                         0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </span>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setErrors(v => ({ ...v, password: undefined }));
                  }}
                  placeholder="••••••••"
                  className="w-full bg-transparent px-3 py-3.5 font-sans text-sm text-white placeholder-white/20 outline-none"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  tabIndex={-1}
                  className="mr-4 shrink-0 text-white/25 transition-colors hover:text-teal"
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>

              {errors.password && (
                <p className="font-mono text-[10px] text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Remember me */}
            <label className="flex cursor-pointer items-center gap-3">
              <button
                type="button"
                role="checkbox"
                aria-checked={remember}
                onClick={() => setRemember(v => !v)}
                className={[
                  "relative h-5 w-5 shrink-0 border transition-all duration-200",
                  remember
                    ? "border-teal bg-teal/15"
                    : "border-white/20 bg-transparent hover:border-white/35",
                ].join(" ")}
              >
                {remember && <CheckIcon className="absolute inset-0.5 h-3.5 w-3.5 text-teal" />}
              </button>
              <span className="font-sans text-sm text-white/40">
                Keep me signed in for 30 days
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={[
                "relative mt-1 flex h-[52px] w-full items-center justify-center",
                "border-0 bg-teal font-mono text-sm font-bold tracking-widest text-dark",
                "overflow-hidden transition-all duration-200",
                loading
                  ? "cursor-not-allowed opacity-70"
                  : "cursor-pointer hover:opacity-90 active:scale-[0.99]",
              ].join(" ")}
            >
              {loading ? (
                <span className="flex items-center gap-2.5">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                  </svg>
                  AUTHENTICATING…
                </span>
              ) : (
                `SIGN IN AS ${role.toUpperCase()} →`
              )}
            </button>

          </form>

          {/* ── Divider ── */}
          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/[0.07]" />
            <span className="font-mono text-[10px] tracking-widest text-white/20">OR</span>
            <div className="h-px flex-1 bg-white/[0.07]" />
          </div>

          {/* SSO / demo */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex h-11 cursor-pointer items-center justify-center gap-2.5 border border-white/10 bg-white/[0.02] font-mono text-[11px] tracking-wider text-white/45 transition-all duration-200 hover:border-white/20 hover:text-white/65">
              {/* Google "G" mark */}
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              GOOGLE SSO
            </button>
            <button className="flex h-11 cursor-pointer items-center justify-center gap-2 border border-teal/20 bg-teal/[0.04] font-mono text-[11px] tracking-wider text-teal/55 transition-all duration-200 hover:border-teal/40 hover:text-teal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0
                     1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
              </svg>
              TRY DEMO
            </button>
          </div>

          {/* Sign-up link */}
          <p className="mt-8 text-center font-sans text-sm text-white/25">
            Don't have an account?{" "}
            <Link to="/signup" className="font-mono text-[11px] tracking-wider text-teal/70 no-underline transition-colors hover:text-teal">
              Sign Up →
            </Link>
          </p>

        </div>
      </main>
    </div>
  );
}