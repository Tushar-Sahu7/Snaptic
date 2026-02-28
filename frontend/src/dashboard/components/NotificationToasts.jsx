import { useState } from "react";
import { NOTIFICATIONS } from "../data/mockData";

const TYPE_CONFIG = {
  success: {
    border: "border-emerald-400/20",
    bg:     "bg-emerald-400/[0.05]",
    dot:    "bg-emerald-400",
    title:  "text-emerald-400",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 text-emerald-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
      </svg>
    ),
  },
  warning: {
    border: "border-amber-400/20",
    bg:     "bg-amber-400/[0.05]",
    dot:    "bg-amber-400",
    title:  "text-amber-400",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 text-amber-400">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
    ),
  },
  info: {
    border: "border-blue-400/20",
    bg:     "bg-blue-400/[0.05]",
    dot:    "bg-blue-400",
    title:  "text-blue-400",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 text-blue-400">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
      </svg>
    ),
  },
};

export default function NotificationToasts() {
  const [dismissed, setDismissed] = useState([]);

  const visible = NOTIFICATIONS.filter(n => !dismissed.includes(n.id));

  if (visible.length === 0) return null;

  return (
    <div
      className="border border-white/[0.07] bg-dark-900/60 backdrop-blur-sm"
      style={{ animation: "fade-up 0.5s 0.2s ease both" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-teal/60">
            Recent Notifications
          </p>
          {visible.length > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal/20 font-mono text-[9px] font-bold text-teal">
              {visible.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setDismissed(NOTIFICATIONS.map(n => n.id))}
          className="font-mono text-[10px] tracking-wider text-white/25 transition-colors hover:text-white/55 cursor-pointer"
        >
          CLEAR ALL
        </button>
      </div>

      {/* Notification list */}
      <div className="flex flex-col gap-2 p-4">
        {visible.map((n, i) => {
          const cfg = TYPE_CONFIG[n.type];
          return (
            <div key={n.id}
              className={`flex items-start gap-3 border p-3.5 ${cfg.border} ${cfg.bg}`}
              style={{ animation: `fade-up 0.35s ${i * 0.07}s ease both` }}
            >
              {/* Icon */}
              <div className="mt-0.5 shrink-0">{cfg.icon}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className={`font-sans text-sm font-semibold ${cfg.title}`}>{n.title}</p>
                  <span className="font-mono text-[10px] text-white/25 shrink-0">{n.time}</span>
                </div>
                <p className="font-sans text-xs leading-relaxed text-white/45">{n.message}</p>
              </div>

              {/* Dismiss */}
              <button
                onClick={() => setDismissed(d => [...d, n.id])}
                className="mt-0.5 shrink-0 text-white/20 transition-colors hover:text-white/55 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}