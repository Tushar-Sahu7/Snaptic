const mongoose = require("mongoose")

const attendanceSessionSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "classId is required"]
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "teacherId is required"]
    },

    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now
    },

    status: {
      type: String,
      enum: {
        values: ["active", "completed"],
        message: "Status must be active or completed"
      },
      default: "active"
    }
  },
  {
    timestamps: true
  }
)

attendanceSessionSchema.index(
  { classId: 1, date: 1 },
  { unique: true }
)

module.exports = mongoose.model("AttendanceSession", attendanceSessionSchema)