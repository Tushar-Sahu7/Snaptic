const AttendanceRecord = require("../models/AttendanceRecord");
const AttendanceSession = require("../models/AttendanceSession");
const Enrollment = require("../models/Enrollment");
const Class = require("../models/Class");
const StudentProfile = require("../models/StudentProfile");

/**
 * GET /api/reports/class/:classId
 * Returns a summary report for a specific class.
 */
const getClassReport = async (req, res) => {
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
 * GET /api/reports/student/history
 * Returns the attendance history for the logged-in student.
 */
const getStudentHistory = async (req, res) => {
  try {
    const studentId = req.user.userId;

    const records = await AttendanceRecord.find({ studentId })
      .populate("sessionId", "dateString startInstant status")
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
        dateString: r.sessionId.dateString,
        startInstant: r.sessionId.startInstant,
        status: r.sessionId.status
      },
      status: r.status,
      method: r.method,
      markedAt: r.markedAt
    }));

    return res.status(200).json({ history: formattedHistory });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getClassReport,
  getStudentHistory
};
