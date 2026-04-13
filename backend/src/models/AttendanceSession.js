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

    dateString: {
      type: String,
      required: [true, "dateString is required"],
      index: true
    },

    status: {
      type: String,
      enum: {
        values: ["inProgress", "submitted", "finalized"],
        message: "Status must be inProgress, submitted or finalized"
      },
      default: "inProgress"
    }
  },
  {
    timestamps: true
  }
)

// Ensure only one session per class per day
attendanceSessionSchema.index(
  { classId: 1, dateString: 1 },
  { unique: true }
)

module.exports = mongoose.model("AttendanceSession", attendanceSessionSchema)