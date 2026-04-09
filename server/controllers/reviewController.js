//reviewController.js
const Review = require('../models/Review');

async function createReview(req, res) {
  try {
    // Identity from token (student or any logged in user can review per user request)
    const user = req.student;
    
    if (!user || user.role !== "student") {
      return res.status(401).json({ message: "Only students are authorized to post reviews." });
    }

    const { supplierEmail, rating, comment, productID, productName } = req.body;

    if (!supplierEmail || !rating || !comment) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newReview = new Review({
      studentEmail: user.email,
      supplierEmail,
      productID: productID || null,
      productName: productName || null,
      rating,
      comment
    });

    await newReview.save();
    res.status(201).json({ message: "Review posted successfully", review: newReview });
  } catch (error) {
    console.error("Create Review Error:", error);
    res.status(500).json({ message: "Failed to post review", error: error.message });
  }
}

async function getSupplierReviews(req, res) {
  try {
    const { email } = req.params;
    const reviews = await Review.find({ supplierEmail: email }).sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews", error: error.message });
  }
}

async function getReviewsByProduct(req, res) {
  try {
    const { id } = req.params;
    const reviews = await Review.find({ productID: id }).sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product reviews", error: error.message });
  }
}

module.exports = { createReview, getSupplierReviews, getReviewsByProduct };

