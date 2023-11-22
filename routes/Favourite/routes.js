const status = require("http-status");
const { Favourite } = require("../../models");
const ObjectId = require("mongodb").ObjectId;

const addToFavourite = async (req, res) => {
    const saga = req.params.id;

    try {
        if (!req.id) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        if (!saga) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "Saga Id is required!" });
        }

        if (!ObjectId.isValid(saga)) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "This Saga Id does not exist in database!" });
        }

        const checkExisting = await Favourite.find({ user: req.id, saga: saga });

        if (checkExisting.length > 0) {
            return res.status(400).json({ Status: false, error: "This Saga already exists in your favourites!" });
        }


        const user = req.id;

        const favourite = {
            saga,
            user
        };

        const data = await Favourite.create(favourite);

        res.status(200).json({
            Status: true,
            data: data,
            message: "Added to favourites successfully!",
        });

    } catch (error) {
        return res.status(error.INTERNAL_SERVER_ERROR).json({ status: false, message: error.message });
    }
};

const getAllFavourite = async (req, res) => {

    try {
        if (!req.id) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        const data = await Favourite.find({ user: req.id }).sort({ updatedAt: -1 }).populate("user", "email firstName lastName profilePicture").populate("saga", "title description thumbnail ")

        if (data.length === 0) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "No Favourites found" });
        }

        return res.status(200).json({ Status: true, data: data, message: "Retrieved data!" });

    } catch (error) {
        return res.status(error.INTERNAL_SERVER_ERROR).json({ status: false, message: error.message });
    }
};

const removeFromFavourite = async (req, res) => {
    const id = req.params.id;
    try {
        if (!req.id) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        const deletedData = await Favourite.findOneAndDelete({ user: req.id, saga: id });

        if (!deletedData) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "Favourite data not found" });
        }

        res.status(200).json({ Status: true, data: deletedData, message: "This Saga is removed from your favourites" });

    } catch (error) {
        return res.status(error.INTERNAL_SERVER_ERROR).json({ status: false, message: error.message });
    }
};

module.exports = {
    addToFavourite,
    getAllFavourite,
    removeFromFavourite
}