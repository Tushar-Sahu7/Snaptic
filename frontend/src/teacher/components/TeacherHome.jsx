import { useState } from "react";
import { TODAY_CLASSES, ATTENDANCE_OVERVIEW, LEAVE_REQUESTS, AI_INSIGHTS } from "../data/teacherData";

/* ── Stat card ── */
function StatCard({ label, value, sub, pct, color = "teal", delay = 0 }) {
  const barColors = { teal: "bg-teal", amber: "bg-amber-400", emerald: "bg-emerald-400", blue: "bg-blue-400" };
  return (
    <div className="border border-white/[0.07] bg-dark-900/80 p-5"
      style={{ animation: `fade-up 0.5s ${delay}s ease both` }}>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/30">{label}</p>
      <div className="mt-2 flex items-end gap-2">
        <span className="font-sans text-3xl font-black leading-none text-white">{value}</span>
        {sub && <span className="mb-0.5 font-mono text-xs text-white/30">{sub}</span>}
      </div>
      {typeof pct === "number" && (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/8">
          <div className={`h-full rounded-full ${barColors[color]}`} style={{ width: `${pct}%`, transition: "width 1s ease" }} />
        </div>
      )}
    </div>
  );
}

/* ── Today's class row ── */
const STATUS_CFG = {
  completed: { label: "Completed", dot: "bg-emerald-400", text: "text-emerald-400", border: "border-emerald-400/20", bg: "bg-emerald-400/[0.05]" },
  ongoing:   { label: "In Progress", dot: "bg-teal", text: "text-teal", border: "border-teal/25", bg: "bg-teal/[0.06]" },
  upcoming:  { label: "Upcoming", dot: "bg-white/30", text: "text-white/40", border: "border-white/10", bg: "bg-white/[0.02]" },
};

