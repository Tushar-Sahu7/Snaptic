const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const TeacherProfile = require("../models/TeacherProfile");

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    // 1. Seed Teacher
    const teacherEmail = "teacher@demo.com";
    let teacherUser = await User.findOne({ email: teacherEmail });

    if (!teacherUser) {
      teacherUser = await User.create({
        email: teacherEmail,
        password: "Password@123",
        role: "teacher",
        isFirstLogin: true
      });
      await TeacherProfile.create({ userId: teacherUser._id, name: "Demo Teacher" });
      console.log("Teacher seeded");
    } else {
      console.log("Teacher already exists");
    }

    console.log("Seeding completed successfully");
    mongoose.connection.close();
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
};

seed();