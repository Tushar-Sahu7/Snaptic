const Class = require("../models/Class");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const TeacherProfile = require("../models/TeacherProfile");
const StudentProfile = require("../models/StudentProfile");
const sessionManager = require("../services/sessionManager");
const { formatIST, getNowIST } = require("../utils/dateUtils");
const { RRule } = require("rrule");

// Helper: Just-In-Time Archiving
const ensureArchivedIfExpired = async (classDoc) => {
  if (classDoc.status === "archived") return classDoc;
  
  const endDate = classDoc.schedule?.endDate;
  const today = formatIST(new Date(), "yyyy-MM-dd");
  
  if (endDate && endDate < today) {
    classDoc.status = "archived";
    await Class.findByIdAndUpdate(classDoc._id, { status: "archived" });
  }
  return classDoc;
};

// POST /api/classes
const createClass = async (req, res) => {
  try {
    const { name, description, icon, color, schedule, location } = req.body;
    const teacherId = req.user.userId;

    if (!name || (!schedule?.rrule && !req.body.startDate)) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Validation: Prevent scheduling in the past
    if (schedule?.rrule) {
      const rule = RRule.fromString(schedule.rrule);
      const now = new Date(); // Use absolute UTC comparison
      if (rule.options.dtstart < now) {
        return res.status(400).json({ message: "Start time cannot be in the past" });
      }
    }

    const newClass = await Class.create({
      name,
      description,
      icon: icon || "BookOpen",
      color: color || "oklch(0.6 0.2 250)",
      schedule, 
      location,
      teacherId,
    });

    // Generate sessions using RRULE logic
    await sessionManager.syncClassSessions(newClass);

    return res.status(201).json({ class: newClass });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/classes
const getMyClasses = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const isStudent = req.user.role === "student";

    let classes;
    if (isStudent) {
      const enrollments = await Enrollment.find({ studentId: req.user.userId, status: "active" })
        .populate({
          path: "classId",
          match: { deletedAt: null }
        })
        .lean();
      
      classes = enrollments
        .filter(e => e.classId)
        .map(e => e.classId);
    } else {
      classes = await Class.find({ teacherId, deletedAt: null })
        .sort({ createdAt: -1 })
        .lean();
    }

    const studentCounts = await Enrollment.aggregate([
      { 
        $match: { 
          classId: { $in: classes.map(c => c._id) }, 
          status: "active" 
        } 
      },
      { $group: { _id: "$classId", count: { $sum: 1 } } }
    ]);

    const countMap = Object.fromEntries(
      studentCounts.map(item => [item._id.toString(), item.count])
    );

    const result = await Promise.all(classes.map(async (c) => {
      await ensureArchivedIfExpired(c);
      const studentCount = countMap[c._id.toString()] || 0;
      
      let teacherInfo = null;
      if (isStudent) {
        teacherInfo = await TeacherProfile.findOne({ userId: c.teacherId }).select("name avatar").lean();
      }

      // Fetch preview students
      const previewEnrollments = await Enrollment.find({ classId: c._id, status: "active" })
        .limit(3)
        .populate("studentId", "email")
        .lean();
        
      const previewStudents = await Promise.all(previewEnrollments.map(async (e) => {
        const profile = await StudentProfile.findOne({ userId: e.studentId?._id }).select("name avatar").lean();
        return {
          _id: e.studentId?._id,
          name: profile?.name || e.studentId?.email?.split('@')[0] || "Unknown Student",
          avatar: profile?.avatar || null,
        };
      }));

      return { ...c, studentCount, teacher: teacherInfo, previewStudents };
    }));

    return res.status(200).json({ classes: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/classes/:id
const getClassById = async (req, res) => {
  try {
    const classDoc = await Class.findOne({ _id: req.params.id, deletedAt: null }).lean();
    if (!classDoc) return res.status(404).json({ message: "Class not found" });

    await ensureArchivedIfExpired(classDoc);

    if (classDoc.teacherId.toString() !== req.user.userId) {
      const isEnrolled = await Enrollment.exists({ classId: classDoc._id, studentId: req.user.userId, status: "active" });
      if (!isEnrolled) return res.status(403).json({ message: "Access denied" });
    }

    const enrollments = await Enrollment.find({ classId: classDoc._id })
      .populate("studentId", "name email avatar")
      .lean();

    const students = await Promise.all(enrollments.map(async (e) => {
      const profile = await StudentProfile.findOne({ userId: e.studentId?._id }).select("name avatar faceEnrolled").lean();
      return {
        _id: e.studentId?._id,
        email: e.studentId?.email,
        name: profile?.name || "Unknown Student",
        avatar: profile?.avatar || null,
        faceEnrolled: profile?.faceEnrolled || false,
        enrollmentId: e._id,
        status: e.status,
        enrolledAt: e.enrolledAt
      };
    }));

    return res.status(200).json({ 
      class: {
        ...classDoc,
        students,
        studentCount: students.filter(s => s.status === "active").length
      } 
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const updateClass = async (req, res) => {
  try {
    const { name, description, icon, color, schedule, location, status } = req.body;
    const classDoc = await Class.findById(req.params.id);

    if (!classDoc || classDoc.deletedAt) return res.status(404).json({ message: "Class not found" });
    if (classDoc.teacherId.toString() !== req.user.userId) return res.status(403).json({ message: "Unauthorized" });

    if (name) classDoc.name = name;
    if (description !== undefined) classDoc.description = description;
    if (icon) classDoc.icon = icon;
    if (color) classDoc.color = color;
    if (status) classDoc.status = status;
    if (location !== undefined) classDoc.location = location;

    // Update schedule if provided
    if (schedule) {
      // Validation: Prevent scheduling in the past for new start dates
      if (schedule.rrule) {
        const rule = RRule.fromString(schedule.rrule);
        const now = new Date();
        if (rule.options.dtstart < now) {
          return res.status(400).json({ message: "Start time cannot be in the past" });
        }
      }
      classDoc.schedule = schedule;
    }

    await classDoc.save();

    // Regenerate future sessions using the updated schedule
    await sessionManager.syncClassSessions(classDoc);

    return res.status(200).json({ class: classDoc });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /api/classes/:id
const deleteClass = async (req, res) => {
  try {
    const classDoc = await Class.findById(req.params.id);
    if (!classDoc || classDoc.deletedAt) return res.status(404).json({ message: "Class not found" });
    if (classDoc.teacherId.toString() !== req.user.userId) return res.status(403).json({ message: "Unauthorized" });

    classDoc.deletedAt = new Date();
    await classDoc.save();

    await sessionManager.purgeFutureSessions(classDoc._id);

    return res.status(200).json({ message: "Class deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// --- ENROLLMENT LOGIC ---

// PUT /api/classes/bulk/status
const bulkUpdateStatus = async (req, res) => {
  try {
    const { classIds, status, endDate } = req.body;
    if (!classIds || !Array.isArray(classIds)) {
      return res.status(400).json({ message: "classIds must be an array" });
    }

    const updateData = { status };
    if (endDate && status === "archived") {
      // In bulk update, if we are archiving, we might want to update the schedule's end date
      // but usually bulk update just flips the status.
    }

    await Class.updateMany(
      { _id: { $in: classIds }, teacherId: req.user.userId },
      updateData
    );

    return res.status(200).json({ message: `Updated ${classIds.length} classes` });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /api/classes/bulk
const bulkDeleteClasses = async (req, res) => {
  try {
    const { classIds } = req.body;
    if (!classIds || !Array.isArray(classIds)) {
      return res.status(400).json({ message: "classIds must be an array" });
    }

    await Class.updateMany(
      { _id: { $in: classIds }, teacherId: req.user.userId },
      { deletedAt: new Date() }
    );

    for (const classId of classIds) {
      await sessionManager.purgeFutureSessions(classId);
    }

    return res.status(200).json({ message: `Deleted ${classIds.length} classes` });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


// POST /api/classes/:id/students
const addStudent = async (req, res) => {
  try {
    const { studentId, email } = req.body;
    const classId = req.params.id;

    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({ message: "Class not found" });
    if (classDoc.teacherId.toString() !== req.user.userId) return res.status(403).json({ message: "Unauthorized" });

    let query = { role: "student" };
    if (studentId) query._id = studentId;
    else if (email) query.email = email.toLowerCase();
    else return res.status(400).json({ message: "Student ID or Email required" });

    const student = await User.findOne(query);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const finalStudentId = student._id;

    const enrollment = await Enrollment.findOneAndUpdate(
      { classId, studentId: finalStudentId },
      { teacherId: req.user.userId, status: "active" },
      { upsert: true, new: false }
    );

    if (!enrollment || enrollment.status === "inactive") {
      await Class.findByIdAndUpdate(classId, { $inc: { studentCount: 1 } });
    }

    return res.status(200).json({ message: "Student enrolled successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /api/classes/:id/students/:studentId
const removeStudent = async (req, res) => {
  try {
    const { id: classId, studentId } = req.params;

    const enrollment = await Enrollment.findOne({ classId, studentId });
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

    if (enrollment.status === "active") {
      enrollment.status = "inactive";
      await enrollment.save();
      await Class.findByIdAndUpdate(classId, { $inc: { studentCount: -1 } });
    }

    return res.status(200).json({ message: "Student removed from class" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/classes/:id/enrollments/import
const importStudents = async (req, res) => {
  try {
    const { fromClassId } = req.body;
    const toClassId = req.params.id;

    const targetClass = await Class.findById(toClassId);
    if (!targetClass || targetClass.teacherId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const sourceEnrollments = await Enrollment.find({ classId: fromClassId, status: "active" });
    
    let addedCount = 0;
    for (const e of sourceEnrollments) {
      const existing = await Enrollment.findOneAndUpdate(
        { classId: toClassId, studentId: e.studentId },
        { studentId: e.studentId, classId: toClassId, teacherId: req.user.userId, status: "active" },
        { upsert: true, new: false }
      );
      if (!existing || existing.status === "inactive") {
        addedCount++;
      }
    }

    if (addedCount > 0) {
      await Class.findByIdAndUpdate(toClassId, { $inc: { studentCount: addedCount } });
    }

    return res.status(200).json({ message: `Imported ${sourceEnrollments.length} students` });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/classes/students/search
const searchStudents = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(200).json({ students: [] });

    const usersByEmail = await User.find({
      email: { $regex: q, $options: "i" },
      role: "student"
    }).select("_id email").limit(10).lean();

    const profilesByName = await StudentProfile.find({
      name: { $regex: q, $options: "i" }
    }).select("userId name avatar faceEnrolled").limit(10).lean();

    const studentMap = new Map();

    usersByEmail.forEach(u => {
      studentMap.set(u._id.toString(), { _id: u._id, email: u.email });
    });

    for (const p of profilesByName) {
      const idStr = p.userId.toString();
      if (studentMap.has(idStr)) {
        studentMap.get(idStr).name = p.name;
        studentMap.get(idStr).avatar = p.avatar;
        studentMap.get(idStr).faceEnrolled = p.faceEnrolled;
      } else {
        const user = await User.findById(p.userId).select("email").lean();
        studentMap.set(idStr, { _id: p.userId, email: user?.email, name: p.name, avatar: p.avatar, faceEnrolled: p.faceEnrolled });
      }
    }

    const results = await Promise.all(Array.from(studentMap.values()).map(async (s) => {
      if (!s.name) {
        const p = await StudentProfile.findOne({ userId: s._id }).select("name avatar faceEnrolled").lean();
        s.name = p?.name || "Unknown Student";
        s.avatar = p?.avatar || null;
        s.faceEnrolled = p?.faceEnrolled || false;
      }
      return s;
    }));

    return res.status(200).json({ students: results.slice(0, 10) });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createClass,
  getMyClasses,
  getClassById,
  updateClass,
  deleteClass,
  bulkUpdateStatus,
  bulkDeleteClasses,
  addStudent,
  removeStudent,
  importStudents,
  searchStudents,
};

