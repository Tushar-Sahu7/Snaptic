import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

import { Temporal } from "@js-temporal/polyfill";

/**
 * Checks if a class is currently in session or within its attendance window.
 * @param {Object} classDoc 
 * @param {Object} currentSession - The active session for today if any
 */
export function isClassInSession(classDoc, currentSession) {
  if (!classDoc) return { onTime: false, message: "No class selected" };

  const now = Temporal.Now.instant();

  // 1. If there's an active session, check its status
  if (currentSession) {
    const start = Temporal.Instant.from(currentSession.startInstant);
    const end = Temporal.Instant.from(currentSession.endInstant);
    
    const isWithin = Temporal.Instant.compare(now, start) >= 0 && Temporal.Instant.compare(now, end) <= 0;
    
    if (isWithin) {
      return { 
        onTime: true, 
        message: "Session is active", 
        session: currentSession 
      };
    }
    
    if (Temporal.Instant.compare(now, start) < 0) {
      return { 
        onTime: false, 
        message: "Upcoming session", 
        session: currentSession 
      };
    }
  }

  return { onTime: false, message: "Not in session" };
}