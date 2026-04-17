import { useClasses } from "@/features/classes/hooks/useClasses";
import { useTodayAttendance } from "@/features/attendance/hooks/useTodayAttendance";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import AttendanceWizard from "@/features/attendance/components/AttendanceWizard";
import { isWithinSchedule } from "@/lib/utils";

export default function AttendanceSelectionPage() {
  const navigate = useNavigate();
  const { classes, loading: classesLoading } = useClasses();
  const { todaySessions, loading: sessionsLoading } = useTodayAttendance();

  const loading = classesLoading || sessionsLoading;

  const activeClasses = classes.filter((c) => c.status === "active");


  if (loading) {
    return (
      <div>

        <div>
          <Skeleton />
          <Skeleton />
        </div>

        <div>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} />
          ))}
        </div>
      </div>

    );
  }

  return (
    <div>

      <AttendanceWizard
        classes={activeClasses}
        todaySessions={todaySessions}

        isDirect={false}
        onSelectClass={(c, mode) => {
          const { onTime } = isWithinSchedule(c.schedule);
          const session = todaySessions[c._id];

          // If session is hard locked (finalized) or submitted but off-schedule, show static summary
          if (
            session?.status === "finalized" ||
            (session?.status === "submitted" && !onTime)
          ) {
            navigate(`/teacher/attendance/${session._id}/summary`);
          } else {
            // Otherwise, enter/resume the wizard (including updating submitted on-time sessions)
            const flag = mode === "manual" ? "?manual=true" : "?autoStart=true";
            navigate(`/teacher/classes/${c._id}/attendance${flag}`);
          }
        }}
      />
    </div>
  );
}
