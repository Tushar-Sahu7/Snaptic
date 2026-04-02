const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const TeacherProfile = require("../models/TeacherProfile");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

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
    const { name, email, password, inviteToken } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    let role = "student";

    if (inviteToken) {
      const inviter = await TeacherProfile.findOne({ inviteToken });

      if (!inviter) {
        return res.status(403).json({ message: "Invalid invite link" });
      }

      if (inviter.invite.expiry < new Date())
        return res.status(403).json({ message: "Invite link has expired" });

      await TeacherProfile.findByIdAndUpdate(inviter._id, {
        invite: { token: null, expiry: null },
      });

      role = "teacher";
    }

    const user = await User.create({
      email,
      password,
      role,
      isFirstLogin: true,
    });

    if (role === "teacher") {
      await TeacherProfile.create({
        userId: user._id,
        name,
        inviteToken: null,
      });
    } else {
      await StudentProfile.create({ userId: user._id, name });
    }

    const token = generateToken(user._id, user.role);
    setCookie(res, token);

    res.json({
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

//POST /api/auth/invite
const generateInvite = async (req, res) => {
  try {
    const token = crypto.randomUUID();

    await TeacherProfile.findOneAndUpdate(
      { userId: req.user.userId },
      { invite: { token, expiry: new Date(Date.now() + 60 * 60 * 1000) } },
    );

    const inviteLink = `${process.env.CLIENT_URL}/api/auth/register?invite=${token}`;
    return res.status(200).json({ inviteLink });
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

module.exports = { register, login, me, generateInvite, logout };
