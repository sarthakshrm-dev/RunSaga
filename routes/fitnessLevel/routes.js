const status = require("http-status");
const { FitnessLevel, User } = require("../../models"); // Assuming you have a FitnessLevel model
const ObjectId = require("mongodb").ObjectId;


const createFitnessLevel = async (req, res) => {
  try {
    const { level, workoutFrequency } = req.body;

    if (!req.id) {
      return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
    }

    const existing = await FitnessLevel.findOne({ level: level });

    if (existing) {
      return res.status(status.UNAUTHORIZED).json({ Status: false, error: "FitnessLevel with this name already exist" });
    }

    const fitnessLevel = {
      level,
      workoutFrequency
    };

    const data = await FitnessLevel.create(fitnessLevel);

    res.status(200).json({
      Status: true,
      data: data,
      message: "FitnessLevel successfully!",
    });

  } catch (error) {
    return res.status(error.INTERNAL_SERVER_ERROR).json({ status: false, message: error.message });
  }
};

const getFitnessLevel = async (req, res) => {
  try {
    if (!req.id) {
      return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
    }

    const data = await FitnessLevel.find({}).sort({ updatedAt: 1 });

    if (!data) {
      return res.status(status.NOT_FOUND).json({ Status: false, error: "No Users found" });
    }

    res.status(200).json({
      Status: true,
      data: data,
    });

  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
  }
};

const getFitnessLevelById = async (req, res) => {
  try {
    const id = req.params.id;

    const data = await FitnessLevel.findById(id);

    if (!data) {
      return res.status(status.NOT_FOUND).json({ Status: false, error: "Can not find FitnessLevel" });
    }

    res.status(200).json({
      Status: true,
      data: data
    });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
  }
};

const updateFitnessLevel = async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = req.body;

    const existingData = await FitnessLevel.findById(id);

    if (!existingData) {
      return res.status(status.NOT_FOUND).json({ Status: false, error: "Can not find FitnessLevel" });
    }

    existingData.level = updateData.level || existingData.level;
    existingData.workoutFrequency = updateData.workoutFrequency || existingData.workoutFrequency;
    existingData.updatedAt = Date.now();

    existingData.save();

    res.status(200).json({
      Status: true,
      data: existingData,
      message: "FitnessLevel updated successfully"
    });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
  }
};

const deleteFitnessLevel = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedFitnessLevel = await FitnessLevel.findByIdAndDelete(id);
    if (!deletedFitnessLevel) {
      return res.status(status.NOT_FOUND).json({ Status: false, error: "FitnessLevel not found" });
    }
    res.status(200).json({
      Status: true,
      data: deletedFitnessLevel,
      message: "FitnessLevel deleted successfully"
    });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
  }
};

const updateUserFitnessLevel = async (req, res) => {
  const updateData = req.body;
  try {
    if (!req.user) {
      return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
    }

    const userId = req.id;

    const existingUser = await User.findById(userId);

    if (!existingUser) {
      return res.status(status.NOT_FOUND).json({ Status: false, error: "Can not find User" });
    }

    const fitness = updateData.fitnessId;
    if (!ObjectId.isValid(fitness)) {
      return res.status(status.UNAUTHORIZED).json({ Status: false, error: "This Fitness Id does not exist in database!" });
  }


    existingUser.fitnessLevel = updateData.fitnessId;
    existingUser.updatedAt = Date.now();

    await existingUser.save();
    const updated = await User.findById(userId).populate("fitnessLevel", "level workoutFrequency");;
    return res.status(200).json({ Status: true, data: updated, message: "Fitness Level status is updated!" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createFitnessLevel,
  getFitnessLevel,
  getFitnessLevelById,
  updateFitnessLevel,
  deleteFitnessLevel,
  updateUserFitnessLevel
};
