const status = require("http-status");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const { OTP } = require("./../models");
const jwtSecret = process.env.JWT_SECRET;
const {
    sendRegisterEmail,
    sendResetEmail,
    sendForgotPasswordEmail,
} = require("./email");

const generateOTP = () => {
    const OTP = otpGenerator.generate(4, {
        digits: true,
        specialChars: false,
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
    });
    return OTP;
};

const verifyOtpForProfile = async (req, res, model) => {
    try {
        const { otp, email } = req.body;
        const entity = await model.findOne({ email });

        if (!entity) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "Profile not found" });
        }

        const entityOtp = await OTP.findOne({ userId: entity._id });

        const currentTime = new Date();
        if (currentTime > entityOtp.expiresAt) {
            return res.status(status.BAD_REQUEST).json({ Status: false, error: "OTP is expired" });
        }

        if (entityOtp.otp !== otp) {
            return res.status(status.BAD_REQUEST).json({ Status: false, error: "Invalid OTP" });
        }

        entity.emailVerified = true;
        entity.profileStatus = 1;
        await entity.save();

        const token = jwt.sign({ userId: entity._id }, jwtSecret);

        const message = "Email verification successful";
        res.status(status.OK).json({ Status: true, message, profile: { ...entity.toObject(), token } });
    } catch (error) {
        console.error("Error in verifyOtp:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json({
            Status: false,
            error: "An internal server error occurred",
        });
    }
};

const resendOtpToProfile = async (req, res, model) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(status.BAD_REQUEST).json({ Status: false, error: "Email is required" });
        }

        const entity = await model.findOne({ email });

        if (!entity) {
            return res.status(status.BAD_REQUEST).json({ Status: false, message: "Profile not found" });
        }

        const expirationTime = new Date();
        expirationTime.setMinutes(expirationTime.getMinutes() + 15);
        const newOTP = generateOTP();

        const existingOTP = await OTP.findOne({ userId: entity._id });

        if (existingOTP) {
            existingOTP.otp = newOTP;
            existingOTP.expiresAt = expirationTime;
            await existingOTP.save();
        } else {
            const otp = new OTP({
                userId: entity._id,
                otp: newOTP,
                expiresAt: expirationTime,
            });
            await otp.save();
        }

        await sendRegisterEmail(entity.email, newOTP);

        const message = "OTP resent successfully";

        res.status(status.OK).json({
            Status: true,
            user: {
                email: entity.email,
                profileStatus: entity.profileStatus,
            },
            message,
        });
    } catch (error) {
        res
            .status(status.INTERNAL_SERVER_ERROR)
            .json({ Status: false, error: error.message });
    }
};

const sendOtp = async (req, res, data) => {
    const newOTP = generateOTP();
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 15);

    const existingOTP = await OTP.findOne({ userId: data._id });

    if (existingOTP) {
        existingOTP.otp = newOTP;
        existingOTP.expiresAt = expirationTime;
        await existingOTP.save();
    } else {
        const otp = new OTP({
            userId: data._id,
            otp: newOTP,
            expiresAt: expirationTime,
        });
        await otp.save();
    }

    await sendRegisterEmail(data.email, newOTP);
    const message = "An OTP has been sent to your email for login";

    res.status(status.OK).json({
        Status: true,
        message,
    });
}

module.exports = {
    verifyOtpForProfile,
    resendOtpToProfile,
    sendOtp,
    generateOTP
}
