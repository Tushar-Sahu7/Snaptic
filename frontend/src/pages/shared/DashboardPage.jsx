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

  const { classes, loading: classesLoading } = useClasses();

  // Only fetch today's sessions for teachers (route is teacher-restricted)
  const {
    data: attendanceQueryData,
    isLoading: sessionsLoading,
  } = useTodayAttendance();

  // Sorted sessions: live → upcoming → done (teacher only)
  const sessions = useMemo(() => {
    if (!isTeacher) return [];
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
  }, [attendanceQueryData, isTeacher]);

  if (isTeacher) {
    return (
      <TeacherDashboard
        user={user}
        classes={classes}
        sessions={sessions}
        loading={classesLoading || sessionsLoading}
        navigate={navigate}
      />
    );
  }

  return (
    <StudentDashboard
      user={user}
      classes={classes}
      loading={classesLoading}
      navigate={navigate}
    />
  );
}
