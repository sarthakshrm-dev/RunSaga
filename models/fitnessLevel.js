const mongoose = require("mongoose");

const fitnessLevelSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: ["Couchling", "Trotter", "Strider", "Galloper", "Sprinter", "Speedster"],
      required: true,
    },
    workoutFrequency: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    versionKey: false, // Disables the version key
  }
);

module.exports = fitnessLevelSchema;
