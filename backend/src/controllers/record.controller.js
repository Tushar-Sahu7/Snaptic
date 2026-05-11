const AttendanceRecord = require("../models/AttendanceRecord");
const AttendanceSession = require("../models/AttendanceSession");
const Enrollment = require("../models/Enrollment");
const Class = require("../models/Class");
const StudentProfile = require("../models/StudentProfile");

/**
 * GET /api/records/class/:classId
 * Returns a summary record for a specific class.
 */
const getClassRecord = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user.userId;

    // 1. Verify ownership
    const classDoc = await Class.findOne({ _id: classId, teacherId, deletedAt: null });
    if (!classDoc) return res.status(404).json({ message: "Class not found" });

    // 2. Aggregate session stats
    const sessions = await AttendanceSession.find({ classId, status: "finalized" });
    const totalSessions = sessions.length;

    // 3. Aggregate record stats
    const records = await AttendanceRecord.find({ classId });
    const totalPresent = records.filter(r => r.status === "present").length;
    const totalAbsent = records.filter(r => r.status === "absent").length;
    
    const attendancePercentage = totalSessions > 0 
      ? (totalPresent / (totalPresent + totalAbsent)) * 100 
      : 0;

    // 4. Student-specific breakdowns
    const enrollments = await Enrollment.find({ classId, status: "active" }).populate("studentId", "name email");
    
    const studentBreakdown = await Promise.all(enrollments.map(async (e) => {
      const studentRecords = records.filter(r => r.studentId.toString() === e.studentId._id.toString());
      const presentCount = studentRecords.filter(r => r.status === "present").length;
      const totalCount = studentRecords.length;
      
      const profile = await StudentProfile.findOne({ userId: e.studentId._id });

      return {
        studentId: e.studentId._id,
        name: profile?.name || e.studentId.name,
        email: e.studentId.email,
        presentCount,
        absentCount: totalCount - presentCount,
        percentage: totalCount > 0 ? (presentCount / totalCount) * 100 : 0
      };
    }));

    return res.status(200).json({
      summary: {
        totalSessions,
        attendancePercentage,
        totalPresent,
        totalAbsent
      },
      students: studentBreakdown.sort((a, b) => b.percentage - a.percentage)
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/records/student/history
 * Returns the attendance history for the logged-in student.
 */
const getStudentHistory = async (req, res) => {
  try {
    const studentId = req.user.userId;

    const records = await AttendanceRecord.find({ studentId })
      .populate("sessionId", "date startTime status")
      .populate("classId", "name icon color")
      .sort({ createdAt: -1 });

    const formattedHistory = records.map(r => ({
      recordId: r._id,
      class: {
        id: r.classId._id,
        name: r.classId.name,
        icon: r.classId.icon,
        color: r.classId.color
      },
      session: {
        date: r.sessionId.date,
        startTime: r.sessionId.startTime,
        status: r.sessionId.status
      },
      status: r.status,
      markingMethod: r.method,
      markedAt: r.markedAt
    }));

    return res.status(200).json({ history: formattedHistory });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/records/class/:classId/student
 * Returns the attendance history for the logged-in student in a specific class.
 */
const getStudentClassRecord = async (req, res) => {
  try {
    const { classId } = req.params;
    const studentId = req.user.userId;

    const records = await AttendanceRecord.find({ classId, studentId })
      .populate("sessionId", "date startTime endTime status updatedAt")
      .sort({ createdAt: -1 });

    const totalSessions = records.length;
    const presentCount = records.filter(r => r.status === "present").length;
    const absentCount = records.filter(r => r.status === "absent").length;
    const attendancePercentage = totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0;

    const formattedHistory = records.map(r => ({
      recordId: r._id,
      session: {
        id: r.sessionId._id,
        date: r.sessionId.date,
        startTime: r.sessionId.startTime,
        endTime: r.sessionId.endTime,
        status: r.sessionId.status,
        updatedAt: r.sessionId.updatedAt
      },
      status: r.status,
      markingMethod: r.method,
      markedAt: r.markedAt
    }));

    return res.status(200).json({
      summary: {
        totalSessions,
        presentCount,
        absentCount,
        attendancePercentage
      },
      history: formattedHistory
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/records/session/:sessionId
 * Returns the record for a specific session.
 * For teacher: returns all student records.
 * For student: returns only their own record + teacher info.
 */
const getSessionRecord = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;

    const session = await AttendanceSession.findById(sessionId)
      .populate("classId", "name icon status color");
      
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (role === "teacher") {
      // Verify ownership
      if (session.teacherId.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }

      const records = await AttendanceRecord.find({ sessionId })
        .populate("studentId", "name email")
        .sort({ studentId: 1 });

      const populatedRecords = await Promise.all(records.map(async (record) => {
        const profile = await StudentProfile.findOne({ userId: record.studentId._id });
        return {
          recordId: record._id,
          studentId: record.studentId._id,
          studentName: profile?.name || record.studentId.name,
          email: record.studentId.email,
          avatar: profile?.avatar || null,
          status: record.status,
          markingMethod: record.method,
          markedAt: record.markedAt
        };
      }));

      return res.status(200).json({ session, records: populatedRecords });

    } else if (role === "student") {
      const record = await AttendanceRecord.findOne({ sessionId, studentId: userId });
      if (!record) return res.status(404).json({ message: "Record not found for this student" });

      const User = require("../models/User");
      const TeacherProfile = require("../models/TeacherProfile");
      
      const teacherUser = await User.findById(session.teacherId).select("name email");
      const teacherProfile = await TeacherProfile.findOne({ userId: session.teacherId });

      return res.status(200).json({
        session,
        record: {
          recordId: record._id,
          status: record.status,
          markingMethod: record.method,
          markedAt: record.markedAt
        },
        teacher: {
          name: teacherUser?.name,
          avatar: teacherProfile?.avatar || null
        }
      });
    } else {
      return res.status(403).json({ message: "Access denied" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/records/class/:classId/sessions
 * Returns all finalized sessions for a specific class
 */
const getClassSessions = async (req, res) => {
  try {
    const { classId } = req.params;
    const userId = req.user.userId;

    // Verify ownership
    const classDoc = await Class.findOne({ _id: classId, teacherId: userId, deletedAt: null });
    if (!classDoc) return res.status(404).json({ message: "Class not found" });

    const sessions = await AttendanceSession.find({ classId, status: { $in: ["finalized", "submitted"] } })
      .sort({ date: -1, startTime: -1 });

    // For each session, we might want to get the quick stats (present/absent)
    const sessionsWithStats = await Promise.all(sessions.map(async (session) => {
      const records = await AttendanceRecord.find({ sessionId: session._id });
      const presentCount = records.filter(r => r.status === "present").length;
      const totalCount = records.length;
      return {
        ...session.toObject(),
        stats: {
          present: presentCount,
          absent: totalCount - presentCount,
          total: totalCount
        }
      };
    }));

    return res.status(200).json({ sessions: sessionsWithStats });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getClassRecord,
  getStudentHistory,
  getStudentClassRecord,
  getSessionRecord,
  getClassSessions
};
