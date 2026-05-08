import { fromZonedTime, toZonedTime, formatInTimeZone } from "date-fns-tz";
import { format, startOfWeek, addDays, isSameDay, parse } from "date-fns";
import { RRule } from "rrule";

export const APP_TIMEZONE = "Asia/Kolkata";

/**
 * Returns the current time as a Date object in IST.
 */
export const getNowIST = () => toZonedTime(new Date(), APP_TIMEZONE);

/**
 * Returns today's date string in IST (yyyy-MM-dd).
 */
export const getTodayISTStr = () => formatInTimeZone(new Date(), APP_TIMEZONE, "yyyy-MM-dd");

/**
 * Combines a local date and time string into a UTC ISO string.
 */
export const toUTC = (date, time) => {
  if (!date || !time) return null;
  const dateStr = typeof date === "string" ? date : formatInTimeZone(date, APP_TIMEZONE, "yyyy-MM-dd");
  return fromZonedTime(`${dateStr} ${time}`, APP_TIMEZONE).toISOString();
};

/**
 * Converts a UTC Date/String to a local Date object for IST logic.
 */
export const toLocal = (utcDate) => {
  if (!utcDate) return null;
  return toZonedTime(new Date(utcDate), APP_TIMEZONE);
};

/**
 * Formats a UTC date for display in IST.
 */
export const formatIST = (utcDate, pattern = "yyyy-MM-dd HH:mm:ss") => {
  if (!utcDate) return "";
  return formatInTimeZone(new Date(utcDate), APP_TIMEZONE, pattern);
};

/**
 * Generates an RRULE string from the form data.
 */
export const generateRRuleString = ({ startDate, startTime, endDate, daysOfWeek, duration }) => {
  const startUTC = fromZonedTime(`${startDate} ${startTime}`, APP_TIMEZONE);
  const endUTC = fromZonedTime(`${endDate} ${startTime}`, APP_TIMEZONE);
  const untilUTC = new Date(endUTC.getTime() + duration * 60000);

  const mappedDays = daysOfWeek.map(jsDay => {
    switch(jsDay) {
      case 0: return RRule.MO;
      case 1: return RRule.TU;
      case 2: return RRule.WE;
      case 3: return RRule.TH;
      case 4: return RRule.FR;
      case 5: return RRule.SA;
      case 6: return RRule.SU;
      default: return null;
    }
  }).filter(d => d !== null);

  const rule = new RRule({
    freq: RRule.WEEKLY,
    dtstart: startUTC,
    until: untilUTC,
    byweekday: mappedDays,
  });

  return rule.toString();
};

/**
 * Parses an RRULE string back into its display components (IST).
 */
export const parseSchedule = (schedule) => {
  if (!schedule || !schedule.rrule) return null;
  try {
    const rule = RRule.fromString(schedule.rrule);
    const startIST = toLocal(rule.options.dtstart);
    
    // Extract days of week (0-6)
    const daysOfWeek = rule.options.byweekday?.map(day => {
      return typeof day === "number" ? day : day.weekday;
    }) || [];

    const untilIST = rule.options.until ? toLocal(rule.options.until) : null;

    return {
      startTime: format(startIST, "HH:mm"),
      startDate: format(startIST, "yyyy-MM-dd"),
      endDate: untilIST ? format(untilIST, "yyyy-MM-dd") : null,
      daysOfWeek,
      duration: schedule.duration || 60,
    };
  } catch (e) {
    console.error("RRULE Parse Error:", e);
    return null;
  }
};

/**
 * Dynamic Weekdays Array using date-fns (0=Sunday, 1=Monday...)
 */
export const WEEKDAYS = Array.from({ length: 7 }).map((_, i) => 
  format(addDays(startOfWeek(getNowIST(), { weekStartsOn: 1 }), i), "EEEE")
);

export const WEEKDAYS_SHORT = Array.from({ length: 7 }).map((_, i) => 
  format(addDays(startOfWeek(getNowIST(), { weekStartsOn: 1 }), i), "EEE")
);

/**
 * Checks if a class is currently in session.
 */
