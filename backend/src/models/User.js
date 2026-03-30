const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate(value) {
        return validator.isEmail(value);
      }
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      validate(value) {
        return validator.isStrongPassword(value);
      }
    },

    role: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: ["teacher", "student"],
        message: "Role must be a teacher or student",
      },
    },

    isFirstLogin: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password, 10)
    next()
  } catch (err) {
    next(err)
  }
})

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model("User", userSchema);
