//orderRouter.js
const express = require('express');
const { 
  createOrder, 
  getStudentOrders, 
  getSupplierOrders, 
  updateOrderItemStatus, 
  updateOrder, 
  cancelOrder,
  getAllOrders,
  getAdminOrders,
  deleteAllOrders,
  calculatePreview,
  verifyOrderEmail,
  resendOrderOTP
} = require('../controllers/orderController.js');
const { protect } = require('../middleware/authMiddleware.js');
const { authorize } = require('../middleware/roleMiddleware.js');
const { verificationLimiter } = require('../middleware/rateLimiter.js');
const { 
  sendMessage, 
  getChatsByOrder, 
  getChatById, 
  getStudentChats, 
  getSupplierChats,
  createOrderChatsManual 
} = require('../controllers/chatController');


const orderRouter = express.Router();

// Admin Global View
orderRouter.get("/admin", protect, authorize('admin'), getAdminOrders);

// Specific routes first
orderRouter.put("/:id/cancel", protect, cancelOrder);
orderRouter.get("/student", protect, getStudentOrders);
orderRouter.get("/supplier", protect, getSupplierOrders);
orderRouter.get("/admin", protect, authorize('admin'), getAdminOrders);
orderRouter.get("/all", protect, authorize('admin'), getAllOrders);
orderRouter.delete("/all", protect, authorize('admin'), deleteAllOrders);
orderRouter.put("/item-status", protect, updateOrderItemStatus);
orderRouter.post("/chat/initialize", protect, createOrderChatsManual);
orderRouter.post("/chat/send-message", protect, sendMessage);

orderRouter.get("/chat/order/:orderId", protect, getChatsByOrder);
orderRouter.get("/chat/:chatId", protect, getChatById);
orderRouter.get("/chat/student/:studentId", protect, getStudentChats);
orderRouter.get("/chat/supplier/:supplierId", protect, getSupplierChats);

// Generic and POST routes
orderRouter.post("/", protect, createOrder);
orderRouter.post("/preview", protect, calculatePreview);
orderRouter.post("/verify-email", protect, verificationLimiter, verifyOrderEmail);
orderRouter.post("/resend-otp", protect, verificationLimiter, resendOrderOTP);
orderRouter.put("/:id", protect, updateOrder);

module.exports = orderRouter;

