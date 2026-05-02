const AttendanceSession = require("../models/AttendanceSession");
const AttendanceRecord = require("../models/AttendanceRecord");
const Class = require("../models/Class");
const StudentProfile = require("../models/StudentProfile");

// --- CONTROLLERS ---

const mongoose = require("mongoose");

// POST /api/attendance/start/:classId
const startSession = async (req, res) => {
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    const { classId } = req.params;
    const teacherId = req.user.userId;
    const now = new Date();

    // 1. Find the session scheduled for today
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const session = await AttendanceSession.findOne({
      classId,
      teacherId,
      startTime: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["scheduled", "inprogress", "submitted"] }
    }).session(dbSession);


    if (!session) {
      await dbSession.abortTransaction();
      dbSession.endSession();
      return res.status(404).json({ message: "No active session found for this time." });
    }

    // 2. Transition to inprogress if it was scheduled
    if (session.status === "scheduled") {
      session.status = "inprogress";
      await session.save({ session: dbSession });
    }

    // 3. Pre-create absent records if they don't exist
    const Enrollment = require("../models/Enrollment");
    const enrollments = await Enrollment.find({ classId, status: "active" }).session(dbSession).lean();
    const enrolledStudentIds = enrollments.map(e => e.studentId);

    const existingRecordsCount = await AttendanceRecord.countDocuments({ sessionId: session._id }).session(dbSession);

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
      await AttendanceRecord.insertMany(records, { session: dbSession });
    }

    // 4. Return session + profiles for scanner
    const profiles = await StudentProfile.find({
      userId: { $in: enrolledStudentIds }
    }).select("userId name avatar embedding faceEnrolled").session(dbSession).lean();

    const records = await AttendanceRecord.find({ sessionId: session._id }).session(dbSession).lean();

    await dbSession.commitTransaction();
    dbSession.endSession();

    return res.status(200).json({
      session,
      profiles,
      records
    });

  } catch (err) {
    await dbSession.abortTransaction();
    dbSession.endSession();
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

    // 2. Mark logic
    const updateData = { status, method };

    // If marking as present, set markedAt
    if (status === "present") {
      updateData.markedAt = new Date();
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

// DELETE /api/attendance/session/:sessionId/reset
const resetSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await AttendanceSession.findById(sessionId);

    if (!session) return res.status(404).json({ message: "Session not found" });
    if (session.teacherId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

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
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const query = {
      startTime: { $gte: startOfDay, $lte: endOfDay }
    };

    if (classId) {
      query.classId = classId;
      const session = await AttendanceSession.findOne(query);
      return res.status(200).json({ session });
    } else {
      query.teacherId = req.user.userId;
      // Bulk fetch for all classes today for this teacher
      const sessions = await AttendanceSession.find(query)
        .populate("classId", "name icon status");
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
  resetSession,
  getTodaySession
};
