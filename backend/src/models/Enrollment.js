const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student reference is required"],
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "Class reference is required"],
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Teacher reference is required"],
      index: true, // Denormalized for fast filtering of a teacher's total student base
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Ensure a student can only be enrolled once in a specific class
enrollmentSchema.index({ studentId: 1, classId: 1 }, { unique: true });

// Compound index for class detail student lists
enrollmentSchema.index({ classId: 1, status: 1 });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
