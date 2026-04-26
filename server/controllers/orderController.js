//orderController.js
const Order = require('../models/Order');
const emailValidator = require('../services/emailValidator');
const otpService = require('../services/otpService');
const orderService = require('../services/orderService');

// Helper to check if the deadline (24 hours before pickup) has passed
const isDeadlinePassed = (pickupDate) => {
  const pickup = new Date(pickupDate);
  const now = new Date();
  const diffInMs = pickup.getTime() - now.getTime();
  return diffInMs < (24 * 60 * 60 * 1000); // 24 hours in milliseconds
};

// Unified status calculation logic
const calculateOverallStatus = (items) => {
  if (!items || items.length === 0) return "Pending";
  
  // Filter out cancelled items to see the state of the "real" order
  const nonCancelledItems = items.filter(i => i.status !== "Cancelled");
  
  // If all items were cancelled, the order is Cancelled
  if (nonCancelledItems.length === 0) return "Cancelled";
  
  // If all remaining items are delivered, it's Completed
  const allDelivered = nonCancelledItems.every(i => i.status === "Delivered");
  if (allDelivered) return "Completed";
  
  // If any remaining item is Processing or Delivered, it's Active
  const anyActive = nonCancelledItems.some(i => i.status === "Processing" || i.status === "Delivered");
  if (anyActive) return "Active";
  
  // Otherwise, it's Pending
  return "Pending";
};


async function createOrder(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: Please log in as a student" });
    }
    const { items, rentalDates, deliveryDetails, contactInfo, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cannot place an order with no items" });
    }

    // ── Email Deliverability Validation ───────────────────────────────────────
    // 1. Syntax Check
    if (!emailValidator.validateSyntax(contactInfo.email)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }

    // 2. Domain (MX) Check
    const domainCheck = await emailValidator.validateDomain(contactInfo.email);
    if (!domainCheck.isValid) {
      return res.status(400).json({ message: domainCheck.error || "Email domain is not valid." });
    }
    // ──────────────────────────────────────────────────────────────────────────

    // Generate a unique Order ID
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderId = `ORD-${Date.now().toString().slice(-4)}-${randomSuffix}`;

    // Date-Based Stock Validation
    const { calculateStockRemaining } = require('./productController');
    const { pickup, return: returnDate } = rentalDates;
    const { calculateFinalPricing } = require('../utils/offerResolver');
    const Offer = require('../models/Offer');
    const Package = require('../models/Package');

    // 1. Backend-Authoritative Pricing & Stock Check
    for (const item of items) {
      const availability = await calculateStockRemaining(item.productId, pickup, returnDate);
      if (item.qty > availability.availableStock) {
        return res.status(400).json({ 
          message: `Stock exceeded for ${item.name}. Only ${availability.availableStock} available for the selected period.`,
          details: [`Product: ${item.name}`, `Requested: ${item.qty}`, `Available: ${availability.availableStock}`]
        });
      }
    }

    // 2. Resolve Discounts
    const activeOffers = await Offer.find({ isActive: true });
    let selectedPackage = null;
    if (req.body.appliedPackageId) {
      selectedPackage = await Package.findOne({ packageId: req.body.appliedPackageId, isActive: true });
    }

    const pricing = calculateFinalPricing(items, selectedPackage, activeOffers);

    // 3. Initiate OTP Verification
    const otp = otpService.generateOTP();
    const hashedOTP = await otpService.hashOTP(otp);
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

    // 4. Create Order with verification metadata
    const newOrder = new Order({
      orderId,
      studentEmail: req.user.email,
      items,
      rentalDates,
      deliveryDetails,
      contactInfo,
      totalAmount: pricing.finalPrice, 
      originalPrice: pricing.originalPrice,
      discountAmount: pricing.discountAmount,
      finalPrice: pricing.finalPrice,
      appliedPackageId: pricing.appliedOfferId && pricing.discountSource === 'PACKAGE' ? pricing.appliedOfferId : null,
      appliedOfferId: pricing.appliedOfferId && pricing.discountSource !== 'PACKAGE' ? pricing.appliedOfferId : null,
      discountSource: pricing.discountSource,
      priceBreakdown: pricing.priceBreakdown,
      // Verification logic
      isEmailVerified: false,
      status: "Pending",
      hashedOTP,
      otpCreatedAt: new Date(),
      otpExpiresAt: expiresAt
    });
    await newOrder.save();
    
    // 5. Send OTP Email (Non-blocking)
    otpService.sendOTPEmail(contactInfo.email, otp, { orderId: orderId });

    // Create chat for each supplier in the order
    const { createOrderChats } = require('./chatController');
    await createOrderChats(newOrder);

    res.status(201).json({ 
      success: true, 
      verificationRequired: true, 
      message: "Order initiated. Please verify your email.", 
      orderId: newOrder._id 
    });
  } catch (error) {
    console.error("Create Order Error Details:", error.errors || error);
    res.status(500).json({ 
      message: "Failed to initiate order. " + error.message, 
      details: error.errors ? Object.keys(error.errors).map(k => error.errors[k].message) : []
    });
  }
}

