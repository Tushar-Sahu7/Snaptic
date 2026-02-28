import { useState, useRef, useEffect } from "react";
import { TEACHER } from "../data/teacherData";

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
    </svg>
  );
}

function ChevronDown({ open }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
      className={`h-3 w-3 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function ProfileDropdown({ initials, onClose }) {
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  }

  return (
    <div
      className="absolute right-0 top-[calc(100%+10px)] z-50 w-72 border border-white/[0.09] bg-dark-900 shadow-[0_12px_40px_rgba(0,0,0,0.65)]"
      style={{ animation: "dropdown-in 0.17s ease both" }}
    >
      {/* User card */}
      <div className="border-b border-white/[0.07] bg-teal/[0.025] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center border-2 border-teal bg-teal/10 font-mono text-sm font-bold text-teal">
            {initials}
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-dark-900 bg-teal" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-sm font-bold text-white truncate">{TEACHER.name}</p>
            <p className="font-sans text-xs text-white/40 truncate">{TEACHER.role}</p>
            <p className="font-mono text-[9px] text-teal/60 mt-0.5">{TEACHER.department}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border border-teal/15 bg-teal/[0.04] px-3 py-1.5">
          <span className="font-mono text-[10px] text-white/30">Employee ID</span>
          <span className="font-mono text-[10px] font-bold tracking-wider text-teal/80">{TEACHER.empId}</span>
        </div>
      </div>

      {/* Menu */}
      <div className="px-2 py-2">
        {[
          { label: "My Profile",   sub: "View your details"      },
          { label: "Settings",     sub: "Preferences"            },
          { label: "Help & Docs",  sub: "How to use the system"  },
        ].map(item => (
          <button key={item.label} type="button" onClick={onClose}
            className="flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04]">
            <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
            <div>
              <p className="font-sans text-sm text-white/65">{item.label}</p>
              <p className="font-mono text-[9px] text-white/22">{item.sub}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="mx-2 border-t border-white/[0.06]" />

      <div className="px-2 py-2">
        <button type="button" onClick={logout}
          className="group flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent px-3 py-3 text-left transition-all hover:bg-red-500/[0.08]">
          <span className="text-red-400/50 transition-colors group-hover:text-red-400"><LogoutIcon /></span>
          <div>
            <p className="font-sans text-sm font-medium text-red-400/70 transition-colors group-hover:text-red-400">Log Out</p>
            <p className="font-mono text-[9px] text-white/20">Return to landing page</p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            className="ml-auto h-3.5 w-3.5 shrink-0 text-white/15 transition-all group-hover:translate-x-0.5 group-hover:text-red-400/50">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function TeacherNav({ notifCount = 3, onNotifClick }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const profileRef = useRef(null);
  const initials = TEACHER.name.split(" ").filter(w => !w.startsWith("Prof")).map(n => n[0]).join("").slice(0, 2);

  useEffect(() => {
    function handler(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    if (profileOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") setProfileOpen(false); }
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

        {/* Nav links */}
        <nav className="ml-5 hidden items-center gap-0.5 md:flex">
          {["Home", "Inbox", "Reports"].map(l => (
            <a key={l} href="#"
              className={`px-3 py-1.5 font-sans text-sm no-underline transition-colors ${l === "Home" ? "font-medium text-teal" : "text-white/40 hover:text-white/70"}`}>
              {l}
            </a>
          ))}
        </nav>

        {/* Search */}
        <div className="relative ml-auto hidden max-w-[220px] flex-1 md:flex">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/25"><SearchIcon /></span>
          <input type="text" placeholder="Search students, classes…" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full border border-white/10 bg-white/[0.04] py-2 pl-9 pr-3 font-sans text-sm text-white placeholder-white/22 outline-none focus:border-teal/40" />
        </div>

        {/* Right */}
        <div className="ml-auto flex items-center gap-1 md:ml-2">
          {/* Bell */}
          <button onClick={onNotifClick}
            className="relative flex h-9 w-9 cursor-pointer items-center justify-center text-white/35 transition-colors hover:text-teal">
            <BellIcon />
            {notifCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal font-mono text-[9px] font-bold text-dark">
                {notifCount}
              </span>
            )}
          </button>

          {/* Profile dropdown — desktop */}
          <div ref={profileRef} className="relative hidden md:block">
            <button type="button" onClick={() => setProfileOpen(v => !v)}
              className={`flex h-9 cursor-pointer items-center gap-2 border px-2.5 transition-all ${profileOpen ? "border-teal/45 bg-teal/[0.08] text-teal" : "border-white/10 bg-white/[0.025] text-white/55 hover:border-teal/30 hover:text-teal/80"}`}>
              <div className="flex h-6 w-6 items-center justify-center border border-teal/45 bg-teal/10 font-mono text-[10px] font-bold text-teal">
                {initials}
              </div>
              <span className="hidden font-sans text-sm lg:block">{TEACHER.firstName}</span>
              <ChevronDown open={profileOpen} />
            </button>
            {profileOpen && <ProfileDropdown initials={initials} onClose={() => setProfileOpen(false)} />}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(v => !v)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center text-white/40 hover:text-teal md:hidden">
            {mobileOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/[0.06] bg-dark-900 px-4 py-3 md:hidden">
          {["Home", "Inbox", "Reports"].map(l => (
            <a key={l} href="#" onClick={() => setMobileOpen(false)}
              className="flex py-2.5 font-sans text-sm text-white/50 no-underline hover:text-teal">{l}</a>
          ))}
          <div className="mt-3 border-t border-white/[0.06] pt-3">
            <p className="font-mono text-[10px] tracking-widest text-white/25">SIGNED IN AS</p>
            <p className="mt-1 font-sans text-sm font-bold text-white">{TEACHER.name}</p>
            <p className="font-mono text-[10px] text-teal/60">{TEACHER.role}</p>
            <button type="button" onClick={logout}
              className="mt-3 flex items-center gap-2 font-sans text-sm text-red-400/70 hover:text-red-400 cursor-pointer">
              <LogoutIcon /> Log Out
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dropdown-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </header>
  );
}