const jwt = require("jsonwebtoken")

const protect = (req, res, next) => {
  try {
    const roleHeader = req.headers["x-role"];
    const teacherToken = req.cookies?.token_teacher;
    const studentToken = req.cookies?.token_student;
    const legacyToken = req.cookies?.token;

    let token = null;

    if (roleHeader === "teacher") {
      token = teacherToken;
    } else if (roleHeader === "student") {
      token = studentToken;
    }

    // Fallback logic
    if (!token) {
      token = legacyToken || teacherToken || studentToken;
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, token invalid or expired" });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden, you do not have access" })
    }
    next()
  }
}

module.exports = { protect, restrictTo }