const mongoose = require("mongoose");

const sagaSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        keyword: {
            type: String
        },
        description: {
            type: String
        },
        thumbnail: {
            type: String,
            required: true
        },
        category:  { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
        voice: { type: mongoose.Schema.Types.ObjectId, ref: "Voice" },
        storyDetail: {
            type: String,
            required: true
        },
        audioFile: {
            type: String,
            required: true
        },
        audioFileLength: {
            type: String
        },
        type: {
            type: String
        },
        isCustom : {
            type: Boolean,
            default: false
        },
        visibleToAll : {
            type: Boolean,
            default: true
        },
        clicks : {
            type: Number,
            default: 0
        },
        createdBy : {
            type: String,
            default: "AI Generated"
        }
    },
    {
        versionKey: false,
        timestamps: true,
    }
);

module.exports = sagaSchema;
