const status = require("http-status");
const { Transactions, User } = require("../../models");
const ObjectId = require("mongodb").ObjectId;

const createTransaction = async (req, res) => {
    try {
        const { type, statusType, amount, plan, transactionId } = req.body;

        if (!req.user) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        if (!ObjectId.isValid(req.id)) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "This User Id does not exist in database!" });
        }

        if (statusType === "Success") {
            const newTransaction = {
                user: req.id,
                type: type,
                plan: plan,
                statusType: statusType,
                amount: amount,
                transactionId: transactionId,
                expireAt : Date.now()
            };

            const data = await Transactions.create(newTransaction);

            const userData = await User.findById(req.id);

            userData.subscriptionStatus = 2;   //for active subscription

            await userData.save();

            res.status(200).json({
                Status: true,
                data: data,
                message: "New Transaction done successfully!",
            });
        } else {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "Something went wrong, please try again!" });
        }

    } catch (error) {
        return res.status(error.INTERNAL_SERVER_ERROR).json({ Status: false, message: error.message });
    }
};

const updateTransaction = async (req, res) => {
    const updatedData = req.body;
    try {
        const id = req.params.id;

        const existingData = await Transactions.findById(id);

        if (!existingData) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "Can not find Transactions" });
        }

        existingData.expireAt = new Date(updatedData.time);

        existingData.save();

        res.status(200).json({
            Status: true,
            data: existingData,
            message: "Transactions updated successfully"
        });
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

const getAllTransactions = async (req, res) => {
    try {
        if (!req.id) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        const data = await Transactions.find({}).sort({ updatedAt: -1 }).populate("user", "email firstName lastName profilePicture");

        if (!data) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "No Users found" });
        }

        res.status(status.OK).json(data);
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

module.exports = {
    createTransaction,
    updateTransaction,
    getAllTransactions
}