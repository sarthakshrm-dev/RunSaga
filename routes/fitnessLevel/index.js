const express = require("express");
const router = express.Router();

const {
  createFitnessLevel,
  getFitnessLevel,
  getFitnessLevelById,
  updateFitnessLevel,
  deleteFitnessLevel,
  updateUserFitnessLevel
} = require("./routes"); // Adjust the import path as needed

router.post("/", createFitnessLevel);
router.get("/", getFitnessLevel);
router.get("/:id", getFitnessLevelById);
router.put("/:id", updateFitnessLevel);
router.delete("/:id", deleteFitnessLevel);
router.put("/user/update", updateUserFitnessLevel);

module.exports = router;
