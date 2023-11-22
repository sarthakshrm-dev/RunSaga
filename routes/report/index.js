const express = require("express");
const router = express.Router();

const { saveWatchData, getWatchData, updateWatchData, getWatchDataById, deleteData } = require("./routes"); // Adjust the import path as needed

router.post("/", saveWatchData);
router.get("/", getWatchData);
router.get("/:id", getWatchDataById);
router.put("/", updateWatchData);
router.delete("/:id", deleteData);

module.exports = router;