const status = require("http-status");
const { Rating } = require("../../models");
const ObjectId = require("mongodb").ObjectId;

const postRating = async (req, res) => {
    try {
        const { storyEngagement, difficultyLevel, overallExperience, comment, saga } = req.body;

        if (!req.id) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        if (!saga) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "Saga Id is required!" });
        }

        if (!ObjectId.isValid(saga)) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "This Saga Id does not exist in database!" });
        }

        const user = req.id;

        // Calculate the average rating
        const averageRating = (storyEngagement + difficultyLevel + overallExperience) / 3;


        const rating = {
            storyEngagement,
            difficultyLevel,
            overallExperience,
            comment,
            saga,
            averageRating,
            user
        };

        const data = await Rating.create(rating);

        res.status(200).json({
            Status: true,
            data: data,
            message: "Rating created successfully!",
        });

    } catch (error) {
        return res.status(error.INTERNAL_SERVER_ERROR).json({ status: false, message: error.message });
    }
};

const getAllRatings = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        const data = await Rating.find({}).sort({ updatedAt: -1 }).populate("user", "email firstName lastName profilePicture").populate("saga", "title description thumbnail ")

        if (!data) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "No Saga Story found" });
        }

        return res.status(200).json({ Status: true, data: data, message: "Retrieved data!" });

    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
}

const clearAllRatings = async (req, res) => {
    try {

        if (!req.id) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        const userId = req.id;

        await Rating.deleteMany({ user: userId });

        return res.status(200).json({ Status: true, message: "Ratings are cleared!" });
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};

module.exports = {
    postRating,
    getAllRatings,
    clearAllRatings
}