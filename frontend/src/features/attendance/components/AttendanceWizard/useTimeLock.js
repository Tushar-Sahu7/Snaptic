import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { format12Hour } from "@/lib/utils";

export const useTimeLock = (session, onFinalize) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [timeExpired, setTimeExpired] = useState(false);

  const endTimeFormatted = useMemo(() => {
    return format12Hour(session?.classId?.schedule?.endTime);
  }, [session?.classId?.schedule?.endTime]);

  const isFinalized = useMemo(() => {
    return session?.status === "finalized" || timeExpired;
  }, [session?.status, timeExpired]);

  const checkLock = useCallback(() => {
    if (isFinalized || !session) return;

    const now = new Date();
    const endTime = session.classId?.schedule?.endTime;
    if (!endTime) return;

    const [eh, em] = endTime.split(":").map(Number);
    const endTotal = eh * 60 + em;
    const currentTotal = now.getHours() * 60 + now.getMinutes();
    const diff = endTotal - currentTotal;

    if (diff <= 0) {
      setTimeExpired(true);
      if (onFinalize) onFinalize();
      toast.error("Class time has ended. Session finalized.", {
        duration: 5000,
      });
    } else {
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      setTimeLeft(h > 0 ? `${h}h ${m}m left` : `${m}m left`);
    }
  }, [session, isFinalized, onFinalize]);

  useEffect(() => {
    if (isFinalized || !session) return;

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