async function getStudentOrders(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const orders = await Order.find({ studentEmail: req.user.email }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
}

async function updateOrder(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const order = await Order.findOne({ _id: id, studentEmail: req.user.email });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const { items, rentalDates, deliveryDetails, contactInfo, totalAmount, status } = req.body;
    
    // If it's a cancellation request, bypass the deadline check
    if (status === "Cancelled") {
      const updatedOrder = await Order.findOneAndUpdate(
        { _id: id, studentEmail: req.user.email },
        { 
          $set: { 
            status: "Cancelled",
            "items.$[].status": "Cancelled" 
          } 
        },
        { new: true }
      );

      require('fs').appendFileSync('request_logs.txt', `[${new Date().toISOString()}] CANCELLED ORDER: ${id}. NEW STATUS: ${updatedOrder?.status}\n`);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found or unauthorized" });
      }

      return res.status(200).json({ 
        message: "Order cancelled successfully", 
        order: updatedOrder 
      });
    }

    // For other updates (edits), enforce the deadline
    if (isDeadlinePassed(order.rentalDates.pickup)) {
      return res.status(403).json({ message: "Deadline passed: Cannot edit order within 24 hours of rental start" });
    }

    // ── Email Deliverability Validation (New for Update) ─────────────────────
    if (contactInfo && contactInfo.email) {
      // 1. Syntax Check
      if (!emailValidator.validateSyntax(contactInfo.email)) {
        return res.status(400).json({ message: "Please enter a valid email address." });
      }

      // 2. Domain (MX) Check
      if (contactInfo.email !== order.contactInfo.email) {
        const domainCheck = await emailValidator.validateDomain(contactInfo.email);
        if (!domainCheck.isValid) {
          return res.status(400).json({ message: domainCheck.error || "Email domain is not valid." });
        }
      }

      // 3. Trigger OTP if email changed or order not already verified
      if (contactInfo.email !== order.contactInfo.email || !order.isEmailVerified) {
        const otp = otpService.generateOTP();
        const hashedOTP = await otpService.hashOTP(otp);
        const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

        order.hashedOTP = hashedOTP;
        order.otpCreatedAt = new Date();
        order.otpExpiresAt = expiresAt;
        order.otpAttempts = 0;
        order.isEmailVerified = false; // Mark as unverified until new OTP entered
        order.status = "Pending";
      }
    }
    // ──────────────────────────────────────────────────────────────────────────

    // Update fields for edit
    order.items = items || order.items;
    order.rentalDates = rentalDates || order.rentalDates;
    order.deliveryDetails = deliveryDetails || order.deliveryDetails;
    order.contactInfo = contactInfo || order.contactInfo;
    order.totalAmount = totalAmount || order.totalAmount;
    
    // Recalculate status based on NEW items state (only if already verified and not pending)
    if (order.isEmailVerified) {
      order.status = calculateOverallStatus(order.items);
    }

    await order.save();

    // If verification is now required, send OTP and return special response
    if (!order.isEmailVerified) {
      otpService.sendOTPEmail(order.contactInfo.email, otp, { orderId: order.orderId });
      return res.status(200).json({ 
        success: true, 
        verificationRequired: true, 
        message: "Email verification required for this update.", 
        orderId: order._id 
      });
    }

    res.status(200).json({ message: "Order updated successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Failed to update order", error: error.message });
  }
}

async function cancelOrder(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const order = await Order.findOne({ _id: id, studentEmail: req.user.email });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (isDeadlinePassed(order.rentalDates.pickup)) {
      return res.status(403).json({ message: "Deadline passed: Cannot cancel order within 24 hours of rental start" });
    }

    order.status = "Cancelled";
    // Also cancel all individual items
    order.items.forEach(item => item.status = "Cancelled");

    await order.save();
    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel order", error: error.message });
  }
}

async function getSupplierOrders(req, res) {
  try {
    const userRole = req.user?.role?.toLowerCase();
    
    if (!req.user || (userRole !== "supplier" && userRole !== "admin")) {
      return res.status(401).json({ message: "Unauthorized: Access restricted" });
    }
    
    if (req.user.role === "admin") {
      const orders = await Order.find({}).sort({ createdAt: -1 });
      return res.status(200).json(orders);
    }

    const supplierEmail = req.user.email;
    const orders = await Order.find({ "items.supplierEmail": supplierEmail }).sort({ createdAt: -1 });
    const filteredOrders = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.items = orderObj.items.filter(item => item.supplierEmail === supplierEmail);
      return orderObj;
    });
    res.status(200).json(filteredOrders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
}

async function getAllOrders(req, res) {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized: Admin access required" });
    }
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch all orders", error: error.message });
  }
}

