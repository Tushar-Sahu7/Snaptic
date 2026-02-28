import { useState } from "react";
import { SCHEDULE } from "../data/mockData";

const STATUS_CONFIG = {
  present:  { label: "Present",    bg: "bg-emerald-400/10", text: "text-emerald-400",  border: "border-emerald-400/25", dot: "bg-emerald-400" },
  absent:   { label: "Absent",     bg: "bg-red-400/10",     text: "text-red-400",      border: "border-red-400/25",     dot: "bg-red-400"     },
  ongoing:  { label: "In Progress",bg: "bg-teal/10",        text: "text-teal",         border: "border-teal/25",        dot: "bg-teal"        },
  upcoming: { label: "Upcoming",   bg: "bg-white/[0.04]",   text: "text-white/40",     border: "border-white/10",       dot: "bg-white/30"    },
};

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-3.5 w-3.5">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-3.5 w-3.5">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-3.5 w-3.5">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
    </svg>
  );
}

/* Mobile card view of a single class */
function ScheduleCard({ cls, idx }) {
  const cfg = STATUS_CONFIG[cls.status];
  return (
    <div
      className={[
        "border p-4 transition-all duration-200",
        cls.status === "ongoing"
          ? "border-teal/30 bg-teal/[0.04]"
          : "border-white/[0.06] bg-white/[0.015]",
      ].join(" ")}
      style={{ animation: `fade-up 0.4s ${idx * 0.06}s ease both` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-sans text-sm font-bold text-white">{cls.subject}</p>
          <p className="font-mono text-[10px] text-teal/50 mt-0.5">{cls.code}</p>
        </div>
        <span className={`flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[10px] font-medium shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} ${cls.status === "ongoing" ? "animate-pulse" : ""}`} />
          {cfg.label}
        </span>
      </div>
      <div className="flex flex-wrap gap-3 text-white/35">
        <span className="flex items-center gap-1 font-mono text-[10px]">
          <ClockIcon /> {cls.time} – {cls.end}
        </span>
        <span className="flex items-center gap-1 font-mono text-[10px]">
          <LocationIcon /> {cls.room}
        </span>
        <span className="flex items-center gap-1 font-mono text-[10px]">
          <UserIcon /> {cls.teacher}
        </span>
      </div>
    </div>
  );
}

export default function TodaySchedule() {
  const [view, setView] = useState("today"); // today | week

  const today = new Date().toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div
      className="border border-white/[0.07] bg-dark-900/60 backdrop-blur-sm"
      style={{ animation: "fade-up 0.5s 0.1s ease both" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.16em] text-teal/60 uppercase">Today's Schedule</p>
          <p className="mt-0.5 font-sans text-xs text-white/30">{today}</p>
        </div>
        {/* Toggle */}
        <div className="flex items-center border border-white/10">
          {["today","week"].map(v => (
            <button key={v} type="button" onClick={() => setView(v)}
              className={[
                "px-3 py-1.5 font-mono text-[10px] tracking-wider uppercase transition-all cursor-pointer border-0",
                view === v
                  ? "bg-teal/15 text-teal"
                  : "bg-transparent text-white/30 hover:text-white/55",
              ].join(" ")}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile: card grid */}
      <div className="flex flex-col gap-2 p-4 md:hidden">
        {SCHEDULE.map((cls, i) => <ScheduleCard key={cls.id} cls={cls} idx={i} />)}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.05]">
              {["Time", "Subject", "Room", "Teacher", "Status"].map(h => (
                <th key={h} className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-white/25">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SCHEDULE.map((cls, i) => {
              const cfg = STATUS_CONFIG[cls.status];
              return (
                <tr key={cls.id}
                  className={[
                    "border-b border-white/[0.04] last:border-0 transition-colors hover:bg-white/[0.02]",
                    cls.status === "ongoing" ? "bg-teal/[0.025]" : "",
                  ].join(" ")}
                  style={{ animation: `fade-up 0.4s ${i * 0.06 + 0.1}s ease both` }}
                >
                  <td className="px-5 py-4">
                    <p className="font-mono text-xs text-white/70">{cls.time}</p>
                    <p className="font-mono text-[10px] text-white/25">{cls.end}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-sans text-sm font-medium text-white">{cls.subject}</p>
                    <p className="font-mono text-[10px] text-teal/50">{cls.code}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-white/45">{cls.room}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-sans text-xs text-white/45">{cls.teacher}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[10px] font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} ${cls.status === "ongoing" ? "animate-pulse" : ""}`} />
                      {cfg.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.05] px-5 py-3">
        <button className="font-mono text-[11px] tracking-wider text-teal/60 transition-colors hover:text-teal cursor-pointer">
          VIEW FULL SCHEDULE →
        </button>
      </div>
    </div>
  );
}