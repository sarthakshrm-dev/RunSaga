const status = require("http-status");
const jwt = require("jsonwebtoken");
const { Saga, Favourite, Rating } = require("../../models");
const { saveNotification } = require("../Notification/routes");
const ObjectId = require("mongodb").ObjectId;


const createSaga = async (req, res) => {
    try {
        const { title, keyword, description, thumbnail, category, voice, storyDetail, audioFile, audioFileLength, isCustom, type } = req.body;

        if (!req.user) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        if (!ObjectId.isValid(category)) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "This Category Id does not exist in database!" });
        }

        if (!ObjectId.isValid(voice)) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "This Voice Id does not exist in database!" });
        }

        const createdBy = isCustom ? req.id : "AI Generated";

        let isVisible = true;

        if (createdBy == req.id) {
            isVisible = false;
        }

        const newSaga = {
            title,
            keyword,
            description,
            thumbnail,
            category,
            voice,
            storyDetail,
            audioFile,
            audioFileLength,
            isCustom,
            createdBy,
            visibleToAll: isVisible,
            type
        };

        const data = await Saga.create(newSaga);

        if (!isCustom) {
            const notification = {
                userId: "All",
                activityId: data._id,
                type: "create saga",
                title: "A new Saga has been created, Go check it out!",
                description: description
            }
            await saveNotification(req, res, notification);
        }

        res.status(200).json({
            Status: true,
            data: data,
            message: "New Saga created!",
        });


    } catch (error) {
        return res.status(error.INTERNAL_SERVER_ERROR).json({ Status: false, message: error.message });
    }
}

const getAllSaga = async (req, res) => {
    try {
        if (!req.id) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        const filter = {
            isCustom: false,
            visibleToAll: true
        }; // No specific rating filter for all Sagas
        return aggregateSagaData(filter, res, req);
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

const getMySaga = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        const filter = {
            createdBy: req.id,
            isCustom: true,
            // averageOverallRating: { $gt: 3 }
        };
        return aggregateSagaData(filter, res, req);
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

async function aggregateSagaData(filter, res, req) {
    try {
        if (!req.id) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        // Aggregate ratings and filter Sagas based on the provided filter
        const sagas = await Saga.aggregate([
            {
                $lookup: {
                    from: 'rating',
                    localField: '_id',
                    foreignField: 'saga',
                    as: 'rating',
                },
            },
            {
                $addFields: {
                    averageOverallRating: {
                        $avg: '$rating.overallExperience',
                    },
                },
            },
            {
                $match: filter,
            },
        ]).sort({ updatedAt: -1 }).exec();

        await Saga.populate(sagas, [{ path: 'category', select: 'categoryName description thumbnail' }, { path: 'voice', select: 'name audioFile' }]);

        if (sagas.length === 0) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "No Saga Story found" });
        }

        const dataWithFavourite = await checkFavoritesWithSaga(req, res, sagas, true);

        return res.status(200).json({ Status: true, data: dataWithFavourite, message: "Retrieved data!" });
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
}

const sagaDetail = async (req, res) => {
    const id = req.params.id;
    try {
        if (!req.user) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        const data = await Saga.findById(id).populate("category", "categoryName description thumbnail").populate("voice", "name audioFile");

        if (!data) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "No Saga Story found" });
        }

        updateClicksOfSaga(data);  //call this to increase clicks

        const favoriteSaga = await Favourite.findOne({ user: req.id, saga: data._id });

        // Include the favorite status in the response
        const response = {
            ...data.toObject(),
            isFavorite: !!favoriteSaga // Set to true if the saga is a favorite, false otherwise
        };

        return res.status(200).json({ Status: true, data: response, message: "Retrieved data!" });

    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

const updateClicksOfSaga = async (saga) => {
    try {
        saga.clicks += 1;
        saga.updatedAt = Date.now();
        await saga.save();
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

const getTopSaga = async (req, res) => {
    const body = req.body;
    try {
        if (!req.user) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        let data;

        if (body.type) {
            data = await Saga.find({ type: 'Top', visibleToAll: true }).populate("category", "categoryName description thumbnail").populate("voice", "name audioFile").limit(8);

        } else {
            data = await Saga.find({ type: 'Top', visibleToAll: true }).populate("category", "categoryName description thumbnail").populate("voice", "name audioFile");
        }

        if (!data) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "No Saga Story found" });
        }

        const dataWithFavourite = await checkFavoritesWithSaga(req, res, data, false);

        return res.status(200).json({ Status: true, data: dataWithFavourite, message: "Retrieved data!" });

    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

const getRecommendedSaga = async (req, res) => {
    const body = req.body;
    try {
        if (!req.user) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        let data;

        if (body.type) {
            data = await Saga.find({ type: 'Recommended', visibleToAll: true }).populate("category", "categoryName description thumbnail").populate("voice", "name audioFile").limit(15);
        } else {
            data = await Saga.find({ type: 'Recommended', visibleToAll: true }).populate("category", "categoryName description thumbnail").populate("voice", "name audioFile");
        }


        if (!data) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "No Saga Story found" });
        }

        const dataWithFavourite = await checkFavoritesWithSaga(req, res, data, false);

        return res.status(200).json({ Status: true, data: dataWithFavourite, message: "Retrieved data!" });

    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

