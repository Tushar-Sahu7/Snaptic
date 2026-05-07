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
    schedule: {
      rrule: {
        type: String,
        required: [true, "Schedule RRULE is required"],
      },
      duration: {
        type: Number, // in minutes
        required: [true, "Duration is required"],
        default: 60,
      },
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
    studentCount: {
      type: Number,
      default: 0,
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