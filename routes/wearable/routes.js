const status = require("http-status");
const { User } = require("../../models");
const { SmartWatch } = require("../../models")
const mongoose = require("mongoose");

const updateUserWearableStatus = async (req, res) => {
  const updateData = req.body;
  try {
    if (!req.user) {
      return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
    }

    const userId = req.id;

    const existingUser = await User.findById(userId);

    if (!existingUser) {
      return res.status(status.NOT_FOUND).json({ Status: false, error: "Can not find User" });
    }

    if (typeof (updateData.wearableStatus) != "boolean") {
      return res.status(status.NOT_FOUND).json({ Status: false, error: "The provided value format is not correct" });
    }

    existingUser.wearableStatus = updateData.wearableStatus;
    existingUser.updatedAt = Date.now();

    await existingUser.save();
    return res.status(200).json({ Status: true, data: existingUser, message: "Wearable status is updated!" });
  } catch (error) {
    res.status(500).json({ Status: false, error: error.message });
  }
};



module.exports = {
  updateUserWearableStatus
};
