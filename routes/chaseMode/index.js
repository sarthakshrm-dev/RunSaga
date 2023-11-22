const express = require("express");
const router = express.Router();

const { updateUserChaseMode } = require("./routes");

router.put("/", updateUserChaseMode);

module.exports = router;
