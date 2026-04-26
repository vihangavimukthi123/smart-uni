const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    index: true
  },
  studentEmail: {
    type: String,
    required: true,
    index: true
  },
  studentId: {
    type: String
  },
  supplierEmail: {
    type: String,
    required: true,
    index: true
  },
  supplierId: {
    type: String
  },
  messages: [
    {
      senderId: { type: String, required: true },
      senderRole: { 
        type: String, 
        enum: ['student', 'supplier'], 
        required: true 
      },
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Ensure unique chat per order + student + supplier
chatSchema.index({ orderId: 1, studentEmail: 1, supplierEmail: 1 }, { unique: true });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
