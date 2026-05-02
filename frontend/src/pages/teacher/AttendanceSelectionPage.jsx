import { useClasses } from "@/features/classes/hooks/useClasses";
import { useTodayAttendance } from "@/features/attendance/hooks/useAttendance";
import { useNavigate } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import AttendanceWizard from "@/features/attendance/components/AttendanceWizard";

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
          // The AttendanceActionGroup buttons handle their own routing now.
          // This callback is only used for the ClassCard's card-level click.
          const flag = mode === "manual" ? "?manual=true" : "?autoStart=true";
          navigate(`/teacher/classes/${c._id}/attendance${flag}`);
        }}
      />
    </div>
  );
}
