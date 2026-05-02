import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { 
  useMarkAttendance,
  useSubmitSession,
  useReopenSession,
  useResetSession
} from "../../hooks/useAttendance";
import { endAttendanceSession, terminateAttendanceSession } from "../../api/attendance.api";

/**
 * Hook to manage attendance wizard state and logic.
 * Aligns with the 5-status lifecycle: scheduled, inprogress, submitted, finalized, missed.
 */
export const useAttendanceSession = ({
  initialSession,
  students = [],
  records = [],
  onSessionReopened
}) => {
  const navigate = useNavigate();
  const [session, setSession] = useState(initialSession);
  const [absencesProcessed, setAbsencesProcessed] = useState(initialSession?.status !== "inprogress");
  
  const markMutation = useMarkAttendance();
  const submitMutation = useSubmitSession();
  const reopenMutation = useReopenSession();
  const resetMutation = useResetSession();

  // 1. Attendance State (Single Source of Truth)
  // Maps studentId -> { status, method }
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

  // Keep attendanceState in sync with initial records if they change
  useEffect(() => {
    if (records && Array.isArray(records)) {
      const state = {};
      records.forEach((r) => {
        const sId = typeof r.studentId === "object" ? r.studentId._id?.toString() : r.studentId?.toString();
        if (sId) {
          state[sId] = { status: r.status || "absent", method: r.method || "manual" };
        }
      });
      setAttendanceState(state);
    }
  }, [records]);

  const isSubmitted = useMemo(() => 
    session?.status === "submitted" || session?.status === "finalized"
  , [session?.status]);

  const handleMarkManual = useCallback(async (studentId, status, method = "manual") => {
    if (session?.status === "finalized" || session?.status === "missed") return;
    
    const sId = studentId.toString();
    // Update local state immediately for snappy UI
    setAttendanceState(prev => ({ ...prev, [sId]: { status, method } }));

    try {
      await markMutation.mutateAsync({
        sessionId: session._id,
        studentId,
        status,
        method,
      });
    } catch (err) {
      toast.error("Failed to update attendance");
      // Revert local state on error
      const originalRecord = records.find(r => (r.studentId?._id || r.studentId)?.toString() === sId);
      setAttendanceState(prev => ({ 
        ...prev, 
        [sId]: originalRecord ? { status: originalRecord.status, method: originalRecord.method } : { status: "absent", method: "manual" }
      }));
    }
  }, [session, markMutation, records]);

  const handleFinishScan = useCallback(async () => {
    if (!session || session.status !== "inprogress") return;
    
    try {
      await endAttendanceSession(session._id);
      
      // Ensure all students have a record in the local state
      setAttendanceState(prev => {
        const newState = { ...prev };
        students.forEach((s) => {
          const id = s._id.toString();
          if (!newState[id]) {
            newState[id] = { status: "absent", method: "manual" };
          }
        });
        return newState;
      });
      
      setAbsencesProcessed(true);
      // We don't change session status to 'ended' because it's not a valid backend status.
      // We stay in 'inprogress' until 'submitted'.
    } catch (err) {
      if (err.response?.status === 403) {
        setSession(prev => ({ ...prev, status: "finalized" }));
        toast.error("Class time has ended. Session finalized.");
      } else {
        toast.error("Failed to end scanning");
      }
    }
  }, [session, students]);

  const handleSubmit = useCallback(async () => {
    if (!session) return;
    try {
      const { data } = await submitMutation.mutateAsync(session._id);
      setSession(data.session);
      toast.success("Attendance submitted!");
    } catch (err) {
      toast.error("Failed to submit session");
    }
  }, [session, submitMutation]);

  const handleReopen = useCallback(async () => {
    if (!session) return;
    try {
      const { data } = await reopenMutation.mutateAsync(session._id);
      setSession(data.session);
      onSessionReopened?.(data.session);
      return data.session;
    } catch (err) {
      toast.error("Failed to reopen session");
    }
  }, [session, reopenMutation, onSessionReopened]);

  const handleTerminate = useCallback(async () => {
    if (!session) return;
    try {
      await terminateAttendanceSession(session._id);
      toast.success("Session reset");
      navigate(`/teacher/dashboard`, { replace: true });
    } catch (err) {
      toast.error("Failed to reset session");
    }
  }, [session, navigate]);

  return {
    session,
    setSession,
    attendanceState,
    loading: markMutation.isPending || submitMutation.isPending || reopenMutation.isPending || resetMutation.isPending,
    isSubmitted,
    absencesProcessed,
    handleMarkManual,
    handleFinishScan,
    handleSubmit,
    handleReopen,
    handleTerminate
  };
};
