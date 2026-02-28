import { useState } from "react";
import { SUBJECT_ATTENDANCE, MONTHLY_DATA } from "../data/mockData";

/* Mini sparkline using SVG path */
function MiniChart({ data }) {
  const W = 200, H = 50;
  const max = Math.max(...data.map(d => d.pct));
  const min = Math.min(...data.map(d => d.pct));
  const range = max - min || 1;

  const pts = data.map((d, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((d.pct - min) / range) * (H - 8) - 4,
  }));

  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${path} L ${W} ${H} L 0 ${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-12" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,229,190,0.25)" />
          <stop offset="100%" stopColor="rgba(0,229,190,0)" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#chartGrad)" />
      <path d={path} fill="none" stroke="rgba(0,229,190,0.7)" strokeWidth="1.5" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#00E5BE" opacity="0.8" />
      ))}
    </svg>
  );
}

/* Circular progress ring */
function RingProgress({ pct, size = 56, stroke = 4 }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 75 ? "#00E5BE" : pct >= 60 ? "#fbbf24" : "#f87171";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
    </svg>
  );
}

export default function AttendanceTab() {
  const [filter, setFilter] = useState("all"); // all | low | good

  const overall = Math.round(
    SUBJECT_ATTENDANCE.reduce((s, a) => s + a.pct, 0) / SUBJECT_ATTENDANCE.length
  );

  const filtered = SUBJECT_ATTENDANCE.filter(s => {
    if (filter === "low")  return s.pct < 75;
    if (filter === "good") return s.pct >= 75;
    return true;
  });

  return (
    <div className="flex flex-col gap-5">

      {/* Summary row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Overall ring card */}
        <div className="col-span-1 flex items-center gap-4 border border-white/[0.07] bg-dark-900/70 p-5">
          <div className="relative flex items-center justify-center">
            <RingProgress pct={overall} size={64} stroke={5} />
            <span className="absolute font-mono text-xs font-bold text-teal">{overall}%</span>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-widest text-white/30 uppercase">Overall</p>
            <p className="font-sans text-lg font-black text-white">{overall}%</p>
            <p className="font-mono text-[10px] text-white/30">
              {overall >= 75 ? "✓ On track" : "⚠ Below 75%"}
            </p>
          </div>
        </div>

        {/* Monthly trend card */}
        <div className="sm:col-span-2 border border-white/[0.07] bg-dark-900/70 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[10px] tracking-widest text-white/30 uppercase">6-Month Trend</p>
            <div className="flex gap-3">
              {MONTHLY_DATA.slice(-2).map(d => (
                <span key={d.month} className="font-mono text-[10px] text-white/30">
                  <span className="text-white/50">{d.month}</span> {d.pct}%
                </span>
              ))}
            </div>
          </div>
          <MiniChart data={MONTHLY_DATA} />
          <div className="flex justify-between mt-1">
            {MONTHLY_DATA.map(d => (
              <span key={d.month} className="font-mono text-[9px] text-white/25">{d.month}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Subject breakdown */}
      <div className="border border-white/[0.07] bg-dark-900/60 backdrop-blur-sm">
        {/* Header + filter */}
        <div className="flex flex-col gap-3 border-b border-white/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-teal/60">
            Subject-wise Attendance
          </p>
          <div className="flex items-center gap-1 border border-white/10">
            {[
              { key: "all",  label: "All"  },
              { key: "good", label: "≥75%" },
              { key: "low",  label: "<75%" },
            ].map(f => (
              <button key={f.key} type="button" onClick={() => setFilter(f.key)}
                className={[
                  "px-3 py-1.5 font-mono text-[10px] tracking-wider transition-all cursor-pointer border-0",
                  filter === f.key
                    ? "bg-teal/15 text-teal"
                    : "bg-transparent text-white/30 hover:text-white/55",
                ].join(" ")}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subject rows */}
        <div className="divide-y divide-white/[0.04]">
          {filtered.map((s, i) => {
            const barColor = s.pct >= 75 ? "bg-teal" : s.pct >= 60 ? "bg-amber-400" : "bg-red-400";
            const textColor = s.pct >= 75 ? "text-teal" : s.pct >= 60 ? "text-amber-400" : "text-red-400";
            const warn = s.pct < 75;

            return (
              <div key={s.code}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02]"
                style={{ animation: `fade-up 0.4s ${i * 0.06}s ease both` }}
              >
                {/* Ring */}
                <div className="relative hidden sm:flex items-center justify-center shrink-0">
                  <RingProgress pct={s.pct} size={44} stroke={3.5} />
                  <span className={`absolute font-mono text-[9px] font-bold ${textColor}`}>{s.pct}</span>
                </div>

                {/* Name + bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="font-sans text-sm font-medium text-white/80 truncate">{s.subject}</p>
                      {warn && (
                        <span className="hidden sm:inline-flex shrink-0 items-center gap-1 border border-amber-400/25 bg-amber-400/10 px-2 py-0.5 font-mono text-[9px] text-amber-400">
                          ⚠ LOW
                        </span>
                      )}
                    </div>
                    <span className={`shrink-0 font-mono text-sm font-bold ${textColor}`}>{s.pct}%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/6">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono text-[10px] text-white/25">{s.code}</span>
                    <span className="font-mono text-[10px] text-white/25">
                      {s.present}/{s.total} classes
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="px-5 py-10 text-center">
              <p className="font-sans text-sm text-white/30">No subjects match this filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}