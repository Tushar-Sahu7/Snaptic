const Class = require("../models/Class");
const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const TeacherProfile = require("../models/TeacherProfile");

// POST /api/classes
const createClass = async (req, res) => {
  try {
    const { name, schedule, icon } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Class name is required" });
    }

    const newClass = await Class.create({
      name,
      icon: icon || "BookOpen",
      schedule: schedule || {},
      teacherId: req.user.userId,
    });

    return res.status(201).json({ class: newClass });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/classes
const getMyClasses = async (req, res) => {
  try {
    const isStudent = req.user.role === "student";
    const filter = isStudent
      ? { studentIds: req.user.userId, deletedAt: null }
      : { teacherId: req.user.userId, deletedAt: null };

    const classes = await Class.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    let teacherProfilesMap = {};
    if (isStudent) {
      const teacherIds = classes.map((c) => c.teacherId);
      const teacherProfiles = await TeacherProfile.find({ userId: { $in: teacherIds } })
        .select("userId name avatar")
        .lean();

      teacherProfiles.forEach((tp) => {
        teacherProfilesMap[tp.userId.toString()] = tp;
      });
    }

    const result = classes.map((c) => ({
      ...c,
      studentCount: c.studentIds.length,
      teacher: teacherProfilesMap[c.teacherId.toString()] || null,
    }));

    return res.status(200).json({ classes: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/classes/:id
const getClassById = async (req, res) => {
  try {
    const classDoc = await Class.findOne({ 
      _id: req.params.id, 
      deletedAt: null 
    }).lean();

    if (!classDoc) {
      return res.status(404).json({ message: "Class not found" });
    }

    const isAuthorized = 
      classDoc.teacherId.toString() === req.user.userId ||
      (req.user.role === "student" && classDoc.studentIds.map(id => id.toString()).includes(req.user.userId));

    if (!isAuthorized) {
      return res.status(403).json({ message: "Not authorized to view this class" });
    }

    // Populate student details from StudentProfile
    const studentProfiles = await StudentProfile.find({
      userId: { $in: classDoc.studentIds },
    })
      .select("userId name faceEnrolled avatar")
      .lean();

    const students = studentProfiles.map((sp) => ({
      _id: sp.userId,
      name: sp.name,
      avatar: sp.avatar,
      faceEnrolled: sp.faceEnrolled,
    }));

    return res.status(200).json({
      class: {
        ...classDoc,
        students,
        studentCount: students.length,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/classes/:id
const updateClass = async (req, res) => {
  try {
    const { name, schedule, icon, status } = req.body;

    const classDoc = await Class.findById(req.params.id);

    if (!classDoc) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (classDoc.teacherId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to update this class" });
    }

    if (name !== undefined) classDoc.name = name;
    if (schedule !== undefined) classDoc.schedule = schedule;
    if (icon !== undefined) classDoc.icon = icon;
    if (status !== undefined) classDoc.status = status;

    await classDoc.save();

    return res.status(200).json({ class: classDoc });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /api/classes/:id
const deleteClass = async (req, res) => {
  try {
    const classDoc = await Class.findById(req.params.id);

    if (!classDoc) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (classDoc.teacherId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to delete this class" });
    }

    classDoc.deletedAt = new Date();
    await classDoc.save();

    return res.status(200).json({ message: "Class deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/classes/:id/students
const addStudent = async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    const classDoc = await Class.findById(req.params.id);

    if (!classDoc) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (classDoc.teacherId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to modify this class" });
    }

    // Verify the user exists and is a student
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(400).json({ message: "Invalid student" });
    }

    // Check for duplicate
    if (classDoc.studentIds.map((id) => id.toString()).includes(studentId)) {
      return res.status(400).json({ message: "Student already in this class" });
    }

    await Class.findByIdAndUpdate(req.params.id, {
      $addToSet: { studentIds: studentId },
    });

    return res.status(200).json({ message: "Student added successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /api/classes/:id/students/:studentId
const removeStudent = async (req, res) => {
  try {
    const classDoc = await Class.findById(req.params.id);

    if (!classDoc) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (classDoc.teacherId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to modify this class" });
    }

    await Class.findByIdAndUpdate(req.params.id, {
      $pull: { studentIds: req.params.studentId },
    });

    return res.status(200).json({ message: "Student removed successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /api/classes/:id/students/bulk
const removeStudents = async (req, res) => {
  try {
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ message: "studentIds array is required" });
    }

    const classDoc = await Class.findById(req.params.id);

    if (!classDoc) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (classDoc.teacherId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to modify this class" });
    }

    await Class.findByIdAndUpdate(req.params.id, {
      $pull: { studentIds: { $in: studentIds } },
    });

    return res.status(200).json({ message: "Students removed successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


// GET /api/students/search?q=
const searchStudents = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 1) {
      return res.status(200).json({ students: [] });
    }

    const regex = new RegExp(q.trim(), "i");

    const profiles = await StudentProfile.find({
      name: regex,
    })
      .select("userId name faceEnrolled avatar")
      .limit(20)
      .lean();

    const students = profiles.map((sp) => ({
      _id: sp.userId,
      name: sp.name,
      avatar: sp.avatar,
      faceEnrolled: sp.faceEnrolled,
    }));

    return res.status(200).json({ students });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/classes/bulk/status
const bulkUpdateStatus = async (req, res) => {
  try {
    const { classIds, status } = req.body;

    if (!classIds || !Array.isArray(classIds)) {
      return res.status(400).json({ message: "classIds array is required" });
    }

    if (!["active", "archived"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Update only classes owned by this teacher
    await Class.updateMany(
      { _id: { $in: classIds }, teacherId: req.user.userId },
      { $set: { status } },
    );

    return res.status(200).json({ message: "Classes updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /api/classes/bulk
const bulkDeleteClasses = async (req, res) => {
  try {
    const { classIds } = req.body;

    if (!classIds || !Array.isArray(classIds)) {
      return res.status(400).json({ message: "classIds array is required" });
    }

    // Delete only classes owned by this teacher
    await Class.updateMany(
      { _id: { $in: classIds }, teacherId: req.user.userId },
      { $set: { deletedAt: new Date() } }
    );

    return res.status(200).json({ message: "Classes deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/classes/bulk/restore
const restoreClasses = async (req, res) => {
  try {
    const { classIds } = req.body;

    if (!classIds || !Array.isArray(classIds)) {
      return res.status(400).json({ message: "classIds array is required" });
    }

    await Class.updateMany(
      { _id: { $in: classIds }, teacherId: req.user.userId },
      { $set: { deletedAt: null } }
    );

    return res.status(200).json({ message: "Classes restored successfully" });
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
  addStudent,
  removeStudent,
  removeStudents,
  searchStudents,
  bulkUpdateStatus,
  bulkDeleteClasses,
  restoreClasses,
};
