import { CalendarDays } from "lucide-react";
import ClassCard from "@/components/shared/ClassCard";
import { AttendanceActionGroup } from "@/features/attendance/components/AttendanceActionGroup";
import { PrimaryAttendanceAction } from "@/features/attendance/components/PrimaryAttendanceAction";
import { Badge } from "@/components/ui/badge";
import { isClassInSession } from "@/lib/date-utils";
import { cn } from "@/lib/utils";


export const ClassSelectionStep = ({
  session,
  classes,
  todaySessions,
  studentsCount,
  onSelectClass,
  onContinue,
}) => {

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
      <div className="space-y-1">
        <h3 className="text-3xl font-black tracking-tighter text-foreground uppercase">
          Select Class
        </h3>
        <p className="text-sm text-muted-foreground font-medium tracking-tight">
          Choose a class to begin taking attendance via face scan or manual entry.
        </p>
      </div>

      {sortedClasses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 bg-muted/30 rounded-3xl border border-dashed border-border text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
            <CalendarDays className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <div className="max-w-sm space-y-2">
            <h3 className="text-xl font-bold text-foreground">
              No active classes
            </h3>
            <p className="text-sm text-muted-foreground">
              It looks like you don't have any classes scheduled for this time.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedClasses.map((c) => {
            const { onTime } = isClassInSession(c);
            const tSession = todaySessions[c._id];
            const hasActiveSession = tSession?.status === "inprogress";
            const isSubmitted = tSession?.status === "submitted";
            const canStart = onTime || hasActiveSession || isSubmitted;

            return (
              <ClassCard
                key={c._id}
                cls={{
                   ...c,
                  studentCount: c.studentCount,
                }}
                onClick={() => canStart && onSelectClass?.(c, onTime ? "auto" : "manual")}
                className={cn(
                  "h-full transition-all duration-500",
                  !canStart && "opacity-60 grayscale-[0.5] pointer-events-none"
                )}
                badge={
                  hasActiveSession ? (
                    <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-white border-none px-3 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider">
                      In Progress
                    </Badge>
                  ) : isSubmitted ? (
                    <Badge variant="secondary" className="px-3 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider">
                      Submitted
                    </Badge>
                  ) : onTime ? (
                    <Badge variant="default" className="bg-foreground text-background border-none px-3 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider">
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
