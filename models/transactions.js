// NotificationSchema.js

const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        type: {
            type: String,
            enum: {
                values: ["Google", "Apple"],
            },
        },
        plan: {
            type: String,
            enum: {
                values: ["Monthly", "Yearly"],
            },
        },
        statusType: {
            type: String,
            enum: {
                values: ["Success", "Pending", "Failed"]
            },
        },
        expireAt : {
            type: Date,
        },
        amount: {
            type: Number,
            require : true
        },
        transactionId: {
            type: String,
            require : true
        }
    },
    {
        timestamps: true, // Enable built-in timestamps
        versionKey: false, // Disable the version key
    }
);


module.exports = transactionSchema;
