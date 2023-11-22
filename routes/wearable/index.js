const express = require("express");
const router = express.Router();

const { updateUserWearableStatus } = require("./routes"); // Adjust the import path as needed

router.put("/", updateUserWearableStatus);

module.exports = router;