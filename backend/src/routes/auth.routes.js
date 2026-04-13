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

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.put("/profile", protect, updateProfile);
router.post("/change-password", protect, changePassword);
router.post("/logout", logout);
router.post("/invite", protect, restrictTo("teacher"), generateInvite);

// Face enrollment (available to both teacher and student)
router.post("/face/enroll", protect, enrollFace);
router.get("/face/status", protect, getFaceStatus);
router.delete("/face", protect, deleteFace);

module.exports = router;
