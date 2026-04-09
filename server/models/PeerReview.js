const mongoose = require('mongoose');

const peerReviewSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true,
      unique: true,
    },
    reviewerName: {
      type: String,
      required: true,
      trim: true,
    },
    reviewerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    revieweeName: {
      type: String,
      required: true,
      trim: true,
    },
    revieweeEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

peerReviewSchema.index({ revieweeEmail: 1, createdAt: -1 });
peerReviewSchema.index({ reviewerEmail: 1, createdAt: -1 });

module.exports = mongoose.model("PeerReview", peerReviewSchema);;

