const express = require("express");
const router = express.Router();

const {
  createVoice,
  getVoices,
  getVoiceById,
  updateVoice,
  deleteVoice,
  getSearchResultForVoice
} = require("./routes"); 


router.post("/",  createVoice);
router.get("/", getVoices);
router.get("/:id", getVoiceById);
router.put("/:id", updateVoice);
router.delete("/:id", deleteVoice);
router.post("/list", getSearchResultForVoice);


module.exports = router;
