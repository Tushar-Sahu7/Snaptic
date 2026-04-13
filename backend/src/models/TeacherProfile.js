const mongoose = require("mongoose");

const teacherProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
      unique: true,
    },

    name: {
      type: String,
      trim: true,
    },

    avatar: {
      type: String,
      default: null,
    },

    faceEnrolled: {
      type: Boolean,
      default: false,
    },

    embedding: {
      type: [Number],
      default: null,
    },

    invite: {
      token: { type: String, default: null },
      expiry: { type: Date, default: null },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("TeacherProfile", teacherProfileSchema);
