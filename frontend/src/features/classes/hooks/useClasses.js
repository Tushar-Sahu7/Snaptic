import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as classesApi from "../api/classes.api";
import { toast } from "sonner";

export const useClasses = () => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data } = await classesApi.fetchClasses();
      return data.classes || [];
    },
  });

  const archiveMutation = useMutation({
    mutationFn: ({ classId, endDate }) => classesApi.archiveClass(classId, endDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Class status updated");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update class status");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: classesApi.deleteClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Class deleted");
    },
  });

  const bulkUnarchiveMutation = useMutation({
    mutationFn: ({ ids, endDate }) => classesApi.bulkUnarchive(ids, endDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Classes unarchived");
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids) => classesApi.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Classes deleted");
    },
  });

  return {
    classes: query.data || [],
    loading: query.isLoading,
    refresh: () => queryClient.invalidateQueries({ queryKey: ["classes"] }),
    toggleArchive: (cls, endDate) => archiveMutation.mutateAsync({ classId: cls._id, endDate }),
    bulkUnarchiveAll: (ids, endDate) => bulkUnarchiveMutation.mutateAsync({ ids, endDate }),
    bulkDeleteAll: (ids) => bulkDeleteMutation.mutateAsync(ids),
    deleteClass: (id) => deleteMutation.mutateAsync(id)
  };
};

export const useClassDetail = (classId) => {
  return useQuery({
    queryKey: ["class", classId],
    queryFn: async () => {
      const { data } = await classesApi.fetchClassById(classId);
      return data.class;
    },
    enabled: !!classId,
  });
};

export const useCreateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: classesApi.createClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
};

export const useUpdateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, payload }) => classesApi.updateClass(classId, payload),
    onSuccess: (_, { classId }) => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["class", classId] });
    },
  });
};

export const useAddStudent = (classId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId) => classesApi.addStudent(classId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class", classId] });
      toast.success("Student added successfully");
    },
  });
};

export const useRemoveStudent = (classId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentIds) => {
      if (Array.isArray(studentIds)) {
        return classesApi.removeStudents(classId, studentIds);
      }
      return classesApi.removeStudent(classId, studentIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class", classId] });
      toast.success("Student(s) removed");
    },
  });
};

export const useSearchStudents = (query) => {
  return useQuery({
    queryKey: ["searchStudents", query],
    queryFn: async ({ signal }) => {
      const { data } = await classesApi.searchStudents(query, signal);
      return data.students || [];
    },
    enabled: query.trim().length > 0,
  });
};
