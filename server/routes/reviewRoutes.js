const express = require('express');
const { createReview, getSupplierReviews, getReviewsByProduct } = require('../controllers/reviewController.js');
// Re-using the existing student auth if needed, but we can make it more generic
const { protect } = require('../middleware/authMiddleware.js'); 

const reviewRouter = express.Router();

// Publicly fetch reviews
reviewRouter.get("/supplier/:email", getSupplierReviews);
reviewRouter.get("/product/:id", getReviewsByProduct);

// Post a review (Needs token)
reviewRouter.post("/", protect, createReview);

module.exports = reviewRouter;

