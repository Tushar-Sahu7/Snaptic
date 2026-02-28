import { useState } from "react";
import { ATTENDANCE_OVERVIEW, TODAY_CLASSES } from "../data/teacherData";

const MOCK_STUDENTS_AT_RISK = [
  { name:"Rahul Verma",     roll:"CS2021003", class:"CS202", pct:58, missed:10 },
  { name:"Ankit Joshi",     roll:"CS2021007", class:"CS303", pct:61, missed:9  },
  { name:"Vikram Das",      roll:"CS2021009", class:"CS101", pct:64, missed:8  },
  { name:"Meera Bose",      roll:"CS2021010", class:"CS202", pct:67, missed:7  },
  { name:"Rohan Gupta",     roll:"CS2021011", class:"CS303", pct:69, missed:7  },
];

const MONTHLY = [
  { month:"Oct", cs101:88, cs202:91, cs303:78, cs404:85 },
  { month:"Nov", cs101:85, cs202:89, cs303:74, cs404:88 },
  { month:"Dec", cs101:91, cs202:94, cs303:80, cs404:86 },
  { month:"Jan", cs101:87, cs202:90, cs303:76, cs404:89 },
  { month:"Feb", cs101:85, cs202:92, cs303:78, cs404:88 },
];

function MiniBar({ value, max = 100, color = "bg-teal" }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/6">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${(value/max)*100}%`, transition:"width 1s ease" }} />
      </div>
      <span className="font-mono text-xs text-white/50 w-8 text-right">{value}%</span>
    </div>
  );
}

export default function ReportsTab() {
  const [selectedClass, setSelectedClass] = useState("all");
  const [exportLoading, setExportLoading] = useState(false);

  async function handleExport() {
    setExportLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setExportLoading(false);
    alert("Report downloaded! (mock)");
  }

  const avgAttendance = Math.round(
    ATTENDANCE_OVERVIEW.reduce((s,c) => s + c.pct, 0) / ATTENDANCE_OVERVIEW.length
  );
  const lowClasses = ATTENDANCE_OVERVIEW.filter(c => c.pct < 80).length;

  return (
    <div className="flex flex-col gap-5">

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label:"Avg Attendance",   value:`${avgAttendance}%`, sub:"across all classes",  color:"text-teal"        },
          { label:"Classes Below 80%",value:lowClasses,          sub:"need attention",      color:"text-amber-400"   },
          { label:"At-Risk Students", value:MOCK_STUDENTS_AT_RISK.length, sub:"below 75%", color:"text-red-400"     },
          { label:"Sessions This Month", value:42,               sub:"attendance sessions", color:"text-white/70"    },
        ].map((s, i) => (
          <div key={s.label} className="border border-white/[0.07] bg-dark-900/80 p-5"
            style={{ animation: `fade-up 0.4s ${i*0.07}s ease both` }}>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/28">{s.label}</p>
            <p className={`mt-2 font-sans text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="mt-0.5 font-mono text-[10px] text-white/25">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-5">

          {/* Class-wise attendance table */}
          <div className="border border-white/[0.07] bg-dark-900/60"
            style={{ animation:"fade-up 0.4s 0.1s ease both" }}>
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-teal/60">Class-wise Report</p>
              <button onClick={handleExport} disabled={exportLoading}
                className={`flex items-center gap-2 border px-3 py-1.5 font-mono text-[10px] tracking-wider transition-all cursor-pointer ${
                  exportLoading ? "border-white/10 text-white/25" : "border-teal/25 text-teal hover:bg-teal/[0.07]"
                }`}>
                {exportLoading ? (
                  <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-3.5 w-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/>
                  </svg>
                )}
                {exportLoading ? "EXPORTING…" : "EXPORT PDF"}
              </button>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {ATTENDANCE_OVERVIEW.map((c, i) => {
                const barColor = c.pct >= 80 ? "bg-teal" : c.pct >= 70 ? "bg-amber-400" : "bg-red-400";
                const pctColor = c.pct >= 80 ? "text-teal" : c.pct >= 70 ? "text-amber-400" : "text-red-400";
                return (
                  <div key={c.classId} className="px-5 py-4 hover:bg-white/[0.01]"
                    style={{ animation:`fade-up 0.4s ${i*0.08+0.1}s ease both` }}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-sans text-sm font-medium text-white/80">{c.name}</span>
                        <span className="ml-2 font-mono text-[10px] text-white/25">{c.code}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-white/30">{c.students} students</span>
                        <span className={`font-mono text-sm font-bold ${pctColor}`}>{c.pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/6">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width:`${c.pct}%`, transition:"width 1s ease" }} />
                    </div>
                    {c.pct < 80 && (
                      <p className="mt-1.5 font-mono text-[10px] text-amber-400/60">
                        ⚠ Below 80% threshold
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Month-by-month trend */}
          <div className="border border-white/[0.07] bg-dark-900/60"
            style={{ animation:"fade-up 0.4s 0.2s ease both" }}>
            <div className="border-b border-white/[0.06] px-5 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-teal/60">Monthly Trend</p>
            </div>
            <div className="p-5 overflow-x-auto">
              <table className="w-full min-w-[400px]">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    <th className="pb-3 text-left font-mono text-[10px] uppercase tracking-wider text-white/22">Month</th>
                    {ATTENDANCE_OVERVIEW.map(c => (
                      <th key={c.code} className="pb-3 text-left font-mono text-[10px] uppercase tracking-wider text-white/22 pl-4">{c.code}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MONTHLY.map((row, i) => (
                    <tr key={row.month} className="border-b border-white/[0.03] last:border-0">
                      <td className="py-3 font-mono text-[11px] text-white/40 pr-4">{row.month}</td>
                      {[row.cs101, row.cs202, row.cs303, row.cs404].map((val, j) => {
                        const color = val >= 80 ? "text-teal" : val >= 70 ? "text-amber-400" : "text-red-400";
                        return (
                          <td key={j} className="py-3 pl-4">
                            <span className={`font-mono text-xs font-bold ${color}`}>{val}%</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* At-risk students sidebar */}
        <div className="flex flex-col gap-5">
          <div className="border border-red-400/15 bg-red-400/[0.03]"
            style={{ animation:"fade-up 0.4s 0.15s ease both" }}>
            <div className="flex items-center gap-3 border-b border-red-400/10 px-5 py-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4 text-red-400/70">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-red-400/70">At-Risk Students</p>
            </div>
            <div className="divide-y divide-red-400/[0.06]">
              {MOCK_STUDENTS_AT_RISK.map((s, i) => (
                <div key={s.roll} className="flex items-start justify-between gap-3 px-5 py-3.5"
                  style={{ animation:`fade-up 0.4s ${i*0.07}s ease both` }}>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-medium text-white/75 truncate">{s.name}</p>
                    <p className="font-mono text-[10px] text-white/25">{s.class} · {s.missed} classes missed</p>
                    <MiniBar value={s.pct} color="bg-red-400" />
                  </div>
                  <span className="shrink-0 border border-red-400/25 bg-red-400/[0.07] px-2 py-0.5 font-mono text-[10px] font-bold text-red-400">
                    {s.pct}%
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-red-400/10 px-5 py-3">
              <button className="font-mono text-[11px] tracking-wider text-red-400/50 hover:text-red-400 cursor-pointer transition-colors">
                SEND ALERT TO ALL →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}