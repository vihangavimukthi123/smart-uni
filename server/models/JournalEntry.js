const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema(
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
    tags: [String],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Optional for now
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
