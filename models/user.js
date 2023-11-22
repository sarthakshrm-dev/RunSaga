const bcrypt = require("bcrypt");
var mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
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
      type: String
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Prefer not to say"],
    },
    height: {
      value: {
        type: Number,
      },
      unit: {
        type: String,
        enum: ["ft", "cm"],
      },
    },
    weight: {
      value: {
        type: Number,
      },
      unit: {
        type: String,
        enum: ["kgs", "lbs"],
      },
    },
    language: {
      type: String,
    },
    fitnessLevel: { type: Number },
    password: {
      type: String
    },
    role: {
      type: String,
      enum: {
        values: ["Admin", "User"],
        message: "Invalid role",
      },
      default: "User",
    },
    authType: {
      type: String,
      enum: {
        values: ["local", "google", "facebook", "apple"],
        message: "Invalid role",
      },
      default: "local",
    },
    authId: {
      type: String,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    chaseMode: {
      type: Boolean,
      default: false,
    },
    wearableStatus: {
      type: Boolean,
      default: false,
    },
    profileStatus: {
      type: Number,
      default: 0,
      enum: [0, 1, 2],
      // 0-userRegister, 1-emailVerified, 2-proifle created
    },
    subscriptionPlan: {
      type: String
    },
    subscriptionStatus: {
      type: Number,
      default: 0,
      enum: [0, 1, 2, 3],
      // 0-free, 1-expired, 2-active, 3-cancelled
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const saltRounds = 10;
  try {
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);
    this.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

module.exports = UserSchema;
