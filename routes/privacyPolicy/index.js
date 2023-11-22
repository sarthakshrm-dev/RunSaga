const express = require("express");
const router = express.Router();

const {
  createPrivacyPolicy,
  getPrivacyPolicy,
  updatePrivacyPolicy,
  deletePrivacyPolicy,
} = require("./routes.js");

router.post("/", createPrivacyPolicy);
router.get("/", getPrivacyPolicy);
router.put("/", updatePrivacyPolicy);
router.delete("/", deletePrivacyPolicy);

module.exports = router;
