const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
    },
    studentId: {
      type: String,
      required: true,
    },
    entryDate: {
      type: Date,
      default: Date.now,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "General",
    },
    mood: {
      type: String,
      default: "Good",
    },
    timeSpent: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
      },
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Journal', journalSchema);
