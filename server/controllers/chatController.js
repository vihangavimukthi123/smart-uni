const mongoose = require('mongoose');
const Chat = require('../models/Chat');
const User = require('../models/User');

/**
 * Internal helper to create chats when an order is placed
 */
const createOrderChats = async (order) => {
  try {
    const { orderId, studentEmail, items } = order;
    
    // Find student ID
    const student = await User.findOne({ email: studentEmail });
    if (!student) {
      console.error(`Student with email ${studentEmail} not found`);
      return;
    }

    // Extract unique supplier emails from items
    const supplierEmails = [...new Set(items.map(item => item.supplierEmail))];
    
    const chatPromises = supplierEmails.map(async (supplierEmail) => {
      // Check if chat already exists (idempotency)
      const existingChat = await Chat.findOne({ orderId, studentEmail, supplierEmail });
      if (existingChat) return existingChat;
      
      // Find supplier ID
      const supplier = await User.findOne({ email: supplierEmail });
      if (!supplier) {
        console.error(`Supplier with email ${supplierEmail} not found`);
        return null;
      }

      return await Chat.create({
        orderId,
        studentEmail,
        studentId: student._id.toString(),
        supplierEmail,
        supplierId: supplier._id.toString(),
        messages: []
      });
    });
    
    await Promise.all(chatPromises);
    console.log(`Created chats for order ${orderId}`);
  } catch (error) {
    console.error("Error creating order chats:", error);
  }
};

/**
 * Send a message
 */
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, message } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { email: senderEmail, role: senderRole, _id: senderUserId } = req.user;
    const io = req.app.get('io');

    if (!message) {
      return res.status(400).json({ message: "Message content cannot be empty" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Auto-repair missing IDs if they aren't there (for legacy chats)
    if (!chat.studentId || !chat.supplierId) {
      const student = await User.findOne({ email: chat.studentEmail });
      const supplier = await User.findOne({ email: chat.supplierEmail });
      if (student && !chat.studentId) chat.studentId = student._id.toString();
      if (supplier && !chat.supplierId) chat.supplierId = supplier._id.toString();
    }

    // Authorization: only student or supplier of this chat can send messages
    if (senderRole === 'student' && chat.studentEmail !== senderEmail) {
      return res.status(403).json({ message: "Unauthorized to send message to this chat" });
    }
    if (senderRole === 'supplier' && chat.supplierEmail !== senderEmail) {
      return res.status(403).json({ message: "Unauthorized to send message to this chat" });
    }

    const newMessage = {
      senderId: senderUserId ? senderUserId.toString() : senderEmail,
      senderRole: senderRole === 'supplier' ? 'supplier' : 'student',
      message,
      timestamp: new Date()
    };

    chat.messages.push(newMessage);
    
    try {
      await chat.save();
    } catch (saveError) {
      console.error("Mongoose Save Error:", saveError);
      return res.status(500).json({ message: "Database save failed", error: saveError.message });
    }

    // Emit to both parties
    if (io) {
      if (chat.studentId) {
        console.log(`Emitting to student: user_${chat.studentId}`);
        io.to(`user_${chat.studentId}`).emit('order_chat_message', { chatId, message: newMessage });
      }
      if (chat.supplierId) {
        console.log(`Emitting to supplier: user_${chat.supplierId}`);
        io.to(`user_${chat.supplierId}`).emit('order_chat_message', { chatId, message: newMessage });
      }
    }

    res.status(200).json({ success: true, chat });
  } catch (error) {
    console.error("SEND MESSAGE CRITICAL ERROR:", error);
    res.status(500).json({ message: "Failed to send message", error: error.message });
  }
};


/**
 * Get chats by order ID
 */
exports.getChatsByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { email, role } = req.user;

    // Try to find chats by orderId (which could be the human-readable ID or MongoDB ID)
    let query = { 
      $or: [
        { orderId: orderId },
        { orderId: orderId.toString() } // Ensure it's a string
      ]
    };
    
    // Filter based on role to ensure users only see their own chats
    if (role === 'student') {
      query.studentEmail = email;
    } else if (role === 'supplier') {
      query.supplierEmail = email;
    }

    let chats = await Chat.find(query);

    // If no chats found, try to find the order first to get the correct human-readable orderId
    if (chats.length === 0) {
      const Order = require('../models/Order');
      // Try finding order by _id or orderId
      let order = await Order.findOne({ 
        $or: [
          { orderId: orderId },
          { _id: mongoose.Types.ObjectId.isValid(orderId) ? orderId : null }
        ].filter(q => q.orderId || q._id)
      });

      if (order) {
        // Now that we have the order, we know the correct human-readable orderId
        const actualOrderId = order.orderId;
        
        // Try finding chats again with the actual orderId
        let secondaryQuery = { orderId: actualOrderId };
        if (role === 'student') secondaryQuery.studentEmail = email;
        else if (role === 'supplier') secondaryQuery.supplierEmail = email;

        chats = await Chat.find(secondaryQuery);

        // If still no chats, initialize them
        if (chats.length === 0) {
          await createOrderChats(order);
          chats = await Chat.find(secondaryQuery);
        }
      }
    }

    // "Repair" chats that are missing studentId or supplierId on the fly
    for (let chat of chats) {
      if (!chat.studentId || !chat.supplierId) {
        const student = await User.findOne({ email: chat.studentEmail });
        const supplier = await User.findOne({ email: chat.supplierEmail });
        let updated = false;
        if (student && !chat.studentId) { chat.studentId = student._id.toString(); updated = true; }
        if (supplier && !chat.supplierId) { chat.supplierId = supplier._id.toString(); updated = true; }
        if (updated) await chat.save();
      }
    }


    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch chats", error: error.message });
  }
};

/**
 * Get chat by ID
 */
exports.getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch chat", error: error.message });
  }
};

/**
 * Get all chats for a student
 */
exports.getStudentChats = async (req, res) => {
  try {
    const { studentId } = req.params; // Using email as studentId
    const chats = await Chat.find({ studentEmail: studentId }).sort({ updatedAt: -1 });
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch student chats", error: error.message });
  }
};

/**
 * Get all chats for a supplier
 */
exports.getSupplierChats = async (req, res) => {
  try {
    const { supplierId } = req.params; // Using email as supplierId
    const chats = await Chat.find({ supplierEmail: supplierId }).sort({ updatedAt: -1 });
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch supplier chats", error: error.message });
  }
};

exports.createOrderChatsManual = async (req, res) => {
  try {
    const { orderId } = req.body;
    const Order = require('../models/Order');
    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ message: "Order not found" });
    
    await createOrderChats(order);
    res.status(200).json({ message: "Chats initialized successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to initialize chats", error: error.message });
  }
};

module.exports.createOrderChats = createOrderChats;