export default function TeacherHome({ onMarkAttendance }) {
  const [leaveStates, setLeaveStates] = useState({});

  const completedCount = TODAY_CLASSES.filter(c => c.status === "completed").length;
  const totalStudents  = ATTENDANCE_OVERVIEW.reduce((s, c) => s + c.students, 0);
  const avgPct         = Math.round(ATTENDANCE_OVERVIEW.reduce((s, c) => s + c.pct, 0) / ATTENDANCE_OVERVIEW.length);
  const pendingLeaves  = LEAVE_REQUESTS.filter(l => l.status === "pending").length;

  function handleLeave(id, action) {
    setLeaveStates(p => ({ ...p, [id]: action }));
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Stat row ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Classes Today"    value={`${completedCount}/${TODAY_CLASSES.length}`} sub="done" pct={(completedCount/TODAY_CLASSES.length)*100} color="teal"   delay={0.05} />
        <StatCard label="Total Students"   value={totalStudents}  sub="enrolled"  pct={80}    color="blue"   delay={0.10} />
        <StatCard label="Avg Attendance"   value={`${avgPct}%`}   pct={avgPct}                color="emerald" delay={0.15} />
        <StatCard label="Leave Requests"   value={pendingLeaves}  sub="pending"               color="amber"  delay={0.20} />
      </div>

      {/* ── Main two-col grid ── */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_340px]">

        {/* LEFT — Today's classes */}
        <div className="flex flex-col gap-5">

          {/* Today's Classes */}
          <div className="border border-white/[0.07] bg-dark-900/60 backdrop-blur-sm"
            style={{ animation: "fade-up 0.5s 0.1s ease both" }}>
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-teal/60">Today's Classes</p>
                <p className="mt-0.5 font-sans text-xs text-white/25">
                  {new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" })}
                </p>
              </div>
              <span className="border border-teal/20 bg-teal/[0.05] px-2.5 py-1 font-mono text-[10px] text-teal/70">
                {TODAY_CLASSES.length} CLASSES
              </span>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    {["Time", "Class", "Room", "Students", "Status", "Action"].map(h => (
                      <th key={h} className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-white/22">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TODAY_CLASSES.map((cls, i) => {
                    const cfg = STATUS_CFG[cls.status];
                    return (
                      <tr key={cls.id}
                        className={`border-b border-white/[0.04] last:border-0 transition-colors hover:bg-white/[0.02] ${cls.status === "ongoing" ? "bg-teal/[0.02]" : ""}`}
                        style={{ animation: `fade-up 0.4s ${i * 0.07 + 0.15}s ease both` }}>
                        <td className="px-5 py-4">
                          <p className="font-mono text-xs text-white/65">{cls.time}</p>
                          <p className="font-mono text-[10px] text-white/25">{cls.end}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-sans text-sm font-semibold text-white/85">{cls.name}</p>
                          <p className="font-mono text-[10px] text-teal/50">{cls.code}</p>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-white/40">{cls.room}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-sans text-sm font-bold text-white/70">{cls.students}</span>
                            {cls.attended !== null && (
                              <span className="font-mono text-[10px] text-emerald-400/70">({cls.attended} present)</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[10px] ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} ${cls.status === "ongoing" ? "animate-pulse" : ""}`} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {cls.status === "completed" ? (
                            <button className="font-mono text-[11px] tracking-wider text-white/30 transition-colors hover:text-teal cursor-pointer">
                              VIEW →
                            </button>
                          ) : (
                            <button
                              onClick={() => onMarkAttendance(cls)}
                              className={`border px-3 py-1.5 font-mono text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
                                cls.status === "ongoing"
                                  ? "border-teal bg-teal text-dark hover:opacity-90"
                                  : "border-white/15 bg-white/[0.04] text-white/50 hover:border-teal/40 hover:text-teal"
                              }`}>
                              {cls.status === "ongoing" ? "MARK NOW" : "MARK"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col gap-2 p-4 md:hidden">
              {TODAY_CLASSES.map((cls, i) => {
                const cfg = STATUS_CFG[cls.status];
                return (
                  <div key={cls.id}
                    className={`border p-4 ${cls.status === "ongoing" ? "border-teal/25 bg-teal/[0.04]" : "border-white/[0.06]"}`}
                    style={{ animation: `fade-up 0.4s ${i * 0.06}s ease both` }}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-sans text-sm font-bold text-white">{cls.name}</p>
                        <p className="font-mono text-[10px] text-teal/50">{cls.code} · {cls.room}</p>
                      </div>
                      <span className={`flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[9px] ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        <span className={`h-1 w-1 rounded-full ${cfg.dot}`} />{cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-[10px] text-white/30">{cls.time} – {cls.end} · {cls.students} students</p>
                      {cls.status !== "completed" && (
                        <button onClick={() => onMarkAttendance(cls)}
                          className={`border px-3 py-1.5 font-mono text-[10px] font-bold cursor-pointer ${cls.status === "ongoing" ? "border-teal bg-teal text-dark" : "border-white/15 text-white/40 hover:border-teal/40 hover:text-teal"}`}>
                          MARK
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Attendance Overview bars */}
          <div className="border border-white/[0.07] bg-dark-900/60 backdrop-blur-sm"
            style={{ animation: "fade-up 0.5s 0.2s ease both" }}>
            <div className="border-b border-white/[0.06] px-5 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-teal/60">Attendance Overview</p>
              <p className="mt-0.5 font-sans text-xs text-white/25">Class-wise attendance this month</p>
            </div>
            <div className="flex flex-col gap-1 p-5">
              {ATTENDANCE_OVERVIEW.map((c, i) => {
                const barColor = c.pct >= 80 ? "bg-teal" : c.pct >= 70 ? "bg-amber-400" : "bg-red-400";
                const textColor = c.pct >= 80 ? "text-teal" : c.pct >= 70 ? "text-amber-400" : "text-red-400";
                return (
                  <div key={c.classId} className="flex flex-col gap-1.5"
                    style={{ animation: `fade-up 0.4s ${i * 0.08 + 0.2}s ease both` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-sm text-white/70">{c.name}</span>
                        <span className="font-mono text-[10px] text-white/25">{c.code}</span>
                      </div>
                      <span className={`font-mono text-sm font-bold ${textColor}`}>{c.pct}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/6">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${c.pct}%`, transition: "width 1s ease" }} />
                    </div>
                    {i < ATTENDANCE_OVERVIEW.length - 1 && <div className="mt-2" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT sidebar */}
        <div className="flex flex-col gap-5">

          {/* AI Insights */}
          <div className="border border-white/[0.07] bg-dark-900/60 backdrop-blur-sm"
            style={{ animation: "fade-up 0.5s 0.12s ease both" }}>
            <div className="border-b border-white/[0.06] px-5 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-teal/60">AI Insights</p>
            </div>
            <div className="flex flex-col gap-2 p-4">
              {AI_INSIGHTS.map((ins, i) => {
                const cfg = {
                  warning: { bg: "bg-amber-400/[0.05]", border: "border-amber-400/20", dot: "bg-amber-400", text: "text-amber-400/80" },
                  info:    { bg: "bg-teal/[0.04]",      border: "border-teal/20",      dot: "bg-teal",      text: "text-teal/70"    },
                  alert:   { bg: "bg-red-400/[0.05]",   border: "border-red-400/20",   dot: "bg-red-400",   text: "text-red-400/80" },
                }[ins.type];
                return (
                  <div key={ins.id}
                    className={`flex items-start gap-3 border p-3 ${cfg.bg} ${cfg.border}`}
                    style={{ animation: `fade-up 0.4s ${i * 0.07}s ease both` }}>
                    <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${cfg.dot}`} />
                    <p className={`font-sans text-xs leading-relaxed ${cfg.text}`}>{ins.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leave Requests */}
          <div className="border border-white/[0.07] bg-dark-900/60 backdrop-blur-sm"
            style={{ animation: "fade-up 0.5s 0.18s ease both" }}>
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-teal/60">Leave Requests</p>
              {pendingLeaves > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/20 font-mono text-[10px] font-bold text-amber-400">
                  {pendingLeaves}
                </span>
              )}
            </div>
            <div className="flex flex-col divide-y divide-white/[0.04]">
              {LEAVE_REQUESTS.map((req, i) => {
                const decided = leaveStates[req.id];
                return (
                  <div key={req.id} className="flex items-start justify-between gap-3 px-5 py-3.5"
                    style={{ animation: `fade-up 0.4s ${i * 0.06}s ease both` }}>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm font-medium text-white/75 truncate">{req.student}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[10px] text-white/30">{req.reason}</span>
                        <span className="font-mono text-[10px] text-white/20">·</span>
                        <span className="font-mono text-[10px] text-white/25">{req.time}</span>
                      </div>
                    </div>
                    {decided ? (
                      <span className={`shrink-0 border px-2 py-0.5 font-mono text-[9px] ${
                        decided === "approved"
                          ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-400"
                          : "border-red-400/25 bg-red-400/10 text-red-400"
                      }`}>
                        {decided === "approved" ? "APPROVED" : "REJECTED"}
                      </span>
                    ) : req.status !== "pending" ? (
                      <span className="shrink-0 font-mono text-[10px] text-white/25">Reviewed</span>
                    ) : (
                      <div className="flex shrink-0 gap-1.5">
                        <button onClick={() => handleLeave(req.id, "approved")}
                          className="border border-emerald-400/25 bg-emerald-400/[0.07] px-2.5 py-1 font-mono text-[10px] text-emerald-400 transition-all hover:bg-emerald-400/15 cursor-pointer">
                          ✓
                        </button>
                        <button onClick={() => handleLeave(req.id, "rejected")}
                          className="border border-red-400/25 bg-red-400/[0.07] px-2.5 py-1 font-mono text-[10px] text-red-400 transition-all hover:bg-red-400/15 cursor-pointer">
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border border-white/[0.07] bg-dark-900/60 backdrop-blur-sm"
            style={{ animation: "fade-up 0.5s 0.22s ease both" }}>
            <div className="border-b border-white/[0.06] px-5 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-teal/60">Quick Actions</p>
            </div>
            <div className="flex flex-col gap-2 p-4">
              {[
                { label: "Generate Report",       sub: "Export attendance PDF"       },
                { label: "Send Notification",     sub: "Message all students"        },
                { label: "Schedule Special Class",sub: "Add extra session"           },
                { label: "Register Student Face", sub: "Enroll new biometric data"   },
              ].map(a => (
                <button key={a.label} type="button"
                  className="flex cursor-pointer items-center gap-3 border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-left transition-all hover:border-teal/25 hover:bg-teal/[0.04]">
                  <div className="h-1.5 w-1.5 rounded-full bg-teal/40" />
                  <div>
                    <p className="font-sans text-sm text-white/65">{a.label}</p>
                    <p className="font-mono text-[10px] text-white/25">{a.sub}</p>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
                    className="ml-auto h-4 w-4 text-white/15">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}