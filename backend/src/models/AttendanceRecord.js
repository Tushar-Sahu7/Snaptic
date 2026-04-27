const mongoose = require("mongoose")

const attendanceRecordSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttendanceSession",
      required: [true, "sessionId is required"]
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "studentId is required"],
    },

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

    status: {
      type: String,
      required: [true, "Status is required"],
      enum: ["present", "absent"],
      default: "absent",
    },
    method: {
      type: String,
      enum: ["face", "manual"],
      default: "manual",
    },
    markedAt: {
      type: String, // Temporal.Instant (UTC)
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

attendanceRecordSchema.index(
  { sessionId: 1, studentId: 1 },
  { unique: true }
)

module.exports = mongoose.model("AttendanceRecord", attendanceRecordSchema)