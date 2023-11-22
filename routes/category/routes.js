const { Category } = require("../../models");
const status = require("http-status");


const createCategory = async (req, res) => {
    const thumbnail = req.file?.path || "";
    try {
        const { categoryName, description } = req.body;

        if (!req.id) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        const existing = await Category.findOne({ categoryName });

        if (existing) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "Category with this name already exist" });
        }

        const category = {
            categoryName,
            description,
            thumbnail
        };

        const data = await Category.create(category);

        res.status(200).json({
            Status: true,
            data: data,
            message: "Category successfully!",
        });

    } catch (error) {
        return res.status(error.INTERNAL_SERVER_ERROR).json({ status: false, message: error.message });
    }
};

const getCategories = async (req, res) => {
    try {
        if (!req.id) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        const data = await Category.find({}).sort({ updatedAt: -1 });

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

const getCategoryById = async (req, res) => {
    try {
        const id = req.params.id;

        const data = await Category.findById(id);

        if (!data) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "Can not find Category" });
        }

        res.status(200).json({
            Status: true,
            data: data
        });
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

const updateCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body;
        const thumbnail = req.file?.path || "";

        const existingData = await Category.findById(id);

        if (!existingData) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "Can not find Category" });
        }

        existingData.categoryName = updateData.categoryName || existingData.categoryName;
        existingData.description = updateData.description || existingData.description;
        existingData.thumbnail = thumbnail || existingData.thumbnail;
        existingData.updatedAt = Date.now();

        res.status(200).json({
            Status: true,
            data: existingData,
            message: "Category updated successfully"
        });
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedCategory = await Category.findByIdAndDelete(id);
        if (!deletedCategory) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "Category not found" });
        }
        res.status(200).json({
            Status: true,
            data: deletedCategory,
            message: "Category deleted successfully"
        });
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};
