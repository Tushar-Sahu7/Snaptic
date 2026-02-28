import { useState } from "react";
import { WEEKLY_SCHEDULE } from "../data/teacherData";

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const TODAY_IDX = new Date().getDay(); // 0=Sun
const DAY_MAP   = { 1:"Mon",2:"Tue",3:"Wed",4:"Thu",5:"Fri",6:"Sat",0:"Sun" };
const TODAY_KEY = DAY_MAP[TODAY_IDX] || "Mon";

const COLORS = ["border-teal/25 bg-teal/[0.05]","border-blue-400/25 bg-blue-400/[0.04]","border-violet-400/25 bg-violet-400/[0.04]","border-amber-400/25 bg-amber-400/[0.04]"];
function codeColor(code) { return COLORS[code.charCodeAt(code.length-1) % COLORS.length]; }

export default function ScheduleTab() {
  const [active, setActive] = useState(TODAY_KEY);

  const dayClasses = WEEKLY_SCHEDULE[active] || [];
  const totalWeek  = Object.values(WEEKLY_SCHEDULE).reduce((s, day) => s + day.length, 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Header stat */}
      <div className="flex flex-wrap items-center gap-4 border border-white/[0.07] bg-dark-900/60 px-5 py-4">
        <div>
          <p className="font-mono text-[10px] tracking-widest text-white/30 uppercase">Weekly Schedule</p>
          <p className="font-sans text-2xl font-black text-white mt-0.5">{totalWeek} Classes / Week</p>
        </div>
        <div className="ml-auto flex flex-wrap gap-4">
          {["Mon","Wed","Fri"].map(d => (
            <div key={d} className="text-center">
              <p className="font-sans text-lg font-black text-teal">{(WEEKLY_SCHEDULE[d]||[]).length}</p>
              <p className="font-mono text-[9px] text-white/30">{d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Day selector tabs */}
      <div className="flex overflow-x-auto border-b border-white/[0.06]">
        {DAYS.map(day => {
          const count   = (WEEKLY_SCHEDULE[day]||[]).length;
          const isToday = day === TODAY_KEY;
          const isActive = day === active;
          return (
            <button key={day} type="button" onClick={() => setActive(day)}
              className={[
                "flex shrink-0 flex-col items-center gap-0.5 px-5 py-3 font-mono text-[11px] transition-all cursor-pointer border-0 bg-transparent border-b-2 -mb-px",
                isActive ? "border-teal text-teal" : "border-transparent text-white/35 hover:text-white/60",
              ].join(" ")}>
              {day}
              <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${
                count > 0
                  ? isActive ? "bg-teal text-dark font-bold" : "bg-white/10 text-white/40"
                  : "text-white/15"
              }`}>
                {count > 0 ? count : "–"}
              </span>
              {isToday && <span className="h-0.5 w-0.5 rounded-full bg-teal" />}
            </button>
          );
        })}
      </div>

      {/* Classes for selected day */}
      {dayClasses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center border border-white/[0.05] bg-dark-900/40">
          <div className="h-10 w-10 flex items-center justify-center border border-white/10 text-white/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          </div>
          <p className="font-sans text-sm text-white/30">No classes on {active}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {dayClasses.map((cls, i) => (
            <div key={`${cls.code}-${i}`}
              className={`flex items-center gap-5 border p-5 transition-all hover:border-teal/20 ${codeColor(cls.code)}`}
              style={{ animation: `fade-up 0.4s ${i * 0.08}s ease both` }}>
              {/* Time */}
              <div className="shrink-0 text-center w-20">
                <p className="font-mono text-xs font-bold text-white/70">{cls.time.split("–")[0]}</p>
                <p className="font-mono text-[10px] text-white/25">– {cls.time.split("–")[1]}</p>
              </div>
              <div className="h-10 w-px shrink-0 bg-white/10" />
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-sans text-base font-bold text-white/85">{cls.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="font-mono text-[10px] text-teal/60">{cls.code}</span>
                  <span className="font-mono text-[10px] text-white/30">{cls.room}</span>
                </div>
              </div>
              {/* Duration pill */}
              <span className="shrink-0 border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[10px] text-white/35">
                90 min
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Full week grid — desktop */}
      <div className="hidden lg:block border border-white/[0.07] bg-dark-900/60 mt-2">
        <div className="border-b border-white/[0.06] px-5 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-teal/60">Full Week Overview</p>
        </div>
        <div className="grid grid-cols-5 divide-x divide-white/[0.05]">
          {["Mon","Tue","Wed","Thu","Fri"].map(day => (
            <div key={day} className={`p-4 ${day === TODAY_KEY ? "bg-teal/[0.02]" : ""}`}>
              <div className="flex items-center justify-between mb-3">
                <p className={`font-mono text-[11px] font-bold tracking-wider ${day === TODAY_KEY ? "text-teal" : "text-white/40"}`}>
                  {day}
                </p>
                {day === TODAY_KEY && <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse" />}
              </div>
              <div className="flex flex-col gap-2">
                {(WEEKLY_SCHEDULE[day]||[]).map((cls, i) => (
                  <div key={i} className={`border p-2 ${codeColor(cls.code)}`}>
                    <p className="font-sans text-xs font-medium text-white/70 truncate">{cls.name}</p>
                    <p className="font-mono text-[9px] text-white/30 mt-0.5">{cls.time}</p>
                  </div>
                ))}
                {(WEEKLY_SCHEDULE[day]||[]).length === 0 && (
                  <p className="font-mono text-[10px] text-white/15 text-center py-2">Free</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}