const express = require("express");
const router = express.Router();

const {
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
} = require("./routes");
const multer = require("multer");

const { jwtDecoder } = require("../../services/middleware");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/user");
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

router.post("/register", register);
router.post("/loginOrSignUpOauth", loginOrSignUpOauth);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp-reset-password", verifyOtpResetPassword);
router.post("/reset-password", jwtDecoder, resetPassword);
router.post("/registerLoginOauth", registerLoginOauth);

router.post("/change-password", jwtDecoder, changePassword);

router.post(
  "/create-profile",
  jwtDecoder,
  upload.single("profilePicture"),
  createProfile
);
router.post("/profile", jwtDecoder, profile);

module.exports = router;
