import { useState } from "react";

import DashboardNav from "./components/DashboardNav";
import StudentHeader from "./components/StudentHeader";
import TodaySchedule from "./components/TodaySchedule";
import NotificationToasts from "./components/NotificationToasts";
import LeavePanel from "./components/LeavePanel";
import AttendanceTab from "./components/AttendanceTab";
import ProfileTab from "./components/ProfileTab";
import QuickActions from "./components/QuickActions";

/* ── Tab config ─────────────────────────────────────────── */
const TABS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-4 w-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
        />
      </svg>
    ),
  },
  {
    id: "attendance",
    label: "Attendance",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-4 w-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0"
        />
      </svg>
    ),
  },
  {
    id: "leave",
    label: "Leave",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-4 w-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
        />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Profile",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-4 w-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
      </svg>
    ),
  },
];

/* ── Notification drawer (mobile overlay) ─────────────────── */
function NotifDrawer({ open, onClose, count }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-dark/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex h-full w-full max-w-sm flex-col border-l border-white/[0.08] bg-dark-900">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <div className="flex items-center gap-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-teal/60">
              Notifications
            </p>
            {count > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal font-mono text-[9px] font-bold text-dark">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white/30 transition-colors hover:text-white/70 cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <NotificationToasts />
        </div>
      </div>
    </div>
  );
}

/* ── Mobile bottom tab bar ─────────────────────────────────── */
function BottomTabBar({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 flex border-t border-white/[0.07] bg-dark-900/95 backdrop-blur-xl md:hidden">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={[
            "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 transition-all cursor-pointer border-0",
            active === tab.id
              ? "text-teal"
              : "text-white/25 hover:text-white/55",
          ].join(" ")}
        >
          {tab.icon}
          <span className="font-mono text-[8px] tracking-wider uppercase">
            {tab.label}
          </span>
          {active === tab.id && (
            <span
              className="absolute top-0 h-0.5 w-8 bg-teal"
              style={{ left: "50%", transform: "translateX(-50%)" }}
            />
          )}
        </button>
      ))}
    </nav>
  );
}

/* ── Desktop tab bar ──────────────────────────────────────── */
function DesktopTabs({ active, onChange }) {
  return (
    <div className="mb-6 hidden border-b border-white/[0.06] md:flex">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={[
            "flex items-center gap-2 px-5 pb-3.5 pt-1 font-sans text-sm transition-all cursor-pointer border-0 bg-transparent",
            active === tab.id
              ? "border-b-2 border-teal text-teal -mb-px font-medium"
              : "text-white/35 hover:text-white/65",
          ].join(" ")}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/* ── Dashboard main content (tab = dashboard) ────────────── */
function DashboardContent() {
  return (
    <>
      <StudentHeader />
      {/* Two-column layout: main + sidebar */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
        {/* Left column */}
        <div className="flex flex-col gap-5">
          <TodaySchedule />
          <NotificationToasts />
        </div>
        {/* Right sidebar */}
        <div className="flex flex-col gap-5">
          <LeavePanel />
          <QuickActions />
        </div>
      </div>
    </>
  );
}

/* ── Root page ─────────────────────────────────────────────── */
export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notifOpen, setNotifOpen] = useState(false);

  const notifCount = 2; // unread count

  function switchTab(id) {
    setActiveTab(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="relative min-h-screen bg-dark font-sans text-white">
      {/* Subtle grid bg */}
      <div className="pointer-events-none fixed inset-0 bg-grid-faint bg-[size:40px_40px]" />

      {/* Navbar */}
      <DashboardNav
        notifCount={notifCount}
        onNotifClick={() => setNotifOpen(true)}
        onProfileClick={() => {
          setActiveTab("profile");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* Notification drawer */}
      <NotifDrawer
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        count={notifCount}
      />

      {/* Main content */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-6 md:pb-8 lg:px-6">
        {/* Desktop tab bar */}
        <DesktopTabs active={activeTab} onChange={switchTab} />

        {/* Tab content — keyed so it fades in on switch */}
        <div key={activeTab} style={{ animation: "fade-up 0.3s ease both" }}>
          {activeTab === "dashboard" && <DashboardContent />}
          {activeTab === "attendance" && (
            <>
              <div className="mb-6">
                <p className="font-mono text-[10px] tracking-[0.22em] text-teal/50 mb-1">
                  ATTENDANCE
                </p>
                <h2 className="font-sans text-2xl font-black">
                  Your Attendance
                </h2>
                <p className="font-sans text-sm text-white/35 mt-1">
                  Track your subject-wise attendance and monthly trends.
                </p>
              </div>
              <AttendanceTab />
            </>
          )}
          {activeTab === "leave" && (
            <>
              <div className="mb-6">
                <p className="font-mono text-[10px] tracking-[0.22em] text-teal/50 mb-1">
                  LEAVE MANAGEMENT
                </p>
                <h2 className="font-sans text-2xl font-black">
                  Leave Requests
                </h2>
                <p className="font-sans text-sm text-white/35 mt-1">
                  Apply for leave and track your application history.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
                <LeavePanel />
                <QuickActions />
              </div>
            </>
          )}
          {activeTab === "profile" && (
            <>
              <div className="mb-6">
                <p className="font-mono text-[10px] tracking-[0.22em] text-teal/50 mb-1">
                  PROFILE
                </p>
                <h2 className="font-sans text-2xl font-black">
                  Student Profile
                </h2>
                <p className="font-sans text-sm text-white/35 mt-1">
                  Your academic details and contact information.
                </p>
              </div>
              <ProfileTab />
            </>
          )}
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <BottomTabBar active={activeTab} onChange={switchTab} />

      {/* Page-level keyframes */}
      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
}
