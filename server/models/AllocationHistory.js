const mongoose = require('mongoose');

const allocationHistorySchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  allocatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  aiScore: { type: Number },
  action: {
    type: String,
    enum: ['suggested', 'confirmed', 'overridden', 'cancelled', 'reallocated'],
    required: true,
  },
  previousRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  notes: { type: String },
  timeSlot: {
    date: { type: Date },
    startTime: { type: String },
    endTime: { type: String },
  },
}, { timestamps: true });

module.exports = mongoose.model('AllocationHistory', allocationHistorySchema);
