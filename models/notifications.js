// NotificationSchema.js

const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
    {
        activityOwner: {
            type: String
        },
        activityId: {
            type: String
        },
        activityType: {
            type: String
        },
        title: {
            type: String
        },
        description: {
            type: String
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true, // Enable built-in timestamps
        versionKey: false, // Disable the version key
    }
);


module.exports = NotificationSchema;
