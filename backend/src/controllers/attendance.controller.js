const AttendanceSession = require("../models/AttendanceSession");
const AttendanceRecord = require("../models/AttendanceRecord");
const Class = require("../models/Class");
const StudentProfile = require("../models/StudentProfile");

// --- HELPERS ---

const getDateString = (date = new Date()) => {
  // Use YYYY-MM-DD in local time
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getWeekDay = (date = new Date()) => {
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return weekdays[date.getDay()];
};

const checkScheduleState = (classDoc) => {
  if (!classDoc.schedule || !classDoc.schedule.days || classDoc.schedule.days.length === 0) {
    return { ok: false, message: "Class has no schedule set." };
  }

  const now = new Date();
  const currentDay = getWeekDay(now);

  if (!classDoc.schedule.days.includes(currentDay)) {
    return { ok: false, message: `Attendance only allowed on: ${classDoc.schedule.days.join(", ")}` };
  }

  if (classDoc.schedule.startTime && classDoc.schedule.endTime) {
    const [sh, sm] = classDoc.schedule.startTime.split(":").map(Number);
    const [eh, em] = classDoc.schedule.endTime.split(":").map(Number);
    const [ch, cm] = [now.getHours(), now.getMinutes()];

    const startTotal = sh * 60 + sm;
    const endTotal = eh * 60 + em;
    const currentTotal = ch * 60 + cm;

    if (currentTotal < startTotal) return { ok: false, message: `Starts at ${classDoc.schedule.startTime}` };
    if (currentTotal > endTotal) return { ok: false, message: `Ended at ${classDoc.schedule.endTime}` };
  }

  return { ok: true };
};

// --- CONTROLLERS ---

// POST /api/attendance/start/:classId
const startSession = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user.userId;

    const classDoc = await Class.findById(classId).populate("studentIds").lean();
    if (!classDoc || classDoc.teacherId.toString() !== teacherId.toString()) {
      return res.status(404).json({ message: "Class not found" });
    }

    const schedule = checkScheduleState(classDoc);
    const dateStr = getDateString();

    // Find today's session
    let session = await AttendanceSession.findOne({ classId, dateString: dateStr });

    // if it exists, check for Lazy Lock
    if (session) {
      if (session.status !== "finalized" && !schedule.ok && schedule.message.includes("Ended")) {
        session.status = "finalized";
        await session.save();
      }
    } else {
      // Create new session - only if within schedule
      if (!schedule.ok) {
        return res.status(400).json({ message: schedule.message });
      }

      session = await AttendanceSession.create({
        classId,
        teacherId,
        date: new Date(),
        dateString: dateStr,
        status: "inProgress"
      });
    }

    // Return session data with students and profiles
    const studentProfiles = await StudentProfile.find({
      userId: { $in: classDoc.studentIds.map(s => (s._id || s)) }
    }).select("userId name avatar embedding faceEnrolled").lean();

    const existingRecords = await AttendanceRecord.find({ sessionId: session._id }).lean();

    if (!session.populated("classId")) {
      await session.populate("classId");
    }

    return res.status(200).json({
      session,
      students: classDoc.studentIds,
      profiles: studentProfiles,
      records: existingRecords
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/attendance/mark
const markAttendance = async (req, res) => {
  try {
    const { sessionId, studentId, classId, status, method } = req.body;

    const session = await AttendanceSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    // 1. Status Check
    if (session.status === "finalized") {
      return res.status(403).json({ message: `Session is ${session.status} and cannot be modified.` });
    }

    // 2. Schedule Check (Server-as-King)
    const classDoc = await Class.findById(classId);
    const schedule = checkScheduleState(classDoc);
    if (!schedule.ok) {
      if (schedule.message.includes("Ended")) {
        session.status = "finalized";
        await session.save();
      }
      return res.status(403).json({ message: `Session Finalized: ${schedule.message}` });
    }

    // 3. Mark logic
    const record = await AttendanceRecord.findOneAndUpdate(
      { sessionId, studentId },
      { classId, status, method, date: new Date() },
      { upsert: true, new: true }
    );

    return res.status(200).json({ record });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/attendance/end/:sessionId
const endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await AttendanceSession.findById(sessionId);

    if (!session || ["finalized", "submitted"].includes(session.status)) {
      return res.status(400).json({ message: "Session is not in a modifiable state." });
    }

    const classDoc = await Class.findById(session.classId);
    const schedule = checkScheduleState(classDoc);
    if (!schedule.ok && schedule.message.includes("Ended")) {
      session.status = "finalized";
      await session.save();
      return res.status(403).json({ message: "Session Finalized: Class time has ended." });
    }

    // record absences for missing students
    const existingRecords = await AttendanceRecord.find({ sessionId });
    const recordedIds = existingRecords.map(r => r.studentId.toString());
    const unrecordedIds = classDoc.studentIds.filter(id => !recordedIds.includes(id.toString()));

    if (unrecordedIds.length > 0) {
      const absences = unrecordedIds.map(id => ({
        sessionId: session._id,
        studentId: id,
        classId: session.classId,
        date: new Date(),
        status: "absent",
        method: "manual"
      }));
      await AttendanceRecord.insertMany(absences);
    }

    await session.populate("classId");
    return res.status(200).json({ message: "Absences recorded. Ready for review.", session });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/attendance/submit/:sessionId
const submitSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await AttendanceSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const classDoc = await Class.findById(session.classId);
    const schedule = checkScheduleState(classDoc);

    if (!schedule.ok && schedule.message.includes("Ended")) {
      session.status = "finalized";
      await session.save();
      return res.status(403).json({ message: "Session Finalized: Cannot submit after class ends." });
    }

    session.status = "submitted";
    await session.save();

    await session.populate("classId");
    return res.status(200).json({ message: "Attendance submitted successfully.", session });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/attendance/reopen/:sessionId
const reopenSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await AttendanceSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    // Only allow reopening if submitted
    if (session.status !== "submitted") {
      return res.status(400).json({ message: "Only submitted sessions can be reopened." });
    }

    const classDoc = await Class.findById(session.classId);
    const schedule = checkScheduleState(classDoc);
    if (!schedule.ok) {
      if (schedule.message.includes("Ended")) {
        session.status = "finalized";
        await session.save();
      }
      return res.status(403).json({ message: "Cannot reopen: Class time has ended." });
    }

    session.status = "inProgress";
    await session.save();
    await session.populate("classId");

    return res.status(200).json({ message: "Session reopened for editing.", session });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /api/attendance/session/:sessionId
const discardSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await AttendanceSession.findById(sessionId);

    if (!session) return res.status(404).json({ message: "Session not found" });
    if (session.teacherId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Only allow discarding sessions that are not finalized
    if (session.status === "finalized") {
      return res.status(400).json({ message: "Finalized sessions cannot be terminated." });
    }

    // HARD DELETE: Remove session and cascading records
    await AttendanceSession.findByIdAndDelete(sessionId);
    await AttendanceRecord.deleteMany({ sessionId });

    return res.status(200).json({ message: "Session terminated and all records deleted." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/attendance/today/:classId?
const getTodaySession = async (req, res) => {
  try {
    const { classId } = req.params;
    const dateStr = getDateString();

    if (classId) {
      const session = await AttendanceSession.findOne({
        classId,
        dateString: dateStr
      });
      return res.status(200).json({ session });
    } else {
      // Bulk fetch for all classes today for this teacher
      const sessions = await AttendanceSession.find({
        teacherId: req.user.userId,
        dateString: dateStr
      }).populate("classId", "name icon status");
      return res.status(200).json({ sessions });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};



// GET /api/attendance/session/:sessionId/records
const getSessionRecords = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await AttendanceSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const records = await AttendanceRecord.find({ sessionId })
      .populate("studentId", "name email role")
      .sort({ studentId: 1 });

    const populatedRecords = await Promise.all(records.map(async (record) => {
      const profile = await StudentProfile.findOne({ userId: record.studentId._id });
      return {
        ...record.toObject(),
        studentName: profile?.name || "Unknown Student",
        avatar: profile?.avatar || null
      };
    }));

    return res.status(200).json({ records: populatedRecords, session });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};



module.exports = {
  startSession,
  markAttendance,
  endSession,
  getSessionRecords,
  submitSession,
  reopenSession,
  discardSession,
  getTodaySession
};
