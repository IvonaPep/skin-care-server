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
  advices:{type: Schema.Types.ObjectId, ref: "Advice"}
});

module.exports = model("Product", productSchema);
