import { CalendarDays } from "lucide-react";
import ClassCard from "@/components/shared/ClassCard";
import { AttendanceActionGroup } from "@/features/attendance/components/AttendanceActionGroup";
import { PrimaryAttendanceAction } from "@/features/attendance/components/PrimaryAttendanceAction";
import { Badge } from "@/components/ui/badge";
import { isWithinSchedule } from "@/lib/utils";


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
                  if (session.status === "inProgress") onContinue(2);
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
    <div>
      <div>
        <h2>
          Choose a Class
        </h2>
        <p>
          Select an active class to begin the recognition process.
        </p>
      </div>


      {sortedClasses.length === 0 ? (
        <div>
          <div>
            <CalendarDays />
          </div>
          <div>
            <h3>
              No Active Sessions
            </h3>
            <p>
              Looks like you're all caught up! Check your schedule or create a
              new session.
            </p>
          </div>
        </div>
      ) : (

        <div>

          {sortedClasses.map((c) => {
            const { onTime } = isWithinSchedule(c.schedule);
            const tSession = todaySessions[c._id];
            const sCount = c.studentIds?.length || 0;
            const hasActiveSession = tSession?.status === "inProgress";
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

                badge={
                  hasActiveSession ? (
                    <Badge>
                      In Progress
                    </Badge>
                  ) : isSubmitted ? (
                    <Badge>
                      Submitted
                    </Badge>
                  ) : onTime ? (
                    <Badge>
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