const getNewSaga = async (req, res) => {
    const body = req.body;
    try {
        if (!req.user) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        let data;

        if (body.type) {
            data = await Saga.find({ visibleToAll: true }).sort({ updatedAt: -1 }).populate("category", "categoryName description thumbnail").populate("voice", "name audioFile").limit(15);
        } else {
            data = await Saga.find({ visibleToAll: true }).sort({ updatedAt: -1 }).populate("category", "categoryName description thumbnail").populate("voice", "name audioFile");
        }

        if (!data) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "No Saga Story found" });
        }

        const dataWithFavourite = await checkFavoritesWithSaga(req, res, data, false);

        return res.status(200).json({ Status: true, data: dataWithFavourite, message: "Retrieved data!" });

    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

const getPopularSaga = async (req, res) => {
    const body = req.body;
    try {
        if (!req.user) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        let data;

        if (body.type) {
            data = await Saga.find({ type: 'Popular', visibleToAll: true }).sort({ updatedAt: -1 }).populate("category", "categoryName description thumbnail").populate("voice", "name audioFile").limit(15);
        } else {
            data = await Saga.find({ type: 'Popular', visibleToAll: true }).sort({ updatedAt: -1 }).populate("category", "categoryName description thumbnail").populate("voice", "name audioFile");
        }


        if (!data) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "No Saga Story found" });
        }

        const dataWithFavourite = await checkFavoritesWithSaga(req, res, data, false);

        return res.status(200).json({ Status: true, data: dataWithFavourite, message: "Retrieved data!" });

    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

const clearAllSaga = async (req, res) => {
    try {

        if (!req.id) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        const userId = req.id;

        await Saga.deleteMany({});

        return res.status(200).json({ Status: true, message: "Sagas are cleared!" });
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};

const getAllSagaCreatedByUser = async (req, res) => {
    try {
        if (!req.id) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        const filter = {
            isCustom: true
        }; // No specific rating filter for all Sagas

        const sagas = await Saga.find(filter).sort({ updatedAt: -1 }).populate("category", "categoryName description thumbnail").populate("voice", "name audioFile");        ;

        const sagasWithAverageRatings = await Promise.all(
            sagas.map(async (saga) => {
                const ratings = await Rating.find({ saga: saga._id });

                // Calculate the average rating
                const totalRating = ratings.reduce((sum, rating) => sum + rating.averageRating, 0);
                const averageRating = ratings.length > 0 ? totalRating / ratings.length : 0;

                return {
                    ...saga.toObject(),
                    averageRating,
                };
            })
        );

        res.status(status.OK).json({
            Status: true,
            data: sagasWithAverageRatings,
            message: "Sagas with average ratings retrieved successfully",
        });

    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

const updateSaga = async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body;

        const existingData = await Saga.findById(id);

        if (!existingData) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "Can not find Saga" });
        }

        existingData.isVisible = updateData.isVisible || existingData.isVisible;
        existingData.title = updateData.title || existingData.title;
        existingData.description = updateData.description || existingData.description;
        existingData.type = updateData.type || existingData.type;
        existingData.updatedAt = Date.now();

        existingData.save();

        res.status(200).json({
            Status: true,
            data: existingData,
            message: "Saga updated successfully"
        });
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

const deleteSaga = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedSaga = await Saga.findByIdAndDelete(id);
        if (!deletedSaga) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "Saga not found" });
        }
        res.status(200).json({
            Status: true,
            data: deletedSaga,
            message: "Saga deleted successfully"
        });
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

const checkFavoritesWithSaga = async (req, res, data, aggregate) => {
    // Query the "favorite" collection to check if each Saga ID is a favorite for the user
    const favoriteSagaIds = await Favourite.find({ user: req.id, saga: { $in: data.map(saga => saga._id) } });

    // Create a set of favorite Saga IDs for faster lookups
    const favoriteSagaSet = new Set(favoriteSagaIds.map(favorite => favorite.saga.toString()));

    // Include the favorite status in the response
    let response;
    if (aggregate) {
        response = data.map(saga => ({
            ...saga,
            isFavorite: favoriteSagaSet.has(saga._id.toString()) ? true : false
        }));
    } else {
        response = data.map(saga => ({
            ...saga.toObject(),
            isFavorite: favoriteSagaSet.has(saga._id.toString()) ? true : false
        }));
    }

    return response;
}



module.exports = {
    createSaga,
    getAllSaga,
    getMySaga,
    sagaDetail,
    getTopSaga,
    getRecommendedSaga,
    getNewSaga,
    getPopularSaga,
    clearAllSaga,
    getAllSagaCreatedByUser,
    updateSaga,
    deleteSaga
}

