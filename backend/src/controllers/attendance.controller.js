const AttendanceSession = require("../models/AttendanceSession");
const AttendanceRecord = require("../models/AttendanceRecord");
const Class = require("../models/Class");
const StudentProfile = require("../models/StudentProfile");

const TemporalService = require("../services/temporalService");

// --- HELPERS ---

/**
 * Checks if a session is currently within its attendance window.
 */
const checkSessionWindow = (session) => {
  if (!session.attendanceWindow || !session.attendanceWindow.opensAt) {
    return { ok: true }; // Fallback for legacy data or manual sessions
  }

  const isStarted = TemporalService.isPast(session.attendanceWindow.opensAt);
  const isEnded = TemporalService.isPast(session.attendanceWindow.closesAt);

  if (!isStarted) {
    return { ok: false, message: "Attendance window hasn't opened yet." };
  }

  if (isEnded) {
    return { ok: false, message: "Attendance window has closed." };
  }

  return { ok: true };
};

// --- CONTROLLERS ---

// POST /api/attendance/start/:classId
const startSession = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user.userId;
    const now = TemporalService.getNowInstant();

    // 1. Find the session that covers "now"
    // Our collision detection ensures only one session exists per time block
    const session = await AttendanceSession.findOne({
      classId,
      teacherId,
      startInstant: { $lte: now },
      endInstant: { $gte: now },
      status: { $in: ["scheduled", "inprogress", "submitted"] }
    });

    if (!session) {
      return res.status(404).json({ message: "No active session found for this time." });
    }

    // 2. Transition to inprogress if it was scheduled
    if (session.status === "scheduled") {
      session.status = "inprogress";
      await session.save();
    }

    // 3. Pre-create absent records if they don't exist
    // Get all enrolled students for this class
    const Enrollment = require("../models/Enrollment");
    const enrollments = await Enrollment.find({ classId, status: "active" }).lean();
    const enrolledStudentIds = enrollments.map(e => e.studentId);

    const existingRecordsCount = await AttendanceRecord.countDocuments({ sessionId: session._id });
    
    if (existingRecordsCount === 0 && enrolledStudentIds.length > 0) {
      const records = enrolledStudentIds.map(studentId => ({
        sessionId: session._id,
        studentId,
        classId,
        teacherId,
        status: "absent",
        method: "manual",
        createdAt: now
      }));
      await AttendanceRecord.insertMany(records);
    }

    // 4. Return session + profiles for scanner
    const profiles = await StudentProfile.find({
      userId: { $in: enrolledStudentIds }
    }).select("userId name avatar embedding faceEnrolled").lean();

    const records = await AttendanceRecord.find({ sessionId: session._id }).lean();

    return res.status(200).json({
      session,
      profiles,
      records
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/attendance/mark
const markAttendance = async (req, res) => {
  try {
    const { sessionId, studentId, status, method } = req.body;

    const session = await AttendanceSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    // 1. Lifecycle Check
    if (session.status === "finalized" || session.status === "missed") {
      return res.status(403).json({ message: `Session is ${session.status} and cannot be modified.` });
    }

    // 2. Window Check
    const window = checkSessionWindow(session);
    if (!window.ok) {
      return res.status(403).json({ message: window.message });
    }

    // 3. Mark logic
    const updateData = { status, method };
    
    // If marking as present, set markedAt
    if (status === "present") {
      updateData.markedAt = TemporalService.getNowInstant();
    } else {
      updateData.markedAt = null;
    }

    const record = await AttendanceRecord.findOneAndUpdate(
      { sessionId, studentId },
      updateData,
      { new: true }
    );

    if (!record) return res.status(404).json({ message: "Record not found for this student." });

    return res.status(200).json({ record });
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

    // Can only submit if inprogress
    if (session.status !== "inprogress") {
      return res.status(400).json({ message: "Only sessions in progress can be submitted." });
    }

    session.status = "submitted";
    await session.save();

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

    // Only allow reopening if submitted and not finalized
    if (session.status !== "submitted") {
      return res.status(400).json({ message: "Only submitted sessions can be reopened." });
    }

    session.status = "inprogress";
    await session.save();

    return res.status(200).json({ message: "Session reopened for editing.", session });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /api/attendance/session/:sessionId/reset
const resetSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await AttendanceSession.findById(sessionId);

    if (!session) return res.status(404).json({ message: "Session not found" });
    if (session.teacherId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Reset logic: Hard delete records and move back to scheduled
    // This allows a fresh start if the scan was corrupted or accidental
    await AttendanceRecord.deleteMany({ sessionId });
    
    session.status = "scheduled";
    await session.save();

    return res.status(200).json({ 
      message: "Session reset. All records deleted.",
      status: "scheduled"
    });
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
  getSessionRecords,
  submitSession,
  reopenSession,
  resetSession,
  getTodaySession
};
