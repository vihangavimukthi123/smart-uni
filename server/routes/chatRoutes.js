const express = require('express');
const router = express.Router();
const { 
  sendMessage, 
  getChatsByOrder, 
  getChatById, 
  getStudentChats, 
  getSupplierChats,
  createOrderChatsManual 
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/send-message', sendMessage);
router.post('/create', createOrderChatsManual); // For manual/retry creation
router.get('/order/:orderId', getChatsByOrder);
router.get('/:chatId', getChatById);
router.get('/student/:studentId', getStudentChats);
router.get('/supplier/:supplierId', getSupplierChats);

module.exports = router;
