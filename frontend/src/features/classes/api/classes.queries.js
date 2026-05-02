import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "./classes.api";

// --- Query Keys ---
export const classKeys = {
  all: ["classes"],
  list: () => [...classKeys.all, "list"],
  detail: (id) => [...classKeys.all, "detail", id],
  students: (query) => ["students", query],
  teacherSessions: (params) => ["teacher-sessions", params],
};

// --- Queries ---

export const useClasses = () => {
  return useQuery({
    queryKey: classKeys.list(),
    queryFn: api.fetchClasses,
  });
};

export const useClass = (id) => {
  return useQuery({
    queryKey: classKeys.detail(id),
    queryFn: () => api.fetchClassById(id),
    enabled: !!id,
  });
};

export const useStudentSearch = (query) => {
  return useQuery({
    queryKey: classKeys.students(query),
    queryFn: ({ signal }) => api.searchStudents(query, signal),
    enabled: query.length >= 2,
    staleTime: 1000 * 60, // 1 min
  });
};

export const useTeacherSessions = (params) => {
  return useQuery({
    queryKey: classKeys.teacherSessions(params),
    queryFn: () => api.fetchTeacherSessions(params),
  });
};

// --- Mutations ---

export const useCreateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.list() });
    },
  });
};

export const useUpdateClass = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.updateClass(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.list() });
      queryClient.invalidateQueries({ queryKey: classKeys.detail(id) });
    },
  });
};

export const useDeleteClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteClass,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: classKeys.list() });
      queryClient.removeQueries({ queryKey: classKeys.detail(id) });
    },
  });
};

export const useBulkUpdateClassStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, status, endDate }) => api.bulkUpdateClassStatus(ids, status, endDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.list() });
    },
  });
};

export const useBulkDeleteClasses = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids) => api.bulkDeleteClasses(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.list() });
    },
  });
};

export const useAddStudent = (classId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId) => api.addStudent(classId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.detail(classId) });
    },
  });
};

export const useRemoveStudent = (classId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId) => api.removeStudent(classId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.detail(classId) });
    },
  });
};
