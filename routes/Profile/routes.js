const status = require("http-status");
const jwt = require("jsonwebtoken");

const { User, Transactions } = require("../../models");
const { saveNotification } = require("../Notification/routes");

const getUserDetails = async (req, res) => {
    try {
        if (!req.id) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        const userId = req.id;

        const data = await User.findById(userId).populate("fitnessLevel", "level workoutFrequency");

        if (!data) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "Can not find User" });
        }
        res.status(status.OK).json(data);

    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
}

const updateUser = async (req, res) => {
    const updateData = req.body;
    const profilePicture = req.file?.path || "";
    try {
        if (!req.user) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        const userId = req.id;

        if (updateData._id) {
            userId = updateData._id;
        }

        const existingUser = await User.findById(userId);

        if (!existingUser) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "Can not find User" });
        }

        let height;
        let weight;

        if (updateData.height) {
            height = JSON.parse(updateData.height);
            if (typeof (height.value) != "number" || typeof (height.unit) != "string") {
                return res.status(status.NOT_FOUND).json({ Status: false, error: "The provided value format of height is not correct" });
            }
        }

        if (updateData.weight) {
            weight = JSON.parse(updateData.weight);

            if (typeof (weight.value) != "number" || typeof (weight.unit) != "string") {
                return res.status(status.NOT_FOUND).json({ Status: false, error: "The provided value format of weight is not correct" });
            }
        }

        existingUser.firstName = updateData.firstName || existingUser.firstName;
        existingUser.lastName = updateData.lastName || existingUser.lastName;
        existingUser.dob = updateData.dob || existingUser.dob;
        existingUser.gender = updateData.gender || existingUser.gender;
        existingUser.height = height || existingUser.height;
        existingUser.weight = weight || existingUser.weight;
        existingUser.language = updateData.language || existingUser.language;
        existingUser.profileStatus = updateData.profileStatus || existingUser.profileStatus;
        existingUser.profilePicture = profilePicture || existingUser.profilePicture;
        existingUser.updatedAt = Date.now();

        await existingUser.save();
        return res.status(200).json({ Status: true, data: existingUser, message: "Profile is updated!" });
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
}

const getAllUsers = async (req, res) => {
    try {
        if (!req.id) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        const data = await User.find({}).sort({ updatedAt: -1 }).populate("fitnessLevel", "level workoutFrequency");

        if (!data) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "No Users found" });
        }

        res.status(status.OK).json(data);
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

const updateFitnessLevel = async (req, res) => {
    const updateData = req.body;
    try {
        if (!req.user) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        const userId = req.id;

        const existingUser = await User.findById(userId);

        if (!existingUser) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "Can not find User" });
        }

        if (typeof (updateData.fitnessLevel) != "number") {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "The provided value format is not correct" });
        }

        existingUser.fitnessLevel = updateData.fitnessLevel;
        existingUser.updatedAt = Date.now();

        await existingUser.save();
        return res.status(200).json({ Status: true, data: existingUser, message: "Chase Mode status is updated!" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const checkSubscriptionStatus = async (req, res) => {
    try {
        if (!req.id) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        const userId = req.id;
        const existingUser = await User.findById(userId);

        if (existingUser.subscriptionPlan != 0) {

            // Find the last transaction done by the user
            const lastTransaction = await Transactions.findOne({ user: req.id }).sort({ createdAt: -1 });

            if (!lastTransaction) {
                return res.status(status.NOT_FOUND).json({ Status: false, error: "No transactions found for the user" });
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const subscriptionType = lastTransaction.plan; // Assuming you have a field for subscriptionType

            // Calculate the expiration date based on the subscription type
            const expirationDate = lastTransaction.expireAt;
            if (subscriptionType === 'Yearly') {
                expirationDate.setFullYear(expirationDate.getFullYear());
            } else if (subscriptionType === 'Monthly') {
                expirationDate.setMonth(expirationDate.getMonth());
            }

            // Compare the expiration date with today's date
            if (expirationDate >= today) {
                return res.status(status.OK).json({ Status: true, message: "Subscription is active" });
            } else {
                existingUser.subscriptionStatus = 1;
                await existingUser.save();

                const notification = {
                    userId: userId,
                    activityId: userId,
                    type: "subscription",
                    title: "Subscription Status",
                    description: "Your subscription is expired"
                }
                await saveNotification(req, res, notification);
                return res.status(status.OK).json({ Status: false, message: "Subscription is expired" });
            }

        } else {
            return res.status(status.OK).json({ Status: true, message: "You are on Basic Free Subscription!" });
        }
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
}

const deleteProfile = async (req, res) => {
    const id = req.params.id;
    try {
        if (!req.id) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "Profile not found" });
        }
        res.status(200).json({
            Status: true,
            data: deletedUser,
            message: "Profile deleted successfully"
        });

    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
}


module.exports = {
    updateUser,
    getUserDetails,
    getAllUsers,
    updateFitnessLevel,
    checkSubscriptionStatus,
    deleteProfile
}