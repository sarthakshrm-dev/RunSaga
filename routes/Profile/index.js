const express = require("express");
const { updateUser, getUserDetails, updateFitnessLevel, getAllUsers, checkSubscriptionStatus, deleteProfile } = require("./routes");
const router = express.Router();
const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/user");
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    },
});
const upload = multer({ storage });

router.get("/user", getUserDetails);
router.put("/editUser", upload.single("profilePicture"), updateUser);
router.put("/editUserFitness", updateFitnessLevel);
router.get("/userList", getAllUsers);
router.get("/checkSubscription", checkSubscriptionStatus);
router.delete("/:id", deleteProfile);


module.exports = router;
