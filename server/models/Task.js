const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    category: String,
    module: String,
    categoryColor: String,
    deadline: String,
    deadlineDate: String,
    deadlineUrgent: Boolean,
    author: String,
    avatar: String,
    userId: String,
    year: Number,
    semester: Number,
    status: {
      type: String,
      default: "OPEN",
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
