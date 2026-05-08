const express = require("express");
const router = express.Router();
const {
  getMyClasses,
  createClass,
  getClassById,
  updateClass,
  deleteClass,
  bulkUpdateStatus,
  bulkDeleteClasses,
  addStudent,
  importStudents,
  removeStudent,
  bulkRemoveStudents,
  searchStudents,
} = require("../controllers/class.controller");
const { protect, restrictTo } = require("../middlewares/auth.middleware");

// All routes require authentication
/**
 * @swagger
 * components:
 *   schemas:
 *     Class:
 *       type: object
 *       required: [name, startDate, endDate, startTime, daysOfWeek]
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         icon:
 *           type: string
 *         color:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         startTime:
 *           type: string
 *           example: "09:00"
 *         duration:
 *           type: number
 *           default: 60
 *         daysOfWeek:
 *           type: array
 *           items:
 *             type: number
 *             minimum: 0
 *             maximum: 6
 *         status:
 *           type: string
 *           enum: [active, archived]
 *         studentCount:
 *           type: number
 */

/**
 * @swagger
 * tags:
 *   name: Classes
 *   description: Class management and student enrollments
 */

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/classes:
 *   get:
 *     summary: Get all classes for the current user
 *     tags: [Classes]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of classes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Class'
 *   post:
 *     summary: Create a new class
 *     tags: [Classes]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Class'
 *     responses:
 *       201:
 *         description: Class created
 */
router.route("/")
  .get(getMyClasses)
  .post(restrictTo("teacher"), createClass);

/**
 * @swagger
 * /api/classes/{id}:
 *   get:
 *     summary: Get class details by ID
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Class details
 *   put:
 *     summary: Update a class
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Class'
 *     responses:
 *       200:
 *         description: Class updated
 *   delete:
 *     summary: Delete a class
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Class deleted
 */
router.put("/bulk/status", restrictTo("teacher"), bulkUpdateStatus);
router.delete("/bulk", restrictTo("teacher"), bulkDeleteClasses);

/**
 * @swagger
 * /api/classes/students/search:
 *   get:
 *     summary: Search for students by email or name
 *     tags: [Classes]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of students found
 */
router.get("/students/search", searchStudents);

router.route("/:id")
  .get(getClassById)
  .put(restrictTo("teacher"), updateClass)
  .delete(restrictTo("teacher"), deleteClass);

/**
 * @swagger
 * /api/classes/{id}/students:
 *   post:
 *     summary: Enroll a student in a class
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Student enrolled
 */
router.post("/:id/students", restrictTo("teacher"), addStudent);

/**
 * @swagger
 * /api/classes/{id}/enrollments/import:
 *   post:
 *     summary: Import students from another class
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sourceClassId]
 *             properties:
 *               sourceClassId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Students imported
 */
router.post("/:id/enrollments/import", restrictTo("teacher"), importStudents);

/**
 * @swagger
 * /api/classes/{id}/students/{studentId}:
 *   delete:
 *     summary: Remove a student from a class
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student removed
 */
router.delete("/:id/students/bulk", restrictTo("teacher"), bulkRemoveStudents);
router.delete("/:id/students/:studentId", restrictTo("teacher"), removeStudent);

module.exports = router;
