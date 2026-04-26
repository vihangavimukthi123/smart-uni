const express = require('express');
const {
  getPublicFaqs,
  getMyPendingFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  getStudyTasks,
  createStudyTask,
  updateStudyTask,
  deleteStudyTask,
  getJournals,
  createJournal,
  updateJournal,
  deleteJournal,
} = require('../controllers/momentumController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public Routes
router.get('/faqs/public', getPublicFaqs);

// Protected Routes
router.use(protect);

// FAQ Routes
router.post('/faqs/my-pending', getMyPendingFaqs);
router.post('/faqs', createFaq);
router.put('/faqs/:id', updateFaq);
router.delete('/faqs/:id', deleteFaq);

// Study Task Routes
router.get('/study-tasks', getStudyTasks);
router.post('/study-tasks', createStudyTask);
router.put('/study-tasks/:id', updateStudyTask);
router.delete('/study-tasks/:id', deleteStudyTask);

// Journal Routes
router.get('/journals', getJournals);
router.post('/journals', createJournal);
router.put('/journals/:id', updateJournal);
router.delete('/journals/:id', deleteJournal);

module.exports = router;
