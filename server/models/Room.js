const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
    unique: true,
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1'],
  },
  equipment: [{
    type: String,
    trim: true,
  }],
  status: {
    type: String,
    enum: ['active', 'disabled', 'maintenance'],
    default: 'active',
  },
  building: { type: String, trim: true, default: 'Main Building' },
  floor: { type: Number, default: 1 },
  type: {
    type: String,
    enum: ['lecture_hall', 'lab', 'seminar_room', 'auditorium', 'conference_room'],
    default: 'lecture_hall',
  },
  usageCount: { type: Number, default: 0 },
  lastUsed: { type: Date },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
