const express = require("express");
const router = express.Router();

const {
  createAboutUs,
  getAboutUs,
  updateAboutUs,
  deleteAboutUs,
} = require("./routes.js");

router.post("/", createAboutUs);
router.get("/", getAboutUs);
router.put("/", updateAboutUs);
router.delete("/", deleteAboutUs);

module.exports = router;
