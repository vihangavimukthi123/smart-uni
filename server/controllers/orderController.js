//orderController.js
const Order = require('../models/Order');

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
  
  const allCancelled = items.every(i => i.status === "Cancelled");
  if (allCancelled) return "Cancelled";
  
  const allDelivered = items.every(i => i.status === "Delivered");
  if (allDelivered) return "Completed";
  
  const anyActive = items.some(i => i.status === "Processing" || i.status === "Delivered");
  if (anyActive) return "Active";
  
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

    // Generate a unique Order ID
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderId = `ORD-${Date.now().toString().slice(-4)}-${randomSuffix}`;

    const newOrder = new Order({
      orderId,
      studentEmail: req.user.email,
      items,
      rentalDates,
      deliveryDetails,
      contactInfo,
      totalAmount
    });
    await newOrder.save();
    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error("Create Order Error Details:", error.errors || error);
    res.status(500).json({ 
      message: "Failed to place order. " + error.message, 
      receivedBody: req.body,
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

    // Update fields for edit
    order.items = items || order.items;
    order.rentalDates = rentalDates || order.rentalDates;
    order.deliveryDetails = deliveryDetails || order.deliveryDetails;
    order.contactInfo = contactInfo || order.contactInfo;
    order.totalAmount = totalAmount || order.totalAmount;
    
    // Recalculate status based on NEW items state
    order.status = calculateOverallStatus(order.items);

    await order.save();
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
    if (!req.user || req.user.role !== "supplier") {
      return res.status(401).json({ message: "Unauthorized: Supplier access required" });
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
    res.status(500).json({ message: "Failed to fetch supplier orders", error: error.message });
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

module.exports = { createOrder, getStudentOrders, updateOrder, cancelOrder, getSupplierOrders, updateOrderItemStatus };

