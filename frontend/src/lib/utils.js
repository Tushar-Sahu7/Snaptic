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

export function formatDays(days) {
  if (!days || !Array.isArray(days) || days.length === 0) return "No days";
  if (days.length === 7) return "Daily";
  
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const numericDays = days.map(d => typeof d === 'number' ? d : dayNames.findIndex(n => n.startsWith(d.toString().slice(0,3))));
  const validDays = numericDays.filter(d => d >= 0 && d <= 6);
  const sortedDays = [...new Set(validDays)].sort((a, b) => a - b);
  
  if (sortedDays.length === 5 && sortedDays[0] === 1 && sortedDays[4] === 5) {
    return "Weekdays";
  }

  const groups = [];
  let currentGroup = [sortedDays[0]];

  for (let i = 1; i < sortedDays.length; i++) {
    if (sortedDays[i] === sortedDays[i - 1] + 1) {
      currentGroup.push(sortedDays[i]);
    } else {
      groups.push(currentGroup);
      currentGroup = [sortedDays[i]];
    }
  }
  groups.push(currentGroup);

  const formattedGroups = groups.map(group => {
    if (group.length === 1) return dayNames[group[0]];
    if (group.length === 2) return `${dayNames[group[0]]}, ${dayNames[group[1]]}`;
    return `${dayNames[group[0]]}-${dayNames[group[group.length - 1]]}`;
  });

  return formattedGroups.join(", ");
}

/**
 * Formats class start and end time with duration (e.g., "10:00 AM - 11:00 AM (60m)")
 */
export function formatClassTimeRange(cls) {
  if (!cls || !cls.startTime) return "Not Set";
  try {
    const [startH, startM] = cls.startTime.split(":").map(Number);
    const start = new Date();
    start.setHours(startH, startM, 0, 0);
    const end = new Date(start.getTime() + (cls.duration || 60) * 60000);
    const endH = end.getHours();
    const endM = end.getMinutes().toString().padStart(2, "0");
    const endStr = `${endH}:${endM}`;
    return `${format12Hour(cls.startTime)} - ${format12Hour(endStr)} (${formatDuration(cls.duration || 60)})`;
  } catch (e) {
    return format12Hour(cls.startTime);
  }
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
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
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

