const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const productSchema = new Schema({
  title: {
    type: String,
    unique: true,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  brands: [],
});

module.exports = model("Product", productSchema);
