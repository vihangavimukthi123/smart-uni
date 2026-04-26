const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  offerId: {
    type: String,
    required: true,
    unique: true,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  supplierEmail: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  offerType: {
    type: String,
    enum: ['PACKAGE_DISCOUNT', 'ITEM_DISCOUNT', 'ORDER_DISCOUNT'],
    required: true,
  },
  targetId: {
    type: String,
    // Can be productId or packageId, or null for ORDER_DISCOUNT
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
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

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;
