const express = require("express");
const router = express.Router();

const { createTransaction, updateTransaction, getAllTransactions } = require("./routes");

router.post("/", createTransaction);
router.put("/:id", updateTransaction);
router.get("/", getAllTransactions);

module.exports = router;
