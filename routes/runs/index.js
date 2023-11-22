const express = require("express");
const { quickRun, startRun, endRun, getRuns, getRunById, pauseResume, tryAgain } = require("./routes");
const router = express.Router();

router.get("/", getRuns);
router.get("/get-by-id/:id", getRunById);
router.get("/quick-run", quickRun);
router.post("/", startRun);
router.put("/pause-resume/:id", pauseResume);
router.put("/try-again/:id", tryAgain);
router.put("/:id", endRun);


module.exports = router;
