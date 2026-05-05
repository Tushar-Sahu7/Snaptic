import { ArrowLeft, Clock, ShieldCheck, Activity, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { AttendanceResetButton } from "@/features/attendance/components/AttendanceResetButton";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export const AttendanceHeader = ({
  session,
  isFinalized,
  timeLeft,
  endTimeFormatted,
  step,
}) => {
  const navigate = useNavigate();

  const statusLabel = isFinalized
    ? "Finalized"
    : session?.status === "submitted"
      ? "Submitted"
      : session
        ? "Live Session"
        : "Session Setup";

  const isLive = session && !isFinalized && session.status !== "submitted";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 dark:border-white/5 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-3xl">
      <div className="container mx-auto px-4 h-24 flex items-center justify-between gap-6">
        <div className="flex items-center gap-6 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-2xl w-12 h-12 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all active:scale-90"
            onClick={() => navigate("/teacher/dashboard")}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 truncate uppercase italic">
                {session?.classId?.name || "Attendance Wizard"}
              </h2>
              {isLive && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Live
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5 text-zinc-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-[0.15em] mt-1">
              <Clock className="w-3.5 h-3.5" />
              <span className="truncate">
                {!session
                   ? "Initialize session"
                   : isFinalized
                     ? "Session Archived"
                     : session.status === "submitted"
                       ? "Awaiting final review"
                       : `${timeLeft} remaining • ends ${endTimeFormatted}`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {session && !isFinalized && step > 1 && step < 4 && (
            <AttendanceResetButton
              sessionId={session?._id}
              showLabel
              className="hidden md:flex rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[10px] border-zinc-200 dark:border-zinc-800"
              onSuccess={() => navigate("/teacher/take-attendance")}
            />
          )}

          <motion.div 
            layout
            className={cn(
              "flex items-center gap-2.5 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border transition-all duration-500 shadow-xl",
              isFinalized 
                ? "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400"
                : isLive 
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent shadow-zinc-900/20 dark:shadow-white/5"
                  : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
            )}
          >
            {isFinalized ? (
              <ShieldCheck className="w-4 h-4" />
            ) : (
              <Activity className={cn("w-4 h-4", isLive && "animate-spin-slow")} />
            )}
            <span className="hidden sm:inline">{statusLabel}</span>
          </motion.div>
        </div>
      </div>
    </header>
  );
};
