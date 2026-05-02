const express = require("express");
const router = express.Router();
const { getClassReport, getStudentHistory } = require("../controllers/report.controller");
const { protect, restrictTo } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Attendance and student performance reports
 */

router.use(protect);

/**
 * @swagger
 * /api/reports/class/{classId}:
 *   get:
 *     summary: Get a summary report for a specific class
 *     tags: [Reports]
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
 *         description: Class report data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalSessions:
 *                       type: number
 *                     attendancePercentage:
 *                       type: number
 *                     totalPresent:
 *                       type: number
 *                     totalAbsent:
 *                       type: number
 *                 students:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       studentId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       presentCount:
 *                         type: number
 *                       absentCount:
 *                         type: number
 *                       percentage:
 *                         type: number
 */
router.get("/class/:classId", restrictTo("teacher"), getClassReport);

/**
 * @swagger
 * /api/reports/student/history:
 *   get:
 *     summary: Get attendance history for the logged-in student
 *     tags: [Reports]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Student attendance history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       recordId:
 *                         type: string
 *                       class:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           icon:
 *                             type: string
 *                           color:
 *                             type: string
 *                       session:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                           startTime:
 *                             type: string
 *                           status:
 *                             type: string
 *                       status:
 *                         type: string
 *                       method:
 *                         type: string
 *                       markedAt:
 *                         type: string
 *                         format: date-time
 */
router.get("/student/history", restrictTo("student"), getStudentHistory);

module.exports = router;

