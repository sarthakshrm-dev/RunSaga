const mongoose = require("mongoose");

const runsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    saga: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SagaSchema",
      required: true,
    },
    calories: {
      type: Number,
      required: true,
    },
    distance: {
      type: Number,
      required: true,
    },
    pace: {
      type: Number,
      required: true,
    },
    steps: {
      type: Number,
      required: true,
    },
    success: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['running', 'paused', 'game over', 'ended', 'win'],
      required: true,
    },
    tryAgain: {
      type: Boolean,
      default: false,
    },
    quickRun: {
      type: Boolean,
      required: true,
    },
    quickRunMode: {
      type: String,
      enum: ['tredmill', 'road']
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = runsSchema;
