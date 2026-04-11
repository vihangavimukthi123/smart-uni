//orderRouter.js
const express = require('express');
const { 
  createOrder, 
  getStudentOrders, 
  getSupplierOrders, 
  updateOrderItemStatus, 
  updateOrder, 
  cancelOrder 
} = require('../controllers/orderController.js');
const { protect } = require('../middleware/authMiddleware.js');

const orderRouter = express.Router();

// Specific routes first
orderRouter.put("/:id/cancel", protect, cancelOrder);
orderRouter.get("/student", protect, getStudentOrders);
orderRouter.get("/supplier", protect, getSupplierOrders);
orderRouter.put("/item-status", protect, updateOrderItemStatus);

// Generic and POST routes
orderRouter.post("/", protect, createOrder);
orderRouter.put("/:id", protect, updateOrder);

module.exports = orderRouter;

