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

/**
 * @swagger
 * components:
 *   schemas:
 *     AttendanceSession:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         classId:
 *           type: string
 *         teacherId:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         location:
 *           type: string
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [scheduled, inprogress, submitted, finalized, missed]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     AttendanceRecord:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         sessionId:
 *           type: string
 *         studentId:
 *           type: string
 *         classId:
 *           type: string
 *         teacherId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [present, absent]
 *         method:
 *           type: string
 *           enum: [face, manual]
 *         markedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     StudentProfileForSession:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *         name:
 *           type: string
 *         avatar:
 *           type: string
 *           nullable: true
 *         embedding:
 *           type: array
 *           items:
 *             type: number
 *         faceEnrolled:
 *           type: boolean
 */

router.use(protect);

// Routes accessible by both teachers and students
/**
 * @swagger
 * /api/attendance/today:
 *   get:
 *     summary: "Get today's sessions (Teacher: their classes, Student: their enrolled classes)"
 *     tags: [Attendance]
 *     responses:
 *       200:
 *         description: List of sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessions:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/AttendanceSession'
 *                       - type: object
 *                         properties:
 *                           attendance:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               status:
 *                                 type: string
 *                                 enum: [present, absent]
 *                               markedAt:
 *                                 type: string
 *                                 format: date-time
 *                                 nullable: true
 */
router.get("/today", getTodaySession);

/**
 * @swagger
 * /api/attendance/today/{classId}:
 *   get:
 *     summary: Get today's session for a specific class
 *     tags: [Attendance]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 session:
 *                   allOf:
 *                     - $ref: '#/components/schemas/AttendanceSession'
 *                     - type: object
 *                       properties:
 *                         attendance:
 *                           type: object
 *                           nullable: true
 *                           properties:
 *                             status:
 *                               type: string
 *                               enum: [present, absent]
 *                             markedAt:
 *                               type: string
 *                               format: date-time
 *                               nullable: true
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
 *         description: Session started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 session:
 *                   $ref: '#/components/schemas/AttendanceSession'
 *                 profiles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/StudentProfileForSession'
 *                 records:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AttendanceRecord'
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
 *               method:
 *                 type: string
 *                 enum: [face, manual]
 *     responses:
 *       200:
 *         description: Attendance marked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 record:
 *                   $ref: '#/components/schemas/AttendanceRecord'
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
 *         description: Session submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 session:
 *                   $ref: '#/components/schemas/AttendanceSession'
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
 *         description: Session reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: string
 *                   example: scheduled
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
 *         description: List of attendance records and session details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 session:
 *                   $ref: '#/components/schemas/AttendanceSession'
 *                 records:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/AttendanceRecord'
 *                       - type: object
 *                         properties:
 *                           studentName:
 *                             type: string
 *                           avatar:
 *                             type: string
 *                             nullable: true
 */
router.get("/session/:sessionId/records", getSessionRecords);

module.exports = router;
