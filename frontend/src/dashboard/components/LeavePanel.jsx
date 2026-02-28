import { useState } from "react";
import { LEAVE_HISTORY, SUBJECTS } from "../data/mockData";

const STATUS_CFG = {
  pending:  { label: "Pending",  bg: "bg-amber-400/10",   text: "text-amber-400",   border: "border-amber-400/25"  },
  approved: { label: "Approved", bg: "bg-emerald-400/10", text: "text-emerald-400", border: "border-emerald-400/25" },
  rejected: { label: "Rejected", bg: "bg-red-400/10",     text: "text-red-400",     border: "border-red-400/25"    },
};

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}

/* ── Apply Leave Form ── */
function ApplyLeaveForm() {
  const [form, setForm]     = useState({ subject: "", from: "", to: "", reason: "", type: "" });
  const [submitted, setSub] = useState(false);
  const [loading, setLoading] = useState(false);

  const LEAVE_TYPES = ["Medical Leave", "Personal Leave", "Academic Leave", "Emergency Leave"];

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  async function submit(e) {
    e.preventDefault();
    if (!form.subject || !form.from || !form.to || !form.reason || !form.type) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSub(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center border-2 border-teal bg-teal/10">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-6 w-6 text-teal">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <p className="font-mono text-[10px] tracking-widest text-teal">SUBMITTED</p>
        <p className="font-sans text-sm text-white/40">Leave application sent for review.</p>
        <button onClick={() => { setSub(false); setForm({ subject:"",from:"",to:"",reason:"",type:"" }); }}
          className="mt-1 font-mono text-[11px] tracking-wider text-white/30 transition-colors hover:text-teal cursor-pointer">
          SUBMIT ANOTHER →
        </button>
      </div>
    );
  }

  const inputCls = "w-full border border-white/10 bg-white/[0.025] px-3 py-2.5 font-sans text-sm text-white placeholder-white/20 outline-none transition-colors focus:border-teal/40 focus:bg-white/[0.04]";
  const selectCls = inputCls + " appearance-none cursor-pointer";
  const labelCls = "font-mono text-[10px] uppercase tracking-[0.14em] text-white/30";

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {/* Leave type */}
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>Leave Type</label>
        <div className="relative">
          <select value={form.type} onChange={e => set("type", e.target.value)}
            className={selectCls} style={{ colorScheme: "dark" }}>
            <option value="" disabled className="bg-[#060f1a]">Select type</option>
            {LEAVE_TYPES.map(t => <option key={t} value={t} className="bg-[#060f1a]">{t}</option>)}
          </select>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Subject */}
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>Subject</label>
        <div className="relative">
          <select value={form.subject} onChange={e => set("subject", e.target.value)}
            className={selectCls} style={{ colorScheme: "dark" }}>
            <option value="" disabled className="bg-[#060f1a]">Select subject</option>
            {SUBJECTS.map(s => <option key={s} value={s} className="bg-[#060f1a]">{s}</option>)}
          </select>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Date range */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>From</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/20">
              <CalendarIcon />
            </span>
            <input type="date" value={form.from} onChange={e => set("from", e.target.value)}
              className={inputCls + " pl-9"} style={{ colorScheme: "dark" }} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>To</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/20">
              <CalendarIcon />
            </span>
            <input type="date" value={form.to} onChange={e => set("to", e.target.value)}
              className={inputCls + " pl-9"} style={{ colorScheme: "dark" }} />
          </div>
        </div>
      </div>

      {/* Reason */}
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>Reason</label>
        <textarea
          rows={3} value={form.reason} onChange={e => set("reason", e.target.value)}
          placeholder="Briefly describe the reason for leave…"
          className={inputCls + " resize-none leading-relaxed"}
        />
      </div>

      {/* Submit */}
      <button type="submit" disabled={loading}
        className={[
          "flex items-center justify-center gap-2 border-0 py-3 font-mono text-[11px] font-bold tracking-widest text-dark transition-all",
          loading ? "cursor-not-allowed bg-teal/55" : "cursor-pointer bg-teal hover:opacity-90",
        ].join(" ")}>
        {loading ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
            </svg>
            SUBMITTING…
          </>
        ) : "SUBMIT APPLICATION →"}
      </button>
    </form>
  );
}

/* ── Leave History List ── */
function LeaveHistory() {
  return (
    <div className="flex flex-col">
      {LEAVE_HISTORY.map((l, i) => {
        const cfg = STATUS_CFG[l.status];
        return (
          <div key={l.id}
            className="flex items-start justify-between gap-3 border-b border-white/[0.05] py-3.5 last:border-0"
            style={{ animation: `fade-up 0.4s ${i * 0.07}s ease both` }}
          >
            <div className="flex-1 min-w-0">
              <p className="font-sans text-sm font-medium text-white/80 truncate">{l.type}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-[10px] text-white/30">{l.from} – {l.to}</span>
                <span className="font-mono text-[10px] text-white/20">·</span>
                <span className="font-mono text-[10px] text-white/30">{l.days}d</span>
              </div>
              <p className="mt-0.5 font-sans text-[11px] text-white/25 truncate">{l.reason}</p>
            </div>
            <span className={`shrink-0 border px-2.5 py-1 font-mono text-[10px] ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              {cfg.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Main export ── */
export default function LeavePanel() {
  const [tab, setTab] = useState("apply"); // apply | history

  return (
    <div
      className="border border-white/[0.07] bg-dark-900/60 backdrop-blur-sm"
      style={{ animation: "fade-up 0.5s 0.1s ease both" }}
    >
      {/* Header */}
      <div className="border-b border-white/[0.06] px-5 pt-4">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-teal/60">Leave Management</p>
        {/* Tab toggles */}
        <div className="flex gap-0 border-b border-transparent">
          {[
            { key: "apply",   label: "Apply" },
            { key: "history", label: "History" },
          ].map(t => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className={[
                "px-4 pb-3 font-mono text-[11px] tracking-wider transition-all cursor-pointer border-0 bg-transparent",
                tab === t.key
                  ? "border-b-2 border-teal text-teal -mb-px"
                  : "text-white/30 hover:text-white/55",
              ].join(" ")}>
              {t.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        {tab === "apply"   && <ApplyLeaveForm />}
        {tab === "history" && <LeaveHistory />}
      </div>
    </div>
  );
}