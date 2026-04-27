const { Temporal } = require("@js-temporal/polyfill");

/**
 * TemporalService provides centralized helpers for date and time logic
 * using the Temporal API. All backend business logic must use this service.
 */
class TemporalService {
  /**
   * Returns current UTC instant as ISO string.
   */
  static getNowInstant() {
    return Temporal.Now.instant().toString();
  }

  /**
   * Returns current PlainDate in a given timezone.
   */
  static getNowDate(timeZone = "UTC") {
    return Temporal.Now.plainDateISO(timeZone).toString();
  }

  /**
   * Checks if an instant has passed.
   */
  static isPast(instantStr) {
    if (!instantStr) return false;
    const instant = Temporal.Instant.from(instantStr);
    const now = Temporal.Now.instant();
    return Temporal.Instant.compare(instant, now) < 0;
  }

  /**
   * Returns the absolute window for attendance.
   * @param {string} dateString - "YYYY-MM-DD"
   * @param {string} startTime - "HH:mm"
   * @param {number} duration - Minutes
   * @param {string} timeZone
   */
  static calculateWindow(dateString, startTime, duration, timeZone) {
    const plainDate = Temporal.PlainDate.from(dateString);
    const startZdt = plainDate.toZonedDateTime({
      timeZone,
      plainTime: Temporal.PlainTime.from(startTime),
    });

    const endZdt = startZdt.add({ minutes: duration });

    return {
      startInstant: startZdt.toInstant().toString(),
      endInstant: endZdt.toInstant().toString(),
    };
  }

  /**
   * Validates if 'now' is within the attendance window.
   */
  static isWithinWindow(startInstant, endInstant) {
    const now = Temporal.Now.instant();
    const start = Temporal.Instant.from(startInstant);
    const end = Temporal.Instant.from(endInstant);

    return Temporal.Instant.compare(now, start) >= 0 && 
           Temporal.Instant.compare(now, end) <= 0;
  }
}

module.exports = TemporalService;
