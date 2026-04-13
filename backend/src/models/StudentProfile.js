const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
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

    embedding: {
      type: [Number],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length === 0 || arr.length === 128;
        },
        message: "Embedding must be exactly 128 numbers",
      },
    },

    faceEnrolled: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true },
);

module.exports = mongoose.model("StudentProfile", studentProfileSchema);