const AttendanceSession = require("../models/AttendanceSession");
const { rrulestr } = require("rrule");
const { toLocal } = require("../utils/dateUtils");

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
  const now = new Date();

  await AttendanceSession.deleteMany({
    classId: classDoc._id,
    startTime: { $gt: now },
    status: "scheduled"
  }, { session: dbSession });

  const futureSessions = await calculateSessions(classDoc, now);
  
  if (futureSessions.length > 0) {
    await AttendanceSession.insertMany(futureSessions, { session: dbSession });
  }
}

/**
 * Purges all future sessions for a deleted class.
 */
async function purgeFutureSessions(classId, dbSession = null) {
  const now = new Date();
  await AttendanceSession.deleteMany({
    classId,
    startTime: { $gt: now },
    status: "scheduled",
  }, { session: dbSession });
}

module.exports = {
  syncClassSessions,
  purgeFutureSessions,
  calculateSessions
};

