import { useQuery } from "@tanstack/react-query";
import * as recordsApi from "../api/records.api";

export const recordKeys = {
  all: ["records"],
  class: (classId) => [...recordKeys.all, "class", classId],
  classSessions: (classId) => [...recordKeys.all, "class", classId, "sessions"],
  studentClass: (classId) => [...recordKeys.all, "student", "class", classId],
  studentHistory: () => [...recordKeys.all, "student", "history"],
  session: (sessionId) => [...recordKeys.all, "session", sessionId],
};

/**
 * Hook to fetch class-wide record summary (Teacher)
 */
export const useClassRecord = (classId) => {
  return useQuery({
    queryKey: recordKeys.class(classId),
    queryFn: async () => {
      const { data } = await recordsApi.fetchClassRecord(classId);
      return data;
    },
    enabled: !!classId,
  });
};

/**
 * Hook to fetch finalized sessions for a class (Teacher)
 */
export const useClassSessions = (classId) => {
  return useQuery({
    queryKey: recordKeys.classSessions(classId),
    queryFn: async () => {
      const { data } = await recordsApi.fetchClassSessions(classId);
      return data.sessions || [];
    },
    enabled: !!classId,
  });
};

/**
 * Hook to fetch personal attendance records for a specific class (Student)
 */
export const useStudentClassRecord = (classId) => {
  return useQuery({
    queryKey: recordKeys.studentClass(classId),
    queryFn: async () => {
      const { data } = await recordsApi.fetchStudentClassRecord(classId);
      return data;
    },
    enabled: !!classId,
  });
};

/**
 * Hook to fetch full attendance history for a student
 */
export const useStudentHistory = () => {
  return useQuery({
    queryKey: recordKeys.studentHistory(),
    queryFn: async () => {
      const { data } = await recordsApi.fetchStudentHistory();
      return data.history || [];
    },
  });
};

/**
 * Hook to fetch detailed record for a specific session (Teacher/Student)
 */
export const useSessionRecord = (sessionId) => {
  return useQuery({
    queryKey: recordKeys.session(sessionId),
    queryFn: async () => {
      const { data } = await recordsApi.fetchSessionRecord(sessionId);
      return data;
    },
    enabled: !!sessionId,
  });
};
