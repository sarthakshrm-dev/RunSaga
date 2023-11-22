const status = require("http-status");
const { PrivacyPolicy } = require("../../models");

const createPrivacyPolicy = async (req, res) => {
  try {
    const privacyPolicyData = req.body;
    const privacyPolicy = await PrivacyPolicy.create(privacyPolicyData);
    return res.status(status.CREATED).json({ Status: true, data: privacyPolicy, message: "Privacy Policy created!" });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
  }
};

const getPrivacyPolicy = async (req, res) => {
  try {
    const privacyPolicy = await PrivacyPolicy.findOne().sort({ updatedAt: -1 });
    if (!privacyPolicy) {
      return res.status(status.NOT_FOUND).json({ Status: false, error: "No Privacy Policy found, Please add a new entry" });
    }
    res.status(status.OK).json(privacyPolicy);
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
  }
};

const updatePrivacyPolicy = async (req, res) => {
  try {
    const data = req.body;
    const existingData = await PrivacyPolicy.findOne().sort({ updatedAt: -1 });
    if (!existingData) {
      return res.status(status.NOT_FOUND).json({ Status: false, error: "Privacy Policy not found" });
    }
    existingData.title = data.title || existingData.title;
    existingData.description = data.description || existingData.description;
    existingData.updatedAt = Date.now();
    await existingData.save();
    return res.status(200).json({ Status: true, data : existingData, message: "Privacy Policy updated!" });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
  }
};

const deletePrivacyPolicy = async (req, res) => {
  try {
    const existingData = await PrivacyPolicy.findOne();
    if (!existingData) {
      return res.status(status.NOT_FOUND).json({ Status: false, error: "No Privacy Policy found, Please add a new entry" });
    }

    await existingData.deleteOne();

    return res.status(200).json({ Status: true, message: "Privacy Policy deleted!" });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
  }
};

module.exports = {
  createPrivacyPolicy,
  getPrivacyPolicy,
  updatePrivacyPolicy,
  deletePrivacyPolicy,
};
