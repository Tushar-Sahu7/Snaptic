const AttendanceSession = require("../models/AttendanceSession");
const { rrulestr } = require("rrule");
const { toLocal, getISTDayBounds, formatIST } = require("../utils/dateUtils");

/**
 * Generates sessions for a class based on its RRULE schedule.
 */
async function calculateSessions(classDoc, startFrom = new Date(0)) {
  const sessions = [];
  const { schedule, teacherId, location, _id: classId } = classDoc;

  if (!schedule || !schedule.rrule || classDoc.status === "archived" || classDoc.deletedAt) {
    return []; 
  }

  const rule = rrulestr(schedule.rrule);
  const duration = schedule.duration || 60;
  
  const occurrences = rule.all();

  occurrences.forEach((occurrence) => {
    if (occurrence >= startFrom) {
      const sessionStart = occurrence;
      const sessionEnd = new Date(sessionStart.getTime() + duration * 60000);

      sessions.push({
        classId,
        teacherId,
        date: sessionStart,
        startTime: sessionStart,
        endTime: sessionEnd,
        location,
        status: "scheduled"
      });
    }
  });

  return sessions;
}

/**
 * Syncs sessions for a class. Deletes future scheduled sessions and regenerates them.
 */
async function syncClassSessions(classDoc, dbSession = null) {
  const { startUTC } = getISTDayBounds(); // Start of today in IST

  // 1. Purge all "scheduled" sessions from the start of today onwards.
  // This removes the "ghost" sessions if the time was moved from earlier today to later today.
  await AttendanceSession.deleteMany({
    classId: classDoc._id,
    startTime: { $gte: startUTC },
    status: "scheduled"
  }, { session: dbSession });

  // 2. Calculate potential sessions from the start of today onwards.
  const potentialSessions = await calculateSessions(classDoc, startUTC);
  
  if (potentialSessions.length > 0) {
    // 3. Find existing sessions (completed, in-progress, etc.) to avoid duplicates.
    // Since we already deleted "scheduled" ones, any session found here is "active" or "finished".
    const existingSessions = await AttendanceSession.find({
      classId: classDoc._id,
      startTime: { $gte: startUTC }
    }).session(dbSession).lean();

    // Create a set of dates (YYYY-MM-DD) that already have a session
    const occupiedDates = new Set(existingSessions.map(s => {
      // Convert to IST string to compare dates correctly
      return formatIST(s.startTime, "yyyy-MM-dd");
    }));

    // 4. Only insert sessions for dates that don't already have an active/completed session.
    const sessionsToInsert = potentialSessions.filter(s => {
      const sessionDate = formatIST(s.startTime, "yyyy-MM-dd");
      return !occupiedDates.has(sessionDate);
    });

    if (sessionsToInsert.length > 0) {
      await AttendanceSession.insertMany(sessionsToInsert, { session: dbSession });
    }
  }
}

/**
 * Purges all future sessions for a deleted class.
 */
async function purgeFutureSessions(classId, dbSession = null) {
  const { startUTC } = getISTDayBounds();
  await AttendanceSession.deleteMany({
    classId,
    startTime: { $gte: startUTC },
    status: "scheduled",
  }, { session: dbSession });
}

module.exports = {
  syncClassSessions,
  purgeFutureSessions,
  calculateSessions
};

