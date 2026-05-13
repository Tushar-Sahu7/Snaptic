const express = require("express");
const router = express.Router();
const {
  register,
  login,
  me,
  generateInvite,
  logout,
  updateProfile,
  changePassword,
  enrollFace,
  getFaceStatus,
  deleteFace,
} = require("../controllers/auth.controller");
const { protect, restrictTo } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           enum: [student, teacher]
 *         name:
 *           type: string
 *         avatar:
 *           type: string
 *           nullable: true
 *         isFirstLogin:
 *           type: boolean
 *         faceEnrolled:
 *           type: boolean
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and Profile management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               inviteToken:
 *                 type: string
 *                 description: Required to register as a teacher
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login to the application
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               rememberMe:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user information and stats
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 */
router.get("/me", protect, me);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put("/profile", protect, updateProfile);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated
 */
router.post("/change-password", protect, changePassword);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout from the application
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post("/logout", logout);

/**
 * @swagger
 * /api/auth/invite:
 *   post:
 *     summary: Generate a teacher invite link
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Invite link generated
 */
router.post("/invite", protect, restrictTo("teacher"), generateInvite);

/**
 * @swagger
 * /api/auth/face/enroll:
 *   post:
 *     summary: Enroll face biometrics
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [image, embedding]
 *             properties:
 *               image:
 *                 type: string
 *                 description: Base64 image
 *               embedding:
 *                 type: array
 *                 items:
 *                   type: number
 *     responses:
 *       200:
 *         description: Face enrolled
 */
router.post("/face/enroll", protect, enrollFace);

/**
 * @swagger
 * /api/auth/face/status:
 *   get:
 *     summary: Get face enrollment status
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Face status returned
 */
router.get("/face/status", protect, getFaceStatus);

/**
 * @swagger
 * /api/auth/face:
 *   delete:
 *     summary: Delete face enrollment
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Face enrollment deleted
 */
router.delete("/face", protect, deleteFace);

module.exports = router;
