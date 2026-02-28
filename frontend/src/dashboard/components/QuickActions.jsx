const ACTIONS = [
  {
    label: "Register Face",
    sub:   "Enroll for attendance scanning",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
      </svg>
    ),
    color: "text-teal border-teal/25 bg-teal/[0.05] hover:bg-teal/[0.10]",
  },
  {
    label: "Download Report",
    sub:   "Export attendance as PDF",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
    color: "text-white/55 border-white/10 bg-white/[0.025] hover:bg-white/[0.05] hover:text-white/80",
  },
  {
    label: "View Timetable",
    sub:   "Full weekly schedule",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
    color: "text-white/55 border-white/10 bg-white/[0.025] hover:bg-white/[0.05] hover:text-white/80",
  },
  {
    label: "Contact Support",
    sub:   "Raise an issue or query",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
      </svg>
    ),
    color: "text-white/55 border-white/10 bg-white/[0.025] hover:bg-white/[0.05] hover:text-white/80",
  },
];

export default function QuickActions() {
  return (
    <div
      className="border border-white/[0.07] bg-dark-900/60 backdrop-blur-sm"
      style={{ animation: "fade-up 0.5s 0.15s ease both" }}
    >
      <div className="border-b border-white/[0.06] px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-teal/60">Quick Actions</p>
      </div>
      <div className="flex flex-col gap-2 p-4">
        {ACTIONS.map((a, i) => (
          <button key={a.label} type="button"
            className={`flex cursor-pointer items-center gap-3 border px-4 py-3 text-left transition-all duration-150 ${a.color}`}
            style={{ animation: `fade-up 0.4s ${i * 0.07 + 0.15}s ease both` }}
          >
            <span className="shrink-0">{a.icon}</span>
            <div>
              <p className="font-sans text-sm font-medium">{a.label}</p>
              <p className="font-mono text-[10px] text-white/25 mt-0.5">{a.sub}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}