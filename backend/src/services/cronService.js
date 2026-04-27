const cron = require("node-cron");
const AttendanceSession = require("../models/AttendanceSession");
const AttendanceRecord = require("../models/AttendanceRecord");
const Class = require("../models/Class");
const TemporalService = require("../services/temporalService");
const { Temporal } = require("@js-temporal/polyfill");

/**
 * Finalization Job: Runs every 5 minutes to lock sessions and handle misses.
 */
async function runFinalizationJob() {
  console.log("Running Attendance Finalization Job...");
  const now = Temporal.Now.instant();
  const gracePeriod = { minutes: 5 };

  try {
    // 1. Finalize 'submitted' sessions
    const submittedSessions = await AttendanceSession.find({ status: "submitted" });
    for (const session of submittedSessions) {
      if (!session.attendanceWindow || !session.attendanceWindow.closesAt) continue;

      const closesAt = Temporal.Instant.from(session.attendanceWindow.closesAt);
      const lockTime = closesAt.add(gracePeriod);

      if (Temporal.Instant.compare(now, lockTime) >= 0) {
        session.status = "finalized";
        await session.save();
        console.log(`Finalized session ${session._id}`);
      }
    }

    // 2. Mark 'missed' and cleanup partials
    const activeSessions = await AttendanceSession.find({ 
      status: { $in: ["scheduled", "inprogress"] } 
    });
    
    for (const session of activeSessions) {
      if (!session.attendanceWindow || !session.attendanceWindow.closesAt) continue;

      const closesAt = Temporal.Instant.from(session.attendanceWindow.closesAt);
      const missTime = closesAt.add(gracePeriod);

      if (Temporal.Instant.compare(now, missTime) >= 0) {
        session.status = "missed";
        await session.save();
        
        // Physical delete of any partial records to ensure data integrity
        await AttendanceRecord.deleteMany({ sessionId: session._id });
        console.log(`Marked session ${session._id} as missed and cleared partials.`);
      }
    }
  } catch (err) {
    console.error("Finalization Job Error:", err);
  }
}

/**
 * Archiving Job: Runs daily at midnight to archive expired classes.
 */
async function runArchivingJob() {
  console.log("Running Class Archiving Job...");
  const today = TemporalService.getNowDate();

  try {
    const expiredClasses = await Class.find({
      status: "active",
      endDate: { $lt: today }
    });

    for (const classDoc of expiredClasses) {
      classDoc.status = "archived";
      await classDoc.save();
      console.log(`Archived class ${classDoc._id}`);
    }
  } catch (err) {
    console.error("Archiving Job Error:", err);
  }
}

function initCron() {
  // Every 5 minutes
  cron.schedule("*/5 * * * *", runFinalizationJob);
  
  // Every day at midnight
  cron.schedule("0 0 * * *", runArchivingJob);
  
  console.log("Cron Jobs Initialized.");
}

module.exports = { initCron };
