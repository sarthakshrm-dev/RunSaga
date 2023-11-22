const status = require("http-status");
const { AboutUs } = require("../../models");

const createAboutUs = async (req, res) => {
  try {
    const aboutUsData = req.body;
    const aboutUs = await AboutUs.create(aboutUsData);
    return res.status(status.CREATED).json({ Status: true, data: aboutUs, message: "About us created!" });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
  }
};

const getAboutUs = async (req, res) => {
  try {
    const aboutUs = await AboutUs.findOne().sort({ updatedAt: -1 });
    if (!aboutUs) {
      return res.status(status.NOT_FOUND).json({ Status: false, error: "About Us not found" });
    }
    res.status(status.OK).json(aboutUs);
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
  }
};

const updateAboutUs = async (req, res) => {
  try {
    const aboutUsData = req.body;
    const existingAboutUs = await AboutUs.findOne().sort({ updatedAt: -1 });
    if (!existingAboutUs) {
      return res.status(status.NOT_FOUND).json({ Status: false, error: "About Us not found" });
    }
    existingAboutUs.title = aboutUsData.title || existingAboutUs.title;
    existingAboutUs.description =
      aboutUsData.description || existingAboutUs.description;
    existingAboutUs.updatedAt = Date.now();
    await existingAboutUs.save();
    return res.status(200).json({ Status: true, message: "About us updated!" });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
  }
};

const deleteAboutUs = async (req, res) => {
  try {
    const existingAboutUs = await AboutUs.findOne();
    if (!existingAboutUs) {
      return res.status(status.NOT_FOUND).json({ Status: false, error: "About Us not found" });
    }

    await existingAboutUs.deleteOne();

    return res.status(200).json({ Status: true, message: "About us deleted!" });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
  }
};

module.exports = {
  createAboutUs,
  getAboutUs,
  updateAboutUs,
  deleteAboutUs,
};
