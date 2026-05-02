const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Class name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      default: "BookOpen",
    },
    color: {
      type: String, // OKLCH color string (e.g. oklch(0.6 0.2 250))
      default: "oklch(0.6 0.2 250)",
    },
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
    },
    startDate: {
      type: String, // ISO Date string (YYYY-MM-DD)
      required: [true, "Start date is required"],
    },
    endDate: {
      type: String, // ISO Date string (YYYY-MM-DD)
      required: [true, "End date is required"],
    },
    startTime: {
      type: String, // "HH:mm"
      required: [true, "Start time is required"],
    },
    duration: {
      type: Number, // minutes
      required: [true, "Duration is required"],
      default: 60,
    },
    daysOfWeek: {
      type: [Number], // 0-6
      required: [true, "Days of week are required"],
      default: [],
    },
    location: {
      type: String,
      trim: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Teacher is required"],
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Fast retrieval of active classes for a teacher
classSchema.index({ teacherId: 1, status: 1 });

module.exports = mongoose.model("Class", classSchema);