// searchSchemaModel.js

const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
    {
        storyEngagement: {
            type: Number,
            required: true,
        },

        difficultyLevel: {
            type: Number,
            required: true,
        },

        overallExperience: {
            type: Number,
            required: true,
        },

        comment: {
            type: String
        },

        averageRating: {
            type: Number,
            default :  0
        },

        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        saga: { type: mongoose.Schema.Types.ObjectId, ref: "SagaSchema" }
    },
    {
        timestamps: true, // Enable built-in timestamps
        versionKey: false, // Disable the version key
    }
);


module.exports = ratingSchema;
