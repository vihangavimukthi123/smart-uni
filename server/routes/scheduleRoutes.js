const express = require('express');
const router = express.Router();
const { suggestAllocation, confirmAllocation, overrideAllocation, getSchedules, cancelSchedule, getScheduleAnalytics } = require('../controllers/scheduleController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.get('/', getSchedules);
router.get('/analytics', authorize('admin'), getScheduleAnalytics);
router.post('/suggest', authorize('admin', 'scheduler'), suggestAllocation);
router.post('/confirm', authorize('admin', 'scheduler'), confirmAllocation);
router.post('/override', authorize('admin'), overrideAllocation);
router.delete('/:id', authorize('admin'), cancelSchedule);

module.exports = router;

