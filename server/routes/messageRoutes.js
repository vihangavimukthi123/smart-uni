const express = require('express');
const router = express.Router();
const { sendMessage, getConversation, getAdminConversations, markAsRead } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', sendMessage);
router.get('/conversations', authorize('admin', 'scheduler'), getAdminConversations);
router.get('/conversation/:id', getConversation);
router.put('/:id/read', markAsRead);

module.exports = router;

