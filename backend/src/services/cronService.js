const cron = require("node-cron");
const AttendanceSession = require("../models/AttendanceSession");
const AttendanceRecord = require("../models/AttendanceRecord");
const Class = require("../models/Class");

/**
 * Finalization Job: Runs every 5 minutes to lock sessions and handle misses.
 */
async function runFinalizationJob() {
  console.log("Running Attendance Finalization Job...");
  const now = new Date();
  const gracePeriodMs = 5 * 60 * 1000; // 5 minutes

  try {
    // 1. Finalize 'submitted' sessions
    // Sessions stay 'submitted' for a few minutes for review before being locked as 'finalized'
    const submittedSessions = await AttendanceSession.find({ status: "submitted" });
    for (const session of submittedSessions) {
      const lockTime = new Date(session.endTime.getTime() + gracePeriodMs);

      if (now >= lockTime) {
        session.status = "finalized";
        await session.save();
        console.log(`Finalized session ${session._id}`);
      }
    }

    // 2. Mark 'missed' for sessions that never started
    // If a session's endTime + grace period has passed and it's still 'scheduled' or 'inprogress'
    // (Note: 'inprogress' sessions that weren't submitted are also considered missed/abandoned)
    const activeSessions = await AttendanceSession.find({ 
      status: { $in: ["scheduled", "inprogress"] } 
    });
    
    for (const session of activeSessions) {
      const missTime = new Date(session.endTime.getTime() + gracePeriodMs);

      if (now >= missTime) {
        session.status = "missed";
        await session.save();
        
        // Physical delete of any partial records to ensure data integrity
        // If it was inprogress, some records might have been created
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
  const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  try {
    const expiredClasses = await Class.find({
      status: "active",
      endDate: { $lt: todayStr }
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

