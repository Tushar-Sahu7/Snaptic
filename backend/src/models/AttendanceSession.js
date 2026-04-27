const mongoose = require("mongoose");

const attendanceSessionSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "classId is required"],
      index: true,
    },
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      // No ref here as it's an embedded ID in Class
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "teacherId is required"],
      index: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    dateString: {
      type: String,
      required: [true, "dateString is required"],
      index: true,
    },
    startTime: {
      type: String, // HH:mm (copied from schedule)
    },
    duration: {
      type: Number, // in minutes
    },
    location: {
      type: String,
    },
    timezone: {
      type: String, // Copied from class at generation time
    },
    // Absolute time anchors for collision detection
    startInstant: {
      type: String, // Temporal.Instant string (UTC)
      required: true,
      index: true,
    },
    endInstant: {
      type: String, // Temporal.Instant string (UTC)
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "inprogress", "submitted", "finalized", "missed"],
      default: "scheduled",
    },
    attendanceWindow: {
      opensAt: {
        type: String, // Temporal.Instant (UTC)
      },
      closesAt: {
        type: String, // Temporal.Instant (UTC)
      }
    },
    isManual: {
      type: Boolean,
      default: false,
    },
    overrideReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// One session per schedule per day (strict constraint)
attendanceSessionSchema.index(
  { classId: 1, scheduleId: 1, dateString: 1 },
  { unique: true }
);

// Absolute overlap detection index for the teacher
attendanceSessionSchema.index({ teacherId: 1, startInstant: 1, endInstant: 1 });

module.exports = mongoose.model("AttendanceSession", attendanceSessionSchema);