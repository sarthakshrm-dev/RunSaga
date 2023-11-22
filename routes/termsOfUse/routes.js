const status = require("http-status");
const { TermsOfUse } = require("../../models");

const createTermsOfUse = async (req, res) => {
    try {
        const data = req.body;
        const termsOfUse = await TermsOfUse.create(data);
        return res.status(200).json({ Status: true, data: termsOfUse, message: "Terms Of use created!" });
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

const getTermsOfUse = async (req, res) => {
    try {
        const termsOfUse = await TermsOfUse.findOne().sort({ updatedAt: -1 });
        if (!termsOfUse) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "No Terms Of Use found, Please add a new entry" });
        }
        res.status(status.OK).json(termsOfUse);
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

const updateTermsOfUse = async (req, res) => {
    try {
        const data = req.body;
        const existingData = await TermsOfUse.findOne().sort({ updatedAt: -1 });
        if (!existingData) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "Terms Of Use not found" });
        }
        existingData.title = data.title || existingData.title;
        existingData.description = data.description || existingData.description;
        existingData.updatedAt = Date.now();
        await existingData.save();
        return res.status(200).json({ Status: true, message: "Terms of use updated!" });
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

const deleteTermsOfUse = async (req, res) => {
    try {
        const existingData = await TermsOfUse.findOne();
        if (!existingData) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "No Terms Of Use found, Please add a new entry" });
        }

        await existingData.deleteOne();

        return res.status(200).json({ Status: true, message: "Terms of use deleted!" });
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

module.exports = {
    createTermsOfUse,
    getTermsOfUse,
    updateTermsOfUse,
    deleteTermsOfUse,
};
