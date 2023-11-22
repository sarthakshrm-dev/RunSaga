const CryptoJS = require('crypto-js');
var mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email already exists"],
      validate: {
        validator: function (email) {
          return /\S+@\S+\.\S+/.test(email);
        },
        message: "Invalid email format",
      },
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    profilePicture: {
      type: String,
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Prefer not to say"],
    },
    language: {
      type: String,
      default: "English",
    },
    password: {
      type: String,
      required: [false, "Password is required"],
    },
    role: {
      type: String,
      default: "Admin",
    },
    authType: {
      type: String,
      enum: {
        values: ["local", "google", "facebook", "apple"],
        message: "Invalid role",
      },
      default: "local",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    profileStatus: {
      type: Number,
      default: 0,
      enum: [0, 1, 2],
      // 0-userRegister, 1-emailVerified, 2-admin created
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const hashedPassword = await CryptoJS.SHA256(this.password).toString();
    this.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

module.exports = AdminSchema;
