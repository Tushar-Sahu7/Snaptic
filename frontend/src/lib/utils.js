import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Checks if a class is currently in session based on its flat schedule.
 * @param {Object} cls The class object
 * @returns {Object} { onTime: boolean, message: string }
 */
export function isClassInSession(cls) {
  if (!cls || cls.status === "archived") return { onTime: false, message: "Class is archived" };
  
  const now = new Date();
  const currentDay = now.getDay(); // 0-6 (Sun-Sat)
  
  // Check if today is a scheduled day
  if (!cls.daysOfWeek?.includes(currentDay)) {
    return { onTime: false, message: "Not scheduled for today" };
  }

  // Parse start time "HH:mm"
  const [startH, startM] = (cls.startTime || "00:00").split(":").map(Number);
  const startDate = new Date(now);
  startDate.setHours(startH, startM, 0, 0);

  const duration = cls.duration || 60;
  const endDate = new Date(startDate.getTime() + duration * 60000);

  const onTime = now >= startDate && now <= endDate;
  
  let message = "";
  if (onTime) {
    message = "Live Now";
  } else if (now < startDate) {
    message = `Starts at ${format12Hour(cls.startTime)}`;
  } else {
    message = "Session ended";
  }

  return { onTime, message };
}

/**
 * Formats "HH:mm" to "h:mm AM/PM"
 */
export function format12Hour(timeStr) {
  if (!timeStr) return "--:--";
  try {
    const [hours, minutes] = timeStr.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  } catch (e) {
    return timeStr;
  }
}

/**
 * Formats room/location string
 */
export function formatRoom(room) {
  if (!room) return "No location set";
  return room;
}

/**
 * Formats an array of days into a readable string
 */
export function formatDays(days) {
  if (!days || !Array.isArray(days) || days.length === 0) return "No days";
  if (days.length === 7) return "Daily";
  
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const formatted = days
    .map(d => (typeof d === "number" ? dayNames[d] : d.toString().slice(0, 3)))
    .filter(Boolean);

  if (days.length === 5 && 
      formatted.includes("Mon") && 
      formatted.includes("Tue") && 
      formatted.includes("Wed") && 
      formatted.includes("Thu") && 
      formatted.includes("Fri")) {
    return "Weekdays";
  }

  return formatted.join(", ");
}

/**
 * Formats a date or time string into a readable time (e.g., "10:30 AM")
 */
export function formatTime(date) {
  if (!date) return "--:--";
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

/**
 * Formats a date into a readable string (e.g., "May 15, 2024")
 */
export function formatDate(date) {
  if (!date) return "---";
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Formats duration in minutes into "Xh Ym" or "Xm"
 */
export function formatDuration(minutes) {
  if (!minutes) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/**
 * Returns a relative time string (e.g., "5 minutes ago")
 */
export function formatRelative(date) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - d) / 1000);
  
  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return formatDate(d);
}

