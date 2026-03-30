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
      required: [true, "studentId is required"]
    },

    date: {
      type: Date,
      required: [true, "Date is required"]
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "classId is required"]
    },

    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ["present", "absent", "late"],
        message: "Status must be present, absent or late"
      }
    },

    method: {
      type: String,
      required: [true, "Method is required"],
      enum: {
        values: ["face", "manual"],
        message: "Method must be face or manual"
      }
    }
  },
  {
    timestamps: true
  }
)

attendanceRecordSchema.index(
  { sessionId: 1, studentId: 1 },
  { unique: true }
)

module.exports = mongoose.model("AttendanceRecord", attendanceRecordSchema)