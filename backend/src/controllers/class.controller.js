const Class = require("../models/Class");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const Label = require("../models/Label");
const TeacherProfile = require("../models/TeacherProfile");
const StudentProfile = require("../models/StudentProfile");
const sessionManager = require("../services/sessionManager");
const { Temporal } = require("@js-temporal/polyfill");

const TemporalService = require("../services/temporalService");

// Helper: Just-In-Time Archiving
const ensureArchivedIfExpired = async (classDoc) => {
  if (classDoc.status === "archived") return classDoc;
  
  const today = TemporalService.getNowDate();
  if (classDoc.endDate < today) {
    classDoc.status = "archived";
    await Class.findByIdAndUpdate(classDoc._id, { status: "archived" });
  }
  return classDoc;
};

// POST /api/classes
const createClass = async (req, res) => {
  try {
    const { name, description, icon, color, timezone, startDate, endDate, schedules } = req.body;
    const teacherId = req.user.userId;

    if (!name || !startDate || !endDate || !timezone) {
      return res.status(400).json({ message: "Name, Start Date, End Date, and Timezone are required" });
    }

    // 1. Create the Class document
    const newClass = await Class.create({
      name,
      description,
      icon: icon || "BookOpen",
      color: color || "oklch(0.6 0.1 200)",
      timezone,
      startDate,
      endDate,
      teacherId,
      schedules: schedules || [],
    });

    // 2. Generate sessions
    try {
      if (newClass.schedules.length > 0) {
        for (const schedule of newClass.schedules) {
          await sessionManager.generateSessionsForSchedule(newClass, schedule);
        }
      }
    } catch (sessionErr) {
      await Class.findByIdAndDelete(newClass._id);
      return res.status(400).json({ message: sessionErr.message });
    }

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
      // Find classes through Enrollments
      const enrollments = await Enrollment.find({ studentId: req.user.userId, status: "active" })
        .populate({
          path: "classId",
          match: { deletedAt: null }
        })
        .lean();
      
      classes = enrollments
        .filter(e => e.classId) // Filter out deleted classes
        .map(e => e.classId);
    } else {
      // Teacher owns classes
      classes = await Class.find({ teacherId, deletedAt: null })
        .sort({ createdAt: -1 })
        .lean();
    }

    // Add student counts and teacher info, and run JIT archiving
    const result = await Promise.all(classes.map(async (c) => {
      // Run JIT check
      await ensureArchivedIfExpired(c);

      const studentCount = await Enrollment.countDocuments({ classId: c._id, status: "active" });
      
      let teacherInfo = null;
      if (isStudent) {
        teacherInfo = await TeacherProfile.findOne({ userId: c.teacherId }).select("name avatar").lean();
      }

      return {
        ...c,
        studentCount,
        teacher: teacherInfo
      };
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

    // Run JIT check
    await ensureArchivedIfExpired(classDoc);

    // Authorization check
    if (classDoc.teacherId.toString() !== req.user.userId) {
      const isEnrolled = await Enrollment.exists({ classId: classDoc._id, studentId: req.user.userId, status: "active" });
      if (!isEnrolled) return res.status(403).json({ message: "Access denied" });
    }

    // Fetch enrolled students
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
        studentCount: students.filter(s => s.status === "active").length
      } 
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/classes/:id
const updateClass = async (req, res) => {
  try {
    const { name, description, icon, color, endDate, schedules, status } = req.body;
    const classDoc = await Class.findById(req.params.id);

    if (!classDoc || classDoc.deletedAt) return res.status(404).json({ message: "Class not found" });
    if (classDoc.teacherId.toString() !== req.user.userId) return res.status(403).json({ message: "Unauthorized" });

    // 1. Handle Unarchiving
    if (endDate) {
      const today = TemporalService.getNowDate();
      if (endDate > today && classDoc.status === "archived") {
        classDoc.status = "active";
      }
      classDoc.endDate = endDate;
    }

    // 2. Simple updates
    if (name) classDoc.name = name;
    if (description !== undefined) classDoc.description = description;
    if (icon) classDoc.icon = icon;
    if (color) classDoc.color = color;
    if (status) classDoc.status = status;

    // Timezone lock check
    if (req.body.timezone && req.body.timezone !== classDoc.timezone) {
      const today = TemporalService.getNowDate();
      if (classDoc.startDate <= today) {
        return res.status(400).json({ message: "Timezone is locked once the class has started" });
      }
      classDoc.timezone = req.body.timezone;
    }

    // 3. Handle Schedule Updates
    if (schedules) {
      // Rule: Purge future sessions for removed schedules
      const oldScheduleIds = classDoc.schedules.map(s => s._id.toString());
      const newScheduleIds = (schedules || []).map(s => s._id?.toString()).filter(Boolean);

      const toDelete = oldScheduleIds.filter(id => !newScheduleIds.includes(id));
      for (const sid of toDelete) {
        await sessionManager.purgeFutureSessions(sid);
      }

      classDoc.schedules = schedules;
    }

    await classDoc.save();

    // 4. Regenerate future sessions
    if (schedules) {
      for (const schedule of classDoc.schedules) {
        await sessionManager.generateSessionsForSchedule(classDoc, schedule);
      }
    }

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

    // Purge future sessions for all schedules in this class
    for (const schedule of classDoc.schedules) {
      await sessionManager.purgeFutureSessions(schedule._id);
    }

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
    if (endDate) {
      updateData.endDate = endDate;
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
      { deletedAt: Temporal.Now.instant().toString() }
    );

    return res.status(200).json({ message: `Deleted ${classIds.length} classes` });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/classes/bulk/restore
const restoreClasses = async (req, res) => {
  try {
    const { classIds } = req.body;
    if (!classIds || !Array.isArray(classIds)) {
      return res.status(400).json({ message: "classIds must be an array" });
    }

    await Class.updateMany(
      { _id: { $in: classIds }, teacherId: req.user.userId },
      { deletedAt: null }
    );

    return res.status(200).json({ message: `Restored ${classIds.length} classes` });
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

    // Check if student exists
    const student = await User.findOne({ _id: studentId, role: "student" });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Create enrollment
    await Enrollment.findOneAndUpdate(
      { classId, studentId },
      { teacherId: req.user.userId, status: "active" },
      { upsert: true, new: true }
    );

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

    // Soft remove
    enrollment.status = "inactive";
    await enrollment.save();

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
    
    const newEnrollments = sourceEnrollments.map(e => ({
      studentId: e.studentId,
      classId: toClassId,
      teacherId: req.user.userId,
      status: "active"
    }));

    // Use bulkWrite or simple loop with upsert to avoid duplicates
    for (const enr of newEnrollments) {
      await Enrollment.findOneAndUpdate(
        { classId: toClassId, studentId: enr.studentId },
        enr,
        { upsert: true }
      );
    }

    return res.status(200).json({ message: `Imported ${newEnrollments.length} students` });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/classes/students/search
const searchStudents = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(200).json({ students: [] });

    // 1. Search Users by email
    const usersByEmail = await User.find({
      email: { $regex: q, $options: "i" },
      role: "student"
    }).select("_id email").limit(10).lean();

    // 2. Search Profiles by name
    const profilesByName = await StudentProfile.find({
      name: { $regex: q, $options: "i" }
    }).select("userId name avatar").limit(10).lean();

    // 3. Combine results
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
        // Find the user email for this profile
        const user = await User.findById(p.userId).select("email").lean();
        studentMap.set(idStr, { id: p.userId, email: user?.email, name: p.name, avatar: p.avatar });
      }
    }

    // 4. Ensure all have names (fetch if missing from email-only results)
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

// --- LABEL LOGIC ---

// GET /api/labels
const getLabels = async (req, res) => {
  try {
    const labels = await Label.find({ teacherId: req.user.userId, isActive: true });
    return res.status(200).json({ labels });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/labels
const createLabel = async (req, res) => {
  try {
    const { name, color } = req.body;
    const label = await Label.create({ name, color, teacherId: req.user.userId });
    return res.status(201).json({ label });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /api/labels/:id
const deleteLabel = async (req, res) => {
  try {
    const { replacementLabelId } = req.body;
    const labelId = req.params.id;

    // 1. Check if in use
    const classesUsing = await Class.find({ "schedules.labelId": labelId });
    
    if (classesUsing.length > 0) {
      if (!replacementLabelId) {
        return res.status(400).json({ 
          message: "Label is in use. Please provide a replacement label ID.",
          affectedClasses: classesUsing.map(c => ({ id: c._id, name: c.name }))
        });
      }

      // 2. Global Migration
      for (const classDoc of classesUsing) {
        classDoc.schedules.forEach(s => {
          if (s.labelId.toString() === labelId) {
            s.labelId = replacementLabelId;
          }
        });
        await classDoc.save();
      }
    }

    // 3. Soft Delete the label
    await Label.findByIdAndUpdate(labelId, { isActive: false });
    
    return res.status(200).json({ message: "Label deleted and schedules migrated." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const AvailabilityService = require("../services/availabilityService");

// GET /api/classes/availability
const getAvailability = async (req, res) => {
  try {
    const { date, duration, timezone } = req.query;
    if (!date || !duration || !timezone) {
      return res.status(400).json({ message: "Date, duration, and timezone are required" });
    }

    const slots = await AvailabilityService.getAvailableSlots(
      req.user.userId,
      date,
      parseInt(duration),
      timezone
    );

    return res.status(200).json({ slots });
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
  restoreClasses,
  addStudent,
  removeStudent,
  importStudents,
  searchStudents,
  getLabels,
  createLabel,
  deleteLabel,
  getAvailability,
};
