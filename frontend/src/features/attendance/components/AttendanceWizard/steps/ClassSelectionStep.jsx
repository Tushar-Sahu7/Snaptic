import {
  CalendarDays,
  ChevronRight,
  Scan,
  Users,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ClassCard from "@/components/shared/ClassCard";
import { AttendanceButton } from "@/components/shared/AttendanceButton";
import { Badge } from "@/components/ui/badge";
import { isWithinSchedule, cn } from "@/lib/utils";

export const ClassSelectionStep = ({
  session,
  classes,
  todaySessions,
  studentsCount,
  onSelectClass,
  onContinue,
}) => {
  if (session) {
    const isSubmitted = session.status === "submitted";
    const baseClass =
      typeof session.classId === "object"
        ? { ...session.classId, studentCount: studentsCount }
        : { name: "Loading Class Details...", studentCount: studentsCount };

    return (
      <div className="h-full flex flex-col items-center">
        <div className="w-full max-w-xl sm:bg-card sm:border sm:rounded-3xl p-0 sm:p-8 sm:shadow-sm hover:shadow-md transition-shadow space-y-6 mt-12 md:mt-0 px-6 md:px-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <ClassCard
            cls={baseClass}
            className="cursor-default hover:border-border hover:shadow-sm"
            footer={
              <AttendanceButton
                cls={baseClass}
                session={session}
                onSelect={(_, mode) => {
                  // In the wizard, auto mode goes to Scan (2), manual to Mark (3)
                  if (mode === "auto") onContinue(2);
                  else if (mode === "manual") onContinue(3);
                  else if (mode === "history") onContinue(4); // Review/Summary
                }}
              />
            }
          />
        </div>
      </div>
    );
  }

  const sortedClasses = [...classes].sort((a, b) => {
    const { onTime: onTimeA } = isWithinSchedule(a.schedule);
    const { onTime: onTimeB } = isWithinSchedule(b.schedule);
    const tSessionA = todaySessions[a._id];
    const tSessionB = todaySessions[b._id];

    // Priority points
    const getPriority = (c, onTime, session) => {
      if (session?.status === "inProgress") return 3;
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
    <div className="w-full max-w-4xl mx-auto space-y-8 mt-4">
      <div className="flex flex-col items-center text-center space-y-2 px-4">
        <h2 className="text-lg sm:text-xl font-black tracking-tight text-foreground uppercase">
          Choose a Class
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium">
          Select an active class to begin the recognition process.
        </p>
      </div>

      {sortedClasses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-muted/20 border-2 border-border border-dashed rounded-[2.5rem] animate-in fade-in zoom-in-95 duration-700">
          <div className="size-20 rounded-3xl bg-background border shadow-xs flex items-center justify-center mb-2">
            <CalendarDays className="size-10 text-primary/20" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-foreground tracking-tight">
              No Active Sessions
            </h3>
            <p className="text-sm text-muted-foreground font-medium max-w-[280px]">
              Looks like you're all caught up! Check your schedule or create a
              new session.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 px-6 sm:px-0">
          {sortedClasses.map((c) => {
            const { onTime, message: scheduleMsg } = isWithinSchedule(
              c.schedule,
            );
            const tSession = todaySessions[c._id];
            const sCount = c.studentIds?.length || 0;
            const hasActiveSession = tSession?.status === "inProgress";
            const isSubmitted = tSession?.status === "submitted";
            const canStart = onTime || hasActiveSession || isSubmitted;

            // Determine primary interaction mode for card click
            let primaryMode = undefined;
            if (isSubmitted && onTime) primaryMode = "manual";
            else if (hasActiveSession) primaryMode = undefined;
            else if (onTime) primaryMode = "auto";

            return (
              <ClassCard
                key={c._id}
                cls={{
                  ...c,
                  studentCount: sCount,
                }}
                onClick={() => canStart && onSelectClass?.(c, primaryMode)}
                className={cn(
                  !canStart &&
                    "opacity-60 grayscale border-dashed cursor-not-allowed",
                )}
                badge={
                  hasActiveSession ? (
                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-200/50 hover:bg-amber-500/20 animate-pulse text-[9px] font-black uppercase tracking-widest px-2 shadow-none">
                      In Progress
                    </Badge>
                  ) : isSubmitted ? (
                    <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 text-[9px] font-black uppercase tracking-widest px-2 shadow-none">
                      Submitted
                    </Badge>
                  ) : onTime ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200/50 hover:bg-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-2 shadow-none">
                      Live Now
                    </Badge>
                  ) : null
                }
                footer={
                  <AttendanceButton
                    cls={c}
                    session={tSession}
                    onSelect={onSelectClass}
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
