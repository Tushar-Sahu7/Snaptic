import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "./attendance.api";

// QUERIES
export const useTodaySessions = () => {
  return useQuery({
    queryKey: ["attendance", "today"],
    queryFn: api.fetchTodaySessions,
  });
};

export const useTodaySession = (classId) => {
  return useQuery({
    queryKey: ["attendance", "today", classId],
    queryFn: () => api.fetchTodaySession(classId),
    enabled: !!classId,
  });
};

export const useSessionRecords = (sessionId) => {
  return useQuery({
    queryKey: ["attendance", "records", sessionId],
    queryFn: () => api.fetchSessionRecords(sessionId),
    enabled: !!sessionId,
  });
};

// MUTATIONS
export const useStartAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (classId) => api.startAttendanceSession(classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["classes", "sessions"] });
    },
  });
};

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.markAttendance(payload),
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: ["attendance", "records", payload.sessionId] });
    },
  });
};

export const useSubmitAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId) => api.submitAttendanceSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["classes", "sessions"] });
    },
  });
};

export const useResetAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId) => api.resetAttendanceSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["classes", "sessions"] });
    },
  });
};
