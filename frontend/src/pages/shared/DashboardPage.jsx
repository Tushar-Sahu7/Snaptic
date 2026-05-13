import { useMemo } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { useClasses } from "@/features/classes/hooks/useClasses";
import { useTodayAttendance } from "@/features/attendance/hooks/useAttendance";
import TeacherDashboard from "./TeacherDashboard";
import StudentDashboard from "./StudentDashboard";

/**
 * DashboardPage — Thin router that fetches shared data
 * and delegates to role-specific dashboard components.
 *
 * Data strategy:
 * - `useClasses()` works for both roles (returns owned classes for teachers,
 *   enrolled classes for students via the backend).
 * - `useTodayAttendance()` calls /api/attendance/today which is teacher-only.
 *   For students we skip it entirely.
 */
export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";

  const { classes, loading: classesLoading, refresh } = useClasses();

  // Fetch today's sessions (now available for both roles)
  const {
    data: attendanceQueryData,
    isLoading: sessionsLoading,
    refetch,
  } = useTodayAttendance();

  // Sorted sessions: live → upcoming → done
  const sessions = useMemo(() => {
    const raw = attendanceQueryData?.sessions || [];
    const order = {
      inprogress: 0,
      scheduled: 1,
      submitted: 2,
      finalized: 3,
      missed: 4,
    };
    return [...raw]
      .filter((s) => !!s.classId)
      .sort((a, b) => {
        const orderDiff = (order[a.status] ?? 5) - (order[b.status] ?? 5);
        if (orderDiff !== 0) return orderDiff;
        // Within the same status group, sort by startTime ascending
        return new Date(a.startTime) - new Date(b.startTime);
      });
  }, [attendanceQueryData]);

  if (isTeacher) {
    return (
      <TeacherDashboard
        user={user}
        classes={classes}
        sessions={sessions}
        loading={classesLoading || sessionsLoading}
        navigate={navigate}
        refresh={() => {
          refresh();
          refetch();
        }}
      />
    );
  }

  return (
    <StudentDashboard
      user={user}
      classes={classes}
      sessions={sessions}
      loading={classesLoading || sessionsLoading}
      navigate={navigate}
    />
  );
}
