const express = require("express");
const { protect, restrictTo } = require("../middlewares/auth.middleware");
const {
  startSession,
  markAttendance,
  getSessionRecords,
  resetSession,
  getTodaySession,
  submitSession,
  reopenSession
} = require("../controllers/attendance.controller");

const router = express.Router();

router.use(protect);

// Teacher routes
router.use(restrictTo("teacher"));
router.post("/start/:classId", startSession);
router.put("/mark", markAttendance);
router.post("/submit/:sessionId", submitSession);
router.post("/reopen/:sessionId", reopenSession);
router.delete("/session/:sessionId/reset", resetSession);
router.get("/today", getTodaySession);
router.get("/today/:classId", getTodaySession);
router.get("/session/:sessionId/records", getSessionRecords);

module.exports = router;
