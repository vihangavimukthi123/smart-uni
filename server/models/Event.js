const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
  },
  description: { type: String, trim: true },
  studentCount: {
    type: Number,
    required: [true, 'Student count is required'],
    min: [1, 'Must have at least 1 student'],
  },
  requiredEquipment: [{ type: String, trim: true }],
  priority: {
    type: Number,
    required: [true, 'Priority is required'],
    min: 1,
    max: 10,
    default: 5,
  },
  priorityLabel: {
    type: String,
    enum: ['exam', 'special_lecture', 'normal_lecture', 'workshop', 'seminar', 'other'],
    default: 'normal_lecture',
  },
  timeSlot: {
    date: { type: Date, required: [true, 'Date is required'] },
    startTime: { type: String, required: [true, 'Start time is required'] },
    endTime: { type: String, required: [true, 'End time is required'] },
  },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'completed', 'cancelled'],
    default: 'pending',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

// Auto-set priority based on label
eventSchema.pre('save', function () {
  const priorityMap = {
    exam: 10,
    special_lecture: 8,
    workshop: 7,
    seminar: 6,
    normal_lecture: 5,
    other: 3,
  };
  if (this.isModified('priorityLabel')) {
    this.priority = priorityMap[this.priorityLabel] || 5;
  }
});

module.exports = mongoose.model('Event', eventSchema);
