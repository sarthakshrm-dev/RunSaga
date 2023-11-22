// searchSchemaModel.js

const mongoose = require("mongoose");

const searchSchema = new mongoose.Schema(
  {
    searchText: {
      type: String,
      required: true,
    },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" }
  },
  {
    timestamps: true, // Enable built-in timestamps
    versionKey: false, // Disable the version key
  }
);


module.exports = searchSchema;
