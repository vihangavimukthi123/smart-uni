//Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productID: {
    type: String,
    required: true,
    unique: true,
  },

  name: {
    type: String,
    required: true,
  },

  altName: {
    type: [String], //string array
    default: [],
  },

  description: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  images: {
    type: [String],
    required: true,
  },

  category: {
    type: String,
    required: true,
  },

  model: {
    type: String,
    required: true,
    default: "Standard",
  },

  brand: {
    type: String,
    required: true,
    default: "Generic",
  },

  stock: {
    type: Number,
    required: true,
    default: 0,
  },

  isAvailable: {
    type: Boolean,
    required: true,
  },

  supplierEmail: {
    type: String,
    required: true,
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;;

