const express = require("express");
const router = express.Router();
const { createHoliday, getHolidays, deleteHoliday } = require("../controllers/holiday.controller");
const { protect, restrictTo } = require("../middlewares/auth.middleware");

router.use(protect);
router.use(restrictTo("teacher"));

router.route("/")
  .get(getHolidays)
  .post(createHoliday);

router.delete("/:id", deleteHoliday);

module.exports = router;
