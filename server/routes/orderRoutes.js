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

orderRouter.post("/", protect, createOrder);
orderRouter.get("/student", protect, getStudentOrders);
orderRouter.get("/supplier", protect, getSupplierOrders);
orderRouter.put("/item-status", protect, updateOrderItemStatus);

// Edit and Cancel
orderRouter.put("/:id", protect, updateOrder);
orderRouter.patch("/:id/cancel", protect, cancelOrder);

module.exports = orderRouter;

