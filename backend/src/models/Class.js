const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Class name is required"],
      trim: true,
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Teacher is required"],
    },

    studentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    schedule: {
      day: {
        type: String,
        enum: {
          values: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
          message: "Day must be a valid weekday",
        },
      },
      startTime: {
        type: String,
      },
      endTime: {
        type: String,
      },
      room: {
        type: String,
        trim: true,
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Class", classSchema);
