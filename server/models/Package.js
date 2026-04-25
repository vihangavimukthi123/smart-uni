const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  packageId: {
    type: String,
    required: true,
    unique: true,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // or 'Supplier' if integrated
    required: true,
  },
  supplierEmail: {
    type: String,
    required: true,
  },
  packageName: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  items: [
    {
      productId: { type: String, required: true },
      quantity: { type: Number, required: true, default: 1 },
    }
  ],
  totalPrice: {
    type: Number,
    // Optional override for the entire package price
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage',
  },
  discountValue: {
    type: Number,
    required: true,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Availability is calculated dynamically, so it's not a field here as per senior dev feedback.

const Package = mongoose.model('Package', packageSchema);

module.exports = Package;
