const express = require("express");
const { postRating, getAllRatings, clearAllRatings } = require("./routes");
const router = express.Router();

router.post("/", postRating);
router.get("/", getAllRatings);
router.delete("/", clearAllRatings);





module.exports = router;
