const mongoose = require("mongoose");

const attendanceSessionSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "classId is required"],
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "teacherId is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    location: {
      type: String,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "inprogress", "submitted", "finalized", "missed"],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
  }
);

// One session per class per start time
attendanceSessionSchema.index(
  { classId: 1, startTime: 1 },
  { unique: true }
);

// Query sessions by teacher and time
attendanceSessionSchema.index({ teacherId: 1, status: 1, startTime: 1, endTime: 1 });

// DATE SEARCH: For calendar views or reports
attendanceSessionSchema.index({ date: 1 });

module.exports = mongoose.model("AttendanceSession", attendanceSessionSchema);