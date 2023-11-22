const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      unique: [true, "Category with this name already exists"],
    },
    description: {
      type: String
    },
    thumbnail: {
      type: String
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = categorySchema;
