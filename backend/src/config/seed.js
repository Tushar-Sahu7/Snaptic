const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const TeacherProfile = require("../models/TeacherProfile");
const StudentProfile = require("../models/StudentProfile");
const Label = require("../models/Label");
const Class = require("../models/Class");
const Enrollment = require("../models/Enrollment");
const { Temporal } = require("@js-temporal/polyfill");
const sessionManager = require("../services/sessionManager");

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

    // 3. Seed Students
    const studentEmails = ["alice@demo.com", "bob@demo.com", "charlie@demo.com"];
    const studentUsers = [];

    for (const email of studentEmails) {
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          email,
          password: "Password@123",
          role: "student",
          isFirstLogin: false
        });
        await StudentProfile.create({
          userId: user._id,
          name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
          embedding: new Array(128).fill(0).map(() => Math.random()),
          faceEnrolled: true
        });
        console.log(`Student ${email} seeded`);
      }
      studentUsers.push(user);
    }

    // 4. Seed a Demo Class if none exist
    const classCount = await Class.countDocuments({ teacherId: teacherUser._id });
    if (classCount === 0) {
      const lectureLabel = await Label.findOne({ name: "Lecture", teacherId: teacherUser._id });
      const labLabel = await Label.findOne({ name: "Lab", teacherId: teacherUser._id });

      const today = Temporal.Now.plainDateISO();
      const startDate = today.toString();
      const endDate = today.add({ months: 3 }).toString();

      const demoClass = await Class.create({
        teacherId: teacherUser._id,
        name: "CS101 - Introduction to Web",
        description: "A foundational course on modern web development.",
        icon: "Code",
        color: "oklch(0.6 0.2 250)",
        timezone: "Asia/Kolkata",
        startDate,
        endDate,
        status: "active",
        schedules: [
          {
            labelId: lectureLabel._id,
            days: [1, 3], // Mon, Wed
            startTime: "09:00",
            duration: 60,
            location: "Main Hall"
          },
          {
            labelId: labLabel._id,
            days: [5], // Fri
            startTime: "14:00",
            duration: 120,
            location: "Lab 201"
          }
        ]
      });

      // Generate initial sessions
      for (const schedule of demoClass.schedules) {
        await sessionManager.generateSessionsForSchedule(demoClass, schedule);
      }

      // Enroll students
      for (const student of studentUsers) {
        await Enrollment.create({
          classId: demoClass._id,
          studentId: student._id,
          teacherId: teacherUser._id,
          status: "active"
        });
      }

      console.log("Demo class and enrollments seeded");
    }

    console.log("Seeding completed successfully");
    mongoose.connection.close();
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
};

seed();