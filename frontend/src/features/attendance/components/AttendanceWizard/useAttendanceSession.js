import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { 
  markAttendance, 
  endAttendanceSession,
  submitAttendanceSession,
  reopenAttendanceSession,
  terminateAttendanceSession
} from "@/features/attendance/api/attendance.api";

export const useAttendanceSession = ({
  initialSession,
  students,
  records,
  onSessionReopened
}) => {
  const navigate = useNavigate();
  const [session, setSession] = useState(initialSession);
  const [loading, setLoading] = useState(false);
  const [absencesProcessed, setAbsencesProcessed] = useState(initialSession?.status !== "inProgress");
  
  // 1. Attendance State (Single Source of Truth)
  const [attendanceState, setAttendanceState] = useState(() => {
    const state = {};
    if (records && Array.isArray(records)) {
      records.forEach((r) => {
        const sId = typeof r.studentId === "object" ? r.studentId._id?.toString() : r.studentId?.toString();
        if (sId) {
          state[sId] = { status: r.status || "absent", method: r.method || "manual" };
        }
      });
    }
    return state;
  });

  // Track if session is submitted locally for faster UX
  const [isSubmitted, setIsSubmitted] = useState(initialSession?.status === "submitted" || initialSession?.status === "finalized");

  // Ref to always have latest state in callbacks
  const attendanceStateRef = useRef(attendanceState);
  useEffect(() => { attendanceStateRef.current = attendanceState; }, [attendanceState]);

  const handleMarkManual = useCallback(async (studentId, status, method = "manual") => {
    if (session?.status === "finalized") return;
    const sId = studentId.toString();

    // Optimistic Update
    const prev = attendanceState[sId];
    setAttendanceState((s) => ({ ...s, [sId]: { status, method } }));

    try {
      await markAttendance({
        sessionId: session._id,
        studentId,
        classId: session.classId._id,
        status,
        method,
      });
    } catch (err) {
      setAttendanceState((s) => ({ ...s, [sId]: prev }));
      if (err.response?.status === 403) {
        setSession(prev => ({ ...prev, status: "finalized" }));
      }
      throw err;
    }
  }, [session]);

  const handleFinishScan = useCallback(async () => {
    if (!session || session.status !== "inProgress") return;
    setLoading(true);
    try {
      await endAttendanceSession(session._id);

      // Fill in absences for all unrecorded students
      const newState = { ...attendanceStateRef.current };
      students.forEach((s) => {
        const id = s._id.toString();
        if (!newState[id]) {
          newState[id] = { status: "absent", method: "manual" };
        }
      });
      setAttendanceState(newState);
      setAbsencesProcessed(true);
      setSession(prev => ({ ...prev, status: "ended" })); // Transition to ended locally
    } catch (err) {
      if (err.response?.status === 403) {
        setSession(prev => ({ ...prev, status: "finalized" }));
        toast.error("Class time has ended. Session finalized.");
      } else {
        toast.error("Failed to process absences");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [session, students]);

  const handleSubmit = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      await submitAttendanceSession(session._id);
      setIsSubmitted(true);
      setSession(prev => ({ ...prev, status: "submitted" }));
      toast.success("Attendance submitted!");
    } catch (err) {
      toast.error("Failed to submit session");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [session]);

  const handleReopen = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const { data } = await reopenAttendanceSession(session._id);
      setSession(data.session);
      setIsSubmitted(false);
      onSessionReopened?.(data.session);
      return data.session;
    } catch (err) {
      toast.error("Failed to reopen session");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [session, onSessionReopened]);

  const handleTerminate = useCallback(async () => {
    if (!session) return;
    try {
      await terminateAttendanceSession(session._id);
      toast.success("Session terminated");
      navigate(`/teacher/dashboard`, { replace: true });
    } catch (err) {
      toast.error("Failed to terminate session");
      throw err;
    }
  }, [session, navigate]);

  return {
    session,
    setSession,
    attendanceState,
    setAttendanceState,
    loading,
    isSubmitted,
    setIsSubmitted,
    absencesProcessed,
    setAbsencesProcessed,
    handleMarkManual,
    handleFinishScan,
    handleSubmit,
    handleReopen,
    handleTerminate
  };
};
