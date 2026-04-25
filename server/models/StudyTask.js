const mongoose = require('mongoose');

const studyTaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    subject: {
      type: String,
      required: true,
    },
    timeTracked: {
      type: Number,
      default: 0,
    },
    timeGoal: {
      type: Number,
      default: 0,
    },
    prodScore: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed'],
      default: 'Pending',
    },
    icon: {
      type: String,
      default: '📘',
    },
    taskDate: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudyTask', studyTaskSchema);
