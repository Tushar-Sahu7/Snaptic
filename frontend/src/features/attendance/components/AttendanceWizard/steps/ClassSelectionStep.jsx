import { CalendarDays } from "lucide-react";
import ClassCard from "@/components/shared/ClassCard";
import { AttendanceActionGroup } from "@/features/attendance/components/AttendanceActionGroup";
import { PrimaryAttendanceAction } from "@/features/attendance/components/PrimaryAttendanceAction";
import { Badge } from "@/components/ui/badge";
import { isClassInSession } from "@/lib/utils";
import { cn } from "@/lib/utils";


export const ClassSelectionStep = ({
  session,
  classes,
  todaySessions,
  studentsCount,
  onSelectClass,
  onContinue,
}) => {
  if (session) {
    const baseClass =
      typeof session.classId === "object"
        ? { ...session.classId, studentCount: studentsCount }
        : { name: "Loading Class Details...", studentCount: studentsCount };

  return (
    <div>
      <div>

          <ClassCard
            cls={baseClass}

            footer={
              <PrimaryAttendanceAction
                cls={baseClass}
                session={session}
                className="w-full"
                onClick={(cls, state) => {
                  // Intercept navigation — route within the wizard instead
                  if (session.status === "inprogress") onContinue(2);
                  else if (session.status === "submitted") onContinue(3);
                  else if (session.status === "finalized") onContinue(4);
                  return false; // Prevent self-navigation
                }}
              />
            }
          />
        </div>
      </div>
    );
  }

  const sortedClasses = [...classes].sort((a, b) => {
    const { onTime: onTimeA } = isClassInSession(a);
    const { onTime: onTimeB } = isClassInSession(b);
    const tSessionA = todaySessions[a._id];
    const tSessionB = todaySessions[b._id];

    // Priority points
    const getPriority = (c, onTime, session) => {
      if (session?.status === "inprogress") return 3;
      if (onTime && session?.status !== "submitted") return 2;
      if (session?.status === "submitted") return 1;
      return 0;
    };

    const prioA = getPriority(a, onTimeA, tSessionA);
    const prioB = getPriority(b, onTimeB, tSessionB);

    if (prioA !== prioB) return prioB - prioA;

    // Tie-break by start time
    if (!a.schedule?.startTime) return 1;
    if (!b.schedule?.startTime) return -1;

    return (a.schedule?.startTime || "").localeCompare(
      b.schedule?.startTime || "",
    );
  });

  return (
    <div className="space-y-16 py-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
      <div className="max-w-3xl space-y-6">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Attendance Wizard</p>
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 italic uppercase leading-[0.9]">
            Ready to <span className="text-primary not-italic">Scan?</span>
          </h2>
        </div>
        <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-xl">
          Select your class below to begin the biometric recognition session. Only active classes are shown for real-time tracking.
        </p>
      </div>

      {sortedClasses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 px-4 bg-white/50 dark:bg-zinc-900/30 backdrop-blur-xl rounded-[48px] border border-dashed border-zinc-200 dark:border-zinc-800 text-center shadow-inner">
          <div className="w-24 h-24 rounded-[32px] bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-8 shadow-2xl">
            <CalendarDays className="w-12 h-12 text-zinc-300" />
          </div>
          <div className="max-w-sm space-y-3">
            <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 uppercase italic">
              No active classes
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              It looks like you don't have any classes scheduled for this time. Check your schedule or try again later.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {sortedClasses.map((c) => {
            const { onTime } = isClassInSession(c);
            const tSession = todaySessions[c._id];
            const sCount = c.studentIds?.length || 0;
            const hasActiveSession = tSession?.status === "inprogress";
            const isSubmitted = tSession?.status === "submitted";
            const canStart = onTime || hasActiveSession || isSubmitted;

            return (
              <ClassCard
                key={c._id}
                cls={{
                  ...c,
                  studentCount: sCount,
                }}
                onClick={() => canStart && onSelectClass?.(c, onTime ? "auto" : "manual")}
                className={cn(
                  "h-full transition-all duration-700 hover:scale-[1.02] active:scale-[0.98]",
                  !canStart && "opacity-60 grayscale-[0.5] pointer-events-none"
                )}
                badge={
                  hasActiveSession ? (
                    <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-white border-none px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                      In Progress
                    </Badge>
                  ) : isSubmitted ? (
                    <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-none px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest">
                      Submitted
                    </Badge>
                  ) : onTime ? (
                    <Badge variant="default" className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-none px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest shadow-xl">
                      Live Now
                    </Badge>
                  ) : null
                }
                footer={
                  <AttendanceActionGroup
                    cls={c}
                    session={tSession}
                    className="w-full"
                  />
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