export function isClassInSession(cls) {
  if (!cls || cls.status === "archived") return { onTime: false, message: "Class is archived" };
  
  const parsed = parseSchedule(cls.schedule);
  if (!parsed) return { onTime: false, message: "Invalid schedule" };
  
  const now = getNowIST();
  const currentDay = (now.getDay() + 6) % 7; // Map JS (0=Sun) to RRule (0=Mon)
  
  const [startH, startM] = parsed.startTime.split(":").map(Number);
  const startDate = new Date(now);
  startDate.setHours(startH, startM, 0, 0);

  const duration = parsed.duration;
  const endDate = new Date(startDate.getTime() + duration * 60000);

  // Case 1: Today is a scheduled day
  if (parsed.daysOfWeek.includes(currentDay)) {
    if (now >= startDate && now <= endDate) {
      return { onTime: true, message: "Live Now" };
    }
    if (now < startDate) {
      return { onTime: false, message: `Starts at ${format12Hour(parsed.startTime)}` };
    }
    // If today's session is over, we fall through to the "Next on..." logic
  }

  // Case 2: Today is not a scheduled day OR today's session is finished
  try {
    const rule = RRule.fromString(cls.schedule.rrule);
    // Find the next occurrence after NOW
    // rule.after expects a Date. Since our rule uses UTC, we should pass UTC now.
    const nextDateUTC = rule.after(fromZonedTime(now, APP_TIMEZONE));
    
    if (!nextDateUTC) {
      return { onTime: false, message: "Course Completed" };
    }
    
    const nextDateIST = toLocal(nextDateUTC);
    const todayStr = format(now, "yyyy-MM-dd");
    const tomorrowStr = format(addDays(now, 1), "yyyy-MM-dd");
    const nextStr = format(nextDateIST, "yyyy-MM-dd");

    if (nextStr === todayStr) {
      // Should ideally be handled by Case 1, but safe fallback
      return { onTime: false, message: `Starts at ${format12Hour(parsed.startTime)}` };
    }

    if (nextStr === tomorrowStr) {
      return { onTime: false, message: `Next Session: Tomorrow` };
    }
    
    return { onTime: false, message: `Next Session: ${format(nextDateIST, "EEEE")}` };
  } catch (e) {
    console.error("isClassInSession Error:", e);
    return { onTime: false, message: "Off Schedule" };
  }
}

export function format12Hour(timeStr) {
  if (!timeStr) return "--:--";
  try {
    const [h, m] = timeStr.split(":").map(Number);
    const d = getNowIST();
    d.setHours(h, m, 0, 0);
    return format(d, "hh:mm a");
  } catch (e) {
    return timeStr;
  }
}

export function formatRoom(room) {
  return room || "No location set";
}

export function formatDays(input) {
  let days = [];
  if (Array.isArray(input)) {
    days = input;
  } else if (input && typeof input === "object" && input.rrule) {
    const parsed = parseSchedule(input);
    days = parsed?.daysOfWeek || [];
  } else {
    return "No days";
  }

  if (days.length === 0) return "No days";
  if (days.length === 7) return "Daily";
  
  const sortedDays = [...new Set(days)].sort((a, b) => a - b);
  
  if (sortedDays.length === 5 && sortedDays[0] === 0 && sortedDays[4] === 4) {
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

  return groups.map(group => {
    if (group.length === 1) return WEEKDAYS_SHORT[group[0]];
    if (group.length === 2) return `${WEEKDAYS_SHORT[group[0]]}, ${WEEKDAYS_SHORT[group[1]]}`;
    return `${WEEKDAYS_SHORT[group[0]]}-${WEEKDAYS_SHORT[group[group.length - 1]]}`;
  }).join(", ");
}

export function formatClassTimeRange(cls) {
  if (!cls) return "Not Set";
  const parsed = parseSchedule(cls.schedule);
  if (!parsed || !parsed.startTime) return "Not Set";
  
  try {
    const [h, m] = parsed.startTime.split(":").map(Number);
    const start = getNowIST();
    start.setHours(h, m, 0, 0);
    const end = new Date(start.getTime() + parsed.duration * 60000);
    return `${format(start, "hh:mm a")} - ${format(end, "hh:mm a")} (${formatDuration(parsed.duration)})`;
  } catch (e) {
    return format12Hour(parsed.startTime);
  }
}

export function formatTime(date) {
  if (!date) return "--:--";
  const d = new Date(date);
  return isNaN(d.getTime()) ? date : format(d, "hh:mm a");
}

export function formatDate(date) {
  if (!date) return "---";
  const d = new Date(date);
  return isNaN(d.getTime()) ? date : format(d, "MMM d, yyyy");
}

export function formatDuration(minutes) {
  if (!minutes) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  return `${m}m`;
}

export function formatClassValidity(schedule) {
  if (!schedule) return "Continuous";
  const parsed = parseSchedule(schedule);
  if (!parsed || !parsed.startDate) return "Continuous";
  
  try {
    const start = parse(parsed.startDate, "yyyy-MM-dd", new Date());
    const startStr = format(start, "dd MMM yy");
    
    if (!parsed.endDate) return `${startStr} - Open`;
    
    const end = parse(parsed.endDate, "yyyy-MM-dd", new Date());
    const endStr = format(end, "dd MMM yy");
    
    return `${startStr} - ${endStr}`;
  } catch (e) {
    return parsed.startDate;
  }
}

export function formatRelative(date) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  
  const now = getNowIST();
  const diff = Math.floor((now - d) / 1000);
  
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return format(d, "MMM d");
}
