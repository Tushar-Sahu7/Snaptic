import { useState, useEffect, useCallback } from "react";
import { fetchTodaySessions } from "../api/attendance.api";

/**
 * Hook to manage today's attendance sessions.
 * Provides a map of classId -> session for easy lookups.
 */
export const useTodayAttendance = () => {
  const [todaySessions, setTodaySessions] = useState({});
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await fetchTodaySessions();
      const sessionsMap = {};
      
      data.sessions.forEach((s) => {
        if (!s.classId) return; // Skip sessions with missing/deleted class data
        
        // Handle both populated and non-populated classId
        const classId = typeof s.classId === 'object' ? s.classId._id : s.classId;
        sessionsMap[classId] = s;
      });
      
      setTodaySessions(sessionsMap);
    } catch (err) {
      console.error("[useTodayAttendance] Failed to load sessions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
    // Refresh sessions when a session is updated elsewhere
    const handleUpdate = () => loadSessions();
    window.addEventListener("attendance-updated", handleUpdate);
    return () => window.removeEventListener("attendance-updated", handleUpdate);
  }, [loadSessions]);

  return { todaySessions, loading, refresh: loadSessions };
};
