const mongoose = require("mongoose")

const teacherProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "userId is required"],
    unique: true
  },

  name: {
    type: String,
    trim: true
  },
}, {timestamps: true}) 

module.exports = mongoose.model("TeacherProfile", teacherProfileSchema)