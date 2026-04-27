const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  labelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Label",
    required: [true, "Schedule must have a label"],
  },
  rrule: {
    type: String, // e.g. "FREQ=WEEKLY;BYDAY=MO,WE"
    required: [true, "RRULE is required"],
  },
  startTime: {
    type: String, // Wall clock time "HH:mm"
    required: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  location: {
    type: String,
    trim: true,
  },
  startDate: {
    type: String, // ISO Date string, used for one-off (COUNT=1) or overriding class start
    default: null,
  },
  exdates: {
    type: [String], // Array of ISO Datetime strings in class timezone
    default: [],
  },
  isHidden: {
    type: Boolean,
    default: false,
  },
});

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Class name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      default: "BookOpen",
    },
    color: {
      type: String, // OKLCH color string (e.g. oklch(0.6 0.2 250))
      default: "oklch(0.6 0.2 250)",
    },
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
    },
    timezone: {
      type: String,
      required: [true, "Timezone is required"],
      default: "Asia/Kolkata",
    },
    startDate: {
      type: String, // Temporal ISO string
      required: [true, "Start date is required"],
    },
    endDate: {
      type: String, // Temporal ISO string
      required: [true, "End date is required"],
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Teacher is required"],
      index: true,
    },
    schedules: [scheduleSchema],
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Fast retrieval of active classes for a teacher
classSchema.index({ teacherId: 1, status: 1 });

module.exports = mongoose.model("Class", classSchema);