const Class = require("../models/Class");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const TeacherProfile = require("../models/TeacherProfile");
const StudentProfile = require("../models/StudentProfile");
const sessionManager = require("../services/sessionManager");

// Helper: Just-In-Time Archiving
const ensureArchivedIfExpired = async (classDoc) => {
  if (classDoc.status === "archived") return classDoc;
  
  const today = new Date().toISOString().split("T")[0];
  if (classDoc.endDate < today) {
    classDoc.status = "archived";
    await Class.findByIdAndUpdate(classDoc._id, { status: "archived" });
  }
  return classDoc;
};

// POST /api/classes
const createClass = async (req, res) => {
  try {
    const { name, description, icon, color, startDate, endDate, startTime, duration, daysOfWeek, location } = req.body;
    const teacherId = req.user.userId;

    if (!name || !startDate || !endDate || !startTime || !daysOfWeek) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const newClass = await Class.create({
      name,
      description,
      icon: icon || "BookOpen",
      color: color || "oklch(0.6 0.2 250)",
      startDate,
      endDate,
      startTime,
      duration: duration || 60,
      daysOfWeek: daysOfWeek || [],
      location,
      teacherId,
    });

    // Generate sessions
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

    const result = await Promise.all(classes.map(async (c) => {
      await ensureArchivedIfExpired(c);
      const studentCount = c.denormalized?.studentCount || 0;
      
      let teacherInfo = null;
      if (isStudent) {
        teacherInfo = await TeacherProfile.findOne({ userId: c.teacherId }).select("name avatar").lean();
      }

      return { ...c, studentCount, teacher: teacherInfo };
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

    const students = enrollments.map(e => ({
      ...e.studentId,
      enrollmentId: e._id,
      status: e.status,
      enrolledAt: e.enrolledAt
    }));

    return res.status(200).json({ 
      class: {
        ...classDoc,
        students,
        studentCount: classDoc.denormalized?.studentCount || 0
      } 
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/classes/:id
const updateClass = async (req, res) => {
  try {
    const { name, description, icon, color, startDate, endDate, startTime, duration, daysOfWeek, location, status } = req.body;
    const classDoc = await Class.findById(req.params.id);

    if (!classDoc || classDoc.deletedAt) return res.status(404).json({ message: "Class not found" });
    if (classDoc.teacherId.toString() !== req.user.userId) return res.status(403).json({ message: "Unauthorized" });

    if (name) classDoc.name = name;
    if (description !== undefined) classDoc.description = description;
    if (icon) classDoc.icon = icon;
    if (color) classDoc.color = color;
    if (status) classDoc.status = status;
    if (startDate) classDoc.startDate = startDate;
    if (endDate) classDoc.endDate = endDate;
    if (startTime) classDoc.startTime = startTime;
    if (duration) classDoc.duration = duration;
    if (daysOfWeek) classDoc.daysOfWeek = daysOfWeek;
    if (location !== undefined) classDoc.location = location;

    await classDoc.save();

    // Regenerate future sessions
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
    if (endDate) updateData.endDate = endDate;

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
    const { studentId } = req.body;
    const classId = req.params.id;

    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({ message: "Class not found" });
    if (classDoc.teacherId.toString() !== req.user.userId) return res.status(403).json({ message: "Unauthorized" });

    const student = await User.findOne({ _id: studentId, role: "student" });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const enrollment = await Enrollment.findOneAndUpdate(
      { classId, studentId },
      { teacherId: req.user.userId, status: "active" },
      { upsert: true, new: false }
    );

    if (!enrollment || enrollment.status === "inactive") {
      await Class.findByIdAndUpdate(classId, { $inc: { "denormalized.studentCount": 1 } });
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
      await Class.findByIdAndUpdate(classId, { $inc: { "denormalized.studentCount": -1 } });
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
      await Class.findByIdAndUpdate(toClassId, { $inc: { "denormalized.studentCount": addedCount } });
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
    }).select("userId name avatar").limit(10).lean();

    const studentMap = new Map();

    usersByEmail.forEach(u => {
      studentMap.set(u._id.toString(), { id: u._id, email: u.email });
    });

    for (const p of profilesByName) {
      const idStr = p.userId.toString();
      if (studentMap.has(idStr)) {
        studentMap.get(idStr).name = p.name;
        studentMap.get(idStr).avatar = p.avatar;
      } else {
        const user = await User.findById(p.userId).select("email").lean();
        studentMap.set(idStr, { id: p.userId, email: user?.email, name: p.name, avatar: p.avatar });
      }
    }

    const results = await Promise.all(Array.from(studentMap.values()).map(async (s) => {
      if (!s.name) {
        const p = await StudentProfile.findOne({ userId: s.id }).select("name avatar").lean();
        s.name = p?.name || "Unknown Student";
        s.avatar = p?.avatar || null;
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

