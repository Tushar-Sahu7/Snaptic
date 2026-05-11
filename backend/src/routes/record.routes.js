const express = require("express");
const router = express.Router();
const { getClassRecord, getStudentHistory, getStudentClassRecord, getSessionRecord, getClassSessions } = require("../controllers/record.controller");
const { protect, restrictTo } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Records
 *   description: Attendance and student performance records
 */

router.use(protect);

/**
 * @swagger
 * /api/records/class/{classId}:
 *   get:
 *     summary: Get a summary record for a specific class
 *     tags: [Records]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Class record data
 */
router.get("/class/:classId", restrictTo("teacher"), getClassRecord);

/**
 * @swagger
 * /api/records/class/{classId}/sessions:
 *   get:
 *     summary: Get all finalized sessions for a class
 *     tags: [Records]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of class sessions
 */
router.get("/class/:classId/sessions", restrictTo("teacher"), getClassSessions);

/**
 * @swagger
 * /api/records/class/{classId}/student:
 *   get:
 *     summary: Get personal attendance records for a specific class (Student only)
 *     tags: [Records]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 */
router.get("/class/:classId/student", restrictTo("student", "teacher"), getStudentClassRecord);

/**
 * @swagger
 * /api/records/student/history:
 *   get:
 *     summary: Get attendance history for the logged-in student
 *     tags: [Records]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Student attendance history
 */
router.get("/student/history", restrictTo("student"), getStudentHistory);

/**
 * @swagger
 * /api/records/session/{sessionId}:
 *   get:
 *     summary: Get record details for a specific session
 *     tags: [Records]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session record data
 */
router.get("/session/:sessionId", restrictTo("teacher", "student"), getSessionRecord);

module.exports = router;

