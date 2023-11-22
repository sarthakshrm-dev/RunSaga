const status = require("http-status");
const { Search, Saga, Favourite } = require("../../models");

const getRecentSearches = async (req, res) => {
  try {

    if (!req.user) {
      return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
    }

    const searches = await Search.find({ userId: req.id }).sort({ updatedAt: -1 }).limit(6);

    return res.status(200).json({ Status: true, data: searches, message: "Retrieved data!" });

  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
  }
};

const getSearchResult = async (req, res) => {
  try {
    if (!req.id) {
      return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
    }

    const searchText = req.query.searchText;

    if (!searchText) {
      return res.status(status.BAD_REQUEST).json({ Status: false, error: "Search text is required" });
    }

    const searchRegex = new RegExp(searchText, 'i');

    const sagas = await Saga.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $lookup: {
          from: 'voices',
          localField: 'voice',
          foreignField: '_id',
          as: 'voice',
        },
      },
      {
        $addFields: {
          categoryName: { $arrayElemAt: ['$category.categoryName', 0] },
          name: { $arrayElemAt: ['$voice.name', 0] },
        },
      },
      {
        $match: {
          $or: [
            { title: searchRegex },
            { keyword: searchRegex },
            { description: searchRegex },
            { storyDetail: searchRegex },
            { genre: searchRegex },
            { categoryName: searchRegex },
            { name: searchRegex },
          ],
        },
      },
    ])
      .sort({ updatedAt: -1 });

    postRecentSearch(res, searchText, req.id);
    
    const dataWithFavourite = await checkFavoritesWithSaga(req, res, sagas);

    return res.status(200).json({ Status: true, data: dataWithFavourite, message: "Retrieved data!" });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
  }
};

const checkFavoritesWithSaga = async (req, res, data) => {
  // Query the "favorite" collection to check if each Saga ID is a favorite for the user
  const favoriteSagaIds = await Favourite.find({ user: req.id, saga: { $in: data.map(saga => saga._id) } });

  // Create a set of favorite Saga IDs for faster lookups
  const favoriteSagaSet = new Set(favoriteSagaIds.map(favorite => favorite.saga.toString()));

  // Include the favorite status in the response
  const response = data.map(saga => ({
    ...saga,
    isFavorite: favoriteSagaSet.has(saga._id.toString()) ? true : false
  }));

  return response;
}


const postRecentSearch = async (res, searchText, userId) => {
  try {
    if (!userId) {
      return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
    }

    if (!searchText) {
      return res.status(status.UNAUTHORIZED).json({ Status: false, error: "Please add a search text!" });
    }

    const newSearch = {
      searchText,
      userId
    };

    await Search.create(newSearch);

  } catch (error) {
    return res.status(error.INTERNAL_SERVER_ERROR).json({ status: false, message: error.message });
  }
};

const clearRecentSearches = async (req, res) => {
  try {

    if (!req.id) {
      return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
    }

    const userId = req.id;

    await Search.deleteMany({ userId: userId });

    return res.status(200).json({ Status: true, message: "Search is cleared!" });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const deleteSearchById = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedSearch = await Search.findByIdAndDelete(id);
    if (!deletedSearch) {
      return res.status(status.NOT_FOUND).json({ Status: false, error: "Search History not found" });
    }
    res.status(200).json({
      Status: true,
      data: deletedSearch,
      message: "Search History deleted successfully"
    });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
  }
}

module.exports = {
  getRecentSearches,
  getSearchResult,
  clearRecentSearches,
  deleteSearchById
};
