import { useState, useEffect } from "react";
import { fetchClasses } from "@/features/classes/api/classes.api";
import { fetchTodaySessions } from "@/features/attendance/api/attendance.api";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import AttendanceWizard from "@/features/attendance/components/AttendanceWizard";
import { isWithinSchedule } from "@/lib/utils";

export default function AttendanceSelectionPage() {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [todaySessions, setTodaySessions] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [classesRes, sessionsRes] = await Promise.all([
          fetchClasses(),
          fetchTodaySessions(),
        ]);

        setClasses(
          classesRes.data.classes.filter((c) => c.status === "active"),
        );

        const sessionsMap = {};
        sessionsRes.data.sessions.forEach((s) => {
          sessionsMap[s.classId._id] = s;
        });
        setTodaySessions(sessionsMap);
      } catch (err) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 px-4 pt-6 sm:px-6 md:px-0 md:pt-0">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full sm:rounded-2xl md:rounded-3xl overflow-hidden bg-background relative sm:border sm:shadow-sm">
      <AttendanceWizard
        classes={classes}
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
