import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { 
  useMarkAttendance,
  useSubmitSession,
  useResetSession
} from "../../hooks/useAttendance";
import { resetAttendanceSession } from "../../api/attendance.api";

const EMPTY_ARRAY = [];

/**
 * Hook to manage attendance wizard state and logic.
 * Aligns with the 5-status lifecycle: scheduled, inprogress, submitted, finalized, missed.
 */
export const useAttendanceSession = ({
  initialSession,
  students = EMPTY_ARRAY,
  records = EMPTY_ARRAY,
  onSessionReopened
}) => {
  const navigate = useNavigate();
  const [session, setSession] = useState(initialSession);
  const [absencesProcessed, setAbsencesProcessed] = useState(initialSession?.status !== "inprogress");
  
  const markMutation = useMarkAttendance();
  const submitMutation = useSubmitSession();
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
    if (records && Array.isArray(records) && records.length > 0) {
      const state = {};
      records.forEach((r) => {
        const sId = typeof r.studentId === "object" ? r.studentId._id?.toString() : r.studentId?.toString();
        if (sId) {
          state[sId] = { status: r.status || "absent", method: r.method || "manual" };
        }
      });
      
      // Simple stability check: only update if lengths differ or if state is empty
      // A deep comparison would be better but this covers most refetch scenarios
      if (Object.keys(state).length > 0) {
        setAttendanceState(state);
      }
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
    
    // Since there's no backend 'end' endpoint, we just update local state
    // to show that we've finished the AI scanning phase and moved to manual review.
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
    toast.success("Scanning complete. Moving to review.");
  }, [session, students]);

  const handleSubmit = useCallback(async () => {
    if (!session) return;
    
    // If already submitted, just toast and consider it a success
    if (session.status === "submitted") {
      toast.success("Attendance updated!");
      return;
    }

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
    
    // Reopening locally allows the UI to move back to Step 3 (MarkStep)
    // The backend 'markAttendance' endpoint works even if status is 'submitted'
    // so we don't need a backend transition.
    const reopenedSession = { ...session, status: "inprogress" };
    setSession(reopenedSession);
    onSessionReopened?.(reopenedSession);
    return reopenedSession;
  }, [session, onSessionReopened]);

  const handleTerminate = useCallback(async () => {
    if (!session) return;
    try {
      await resetMutation.mutateAsync(session._id);
      toast.success("Session reset");
      navigate(`/teacher/dashboard`, { replace: true });
    } catch (err) {
      toast.error("Failed to reset session");
    }
  }, [session, resetMutation, navigate]);

  return {
    session,
    setSession,
    attendanceState,
    loading: markMutation.isPending || submitMutation.isPending || resetMutation.isPending,
    isSubmitted,
    absencesProcessed,
    handleMarkManual,
    handleFinishScan,
    handleSubmit,
    handleReopen,
    handleTerminate
  };
};
