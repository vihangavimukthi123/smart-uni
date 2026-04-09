const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // or mongoose.Schema.Types.ObjectId
    query: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SearchHistory", searchHistorySchema);

