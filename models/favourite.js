// searchSchemaModel.js

const mongoose = require("mongoose");

const favouriteSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        saga: { type: mongoose.Schema.Types.ObjectId, ref: "SagaSchema" }
    },
    {
        timestamps: true, // Enable built-in timestamps
        versionKey: false, // Disable the version key
    }
);


module.exports = favouriteSchema;
