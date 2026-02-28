import { STUDENT, TODAY_STATS } from "../data/mockData";

function StatCard({ label, value, sub, pct, color = "teal", delay = 0 }) {
  const barColor = {
    teal:   "bg-teal",
    amber:  "bg-amber-400",
    blue:   "bg-blue-400",
    green:  "bg-emerald-400",
  }[color];

  return (
    <div
      className="flex flex-col gap-2 border border-white/[0.07] bg-dark-900/80 p-5 backdrop-blur-sm"
      style={{ animation: `fade-up 0.5s ${delay}s ease both` }}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">{label}</p>
      <div className="flex items-end gap-2">
        <span className="font-sans text-3xl font-black leading-none tracking-tight text-white">
          {value}
        </span>
        {sub && (
          <span className="mb-0.5 font-mono text-xs text-white/30">{sub}</span>
        )}
      </div>
      {typeof pct === "number" && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/8">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function StudentHeader() {
  const initials = STUDENT.name.split(" ").map(n => n[0]).join("").slice(0, 2);
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="mb-6">
      {/* Welcome banner */}
      <div
        className="relative mb-5 overflow-hidden border border-teal/10 bg-dark-900/60 px-5 py-5 backdrop-blur-sm lg:px-7"
        style={{ animation: "fade-up 0.4s ease both" }}
      >
        {/* Subtle radial glow */}
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-64 opacity-60"
          style={{ background: "radial-gradient(ellipse at 100% 0%, rgba(0,229,190,0.08) 0%, transparent 70%)" }} />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: avatar + name */}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-teal bg-teal/10 font-mono text-sm font-bold text-teal lg:h-14 lg:w-14 lg:text-base">
              {initials}
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-[0.18em] text-teal/60">
                ◆ STUDENT PORTAL
              </p>
              <h1 className="font-sans text-xl font-black tracking-tight text-white lg:text-2xl">
                Welcome back, {STUDENT.firstName}
              </h1>
              <p className="font-sans text-sm text-white/40">
                {STUDENT.department} · {STUDENT.year} · Roll #{STUDENT.roll}
              </p>
            </div>
          </div>

          {/* Right: date + streak */}
          <div className="flex items-center gap-3 sm:flex-col sm:items-end">
            <p className="font-mono text-[11px] text-white/30">{today}</p>
            <div className="flex items-center gap-1.5 border border-teal/20 bg-teal/[0.05] px-3 py-1.5">
              <span className="font-mono text-[10px] tracking-wider text-teal/70">🔥 {TODAY_STATS.streak} DAY STREAK</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Today's Attendance"
          value={`${TODAY_STATS.todayAttendance}%`}
          pct={TODAY_STATS.todayAttendance}
          color="teal"
          delay={0.05}
        />
        <StatCard
          label="Overall Attendance"
          value={`${TODAY_STATS.overallAttendance}%`}
          pct={TODAY_STATS.overallAttendance}
          color="blue"
          delay={0.1}
        />
        <StatCard
          label="Classes Today"
          value={TODAY_STATS.classesTotal}
          sub={`${TODAY_STATS.classesCompleted} done`}
          pct={(TODAY_STATS.classesCompleted / TODAY_STATS.classesTotal) * 100}
          color="green"
          delay={0.15}
        />
        <StatCard
          label="Current Streak"
          value={`${TODAY_STATS.streak}d`}
          sub="in a row"
          pct={Math.min((TODAY_STATS.streak / 30) * 100, 100)}
          color="amber"
          delay={0.2}
        />
      </div>
    </div>
  );
}