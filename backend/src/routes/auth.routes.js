const express = require("express");
const router = express.Router();
const {
  register,
  login,
  me,
  onboarding,
  logout,
} = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.put("/onboarding", protect, onboarding);
router.post("/logout", logout);

module.exports = router;