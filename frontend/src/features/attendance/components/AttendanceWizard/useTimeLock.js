import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";

/**
 * Hook to manage session time locks and countdowns using standard Date API.
 * 
 * @param {Object} session - The current attendance session
 * @param {Function} onFinalize - Callback when time expires
 */
/**
 * Hook to manage session locking based on status.
 * 
 * @param {Object} session - The current attendance session
 */
export const useTimeLock = (session) => {
  // Use the session's endTime for static display if needed
  const endTimeFormatted = useMemo(() => {
    if (!session?.endTime) return "--:--";
    try {
      const date = new Date(session.endTime);
      if (isNaN(date.getTime())) return "--:--";
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch (e) {
      console.warn("[useTimeLock] Failed to format end time:", e);
      return "--:--";
    }
  }, [session?.endTime]);

  const isFinalized = useMemo(() => {
    return session?.status === "finalized" || session?.status === "missed";
  }, [session?.status]);

  return {
    endTimeFormatted,
    isFinalized
  };
};

