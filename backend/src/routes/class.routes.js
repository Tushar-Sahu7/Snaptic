const express = require("express");
const router = express.Router();
const {
  createClass,
  getMyClasses,
  getClassById,
  updateClass,
  deleteClass,
  addStudent,
  removeStudent,
  importStudents,
  searchStudents,
  bulkUpdateStatus,
  bulkDeleteClasses,
  restoreClasses,
  getLabels,
  createLabel,
  deleteLabel,
  getAvailability,
} = require("../controllers/class.controller");
const { protect, restrictTo } = require("../middlewares/auth.middleware");

// All routes require authentication
router.use(protect);

// --- CLASS ROUTES ---
router.route("/")
  .get(getMyClasses)
  .post(restrictTo("teacher"), createClass);

router.get("/availability", restrictTo("teacher"), getAvailability);

router.route("/:id")
  .get(getClassById)
  .put(restrictTo("teacher"), updateClass)
  .delete(restrictTo("teacher"), deleteClass);

// Bulk ops
router.put("/bulk/status", restrictTo("teacher"), bulkUpdateStatus);
router.put("/bulk/restore", restrictTo("teacher"), restoreClasses);
router.delete("/bulk", restrictTo("teacher"), bulkDeleteClasses);

// --- ENROLLMENT ROUTES ---
router.post("/:id/students", restrictTo("teacher"), addStudent);
router.post("/:id/enrollments/import", restrictTo("teacher"), importStudents);
router.delete("/:id/students/:studentId", restrictTo("teacher"), removeStudent);
router.get("/students/search", searchStudents);

// --- LABEL ROUTES (Teacher Level) ---
router.route("/labels/all")
  .get(restrictTo("teacher"), getLabels)
  .post(restrictTo("teacher"), createLabel);

router.delete("/labels/:id", restrictTo("teacher"), deleteLabel);

module.exports = router;
