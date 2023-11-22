const express = require("express");
const { createSaga, getAllSaga, getMySaga, sagaDetail, getTopSaga, getRecommendedSaga, getNewSaga, getPopularSaga, clearAllSaga, getAllSagaCreatedByUser, updateSaga, deleteSaga } = require("./routes");
const router = express.Router();

router.post("/", createSaga);
router.get("/", getAllSaga);
router.get("/mySaga", getMySaga);
router.get("/detail/:id", sagaDetail);
router.get("/top", getTopSaga);
router.get("/recommended", getRecommendedSaga);
router.get("/new", getNewSaga);
router.get("/popular", getPopularSaga);
router.delete("/clear", clearAllSaga);
router.get("/userSaga", getAllSagaCreatedByUser);
router.delete("/saga/:id", deleteSaga);
router.put("/saga/:id", updateSaga);





module.exports = router;
