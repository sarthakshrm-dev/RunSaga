const express = require("express");
const router = express.Router();

const {
    register,
    login,
    getAllAdmins,
    verifyOtp
} = require("./routes.js");

router.post("/signup", register);
router.post("/login", login);
router.get("/", getAllAdmins);
router.post("/verifyOtpAdmin", verifyOtp);
router.post("/resendOtpAdmin", verifyOtp);

module.exports = router;
