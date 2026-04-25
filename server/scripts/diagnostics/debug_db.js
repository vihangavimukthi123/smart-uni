require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');

async function debug() {
  await mongoose.connect(process.env.MONGO_URI);
  const orders = await Order.find({ studentEmail: 'user@campus.edu' });
  console.log("USER ORDERS:", JSON.stringify(orders.map(o => ({ id: o.orderId, status: o.status, itemStatuses: o.items.map(i => i.status) })), null, 2));
  process.exit(0);
}

debug();
