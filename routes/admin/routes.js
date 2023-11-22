const status = require("http-status");
const jwt = require("jsonwebtoken");
const { Admin } = require("../../models");
const { verifyOtpForProfile, sendOtp } = require("../../services/otp");

const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, dob, gender } = req.body;

        if (!email || !password) {
            return res.status(status.BAD_REQUEST).json({ Status: false, error: "Both email and password are required" });
        }

        const checkExistingAdmin = await Admin.findOne({ email });

        if (checkExistingAdmin) {
            return res.status(status.CONFLICT).json({ Status: false, error: "Email address is already in use" });
        }

        const newAdmin = {
            email,
            password,
            firstName,
            lastName,
            dob,
            gender
        };

        const admin = await Admin.create(newAdmin);
        delete newAdmin.password;
        const message = "Registration successful";

        res.status(status.OK).json({
            Status: true,
            data: {
                email: admin.email,
                profileStatus: admin.profileStatus,
            },
            message,
        });

    } catch (error) {
        return res.status(error.INTERNAL_SERVER_ERROR).json({ status: false, message: error.message });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(status.BAD_REQUEST).json({ Status: false, error: "Both email and password are required" });
        }

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(status.BAD_REQUEST).json({ Status: false, error: "Admin does not exist with this email address" });
        }

        if (admin.authType !== "local") {
            return res.status(status.BAD_REQUEST).json({ Status: false, error: "Invalid email and password" });
        }


        if (password != admin.password) {
            return res.status(status.BAD_REQUEST).json({ Status: false, error: "Password is not valid" });
        }

        await sendOtp(req, res, admin);

    } catch (error) {
        return res.status(error.INTERNAL_SERVER_ERROR).json({ status: false, error: error.message });
    }
}

const verifyOtp = async (req, res) => {
    try {
        await verifyOtpForProfile(req, res, Admin);
    } catch (error) {
        console.error("Error in verifyOtp:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json({
            Status: false,
            error: "An internal server error occurred",
        });
    }
};

const getAllAdmins = async (req, res) => {
    try {
        const data = await Admin.find({}).sort({ updatedAt: -1 });
        if (!data) {
            return res.status(status.NOT_FOUND).json({ error: "Admin not found" });
        }
        res.status(status.OK).json(data);
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};

const resendOtp = async (req, res) => {
    try {
        await resendOtpToProfile(req, res, Admin);
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};



module.exports = {
    register,
    login,
    getAllAdmins,
    verifyOtp,
    resendOtp
}