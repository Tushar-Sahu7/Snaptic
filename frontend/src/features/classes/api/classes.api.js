import api from "@/lib/axios";

export const fetchClasses = () => api.get("/api/classes");

export const fetchClassById = (id) => api.get(`/api/classes/${id}`);

export const createClass = (data) => api.post("/api/classes", data);

export const updateClass = (id, data) => api.put(`/api/classes/${id}`, data);

export const bulkUpdateClassStatus = (classIds, status, endDate) =>
  api.put("/api/classes/bulk/status", { classIds, status, endDate });

export const restoreClasses = (classIds) =>
  api.put("/api/classes/bulk/restore", { classIds });

export const deleteClass = (id) => api.delete(`/api/classes/${id}`);

export const bulkDeleteClasses = (classIds) =>
  api.delete("/api/classes/bulk", { data: { classIds } });

export const addStudent = (classId, studentId) =>
  api.post(`/api/classes/${classId}/students`, { studentId });

export const importStudents = (classId, fromClassId) =>
  api.post(`/api/classes/${classId}/enrollments/import`, { fromClassId });

export const removeStudent = (classId, studentId) =>
  api.delete(`/api/classes/${classId}/students/${studentId}`);

export const removeStudents = (classId, studentIds) =>
  api.delete(`/api/classes/${classId}/students/bulk`, { data: { studentIds } });

export const searchStudents = (q, signal) =>
  api.get("/api/students/search", { params: { q }, signal });

// Labels
export const fetchLabels = () => api.get("/api/classes/labels/all");

export const createLabel = (data) => api.post("/api/classes/labels/all", data);

export const deleteLabel = (id, replacementLabelId) =>
  api.delete(`/api/classes/labels/${id}`, { data: { replacementLabelId } });
