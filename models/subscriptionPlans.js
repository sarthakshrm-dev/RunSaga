const mongoose = require("mongoose");

const subscriptionPlansSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            enum: {
                values: ["Monthly", "Yearly"],
                message: "Invalid type",
            },
            default: "Monthly",
        },
        features: {
            type: [mongoose.Schema.Types.Mixed], // JSON array column
            default: ["No Ads"], // Default empty array
        },
    },
    {
        versionKey: false,
        timestamps: true,
    }
);

module.exports = subscriptionPlansSchema;
