const status = require("http-status");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { User, OTP } = require("../../models");
const {
  sendRegisterEmail,
  sendResetEmail,
  sendForgotPasswordEmail,
} = require("../../services/email");
const { verifyOtpForProfile, resendOtpToProfile, sendOtp, generateOTP } = require("../../services/otp");
const axios = require("axios");

const jwtSecret = process.env.JWT_SECRET;

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(status.BAD_REQUEST)
        .json({ Status: false, error: "Both email and password are required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(status.CONFLICT)
        .json({ Status: false, error: "Email address is already in use" });
    }

    const newUser = {
      email,
      password,
    };

    const user = await User.create(newUser);

    const otp = generateOTP();
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 15);

    await OTP.create({
      userId: user._id,
      otp,
      expiresAt: expirationTime,
    });

    await sendRegisterEmail(user.email, otp);

    const message = "Registration successful";

    res.status(status.OK).json({
      Status: true,
      user: {
        email: user.email,
        profileStatus: user.profileStatus,
      },
      message,
    });
  } catch (error) {
    res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ Status: false, error: error.message });
  }
};

const resendOtp = async (req, res) => {
  try {
    await resendOtpToProfile(req, res, User);
  } catch (error) {
    res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ Status: false, error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(status.BAD_REQUEST).json({ Status: false, error: "Both email and password are required" });
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(status.BAD_REQUEST).json({ Status: false, error: "User does not exist with this email address" });
    }

    if (user.authType !== "local") {
      return res.status(status.BAD_REQUEST).json({ Status: false, error: "Invalid email or password!" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(status.BAD_REQUEST).json({ Status: false, error: "Please check your password!" });
    }

    if (user.emailVerified) {
      const token = jwt.sign({ userId: user._id }, jwtSecret);
      const message = "Logged in Successfully";
      res.status(status.OK).json({
        Status: true,
        user: {
          ...user.toObject(),
          token,
        },
        message,
      });
    } else {
      // if user email is not verified
      await sendOtp(req, res, user);
    }
  } catch (error) {
    res
      .status(status.UNAUTHORIZED)
      .json({ Status: false, error: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    await verifyOtpForProfile(req, res, User);
  } catch (error) {
    console.error("Error in verifyOtp:", error);
    res.status(status.INTERNAL_SERVER_ERROR).json({
      Status: false,
      error: "An internal server error occurred",
    });
  }
};

const profile = (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(status.UNAUTHORIZED)
        .json({ Status: false, error: "User is not authorized" });
    }

    const message = "User profile retrieved successfully";
    const token = jwt.sign({ userId: user._id }, jwtSecret);

    res.status(status.OK).json({
      Status: true,
      user: {
        ...user.toObject(),
        token,
      },
      message,
    });
  } catch (error) {
    console.error("Error in profile:", error);
    res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ Status: false, error: "Internal server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(status.BAD_REQUEST)
        .json({ Status: false, error: "Please enter your email" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("User not found");
    }

    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 15);
    const newOTP = generateOTP();

    const existingOTP = await OTP.findOne({ userId: user._id });
    existingOTP.otp = newOTP;
    existingOTP.expiresAt = expirationTime;
    await existingOTP.save();

    await sendForgotPasswordEmail(user.email, newOTP);

    const message = "Reset password OTP has been sent to your account";

    res.status(status.OK).json({
      Status: true,
      message,
    });
  } catch (error) {
    res
      .status(status.UNAUTHORIZED)
      .json({ Status: false, error: error.message });
  }
};

const verifyOtpResetPassword = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(status.BAD_REQUEST).json({
        Status: false,
        error: "Please provide email and otp",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(status.BAD_REQUEST)
        .json({ Status: false, message: "User not found" });
    }

    const userOtp = await OTP.findOne({ userId: user._id });
    const currentTime = new Date();
    if (currentTime > userOtp.expiresAt) {
      return res
        .status(status.BAD_REQUEST)
        .json({ Status: false, error: "OTP is expired" });
    }

    if (userOtp.otp !== otp) {
      return res
        .status(status.BAD_REQUEST)
        .json({ Status: false, error: "Invalid OTP" });
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret);

    // user.emailVerified = true;
    // user.profileStatus = 1;
    // user.password = newPassword;
    // await user.save();

    const message = "Password has been reset successfully";

    res.status(status.OK).json({
      Status: true,
      message,
    });
  } catch (error) {
    res
      .status(status.UNAUTHORIZED)
      .json({ Status: false, error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const user = req.user;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(status.BAD_REQUEST).json({
        Status: false,
        error: "Please provide newPassword.",
      });
    }

    user.emailVerified = true;
    user.profileStatus = 1;
    user.password = newPassword;
    await user.save();

    const message = "Password has been reset successfully";
    const token = jwt.sign({ userId: user._id }, jwtSecret);

    res.status(status.OK).json({
      Status: true,
      user: {
        ...user.toObject(),
        token,
      },
      message,
    });
  } catch (error) {
    res
      .status(status.UNAUTHORIZED)
      .json({ Status: false, error: error.message });
  }
};

const oldResetPassword = async (req, res) => {
  try {
    const { newPassword, email, otp } = req.body;

    if (!newPassword || !email || !otp) {
      return res.status(status.BAD_REQUEST).json({
        Status: false,
        error: "Please provide newPassword, email, and token",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(status.BAD_REQUEST)
        .json({ Status: false, message: "User not found" });
    }

    const userOtp = await OTP.findOne({ userId: user._id });
    const currentTime = new Date();
    if (currentTime > userOtp.expiresAt) {
      return res
        .status(status.BAD_REQUEST)
        .json({ Status: false, error: "OTP is expired" });
    }

    if (userOtp.otp !== otp) {
      return res
        .status(status.BAD_REQUEST)
        .json({ Status: false, error: "Invalid OTP" });
    }

    user.emailVerified = true;
    user.profileStatus = 1;
    user.password = newPassword;
    await user.save();

    const message = "Password has been reset successfully";

    res.status(status.OK).json({
      Status: true,
      message,
    });
  } catch (error) {
    res
      .status(status.UNAUTHORIZED)
      .json({ Status: false, error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const user = req.user;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(status.BAD_REQUEST).json({
        Status: false,
        error: "Please provide both the old and new passwords.",
      });
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordMatch) {
      throw new Error("Invalid old password");
    }

    user.password = newPassword;
    await user.save();

    const message = "Password has been changed successfully";

    res.status(status.OK).json({
      Status: true,
      message,
    });
  } catch (error) {
    res
      .status(status.UNAUTHORIZED)
      .json({ Status: false, error: error.message });
  }
};

const createProfile = async (req, res) => {
  try {
    const user = req.user;
    const profilePicture = req.file?.path || "";
    const {
      firstName,
      lastName,
      dob,
      gender,
      height,
      weight,
      fitnessLevel,
      language,
    } = req.body;

    const updatedData = {
      firstName,
      lastName,
      dob,
      gender,
      height,
      weight,
      fitnessLevel,
      language,
      profilePicture,
      profileStatus: 2,
    };

    const updatedUser = await User.findByIdAndUpdate(user._id, updatedData, {
      new: true,
    });

    const message = "Profile  has been updated successfully";

    res.status(status.OK).json({
      Status: true,
      message: message,
      user: updatedUser,
    });
  } catch (error) {
    res
      .status(status.UNAUTHORIZED)
      .json({ Status: false, error: error.message });
  }
};

const registerLoginOauth = async (req, res) => {
  try {
    const { email, authType, firstName, lastName, profilePicture } = req.body;
    if (!email || !authType) {
      return res
        .status(status.BAD_REQUEST)
        .json({ Status: false, error: "Missing required field." });
    }

    let user = await User.findOne({ email });
    let message;
    if (user) {
      message = "Logged in successfully";
    } else {
      const newUser = {
        email: email,
        emailVerified: true,
        profileStatus: 1,
      };
      if (authType) {
        newUser.authType = authType;
      }
      if (firstName && lastName) {
        newUser.firstName = firstName;
        newUser.lastName = lastName;
      }

      if (profilePicture) {
        newUser.profilePicture = profilePicture;
      }
      user = await User.create(newUser);
      message = "Registered Successfully";
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.status(status.OK).json({ Status: true, message, token, user });
  } catch (error) {
    res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ Status: false, error: error.message });
  }
};

const loginOrSignUpOauth = async (req, res) => {
  try {
    const { email, authId, authType } = req.body;

    if (!authId || !authType) {
      return res.status(status.BAD_REQUEST).json({ Status: false, error: "Auth Id and type is required!" });
    }

    if(email) {
      const data = await User.findOne({ email, authType: 'local' });
      if (data) {
        return res.status(status.BAD_REQUEST).json({ Status: false, error: "This Email Address requires password, please try logging in using Email and Password!!" });
      }
    }

    const existingUser = await User.findOne({ authId });

    if (existingUser) {
      const token = jwt.sign({ userId: existingUser._id }, jwtSecret);
      const message = "Logged in Successfully";
      res.status(status.OK).json({
        Status: true,
        user: {
          ...existingUser.toObject(),
          token,
        },
        message,
      });
    } else {
      const newUser = {
        email: email,
        authId: authId,
        authType: authType,
        profileStatus: 1
      };

      const user = await User.create(newUser);

      const token = jwt.sign({ userId: user._id }, jwtSecret);

      res.status(status.OK).json({
        Status: true,
        user: {
          ...user.toObject(),
          token,
        },
        message: "Registered successfully",
      });
    }

  } catch (error) {
    res
      .status(status.INTERNAL_SERVER_ERROR)
      .json({ Status: false, error: error.message });
  }
};

module.exports = {
  register,
  login,
  verifyOtp,
  profile,
  forgotPassword,
  resetPassword,
  changePassword,
  registerLoginOauth,
  createProfile,
  resendOtp,
  verifyOtpResetPassword,
  loginOrSignUpOauth
};
