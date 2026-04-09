const express = require('express');
const router = express.Router();
const { getRooms, getRoom, createRoom, updateRoom, deleteRoom, getRoomStats } = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.get('/stats', authorize('admin', 'scheduler'), getRoomStats);
router.get('/', getRooms);
router.get('/:id', getRoom);
router.post('/', authorize('admin'), createRoom);
router.put('/:id', authorize('admin', 'scheduler'), updateRoom);
router.delete('/:id', authorize('admin'), deleteRoom);

module.exports = router;

