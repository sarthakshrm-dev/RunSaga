const { Voice } = require("../../models");
const status = require("http-status");


const createVoice = async (req, res) => {

    try {
        const { name, audioFile } = req.body;

        if (!req.id) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        const voice = {
            name,
            audioFile
        };

        const data = await Voice.create(voice);

        res.status(200).json({
            Status: true,
            data: data,
            message: "Voice added successfully!",
        });

    } catch (error) {
        return res.status(error.INTERNAL_SERVER_ERROR).json({ status: false, message: error.message });
    }
};

const getVoices = async (req, res) => {
    try {
        if (!req.id) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        const data = await Voice.find({}).sort({ updatedAt: -1 });

        if (!data) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "No Voice found" });
        }

        res.status(200).json({
            Status: true,
            data: data,
        });

    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

const getVoiceById = async (req, res) => {
    try {
        const id = req.params.id;

        const data = await Voice.findById(id);

        if (!data) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "Can not find Voice" });
        }

        res.status(200).json({
            Status: true,
            data: data
        });
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

const updateVoice = async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body;

        const existingData = await Voice.findById(id);

        if (!existingData) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "Can not find Voice" });
        }

        existingData.name = updateData.name || existingData.name;
        existingData.audioFile = updateData.audioFile || existingData.audioFile;
        existingData.updatedAt = Date.now();

        existingData.save();

        res.status(200).json({
            Status: true,
            data: existingData,
            message: "Voice updated successfully"
        });
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

const deleteVoice = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedVoice = await Voice.findByIdAndDelete(id);
        if (!deletedVoice) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "Voice not found" });
        }
        res.status(200).json({
            Status: true,
            data: deletedVoice,
            message: "Voice deleted successfully"
        });
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

const getSearchResultForVoice = async (req, res) => {
    try {
        if (!req.id) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        const searchText = req.query.searchText;

        if (!searchText) {
            return res.status(status.BAD_REQUEST).json({ Status: false, error: "Search text is required" });
        }

        const searchRegex = new RegExp(searchText, 'i');

        const searchResult = await Voice.find({
            $or: [
                { name: searchRegex }
            ]
        }).sort({ updatedAt: -1 });

        return res.status(200).json({ Status: true, data: searchResult, message: "Retrieved data!" });
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

module.exports = {
    createVoice,
    getVoices,
    getVoiceById,
    updateVoice,
    deleteVoice,
    getSearchResultForVoice
};
