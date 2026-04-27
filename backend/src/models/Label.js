const mongoose = require("mongoose");

const labelSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Teacher reference is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Label name is required"],
      trim: true,
    },
    color: {
      type: String,
      required: [true, "Color is required"],
      // Default set of oklch colors will be managed by frontend, 
      // but backend stores the value chosen from the palette.
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Ensure label name is unique per teacher
labelSchema.index({ teacherId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Label", labelSchema);
