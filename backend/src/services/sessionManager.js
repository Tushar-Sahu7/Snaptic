const { Temporal } = require("@js-temporal/polyfill");
const { rrule: RRule } = require("rrule");
const AttendanceSession = require("../models/AttendanceSession");
const TemporalService = require("./temporalService");

/**
 * Validates if a proposed time range overlaps with any existing sessions for the teacher.
 */
async function checkCollisions(teacherId, proposedSessions, ignoreScheduleId = null) {
  for (const proposed of proposedSessions) {
    const conflict = await AttendanceSession.findOne({
      teacherId,
      scheduleId: { $ne: ignoreScheduleId },
      status: { $ne: "missed" }, // Rule: Ignore historical missed sessions
      $or: [
        {
          startInstant: { $lt: proposed.endInstant },
          endInstant: { $gt: proposed.startInstant },
        },
      ],
    }).populate("classId", "name");

    if (conflict) {
      return {
        hasConflict: true,
        conflictSession: conflict,
        proposedSession: proposed,
      };
    }
  }
  return { hasConflict: false };
}

/**
 * Generates absolute session metadata for a class schedule blueprint.
 */
async function calculateSessions(classDoc, schedule) {
  if (schedule.isHidden) return [];

  const sessions = [];
  const timezone = classDoc.timezone;
  
  // DTSTART for rrule should be the schedule's startDate or the class's startDate
  // We use the start of the day in the class timezone
  const startPlainDate = Temporal.PlainDate.from((schedule.startDate || classDoc.startDate).split("T")[0]);
  const endPlainDate = Temporal.PlainDate.from(classDoc.endDate.split("T")[0]);

  const rule = RRule.fromString(schedule.rrule);
  const options = rule.options;
  
  // Set dtstart to the beginning of the class range
  options.dtstart = new Date(startPlainDate.toString());
  options.until = new Date(endPlainDate.toString());
  
  const ruleWithBounds = new RRule(options);
  const occurrences = ruleWithBounds.all();

  for (const occ of occurrences) {
    const dateStr = occ.toISOString().split("T")[0];
    
    // Check if this date is in exdates
    if (schedule.exdates.some(ex => ex.startsWith(dateStr))) continue;

    // Rule: Check for teacher-level holidays
    const Holiday = require("../models/Holiday");
    const isHoliday = await Holiday.exists({
      teacherId: classDoc.teacherId,
      startDate: { $lte: dateStr },
      endDate: { $gte: dateStr }
    });
    if (isHoliday) continue;

    const window = TemporalService.calculateWindow(
      dateStr,
      schedule.startTime,
      schedule.duration,
      timezone
    );

    sessions.push({
      classId: classDoc._id,
      scheduleId: schedule._id,
      teacherId: classDoc.teacherId,
      dateString: dateStr,
      startTime: schedule.startTime,
      duration: schedule.duration,
      location: schedule.location,
      timezone,
      startInstant: window.startInstant,
      endInstant: window.endInstant,
      status: "scheduled",
      attendanceWindow: {
        opensAt: window.startInstant,
        closesAt: window.endInstant
      }
    });
  }

  return sessions;
}

/**
 * Generates and saves sessions for a new schedule.
 */
async function generateSessionsForSchedule(classDoc, schedule) {
  const proposedSessions = await calculateSessions(classDoc, schedule);
  const collision = await checkCollisions(classDoc.teacherId, proposedSessions);
  
  if (collision.hasConflict) {
    const error = new Error(`Collision on ${collision.proposedSession.dateString}`);
    error.code = "COLLISION";
    throw error;
  }

  if (proposedSessions.length > 0) {
    await AttendanceSession.insertMany(proposedSessions);
  }
}

/**
 * Cleans up and regenerates future sessions when a schedule is updated.
 */
async function regenerateSessions(classDoc, schedule) {
  const now = TemporalService.getNowInstant();
  
  // 1. Delete future unoverridden sessions
  await AttendanceSession.deleteMany({
    scheduleId: schedule._id,
    startInstant: { $gt: now },
    status: "scheduled", 
  });

  // 2. Calculate new sessions
  const allSessions = await calculateSessions(classDoc, schedule);
  const futureSessions = allSessions.filter(s => s.startInstant > now);

  // 3. Check collisions for future sessions
  const collision = await checkCollisions(classDoc.teacherId, futureSessions, schedule._id);
  if (collision.hasConflict) {
    const error = new Error(`Updated schedule conflicts with class "${collision.conflictSession.classId.name}" on ${collision.proposedSession.dateString}`);
    error.code = "COLLISION";
    throw error;
  }

  // 4. Insert new sessions
  if (futureSessions.length > 0) {
    await AttendanceSession.insertMany(futureSessions);
  }
}

/**
 * Purges all future sessions for a deleted schedule or class.
 */
async function purgeFutureSessions(scheduleId) {
  const now = TemporalService.getNowInstant();
  await AttendanceSession.deleteMany({
    scheduleId,
    startInstant: { $gt: now },
    status: "scheduled",
  });
}

module.exports = {
  generateSessionsForSchedule,
  regenerateSessions,
  purgeFutureSessions,
  calculateSessions,
  checkCollisions,
};
