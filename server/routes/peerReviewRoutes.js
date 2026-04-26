const express = require('express');
const mongoose = require('mongoose');
const PeerReview = require('../models/PeerReview');
const Request = require('../models/Request');
const Peer = require('../models/Peer');

const router = express.Router();

const normalize = (value = "") => String(value).trim().toLowerCase();

const syncPeerRating = async (revieweeEmail) => {
  const email = normalize(revieweeEmail);
  if (!email) return;

  const stats = await PeerReview.aggregate([
    { $match: { revieweeEmail: email } },
    {
      $group: {
        _id: "$revieweeEmail",
        avgRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const avgRating = stats[0]?.avgRating || 0;
  const reviewCount = stats[0]?.reviewCount || 0;

  await Peer.findOneAndUpdate(
    { email },
    {
      rating: Number(avgRating.toFixed(2)),
      reviewCount,
    },
    { new: true }
  );
};

// Read all reviews for a specific peer.
router.get("/peer/:email", async (req, res) => {
  try {
    const email = normalize(req.params.email);
    const reviews = await PeerReview.find({ revieweeEmail: email }).sort({ createdAt: -1 });

    const reviewCount = reviews.length;
    const avgRating = reviewCount
      ? Number((reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviewCount).toFixed(2))
      : 0;

    res.json({
      reviews,
      summary: {
        reviewCount,
        avgRating,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reviews submitted by a specific user.
router.get("/reviewer/:email", async (req, res) => {
  try {
    const email = normalize(req.params.email);
    const reviews = await PeerReview.find({ reviewerEmail: email }).select("requestId").lean();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add one review after help is completed.
router.post("/", async (req, res) => {
  try {
    const {
      requestId,
      reviewerName,
      reviewerEmail,
      revieweeName,
      revieweeEmail,
      rating,
      comment,
    } = req.body;

    if (!requestId || !reviewerName || !reviewerEmail || !revieweeName || !revieweeEmail || !rating) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "Invalid requestId" });
    }

    const normalizedReviewerEmail = normalize(reviewerEmail);
    const normalizedRevieweeEmail = normalize(revieweeEmail);

    if (normalizedReviewerEmail === normalizedRevieweeEmail) {
      return res.status(400).json({ message: "You cannot review yourself" });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const isRequester = normalize(request.senderEmail) === normalizedReviewerEmail;
    const isReceiver = normalize(request.receiverEmail) === normalizedRevieweeEmail;
    if (!isRequester || !isReceiver) {
      return res.status(403).json({ message: "Only the requester can review the helper for this request" });
    }

    // Automatically mark the request as COMPLETED when a review is submitted
    if ((request.status || "").toUpperCase() !== "COMPLETED") {
      request.status = "COMPLETED";
      await request.save();
    }

    const existing = await PeerReview.findOne({ requestId: request._id });
    if (existing) {
      return res.status(409).json({ message: "A review already exists for this request" });
    }

    const review = await PeerReview.create({
      requestId: request._id,
      reviewerName,
      reviewerEmail: normalizedReviewerEmail,
      revieweeName,
      revieweeEmail: normalizedRevieweeEmail,
      rating: Number(rating),
      comment: comment || "",
    });

    await syncPeerRating(normalizedRevieweeEmail);

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

