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

