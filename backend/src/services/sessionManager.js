const AttendanceSession = require("../models/AttendanceSession");

/**
 * Generates sessions for a class based on its flat schedule.
 */
async function calculateSessions(classDoc) {
  const sessions = [];
  const { startDate, endDate, startTime, duration, daysOfWeek, teacherId, location, _id: classId } = classDoc;

  // Parse start and end dates (YYYY-MM-DD)
  const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
  const [endYear, endMonth, endDay] = endDate.split("-").map(Number);
  const [hours, minutes] = startTime.split(":").map(Number);

  // Use UTC to avoid server-local timezone issues during calculation
  // We treat the dates and times as "absolute" local values
  const start = new Date(Date.UTC(startYear, startMonth - 1, startDay));
  const end = new Date(Date.UTC(endYear, endMonth - 1, endDay));

  let current = new Date(start);
  while (current <= end) {
    // getUTCDay() returns 0 for Sunday, 1 for Monday, etc.
    if (daysOfWeek.includes(current.getUTCDay())) {
      const sessionStart = new Date(current);
      sessionStart.setUTCHours(hours, minutes, 0, 0);
      
      const sessionEnd = new Date(sessionStart);
      sessionEnd.setUTCMinutes(sessionEnd.getUTCMinutes() + duration);

      sessions.push({
        classId,
        teacherId,
        date: new Date(current),
        startTime: sessionStart,
        endTime: sessionEnd,
        location,
        status: "scheduled"
      });
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return sessions;
}

/**
 * Syncs sessions for a class. Deletes future scheduled sessions and regenerates them.
 * This is the "Hard Sync" logic.
 */
async function syncClassSessions(classDoc) {
  const now = new Date();

  // Delete future scheduled sessions for this class
  // Only delete those that haven't been started or missed
  await AttendanceSession.deleteMany({
    classId: classDoc._id,
    startTime: { $gt: now },
    status: "scheduled"
  });

  // Calculate new sessions
  const allSessions = await calculateSessions(classDoc);
  
  // Filter to only include future sessions
  const futureSessions = allSessions.filter(s => s.startTime > now);

  if (futureSessions.length > 0) {
    await AttendanceSession.insertMany(futureSessions);
  }
}

/**
 * Purges all future sessions for a deleted class.
 */
async function purgeFutureSessions(classId) {
  const now = new Date();
  await AttendanceSession.deleteMany({
    classId,
    startTime: { $gt: now },
    status: "scheduled",
  });
}

module.exports = {
  syncClassSessions,
  purgeFutureSessions,
  calculateSessions
};

