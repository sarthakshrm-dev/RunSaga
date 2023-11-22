// recentSearchesRoutes.js

const express = require("express");
const router = express.Router();

const { getRecentSearches, getSearchResult, clearRecentSearches, deleteSearchById } = require("./routes.js");

router.get("/", getRecentSearches); // Get recent searches
router.delete("/", clearRecentSearches); // Clear all recent searches
router.get("/list", getSearchResult); // Clear all recent searches
router.delete("/:id", deleteSearchById); 


module.exports = router;
