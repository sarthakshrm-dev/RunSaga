const express = require("express");
const router = express.Router();

const {
  createSubscription,
  getAllSubscriptions,
  updateSubscription,
  deleteSubscription
} = require("./routes"); // Adjust the import path as needed

router.post("/", createSubscription);
router.get("/", getAllSubscriptions);
router.put("/:id", updateSubscription);
router.delete("/:id", deleteSubscription);

module.exports = router;
