const status = require("http-status");
const { Product } = require("../../models");

const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    const product = await Product.create(productData);
    res.status(status.CREATED).json(product);
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(status.OK).json(products);
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(status.NOT_FOUND).json({ error: "Product not found" });
    }
    res.status(status.OK).json(product);
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const productData = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      productData,
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(status.NOT_FOUND).json({ error: "Product not found" });
    }
    res.status(status.OK).json(updatedProduct);
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return res.status(status.NOT_FOUND).json({ error: "Product not found" });
    }
    res.status(status.NO_CONTENT).send();
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
