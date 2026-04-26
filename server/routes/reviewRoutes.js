const express = require('express');
const { createReview, getSupplierReviews, getReviewsByProduct, getAdminReviews } = require('../controllers/reviewController.js');
// Re-using the existing student auth if needed, but we can make it more generic
const { protect } = require('../middleware/authMiddleware.js'); 
const { authorize } = require('../middleware/roleMiddleware.js');

const reviewRouter = express.Router();

// Admin Global View
reviewRouter.get("/admin", protect, authorize('admin'), getAdminReviews);

// Publicly fetch reviews
reviewRouter.get("/supplier/:email", getSupplierReviews);
reviewRouter.get("/product/:id", getReviewsByProduct);

// Post a review (Needs token)
reviewRouter.post("/", protect, createReview);

module.exports = reviewRouter;

