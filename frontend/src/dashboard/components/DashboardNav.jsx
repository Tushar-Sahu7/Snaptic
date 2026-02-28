import { useState, useRef, useEffect } from "react";
import { STUDENT } from "../data/mockData";

/* ── Icons ─────────────────────────────────────────────────── */
function BellIcon() {
  return (
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
        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
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
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
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
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
      />
    </svg>
  );
}

function XIcon({ cls = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={cls}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18 18 6M6 6l12 12"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
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
        d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
      />
    </svg>
  );
}

function ProfileIcon() {
  return (
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
  );
}

function SettingsIcon() {
  return (
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
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
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
        d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
      />
    </svg>
  );
}

function ChevronDownIcon({ open }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      className={`h-3 w-3 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
    </svg>
  );
}

/* ── Profile Dropdown Panel ─────────────────────────────────── */
function ProfileDropdown({ initials, onClose, onProfileClick }) {
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/"; // → landing page
  }

  const MENU = [
    {
      label: "My Profile",
      sub: "View & edit your details",
      icon: <ProfileIcon />,
      action: () => {
        onProfileClick();
        onClose();
      },
    },
    {
      label: "Settings",
      sub: "Preferences & notifications",
      icon: <SettingsIcon />,
    },
    {
      label: "Privacy & Security",
      sub: "Password, biometric data",
      icon: <ShieldIcon />,
    },
  ];

  return (
    <div
      className="absolute right-0 top-[calc(100%+10px)] z-50 w-72 border border-white/[0.09] bg-dark-900 shadow-[0_12px_40px_rgba(0,0,0,0.65)]"
      style={{ animation: "dropdown-in 0.17s ease both" }}
    >
      {/* ── User card ── */}
      <div className="border-b border-white/[0.07] bg-teal/[0.025] px-4 py-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center border-2 border-teal bg-teal/10 font-mono text-sm font-bold text-teal">
            {initials}
            {/* Online dot */}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center border-2 border-dark-900 rounded-full bg-teal" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-sm font-bold text-white truncate">
              {STUDENT.name}
            </p>
            <p className="font-sans text-xs text-white/40 truncate">
              {STUDENT.department}
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="font-mono text-[9px] tracking-wider text-teal/60">
                {STUDENT.program} · {STUDENT.year}
              </span>
            </div>
          </div>
        </div>

        {/* Roll badge */}
        <div className="mt-3 flex items-center justify-between border border-teal/15 bg-teal/[0.04] px-3 py-1.5">
          <span className="font-mono text-[10px] text-white/30">
            Roll Number
          </span>
          <span className="font-mono text-[10px] font-bold tracking-wider text-teal/80">
            {STUDENT.roll}
          </span>
        </div>
      </div>

      {/* ── Menu items ── */}
      <div className="px-2 py-2">
        {MENU.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.action}
            className="flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent px-3 py-2.5 text-left transition-colors hover:bg-white/[0.05] group"
          >
            <span className="shrink-0 text-white/30 transition-colors group-hover:text-teal/70">
              {item.icon}
            </span>
            <div>
              <p className="font-sans text-sm text-white/65 transition-colors group-hover:text-white/85">
                {item.label}
              </p>
              <p className="font-mono text-[9px] text-white/22">{item.sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Divider ── */}
      <div className="mx-2 border-t border-white/[0.06]" />

      {/* ── Logout ── */}
      <div className="px-2 py-2">
        <button
          type="button"
          onClick={logout}
          className="group flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent px-3 py-3 text-left transition-all hover:bg-red-500/[0.08]"
        >
          <span className="shrink-0 text-red-400/50 transition-colors group-hover:text-red-400">
            <LogoutIcon />
          </span>
          <div>
            <p className="font-sans text-sm font-medium text-red-400/70 transition-colors group-hover:text-red-400">
              Log Out
            </p>
            <p className="font-mono text-[9px] text-white/20">
              Return to landing page
            </p>
          </div>
          {/* Arrow */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="ml-auto h-3.5 w-3.5 shrink-0 text-white/15 transition-all group-hover:translate-x-0.5 group-hover:text-red-400/50"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ── Main exported component ───────────────────────────────── */
export default function DashboardNav({
  notifCount = 2,
  onNotifClick,
  onProfileClick,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);
  const initials = STUDENT.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  /* Close on outside click */
  useEffect(() => {
    function onMouseDown(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [profileOpen]);

  /* Close on Escape */
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setProfileOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-dark/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[60px] max-w-7xl items-center gap-3 px-4 lg:px-6">
        {/* Logo */}
        <a href="/" className="flex shrink-0 items-center gap-2.5 no-underline">
          <div className="flex h-7 w-7 items-center justify-center border-2 border-teal">
            <div className="h-2 w-2 rounded-full bg-teal animate-pulse-dot" />
          </div>
          <span className="font-mono text-base font-bold tracking-wider text-white">
            SNAP<span className="text-teal">TIC</span>
          </span>
        </a>

        {/* Desktop nav links */}
        <nav className="ml-5 hidden items-center gap-0.5 md:flex">
          {["Home", "Inbox", "Reports"].map((link) => (
            <a
              key={link}
              href="#"
              className={[
                "px-3 py-1.5 font-sans text-sm no-underline transition-colors",
                link === "Home"
                  ? "font-medium text-teal"
                  : "text-white/40 hover:text-white/70",
              ].join(" ")}
            >
              {link}
            </a>
          ))}
        </nav>

        {/* Search — desktop */}
        <div className="relative ml-auto hidden max-w-[240px] flex-1 md:flex">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/25">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search classes, reports…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-white/10 bg-white/[0.04] py-2 pl-9 pr-3 font-sans text-sm text-white placeholder-white/22 outline-none transition-colors focus:border-teal/40 focus:bg-white/[0.06]"
          />
        </div>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-1 md:ml-2">
          {/* Mobile search toggle */}
          <button
            onClick={() => setSearchOpen((v) => !v)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center text-white/35 transition-colors hover:text-teal md:hidden"
          >
            <SearchIcon />
          </button>

          {/* Bell */}
          <button
            onClick={onNotifClick}
            className="relative flex h-9 w-9 cursor-pointer items-center justify-center text-white/35 transition-colors hover:text-teal"
          >
            <BellIcon />
            {notifCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal font-mono text-[9px] font-bold text-dark">
                {notifCount}
              </span>
            )}
          </button>

          {/* ── Profile button (desktop) ── */}
          <div ref={profileRef} className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={profileOpen}
              className={[
                "flex h-9 cursor-pointer items-center gap-2 border px-2.5 transition-all duration-150",
                profileOpen
                  ? "border-teal/45 bg-teal/[0.08] text-teal"
                  : "border-white/10 bg-white/[0.025] text-white/55 hover:border-teal/30 hover:bg-teal/[0.04] hover:text-teal/80",
              ].join(" ")}
            >
              {/* Initials avatar */}
              <div className="flex h-6 w-6 shrink-0 items-center justify-center border border-teal/45 bg-teal/10 font-mono text-[10px] font-bold text-teal">
                {initials}
              </div>
              {/* Name — hidden on smaller desktops */}
              <span className="hidden font-sans text-sm lg:block">
                {STUDENT.firstName}
              </span>
              <ChevronDownIcon open={profileOpen} />
            </button>

            {/* Dropdown */}
            {profileOpen && (
              <ProfileDropdown
                initials={initials}
                onClose={() => setProfileOpen(false)}
                onProfileClick={onProfileClick}
              />
            )}
          </div>

          {/* Mobile: avatar toggle (opens mobile panel) */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center border-2 border-teal/35 bg-teal/[0.07] font-mono text-xs font-bold text-teal transition-all hover:border-teal/60 md:hidden"
          >
            {mobileOpen ? <XIcon cls="h-4 w-4" /> : initials}
          </button>
        </div>
      </div>

      {/* ── Mobile search bar ── */}
      {searchOpen && (
        <div className="border-t border-white/[0.06] px-4 py-3 md:hidden">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/25">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search…"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-4 font-sans text-sm text-white placeholder-white/25 outline-none focus:border-teal/40"
            />
          </div>
        </div>
      )}

      {/* ── Mobile menu panel ── */}
      {mobileOpen && (
        <div className="border-t border-white/[0.06] bg-dark-900 md:hidden">
          {/* Nav links */}
          <nav className="px-4 pt-3">
            {["Home", "Inbox", "Reports"].map((link) => (
              <a
                key={link}
                href="#"
                onClick={() => setMobileOpen(false)}
                className="flex py-2.5 font-sans text-sm text-white/50 no-underline transition-colors hover:text-teal"
              >
                {link}
              </a>
            ))}
          </nav>

          {/* User card */}
          <div className="mx-4 mb-3 mt-2 border border-white/[0.07] bg-white/[0.015]">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/[0.06] bg-teal/[0.025] px-4 py-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-teal bg-teal/10 font-mono text-sm font-bold text-teal">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm font-bold text-white truncate">
                  {STUDENT.name}
                </p>
                <p className="font-mono text-[10px] text-teal/60">
                  {STUDENT.roll}
                </p>
                <p className="font-sans text-xs text-white/35 truncate">
                  {STUDENT.department}
                </p>
              </div>
            </div>

            {/* Mobile menu actions */}
            <div className="px-1 py-1.5">
              {[
                {
                  label: "My Profile",
                  icon: <ProfileIcon />,
                  action: () => {
                    onProfileClick();
                    setMobileOpen(false);
                  },
                },
                {
                  label: "Settings",
                  icon: <SettingsIcon />,
                  action: () => setMobileOpen(false),
                },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.action}
                  className="flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent px-3 py-2.5 text-left font-sans text-sm text-white/50 transition-colors hover:bg-white/[0.04] hover:text-white/80"
                >
                  <span className="text-white/30">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>

            {/* Mobile logout */}
            <div className="border-t border-white/[0.06] px-1 py-1.5">
              <button
                type="button"
                onClick={logout}
                className="group flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent px-3 py-2.5 text-left transition-all hover:bg-red-500/[0.07]"
              >
                <span className="text-red-400/55 transition-colors group-hover:text-red-400">
                  <LogoutIcon />
                </span>
                <div>
                  <p className="font-sans text-sm text-red-400/70 transition-colors group-hover:text-red-400">
                    Log Out
                  </p>
                  <p className="font-mono text-[9px] text-white/20">
                    Return to landing page
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown animation keyframe */}
      <style>{`
        @keyframes dropdown-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </header>
  );
}
