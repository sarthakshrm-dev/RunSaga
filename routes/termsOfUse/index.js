const express = require("express");
const router = express.Router();

const {
    createTermsOfUse,
    getTermsOfUse,
    updateTermsOfUse,
    deleteTermsOfUse,
} = require("./routes.js");

router.post("/", createTermsOfUse);
router.get("/", getTermsOfUse);
router.put("/", updateTermsOfUse);
router.delete("/", deleteTermsOfUse);

module.exports = router;
