const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Teacher reference is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Holiday name is required"],
      trim: true,
    },
    startDate: {
      type: String, // "YYYY-MM-DD"
      required: [true, "Start date is required"],
    },
    endDate: {
      type: String, // "YYYY-MM-DD"
      required: [true, "End date is required"],
    },
  },
  { timestamps: true }
);

// Ensure no overlapping holidays for the same teacher (optional but good)
holidaySchema.index({ teacherId: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model("Holiday", holidaySchema);
