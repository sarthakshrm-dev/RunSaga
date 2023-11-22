const mongoose = require("mongoose");

const voiceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        audioFile: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = voiceSchema;
