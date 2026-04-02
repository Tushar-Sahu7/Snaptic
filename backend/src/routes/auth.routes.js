const express = require("express");
const router = express.Router();
const {
  register,
  login,
  me,
  generateInvite,
  logout,
} = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.post("/logout", logout);
router.post("/invite", protect, restrictTo("teacher"), generateInvite);

module.exports = router;
