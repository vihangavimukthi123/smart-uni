const mongoose = require('mongoose');

const momentumTaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    course: {
      type: String,
    },
    subject: {
      type: String,
    },
    timeTracked: {
      type: Number, // in minutes
      default: 0,
    },
    timeGoal: {
      type: Number, // in minutes
      default: 0,
    },
    prodScore: {
      type: Number, // 0-100
      default: 0,
    },
    icon: {
      type: String,
      default: "📘",
    },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
    taskDate: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MomentumTask', momentumTaskSchema);
