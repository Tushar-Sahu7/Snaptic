const express = require("express");
const router = express.Router();
const { getClassRecord, getStudentHistory, getStudentClassRecord } = require("../controllers/record.controller");
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
router.get("/class/:classId/student", restrictTo("student"), getStudentClassRecord);

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

module.exports = router;

