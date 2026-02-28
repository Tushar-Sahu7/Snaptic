import { useState } from "react";
import { STUDENT, SUBJECT_ATTENDANCE, TODAY_STATS } from "../data/mockData";

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-3.5 w-3.5">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
    </svg>
  );
}

export default function ProfileTab() {
  const initials = STUDENT.name.split(" ").map(n => n[0]).join("").slice(0, 2);
  const [editing, setEditing] = useState(false);
  const [contact, setContact] = useState({
    phone: "+91 98765 43210",
    email: "arjun.sharma@university.edu",
    address: "Hostel Block C, Room 204",
  });
  const [draft, setDraft] = useState({ ...contact });

  function save() {
    setContact({ ...draft });
    setEditing(false);
  }

  const INFO_ROWS = [
    { label: "Full Name",     value: STUDENT.name        },
    { label: "Roll Number",   value: STUDENT.roll         },
    { label: "Department",    value: STUDENT.department   },
    { label: "Program",       value: STUDENT.program      },
    { label: "Year",          value: STUDENT.year         },
    { label: "Semester",      value: STUDENT.semester     },
  ];

  const inputCls = "w-full border border-white/10 bg-white/[0.03] px-3 py-2 font-sans text-sm text-white placeholder-white/25 outline-none focus:border-teal/40";

  return (
    <div className="flex flex-col gap-5">

      {/* Profile card */}
      <div className="border border-white/[0.07] bg-dark-900/60 p-5 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="flex h-20 w-20 items-center justify-center border-2 border-teal bg-teal/10 font-mono text-xl font-bold text-teal">
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center border border-dark bg-teal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3 text-dark">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <p className="font-mono text-[10px] tracking-widest text-teal/60 uppercase mb-0.5">Student Profile</p>
            <h2 className="font-sans text-xl font-black text-white">{STUDENT.name}</h2>
            <p className="font-sans text-sm text-white/40">{STUDENT.department} · {STUDENT.program}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              <span className="border border-teal/20 bg-teal/[0.05] px-2.5 py-1 font-mono text-[10px] text-teal/70">
                {STUDENT.year}
              </span>
              <span className="border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] text-white/40">
                {STUDENT.semester}
              </span>
              <span className="border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] text-white/40">
                Roll #{STUDENT.roll}
              </span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-4 sm:flex-col sm:gap-2 sm:items-end">
            <div className="text-center sm:text-right">
              <p className="font-sans text-2xl font-black text-teal">{TODAY_STATS.overallAttendance}%</p>
              <p className="font-mono text-[9px] text-white/30 uppercase">Overall</p>
            </div>
            <div className="text-center sm:text-right">
              <p className="font-sans text-2xl font-black text-white">{TODAY_STATS.streak}</p>
              <p className="font-mono text-[9px] text-white/30 uppercase">Day Streak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Academic info */}
      <div className="border border-white/[0.07] bg-dark-900/60 backdrop-blur-sm">
        <div className="border-b border-white/[0.06] px-5 py-3.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-teal/60">Academic Information</p>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {INFO_ROWS.map(row => (
            <div key={row.label} className="flex items-center px-5 py-3.5">
              <span className="w-36 shrink-0 font-mono text-[10px] tracking-wide text-white/30">{row.label}</span>
              <span className="font-sans text-sm text-white/70">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contact info — editable */}
      <div className="border border-white/[0.07] bg-dark-900/60 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-teal/60">Contact Information</p>
          {!editing ? (
            <button type="button" onClick={() => { setDraft({ ...contact }); setEditing(true); }}
              className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-white/30 transition-colors hover:text-teal cursor-pointer">
              <EditIcon /> EDIT
            </button>
          ) : (
            <div className="flex gap-3">
              <button type="button" onClick={() => setEditing(false)}
                className="font-mono text-[10px] tracking-wider text-white/25 hover:text-white/55 cursor-pointer">
                CANCEL
              </button>
              <button type="button" onClick={save}
                className="font-mono text-[10px] tracking-wider text-teal hover:opacity-80 cursor-pointer">
                SAVE ✓
              </button>
            </div>
          )}
        </div>

        <div className="divide-y divide-white/[0.04]">
          {[
            { key: "phone",   label: "Phone",   type: "tel"   },
            { key: "email",   label: "Email",   type: "email" },
            { key: "address", label: "Address", type: "text"  },
          ].map(field => (
            <div key={field.key} className="flex items-center gap-4 px-5 py-3.5">
              <span className="w-20 shrink-0 font-mono text-[10px] tracking-wide text-white/30">{field.label}</span>
              {editing ? (
                <input
                  type={field.type}
                  value={draft[field.key]}
                  onChange={e => setDraft(d => ({ ...d, [field.key]: e.target.value }))}
                  className={inputCls + " flex-1"}
                />
              ) : (
                <span className="font-sans text-sm text-white/65">{contact[field.key]}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Attendance performance per subject (mini) */}
      <div className="border border-white/[0.07] bg-dark-900/60 backdrop-blur-sm">
        <div className="border-b border-white/[0.06] px-5 py-3.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-teal/60">Attendance Summary</p>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3">
          {SUBJECT_ATTENDANCE.map(s => {
            const color = s.pct >= 75 ? "bg-teal" : s.pct >= 60 ? "bg-amber-400" : "bg-red-400";
            const text  = s.pct >= 75 ? "text-teal" : s.pct >= 60 ? "text-amber-400" : "text-red-400";
            return (
              <div key={s.code} className="flex items-center gap-3">
                <span className="w-28 shrink-0 font-sans text-xs text-white/45 truncate">{s.subject}</span>
                <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-white/6">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${s.pct}%` }} />
                </div>
                <span className={`w-10 shrink-0 text-right font-mono text-xs ${text}`}>{s.pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}