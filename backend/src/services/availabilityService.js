const AttendanceSession = require("../models/AttendanceSession");
const { Temporal } = require("@js-temporal/polyfill");

/**
 * AvailabilityService handles the computation of free time slots for a teacher.
 */
class AvailabilityService {
  /**
   * Returns a list of free windows for a teacher on a specific date.
   * @param {string} teacherId
   * @param {string} dateString - "YYYY-MM-DD"
   * @param {number} duration - Requested session duration in minutes
   * @param {string} timezone
   */
  static async getAvailableSlots(teacherId, dateString, duration, timezone) {
    // 1. Define the "working day" bounds (e.g. 07:00 to 22:00)
    const dayStart = Temporal.PlainTime.from("07:00");
    const dayEnd = Temporal.PlainTime.from("22:00");
    
    const plainDate = Temporal.PlainDate.from(dateString);
    const dayStartZdt = plainDate.toZonedDateTime({ timeZone: timezone, plainTime: dayStart });
    const dayEndZdt = plainDate.toZonedDateTime({ timeZone: timezone, plainTime: dayEnd });

    // 2. Fetch all sessions for this teacher on this day (including overlapping ones)
    const sessions = await AttendanceSession.find({
      teacherId,
      status: { $ne: "missed" }, // Rule: Missed sessions don't block availability
      startInstant: { $lt: dayEndZdt.toInstant().toString() },
      endInstant: { $gt: dayStartZdt.toInstant().toString() }
    }).sort({ startInstant: 1 });

    // 3. Find gaps
    const freeSlots = [];
    let currentPointer = dayStartZdt;

    for (const session of sessions) {
      const sessionStart = Temporal.ZonedDateTime.from(session.startInstant + "[" + timezone + "]");
      
      // Calculate gap between current pointer and session start
      const gap = currentPointer.until(sessionStart, { largestUnit: "minutes" }).minutes;
      
      if (gap >= duration) {
        freeSlots.push({
          start: currentPointer.toPlainTime().toString(),
          end: sessionStart.toPlainTime().toString(),
          duration: gap
        });
      }
      
      // Move pointer to the end of the session if it's further than current
      const sessionEnd = Temporal.ZonedDateTime.from(session.endInstant + "[" + timezone + "]");
      if (Temporal.ZonedDateTime.compare(sessionEnd, currentPointer) > 0) {
        currentPointer = sessionEnd;
      }
    }

    // Check final gap after last session
    const finalGap = currentPointer.until(dayEndZdt, { largestUnit: "minutes" }).minutes;
    if (finalGap >= duration) {
      freeSlots.push({
        start: currentPointer.toPlainTime().toString(),
        end: dayEnd.toString(),
        duration: finalGap
      });
    }

    return freeSlots;
  }
}

module.exports = AvailabilityService;
