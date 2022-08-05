const router = require("express").Router();

const mongoose = require("mongoose");

const Advice = require("../models/Advice.model");
const Product = require("../models/Product.model");

const { isAuthenticated } = require("../middleware/jwt.middleware");

//READ list of products
router.get("/products", (req, res, next) => {
  Product.find()
    .populate("advices")
    .then((allProducts) => {
      res.json(allProducts);
    })
    .catch((err) => res.json(err));
});

//  POST /api/products  -  Create a new product
router.post("/products", isAuthenticated, (req, res, next) => {
  const { title, description, brands, advices: adviceId } = req.body;

  Product.create({ title, description, brands, advices: [adviceId] })
    .then((newProduct) => {
      return Advice.findByIdAndUpdate(adviceId, {
        $push: { products: newProduct._id },
      });
    })
    .then((response) => res.json(response))
    .catch((err) => res.json(err));
});

//READ product details
router.get("/products/:productId", (req, res, next) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Product.findById(productId)
    .populate("advices")
    .then((product) => res.json(product))
    .catch((error) => res.json(error));
});

//UPDATE product
router.put("/products/:productId", isAuthenticated, (req, res, next) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Advice.findByIdAndUpdate(productId, req.body, { new: true })
    .then((updatedProduct) => res.json(updatedProduct))
    .catch((error) => res.json(error));
});

//DELETE product
router.delete("/products/:productId", isAuthenticated, (req, res, next) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Product.findByIdAndRemove(productId)
    .then(() =>
      res.json({
        message: `Product with id ${productId} was removed successfully.`,
      })
    )
    .catch((error) => res.status(500).json(error));
});

module.exports = router;
