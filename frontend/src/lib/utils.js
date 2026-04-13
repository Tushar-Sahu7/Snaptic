import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

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

export function formatDays(daysArray) {
  if (!daysArray || daysArray.length === 0) return "";
  if (daysArray.length === 1) return daysArray[0].slice(0, 3);
  
  // Sort based on WEEKDAYS order
  const sorted = [...daysArray].sort(
    (a, b) => WEEKDAYS.indexOf(a) - WEEKDAYS.indexOf(b)
  );
  
  // Check if consecutive
  let consecutive = true;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (WEEKDAYS.indexOf(sorted[i + 1]) - WEEKDAYS.indexOf(sorted[i]) !== 1) {
      consecutive = false;
      break;
    }
  }

  if (consecutive && sorted.length >= 3) {
    return `${sorted[0].slice(0, 3)} - ${sorted[sorted.length - 1].slice(0, 3)}`;
  }
  
  return sorted.map(d => d.slice(0, 3)).join(", ");
}

export function format12Hour(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  if (!h || !m) return timeStr;
  let hours = parseInt(h, 10);
  const suffix = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${m} ${suffix}`;
}

export function formatRoom(room) {
  if (!room) return "";
  const t = room.trim();
  if (!t) return "";

  // Regex to detect "Room" or "Rm" prefixes (case insensitive, optional dot)
  const prefixRegex = /^(room|rm)\.?\s*(.+)$/i;
  const match = t.match(prefixRegex);

  if (match) {
    return `Room ${match[2]}`;
  }

  // Prepend "Room " if no prefix found
  return `Room ${t}`;
}

export function isWithinSchedule(schedule) {
  if (!schedule || !schedule.days || schedule.days.length === 0 || !schedule.startTime || !schedule.endTime) {
    return { onTime: false, message: "No schedule set" };
  }

  const now = new Date();
  const currentDay = WEEKDAYS[now.getDay() === 0 ? 6 : now.getDay() - 1]; // Convert 0=Sunday to match our WEEKDAYS array index
  
  if (!schedule.days.includes(currentDay)) {
    return { 
      onTime: false, 
      message: `Next scheduled for ${schedule.days.includes("Monday") ? "Monday" : schedule.days[0]}` 
    };
  }

  const [sh, sm] = schedule.startTime.split(":").map(Number);
  const [eh, em] = schedule.endTime.split(":").map(Number);
  const [ch, cm] = [now.getHours(), now.getMinutes()];

  const startTotal = sh * 60 + sm;
  const endTotal = eh * 60 + em;
  const currentTotal = ch * 60 + cm;

  if (currentTotal < startTotal) {
    return { 
      onTime: false, 
      message: `Starts at ${format12Hour(schedule.startTime)}` 
    };
  }

  if (currentTotal > endTotal) {
    return { 
      onTime: false, 
      message: `Ended at ${format12Hour(schedule.endTime)}` 
    };
  }

  return { onTime: true, message: "Class in session" };
}
