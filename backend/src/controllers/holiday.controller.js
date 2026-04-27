const Holiday = require("../models/Holiday");
const AttendanceSession = require("../models/AttendanceSession");
const Class = require("../models/Class");
const { Temporal } = require("@js-temporal/polyfill");

/**
 * POST /api/holidays
 * Creates a new holiday and purges affected scheduled sessions.
 */
const createHoliday = async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body;
    const teacherId = req.user.userId;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ message: "Name, Start Date, and End Date are required" });
    }

    const holiday = await Holiday.create({ name, startDate, endDate, teacherId });

    // Purge logic: Find 'scheduled' sessions for this teacher in the holiday range
    const sessionsToPurge = await AttendanceSession.find({
      teacherId,
      status: "scheduled",
      dateString: { $gte: startDate, $lte: endDate }
    });

    if (sessionsToPurge.length > 0) {
      const sessionIds = sessionsToPurge.map(s => s._id);
      
      // Update parent schedules with exdates
      for (const session of sessionsToPurge) {
        await Class.updateOne(
          { _id: session.classId, "schedules._id": session.scheduleId },
          { $addToSet: { "schedules.$.exdates": session.dateString } }
        );
      }

      // Bulk delete the sessions
      await AttendanceSession.deleteMany({ _id: { $in: sessionIds } });
    }

    return res.status(201).json({ 
      holiday, 
      purgedSessionCount: sessionsToPurge.length 
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/holidays
 */
const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find({ teacherId: req.user.userId }).sort({ startDate: 1 });
    return res.status(200).json({ holidays });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE /api/holidays/:id
 * Deletes a holiday. (Note: Does not restore purged sessions automatically)
 */
const deleteHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findOneAndDelete({ _id: req.params.id, teacherId: req.user.userId });
    if (!holiday) return res.status(404).json({ message: "Holiday not found" });

    return res.status(200).json({ message: "Holiday deleted successfully." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createHoliday,
  getHolidays,
  deleteHoliday
};
