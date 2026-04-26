const Message = require('../models/Message');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// Helper to get the main admin ID
const getMainAdminId = async () => {
  const admin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 });
  return admin ? admin._id : null;
};

// @POST /api/messages
const sendMessage = asyncHandler(async (req, res) => {
  const { content, requestId } = req.body;
  let { receiverId } = req.body;

  // Legacy fallback for standard users messaging admin if no receiverId provided
  if (!receiverId && ['student', 'user'].includes(req.user.role)) {
    receiverId = await getMainAdminId();
  }

  if (!receiverId) {
    return res.status(400).json({ success: false, message: 'Receiver not found' });
  }

  const message = await Message.create({
    sender: req.user._id,
    receiver: receiverId,
    requestId: requestId || null,
    content
  });

  const populatedMsg = await Message.findById(message._id)
    .populate('sender', 'name email role')
    .populate('receiver', 'name email role');

  // Broadcast via Socket
  const io = req.app.get('io');
  if (io) {
    io.to(`user_${receiverId}`).emit('receiveMessage', populatedMsg);
    io.to(`user_${req.user._id}`).emit('receiveMessage', populatedMsg);
  }

  res.status(201).json({ success: true, data: populatedMsg });
});

// @GET /api/messages/conversation/:id
const getConversation = asyncHandler(async (req, res) => {
  let otherUserId = req.params.id;

  if (otherUserId === 'admin') {
    otherUserId = await getMainAdminId();
  }

  if (!otherUserId) return res.status(400).json({ success: false, message: 'User not found' });

  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: otherUserId },
      { sender: otherUserId, receiver: req.user._id }
    ]
  })
  .populate('sender', 'name email role')
  .populate('receiver', 'name email role')
  .sort({ createdAt: 1 });

  res.json({ success: true, data: messages });
});

// @GET /api/messages/conversations
const getUserConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Aggregate to get the latest message and unread count per user
  const latestMessages = await Message.aggregate([
    {
      $match: {
        $or: [{ receiver: userId }, { sender: userId }]
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ['$sender', userId] },
            '$receiver',
            '$sender'
          ]
        },
        latestMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$isRead', false] }] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  // Populate user data
  await User.populate(latestMessages, { path: '_id', select: 'name email role avatar' });

  // Format response
  const conversations = latestMessages.map(conv => ({
    user: conv._id,
    lastMessage: conv.latestMessage,
    unreadCount: conv.unreadCount
  })).sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

  res.json({ success: true, data: conversations });
});

// @PUT /api/messages/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  let senderId = req.params.id;
  if (senderId === 'admin') {
    senderId = await getMainAdminId();
  }

  await Message.updateMany(
    { sender: senderId, receiver: req.user._id, isRead: false },
    { isRead: true }
  );

  res.json({ success: true, message: 'Messages marked as read' });
});

module.exports = { 
  sendMessage, 
  getConversation, 
  getUserConversations, 
  markAsRead,
  getAdminConversations: getUserConversations // Keep for backward compatibility if needed
};


