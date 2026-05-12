import { useState, useEffect } from "react";
import { getNowIST } from "@/lib/date-utils";

/**
 * useNow - Custom hook that returns the current time in IST,
 * updated every minute to trigger re-renders for schedule-based UI.
 */
export const useNow = (intervalMs = 60000) => {
  const [now, setNow] = useState(getNowIST());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(getNowIST());
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
};
