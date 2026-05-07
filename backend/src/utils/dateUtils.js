const { fromZonedTime, toZonedTime, formatInTimeZone } = require("date-fns-tz");
const { RRule } = require("rrule");

const APP_TIMEZONE = "Asia/Kolkata";

/**
 * Returns current time normalized to IST for calendar logic.
 */
const getNowIST = () => {
  return toZonedTime(new Date(), APP_TIMEZONE);
};

/**
 * Converts a UTC date to IST Date object.
 */
const toLocal = (utcDate) => {
  if (!utcDate) return null;
  return toZonedTime(new Date(utcDate), APP_TIMEZONE);
};

/**
 * Formats a UTC date for display in IST.
 */
const formatIST = (utcDate, pattern = "yyyy-MM-dd HH:mm:ss") => {
  if (!utcDate) return "";
  return formatInTimeZone(new Date(utcDate), APP_TIMEZONE, pattern);
};

/**
 * Helper to get Start of Day and End of Day in UTC for a given IST date.
 */
const getISTDayBounds = (date = new Date()) => {
  const localDate = toZonedTime(date, APP_TIMEZONE);
  
  const start = new Date(localDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(localDate);
  end.setHours(23, 59, 59, 999);
  
  return {
    startUTC: fromZonedTime(start, APP_TIMEZONE),
    endUTC: fromZonedTime(end, APP_TIMEZONE)
  };
};

module.exports = {
  APP_TIMEZONE,
  getNowIST,
  toLocal,
  formatIST,
  getISTDayBounds
};
