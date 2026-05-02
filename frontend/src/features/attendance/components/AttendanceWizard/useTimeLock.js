import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";

/**
 * Hook to manage session time locks and countdowns using standard Date API.
 * 
 * @param {Object} session - The current attendance session
 * @param {Function} onFinalize - Callback when time expires
 */
export const useTimeLock = (session, onFinalize) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [timeExpired, setTimeExpired] = useState(false);

  // Use the session's endTime for display
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
    return session?.status === "finalized" || session?.status === "missed" || timeExpired;
  }, [session?.status, timeExpired]);

  const checkLock = useCallback(() => {
    if (isFinalized || !session?.endTime) return;

    try {
      const now = new Date();
      const end = new Date(session.endTime);
      
      const diffInMs = end.getTime() - now.getTime();
      const totalMinutes = Math.floor(diffInMs / 60000);

      if (totalMinutes <= 0) {
        setTimeExpired(true);
        if (onFinalize) onFinalize();
        toast.error("Class time has ended. Session finalized.", {
          duration: 5000,
        });
      } else {
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        setTimeLeft(h > 0 ? `${h}h ${m}m left` : `${m}m left`);
      }
    } catch (e) {
      console.error("[useTimeLock] checkLock error:", e);
    }
  }, [session, isFinalized, onFinalize]);

  useEffect(() => {
    if (isFinalized || !session) return;

    // Run checkLock every 30 seconds
    const interval = setInterval(checkLock, 30000);
    checkLock();
    return () => clearInterval(interval);
  }, [session, isFinalized, checkLock]);

  return {
    timeLeft,
    endTimeFormatted,
    isFinalized
  };
};
