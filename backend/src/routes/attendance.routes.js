const express = require("express");
const { protect, restrictTo } = require("../middlewares/auth.middleware");
const {
  startSession,
  markAttendance,
  getSessionRecords,
  resetSession,
  getTodaySession,
  submitSession
} = require("../controllers/attendance.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Attendance session management and marking
 */

router.use(protect);

// Routes accessible by both teachers and students
/**
 * @swagger
 * /api/attendance/today:
 *   get:
 *     summary: "Get today's sessions (Teacher: their classes, Student: their enrolled classes)"
 *     tags: [Attendance]
 */
router.get("/today", getTodaySession);

/**
 * @swagger
 * /api/attendance/today/{classId}:
 *   get:
 *     summary: Get today's session for a specific class
 *     tags: [Attendance]
 */
router.get("/today/:classId", getTodaySession);

// Teacher-only routes
router.use(restrictTo("teacher"));

/**
 * @swagger
 * /api/attendance/start/{classId}:
 *   post:
 *     summary: Start an attendance session for a class
 *     tags: [Attendance]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session started
 */
router.post("/start/:classId", startSession);

/**
 * @swagger
 * /api/attendance/mark:
 *   put:
 *     summary: Mark attendance for a student manually
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sessionId, studentId, status]
 *             properties:
 *               sessionId:
 *                 type: string
 *               studentId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [present, absent]
 *     responses:
 *       200:
 *         description: Attendance marked
 */
router.put("/mark", markAttendance);

/**
 * @swagger
 * /api/attendance/submit/{sessionId}:
 *   post:
 *     summary: Submit an attendance session for review
 *     tags: [Attendance]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session submitted
 */
router.post("/submit/:sessionId", submitSession);

/**
 * @swagger
 * /api/attendance/session/{sessionId}/reset:
 *   delete:
 *     summary: Reset an attendance session
 *     tags: [Attendance]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session reset
 */
router.delete("/session/:sessionId/reset", resetSession);

// (Original routes removed - moved to public section above)

/**
 * @swagger
 * /api/attendance/session/{sessionId}/records:
 *   get:
 *     summary: Get all attendance records for a session
 *     tags: [Attendance]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of attendance records
 */
router.get("/session/:sessionId/records", getSessionRecords);

module.exports = router;