async function updateOrderItemStatus(req, res) {
    try {
    if (!req.user || req.user.role !== "supplier") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { orderId, productId, status, supplierNote } = req.body;
    const supplierEmail = req.user.email;
    
    // Find the order
    const order = await Order.findOne({ _id: orderId, "items.supplierEmail": supplierEmail });
        if (!order) {
            return res.status(404).json({ message: "Order not found or unauthorized" });
        }

        // Update items belonging to this supplier
        let itemsUpdated = false;
        order.items.forEach(item => {
            // If productId is provided, only update that one. If not, update all belonging to this supplier
            if (item.supplierEmail === supplierEmail && (!productId || item.productId === productId)) {
                if (status) item.status = status;
                if (supplierNote !== undefined) item.supplierNote = supplierNote;
                itemsUpdated = true;
            }
        });

        if (!itemsUpdated) {
            return res.status(404).json({ message: "No matching items found for this supplier" });
        }

        // Recalculate Global Order Status using unified logic
        order.status = calculateOverallStatus(order.items);

        await order.save();

        // Emit socket notification to student
        const io = req.app.get('io');
        if (io) {
            const User = require('../models/User');
            const student = await User.findOne({ email: order.studentEmail });
            if (student) {
                io.to(`user_${student._id}`).emit('order_status_update', { 
                    orderId: order._id, 
                    orderStatus: order.status,
                    message: `Order #${order.orderId} status has been updated to ${order.status}`
                });
            }
        }

        return res.status(200).json({ 
            message: "Order updated successfully", 
            orderStatus: order.status,
            itemsCount: order.items.length 
        });
    } catch (error) {
        console.error("Status Update Error:", error);
        res.status(500).json({ message: "Failed to update status", error: error.message });
    }
}


async function getAdminOrders(req, res) {
  try {
    const orders = await Order.aggregate([
      // First join to get student name if needed (though contactInfo has it)
      // Now unwind items to join each with its supplier
      { $unwind: { path: "$items", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "suppliers",
          localField: "items.supplierEmail",
          foreignField: "semail",
          as: "supplierInfo"
        }
      },
      {
        $addFields: {
          "items.supplierName": {
            $cond: {
              if: { $gt: [{ $size: "$supplierInfo" }, 0] },
              then: { $concat: [{ $arrayElemAt: ["$supplierInfo.firstName", 0] }, " ", { $arrayElemAt: ["$supplierInfo.lastName", 0] }] },
              else: "System admin"
            }
          }
        }
      },
      {
        $group: {
          _id: "$_id",
          orderId: { $first: "$orderId" },
          studentEmail: { $first: "$studentEmail" },
          items: { $push: "$items" },
          rentalDates: { $first: "$rentalDates" },
          deliveryDetails: { $first: "$deliveryDetails" },
          contactInfo: { $first: "$contactInfo" },
          totalAmount: { $first: "$totalAmount" },
          status: { $first: "$status" },
          createdAt: { $first: "$createdAt" }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch admin orders", error: error.message });
  }
}

async function calculatePreview(req, res) {
  try {
    const { items, appliedPackageId } = req.body;
    const { calculateFinalPricing } = require('../utils/offerResolver');
    const Offer = require('../models/Offer');
    const Package = require('../models/Package');
    const Product = require('../models/Product');

    // Fetch actual prices for items (prevents price tampering from client)
    const itemsWithPrices = await Promise.all(items.map(async (item) => {
      const product = await Product.findOne({ productID: item.productId });
      return {
        productId: item.productId,
        qty: item.qty,
        price: product ? product.price : 0
      };
    }));

    const activeOffers = await Offer.find({ isActive: true });
    let selectedPackage = null;
    if (appliedPackageId) {
      selectedPackage = await Package.findOne({ packageId: appliedPackageId, isActive: true });
    }

    const pricing = calculateFinalPricing(itemsWithPrices, selectedPackage, activeOffers);
    res.json({ success: true, pricing });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error calculating preview", error: error.message });
  }
}

async function deleteAllOrders(req, res) {
  try {
    const Order = require('../models/Order');
    await Order.deleteMany({});
    res.json({ success: true, message: "All orders have been successfully deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting orders", error: error.message });
  }
}

async function verifyOrderEmail(req, res) {
  try {
    const { orderId, otp } = req.body;
    if (!orderId || !otp) {
        return res.status(400).json({ success: false, message: "Order ID and OTP are required" });
    }

    const result = await orderService.verifyAndConfirmOrder(orderId, otp);

    if (!result.success) {
        return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: "Verification failed", error: error.message });
  }
}

async function resendOrderOTP(req, res) {
  try {
    const { orderId } = req.body;
    if (!orderId) {
        return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    const result = await orderService.resendOTP(orderId);

    if (!result.success) {
        return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to resend OTP", error: error.message });
  }
}

module.exports = { 
  createOrder, 
  getStudentOrders, 
  updateOrder, 
  cancelOrder, 
  getSupplierOrders, 
  updateOrderItemStatus, 
  getAllOrders, 
  getAdminOrders, 
  deleteAllOrders, 
  calculatePreview,
  verifyOrderEmail,
  resendOrderOTP
};

