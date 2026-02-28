import { useState } from "react";
import TeacherNav    from "./components/TeacherNav";
import TeacherHome   from "./components/TeacherHome";
import AttendanceFlow from "./components/AttendanceFlow";
import ScheduleTab   from "./components/ScheduleTab";
import ReportsTab    from "./components/ReportsTab";
import { TEACHER }   from "./data/teacherData";

/* ── Tab config ─────────────────────────────────────────── */
const TABS = [
  {
    id: "home",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
      </svg>
    ),
  },
  {
    id: "attendance",
    label: "Attendance",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    id: "schedule",
    label: "Schedule",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
  },
  {
    id: "reports",
    label: "Reports",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
];

/* ── Welcome banner shown once on home ─────────────────────── */
function WelcomeBanner({ onTakeAttendance }) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const initials = TEACHER.name.split(" ").filter(w => !w.startsWith("Prof")).map(n => n[0]).join("").slice(0, 2);

  return (
    <div className="relative mb-6 overflow-hidden border border-teal/10 bg-dark-900/60 px-5 py-5 lg:px-7"
      style={{ animation: "fade-up 0.4s ease both" }}>
      <div className="pointer-events-none absolute right-0 top-0 h-48 w-72 opacity-70"
        style={{ background: "radial-gradient(ellipse at 100% 0%, rgba(0,229,190,0.09) 0%, transparent 70%)" }} />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-teal bg-teal/10 font-mono text-sm font-bold text-teal lg:h-14 lg:w-14">
            {initials}
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.18em] text-teal/60">◆ TEACHER PORTAL</p>
            <h1 className="font-sans text-xl font-black tracking-tight text-white lg:text-2xl">
              {greet}, {TEACHER.firstName}
            </h1>
            <p className="font-sans text-sm text-white/40">{TEACHER.role} · {TEACHER.department}</p>
          </div>
        </div>
        <button
          onClick={onTakeAttendance}
          className="flex shrink-0 items-center gap-2.5 border border-teal bg-teal px-5 py-2.5 font-mono text-[11px] font-bold tracking-widest text-dark transition-all hover:opacity-90 cursor-pointer self-start sm:self-auto">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          MARK ATTENDANCE
        </button>
      </div>
    </div>
  );
}

/* ── Desktop tab bar ─────────────────────────────────────── */
function DesktopTabs({ active, onChange }) {
  return (
    <div className="mb-6 hidden border-b border-white/[0.06] md:flex">
      {TABS.map(tab => (
        <button key={tab.id} type="button" onClick={() => onChange(tab.id)}
          className={[
            "flex items-center gap-2 px-5 pb-3.5 pt-1 font-sans text-sm transition-all cursor-pointer border-0 bg-transparent",
            active === tab.id
              ? "border-b-2 border-teal text-teal -mb-px font-medium"
              : "text-white/35 hover:text-white/65",
          ].join(" ")}>
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/* ── Mobile bottom tab bar ────────────────────────────────── */
function BottomTabBar({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 flex border-t border-white/[0.07] bg-dark-900/95 backdrop-blur-xl md:hidden">
      {TABS.map(tab => (
        <button key={tab.id} type="button" onClick={() => onChange(tab.id)}
          className={[
            "relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 transition-all cursor-pointer border-0 bg-transparent",
            active === tab.id ? "text-teal" : "text-white/25 hover:text-white/55",
          ].join(" ")}>
          {active === tab.id && (
            <span className="absolute top-0 h-0.5 w-8 bg-teal" />
          )}
          {tab.icon}
          <span className="font-mono text-[8px] tracking-wider uppercase">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ── Tab page header ────────────────────────────────────── */
function TabHeader({ title, sub, label }) {
  return (
    <div className="mb-6">
      {label && <p className="font-mono text-[10px] tracking-[0.22em] text-teal/60 mb-1">{label}</p>}
      <h2 className="font-sans text-2xl font-black text-white">{title}</h2>
      {sub && <p className="font-sans text-sm text-white/35 mt-1">{sub}</p>}
    </div>
  );
}

/* ── Root dashboard ──────────────────────────────────────── */
export default function TeacherDashboard() {
  const [activeTab,     setActiveTab]     = useState("home");
  const [attendanceCls, setAttendanceCls] = useState(null); // pre-selected class when jumping to attendance

  function switchTab(id) {
    setActiveTab(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Called from "MARK NOW" or "MARK ATTENDANCE" button — jumps straight to attendance tab
  function handleMarkAttendance(cls = null) {
    setAttendanceCls(cls);   // null = show class selector, cls = skip to marking
    switchTab("attendance");
  }

  // Called when attendance flow finishes
  function handleAttendanceDone() {
    setAttendanceCls(null);
    switchTab("home");
  }

  return (
    <div className="relative min-h-screen bg-dark font-sans text-white">
      {/* Grid background */}
      <div className="pointer-events-none fixed inset-0 bg-grid-faint bg-[size:40px_40px]" />

      {/* Navbar */}
      <TeacherNav notifCount={3} onNotifClick={() => {}} />

      {/* Main content */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-6 md:pb-8 lg:px-6">

        {/* Desktop tabs */}
        <DesktopTabs active={activeTab} onChange={switchTab} />

        {/* Tab content */}
        <div key={activeTab} style={{ animation: "fade-up 0.3s ease both" }}>

          {/* HOME */}
          {activeTab === "home" && (
            <>
              <WelcomeBanner onTakeAttendance={() => handleMarkAttendance(null)} />
              <TeacherHome onMarkAttendance={handleMarkAttendance} />
            </>
          )}

          {/* ATTENDANCE FLOW */}
          {activeTab === "attendance" && (
            <AttendanceFlow
              key={attendanceCls?.id || "select"}  /* remount when class changes */
              initialClass={attendanceCls}
              onDone={handleAttendanceDone}
            />
          )}

          {/* SCHEDULE */}
          {activeTab === "schedule" && (
            <>
              <TabHeader label="SCHEDULE" title="Weekly Timetable" sub="Your class schedule for the current semester." />
              <ScheduleTab />
            </>
          )}

          {/* REPORTS */}
          {activeTab === "reports" && (
            <>
              <TabHeader label="ANALYTICS" title="Attendance Reports" sub="Class-wise breakdown, trends and at-risk student alerts." />
              <ReportsTab />
            </>
          )}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomTabBar active={activeTab} onChange={switchTab} />

      {/* Shared keyframes */}
      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
}