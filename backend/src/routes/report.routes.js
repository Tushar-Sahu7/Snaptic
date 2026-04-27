const express = require("express");
const router = express.Router();
const { getClassReport, getStudentHistory } = require("../controllers/report.controller");
const { protect, restrictTo } = require("../middlewares/auth.middleware");

router.use(protect);

// Teacher reports
router.get("/class/:classId", restrictTo("teacher"), getClassReport);

// Student reports
router.get("/student/history", restrictTo("student"), getStudentHistory);

module.exports = router;
