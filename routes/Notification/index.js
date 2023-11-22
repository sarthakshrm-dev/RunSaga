const express = require("express");
const { getAllNotification } = require("./routes");
const router = express.Router();

router.get("/", getAllNotification);

module.exports = router;