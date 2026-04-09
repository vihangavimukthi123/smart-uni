//Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  studentEmail: {
    type: String,
    required: true,
  },
  supplierEmail: {
    type: String,
    required: true,
  },
  productID: {
    type: String, // Optional: if present, it's a product review
    default: null,
  },
  productName: {
    type: String, // Optional: helpful for display
    default: null,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;

