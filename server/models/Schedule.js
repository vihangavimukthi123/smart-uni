const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'reallocated'],
    default: 'pending',
  },
  aiScore: { type: Number },
  aiExplanation: { type: String },
  alternativeRooms: [{
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    score: Number,
    explanation: String,
  }],
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  confirmedAt: { type: Date },
  overridden: { type: Boolean, default: false },
  overrideReason: { type: String },
  timeSlot: {
    date: { type: Date },
    startTime: { type: String },
    endTime: { type: String },
  },
}, { timestamps: true });

// Prevent double-booking: unique room + date + startTime
scheduleSchema.index(
  { room: 1, 'timeSlot.date': 1, 'timeSlot.startTime': 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } } }
);

module.exports = mongoose.model('Schedule', scheduleSchema);
