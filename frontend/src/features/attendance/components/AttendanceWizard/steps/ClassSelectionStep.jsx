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

    return (
      <div className="h-full flex flex-col items-center">
        <div className="w-full max-w-xl sm:bg-card sm:border sm:rounded-3xl p-0 sm:p-8 sm:shadow-sm hover:shadow-md transition-shadow space-y-6 mt-12 md:mt-0 px-6 md:px-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <ClassCard
            cls={
              typeof session.classId === "object"
                ? {
                    ...session.classId,
                    studentCount: studentsCount,
                  }
                : {
                    name: "Loading Class Details...",
                    studentCount: studentsCount,
                  }
            }
            className="cursor-default hover:border-border hover:shadow-sm"
          />

          <div className="flex flex-col gap-3 w-full">
            {isSubmitted ? (
              <Button
                onClick={() => onContinue(3)}
                className="w-full h-12 sm:h-14 rounded-2xl font-black text-sm sm:text-lg gap-2 shadow-xl shadow-primary/20"
              >
                Update Attendance Records
                <ChevronRight className="size-4 sm:size-5" />
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => onContinue(2)}
                  className="w-full h-12 sm:h-14 rounded-2xl font-black text-sm sm:text-lg gap-2 shadow-xl shadow-primary/20"
                >
                  Start Automatic Recognition
                  <ChevronRight className="size-4 sm:size-5" />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => onContinue(3)}
                  className="w-full h-11 sm:h-12 rounded-xl font-bold uppercase text-xs tracking-widest gap-2"
                >
                  Mark Attendance Manually
                  <ArrowLeft className="size-4 rotate-180" />
                </Button>
              </>
            )}
          </div>
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
                  sCount === 0 ? (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-500/5 p-3 rounded-2xl border border-amber-500/10 shadow-xs">
                      <AlertCircle className="size-4 shrink-0 text-amber-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Assign students before starting
                      </span>
                    </div>
                  ) : (
                    <div className="w-full">
                      {isSubmitted && onTime ? (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectClass?.(c, "manual");
                          }}
                          className="w-full rounded-xl font-bold h-12 uppercase text-[11px] tracking-widest gap-2 shadow-sm"
                        >
                          Update Attendance
                          <ChevronRight className="size-4" />
                        </Button>
                      ) : hasActiveSession ? (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectClass?.(c);
                          }}
                          className="w-full rounded-xl font-bold h-12 uppercase text-[11px] tracking-widest gap-2 shadow-sm"
                        >
                          Resume Session
                          <ChevronRight className="size-4" />
                        </Button>
                      ) : onTime ? (
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="default"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectClass?.(c, "auto");
                            }}
                            className="w-full rounded-xl font-black h-10 sm:h-12 uppercase text-[10px] sm:text-[11px] tracking-widest gap-2 shadow-lg"
                          >
                            Start Recognition
                            <Scan className="size-3.5 sm:size-4" />
                          </Button>
                          <Button
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectClass?.(c, "manual");
                            }}
                            className="w-full rounded-xl font-bold h-9 sm:h-10 uppercase text-[9px] sm:text-[10px] tracking-widest gap-2 border-primary/20"
                          >
                            Manual Attendance
                            <Users className="size-3 sm:size-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-muted/30 border border-dashed gap-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                            Off Schedule
                          </span>
                          {scheduleMsg && (
                            <span className="text-[9px] font-medium text-muted-foreground/70 uppercase tracking-tighter tabular-nums">
                              {scheduleMsg}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
