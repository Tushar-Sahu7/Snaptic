const mongoose = require("mongoose")
const dotenv = require("dotenv")
const User = require("../models/User")
const TeacherProfile = require("../models/TeacherProfile")

dotenv.config()

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Connected to DB");

    const email = "teacher@demo.com";

    const existing = await User.findOne({ email: email })
    if (existing) {
      console.log("Teacher already exists, skipping")
      process.exit(0)
    }

    const teacher = await User.create({
      email: email,
      password: "Password@123",
      role: "teacher",
      isFirstLogin: true
    })

    await TeacherProfile.create({ userId: teacher._id, name: "Demo Teacher" })

    console.log("Teacher seeded successfully")
    process.exit(0)
  } catch (err) {
    console.error("Seed failed:", err.message)
    process.exit(1)
  }
}

seed()