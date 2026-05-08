import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as attendanceApi from "../api/attendance.api";

/**
 * Hook to fetch session records for a specific session.
 */
export const useAttendanceSessionDetail = (sessionId) => {
  return useQuery({
    queryKey: ["attendance-session", sessionId],
    queryFn: async () => {
      const { data } = await attendanceApi.fetchSessionRecords(sessionId);
      return data;
    },
    enabled: !!sessionId,
  });
};

/**
 * Hook to fetch today's sessions for the teacher.
 */
export const useTodayAttendance = () => {
  const query = useQuery({
    queryKey: ["attendance-today"],
    queryFn: async () => {
      const { data } = await attendanceApi.fetchTodaySessions();
      // Return both raw sessions and a map for convenience
      const sessionsMap = {};
      data.sessions.forEach((s) => {
        if (!s.classId) return; // Skip sessions with missing/deleted class data
        const classId = typeof s.classId === 'object' ? s.classId._id : s.classId;
        sessionsMap[classId] = s;
      });
      return { 
        sessions: data.sessions, 
        todaySessions: sessionsMap // Alias for legacy support
      };
    },
  });

  return {
    ...query,
    todaySessions: query.data?.todaySessions || {},
    loading: query.isLoading,
    refresh: query.refetch,
  };
};

/**
 * Hook to start an attendance session for a class.
 */
export const useStartAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (classId) => {
      const { data } = await attendanceApi.startAttendanceSession(classId);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-today"] });
    },
  });
};

/**
 * Hook to mark attendance for a student in a session.
 */
export const useMarkAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: attendanceApi.markAttendance,
    onMutate: async (newRecord) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["attendance-session", newRecord.sessionId] });
      const previous = queryClient.getQueryData(["attendance-session", newRecord.sessionId]);
      
      queryClient.setQueryData(["attendance-session", newRecord.sessionId], (old) => {
        if (!old) return old;
        return {
          ...old,
          records: (old.records || []).map(r => {
            if (!r.studentId) return r;
            const rId = typeof r.studentId === "object" ? r.studentId._id : r.studentId;
            if (rId?.toString() === newRecord.studentId?.toString()) {
              return { ...r, status: newRecord.status, method: newRecord.method };
            }
            return r;
          })
        };
      });
      
      return { previous };
    },
    onError: (err, newRecord, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["attendance-session", newRecord.sessionId], context.previous);
      }
    },
    onSettled: (data, err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["attendance-session", variables.sessionId] });
    },
  });
};

/**
 * Hook to submit an attendance session (finalize records).
 */
export const useSubmitSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: attendanceApi.submitAttendanceSession,
    onSuccess: (response, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ["attendance-session", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["attendance-today"] });
    },
  });
};

/**
 * Hook to reset an attendance session.
 */
export const useResetSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: attendanceApi.resetAttendanceSession,
    onSuccess: (response, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ["attendance-session", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["attendance-today"] });
    },
  });
};
