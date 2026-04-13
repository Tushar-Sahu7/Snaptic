import { useState, useEffect } from "react";
import { fetchClasses } from "@/features/classes/api/classes.api";
import { fetchTodaySessions } from "@/features/attendance/api/attendance.api";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
      <div className="flex flex-col h-[calc(100svh-4rem)] items-center justify-center p-6 text-center">
        <Loader2 className="size-10 mb-4 animate-spin text-primary" />
        <h2 className="text-lg font-bold">Loading Schedule...</h2>
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
