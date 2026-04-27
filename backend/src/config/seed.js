const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const TeacherProfile = require("../models/TeacherProfile");
const Label = require("../models/Label");

dotenv.config();

const DEFAULT_LABELS = [
  { name: "Lecture", color: "oklch(0.6 0.2 250)" },
  { name: "Lab", color: "oklch(0.6 0.2 20)" },
  { name: "Tutorial", color: "oklch(0.6 0.2 150)" },
  { name: "Seminar", color: "oklch(0.6 0.2 80)" },
  { name: "Workshop", color: "oklch(0.6 0.2 280)" },
  { name: "Review", color: "oklch(0.6 0.2 0)" },
];

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
        isFirstLogin: false
      });
      await TeacherProfile.create({ userId: teacherUser._id, name: "Demo Teacher" });
      console.log("Teacher seeded");
    } else {
      console.log("Teacher already exists");
    }

    // 2. Seed Labels for this teacher
    const existingLabels = await Label.find({ teacherId: teacherUser._id });
    if (existingLabels.length === 0) {
      await Label.insertMany(DEFAULT_LABELS.map(l => ({ ...l, teacherId: teacherUser._id })));
      console.log("Default labels seeded");
    } else {
      console.log("Labels already exist");
    }

    // 3. Removed Students and Classes as requested

    console.log("Seeding completed successfully");
    mongoose.connection.close();
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
};

seed();