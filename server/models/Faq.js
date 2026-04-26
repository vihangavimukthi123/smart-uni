const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "General",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    submittedByUser: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FAQ', faqSchema);
