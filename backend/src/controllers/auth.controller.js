const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const TeacherProfile = require("../models/TeacherProfile");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const setCookie = (res, token, rememberMe = true) => {
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };

  if (rememberMe) {
    cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  }

  res.cookie("token", token, cookieOptions);
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
      const inviter = await TeacherProfile.findOne({ "invite.token": inviteToken });

      if (!inviter) {
        return res.status(403).json({ message: "Invalid invite link" });
      }

      const now = new Date();
      if (inviter.invite.expiry && now > new Date(inviter.invite.expiry))
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
        name
      });
    } else {
      await StudentProfile.create({ userId: user._id, name });
    }

    const token = generateToken(user._id, user.role);
    setCookie(res, token, true); // Registration always persists for better onboarding UX

    res.json({
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        isFirstLogin: user.isFirstLogin,
        name: name,
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

    const { rememberMe } = req.body;
    const token = generateToken(user._id, user.role);
    setCookie(res, token, rememberMe);

    const profile = user.role === "teacher"
      ? await TeacherProfile.findOne({ userId: user._id })
      : await StudentProfile.findOne({ userId: user._id });

    return res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        isFirstLogin: user.isFirstLogin,
        name: profile?.name || "",
        avatar: profile?.avatar || null,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const Enrollment = require("../models/Enrollment");
const Class = require("../models/Class");
// TemporalService removed


// GET /api/auth/me
const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profile = null;
    let stats = {};

    if (user.role === "teacher") {
      profile = await TeacherProfile.findOne({ userId: user._id });

      // Teacher stats: count of classes they own and unique students enrolled
      const classes = await Class.find({ teacherId: user._id, deletedAt: null });
      const enrollments = await Enrollment.find({ teacherId: user._id, status: "active" });
      const studentIds = new Set(enrollments.map(e => e.studentId.toString()));

      stats = {
        classCount: classes.length,
        studentCount: studentIds.size,
        faceEnrolled: profile?.faceEnrolled || false,
      };
    } else {
      profile = await StudentProfile.findOne({ userId: user._id });

      // Student stats: count of active enrollments
      const enrollmentCount = await Enrollment.countDocuments({
        studentId: user._id,
        status: "active"
      });

      stats = {
        classCount: enrollmentCount,
        faceEnrolled: profile?.faceEnrolled || false,
      };
    }

    return res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        isFirstLogin: user.isFirstLogin,
        name: profile?.name || "",
        avatar: profile?.avatar || null,
        joinedAt: user.createdAt,
        ...stats
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    let profile;

    if (req.user.role === "teacher") {
      profile = await TeacherProfile.findOneAndUpdate(
        { userId: req.user.userId },
        { name, avatar },
        { new: true, runValidators: true }
      );
    } else {
      profile = await StudentProfile.findOneAndUpdate(
        { userId: req.user.userId },
        { name, avatar },
        { new: true, runValidators: true }
      );
    }

    res.json({
      message: "Profile updated successfully",
      profile: {
        name: profile.name,
        avatar: profile.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId);
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//POST /api/auth/invite
const generateInvite = async (req, res) => {
  try {
    const token = crypto.randomUUID();
    const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now


    await TeacherProfile.findOneAndUpdate(
      { userId: req.user.userId },
      { invite: { token, expiry } },
    );

    const inviteLink = `${process.env.CLIENT_URL}/register?invite=${token}`;
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

// POST /api/auth/face/enroll
const enrollFace = async (req, res) => {
  try {
    const { image, embedding } = req.body;

    if (!image || !embedding || !Array.isArray(embedding)) {
      return res.status(400).json({ message: "Face image and descriptor are required" });
    }

    const Model = req.user.role === "teacher" ? TeacherProfile : StudentProfile;

    const profile = await Model.findOneAndUpdate(
      { userId: req.user.userId },
      { avatar: image, embedding, faceEnrolled: true },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    return res.status(200).json({
      message: "Face enrolled successfully",
      faceEnrolled: true,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/face/status
const getFaceStatus = async (req, res) => {
  try {
    const Model = req.user.role === "teacher" ? TeacherProfile : StudentProfile;
    const profile = await Model.findOne({ userId: req.user.userId });

    if (!profile) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    return res.status(200).json({
      faceEnrolled: profile.faceEnrolled || false,
      enrolledAt: profile.faceEnrolled ? profile.updatedAt : null,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /api/auth/face
const deleteFace = async (req, res) => {
  try {
    const Model = req.user.role === "teacher" ? TeacherProfile : StudentProfile;
    const profile = await Model.findOneAndUpdate(
      { userId: req.user.userId },
      { embedding: [], faceEnrolled: false, avatar: null },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    return res.status(200).json({
      message: "Face enrollment deleted",
      faceEnrolled: false,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  register,
  login,
  me,
  updateProfile,
  changePassword,
  generateInvite,
  logout,
  enrollFace,
  getFaceStatus,
  deleteFace,
};