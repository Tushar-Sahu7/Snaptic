const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const TeacherProfile = require("../models/TeacherProfile");
const jwt = require("jsonwebtoken");

const setCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  }); 
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      email,
      password,
      role: "student",
    });

    await StudentProfile.create({ userId: user._id });

    const token = generateToken(user._id, user.role);
    setCookie(res, token);

    return res.status(201).json({
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        isFirstLogin: user.isFirstLogin,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id, user.role);
    setCookie(res, token);

    return res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        isFirstLogin: user.isFirstLogin,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        isFirstLogin: user.isFirstLogin,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/auth/onboarding
const onboarding = async (req, res) => {
  try {
    const { name, rollNumber, password } = req.body;
    const { userId, role } = req.user;

    if (role === "teacher") {
      if (!name || !password) {
        return res
          .status(400)
          .json({ message: "Name and password are required" });
      }

      await TeacherProfile.findOneAndUpdate(
        { userId },
        { name },
        { new: true },
      );

      const user = await User.findById(userId);
      user.password = password;
      user.isFirstLogin = false;
      await user.save();

      return res.status(200).json({ message: "Teacher onboarding complete" });
    }

    if (role === "student") {
      if (!name || !rollNumber) {
        return res
          .status(400)
          .json({ message: "Name and roll number are required" });
      }

      await StudentProfile.findOneAndUpdate(
        { userId },
        { name, rollNumber },
        { new: true },
      );

      await User.findByIdAndUpdate(userId, { isFirstLogin: false });

      return res.status(200).json({ message: "Student onboarding complete" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, me, onboarding, logout };
