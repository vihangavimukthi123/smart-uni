//Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  studentEmail: {
    type: String,
    required: true,
  },
  items: [
    {
      productId: { type: String, required: true },
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      price: { type: Number, required: true },
      image: { type: String },
      supplierEmail: { type: String, required: true },
      status: {
        type: String,
        default: "Pending",
        enum: ["Pending", "Processing", "Delivered", "Cancelled"]
      },
      supplierNote: {
        type: String,
        default: ""
      }
    }
  ],
  rentalDates: {
    pickup: { type: Date, required: true },
    pickupTime: { type: String, default: "09:00" },
    return: { type: Date, required: true }
  },
  deliveryDetails: {
    campus: { type: String, required: true },
    location: { type: String },
    instructions: { type: String }
  },
  contactInfo: {
    organizer: { type: String, required: true },
    uniId: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  totalAmount: {
    type: Number,
    required: true
  },
  appliedPackageId: { type: String, default: null },
  appliedOfferId: { type: String, default: null },
  discountSource: { 
    type: String, 
    enum: ['PACKAGE', 'ITEM', 'ORDER', null], 
    default: null 
  },
  originalPrice: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  finalPrice: { type: Number, required: true },
  priceBreakdown: {
    basePrice: { type: Number },
    packageDiscount: { type: Number },
    itemDiscounts: { type: Number },
    offerDiscount: { type: Number },
    finalAdjustment: { type: Number }
  },
  // Email Verification Fields
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  hashedOTP: {
    type: String,
    default: null
  },
  otpCreatedAt: {
    type: Date,
    default: null
  },
  otpExpiresAt: {
    type: Date,
    default: null
  },
  otpAttempts: {
    type: Number,
    default: 0
  },
  otpResendCount: {
    type: Number,
    default: 0
  },
  cooldownUntil: {
    type: Date,
    default: null
  },
  // Reminder metadata
  reminderScheduledAt: {
    type: Date,
    index: true,
    default: null
  },
  reminderStatus: {
    type: String,
    enum: ["NONE", "SCHEDULED", "SENT", "FAILED"],
    default: "NONE"
  },
  reminderRetryCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: "Pending",
    enum: ["Pending", "Active", "Completed", "Cancelled"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;

