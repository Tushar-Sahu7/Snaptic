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
  removeStudents,
  restoreClasses,
  searchStudents,
  bulkUpdateStatus,
  bulkDeleteClasses,
} = require("../controllers/class.controller");
const { protect, restrictTo } = require("../middlewares/auth.middleware");

// All routes require authentication
router.use(protect);

router.route("/")
  .get(getMyClasses) // Teacher gets owned, Student gets enrolled
  .post(restrictTo("teacher"), createClass);

router.put("/bulk/status", restrictTo("teacher"), bulkUpdateStatus);
router.put("/bulk/restore", restrictTo("teacher"), restoreClasses);
router.delete("/bulk", restrictTo("teacher"), bulkDeleteClasses);

router.route("/:id")
  .get(getClassById)
  .put(restrictTo("teacher"), updateClass)
  .delete(restrictTo("teacher"), deleteClass);

router.post("/:id/students", restrictTo("teacher"), addStudent);
router.delete("/:id/students/bulk", restrictTo("teacher"), removeStudents);
router.delete("/:id/students/:studentId", restrictTo("teacher"), removeStudent);

module.exports = router;
