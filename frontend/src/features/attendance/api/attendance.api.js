import api from "@/lib/axios";

export const startAttendanceSession = (classId) =>
  api.post(`/api/attendance/start/${classId}`);
export const markAttendance = (payload) =>
  api.put("/api/attendance/mark", payload);
export const submitAttendanceSession = (sessionId) =>
  api.post(`/api/attendance/submit/${sessionId}`);
export const endAttendanceSession = (sessionId) =>
  api.post(`/api/attendance/end/${sessionId}`);
export const reopenAttendanceSession = (sessionId) => api.post(`/api/attendance/reopen/${sessionId}`);
export const resetAttendanceSession = (sessionId) => api.delete(`/api/attendance/session/${sessionId}/reset`);
export const terminateAttendanceSession = (sessionId) => api.delete(`/api/attendance/session/${sessionId}/terminate`);

export const fetchTodaySessions = () => api.get('/api/attendance/today');
export const fetchTodaySession = (classId) => api.get(`/api/attendance/today/${classId}`);
export const fetchSessionRecords = (sessionId) => api.get(`/api/attendance/session/${sessionId}/records`);
