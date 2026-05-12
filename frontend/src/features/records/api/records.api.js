import api from "@/lib/axios";

/**
 * Fetch a summary record for a specific class (Teacher only)
 */
export const fetchClassRecord = (classId) => api.get(`/api/records/class/${classId}`);

/**
 * Fetch all finalized sessions for a class (Teacher only)
 */
export const fetchClassSessions = (classId) => api.get(`/api/records/class/${classId}/sessions`);

/**
 * Fetch personal attendance records for a specific class (Student only)
 */
export const fetchStudentClassRecord = (classId, studentId) => {
  const url = `/api/records/class/${classId}/student${studentId ? `?studentId=${studentId}` : ""}`;
  return api.get(url);
};

/**
 * Fetch attendance history for the logged-in student
 */
export const fetchStudentHistory = () => api.get("/api/records/student/history");

/**
 * Fetch record details for a specific session (Teacher/Student)
 */
export const fetchSessionRecord = (sessionId) => api.get(`/api/records/session/${sessionId}`);
