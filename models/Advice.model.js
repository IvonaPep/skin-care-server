const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const adviceSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  problemDescription: {
    type: String,
    required: true,
  },
  advice: {
    type: String,
    required: true,
  },
  products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
});

module.exports = model("Advice", adviceSchema);
