const express = require("express");
const { addToFavourite, getAllFavourite, removeFromFavourite } = require("./routes");
const router = express.Router();

router.post("/:id", addToFavourite);
router.get("/", getAllFavourite);
router.delete("/:id", removeFromFavourite);


module.exports = router;
