const express = require('express');
const router = express.Router();
const { sendMessage, getConversation, getUserConversations, markAsRead } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', sendMessage);
router.get('/conversations', getUserConversations);
router.get('/conversation/:id', getConversation);
router.put('/:id/read', markAsRead);

module.exports = router;

