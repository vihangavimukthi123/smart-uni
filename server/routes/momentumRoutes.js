const express = require('express');
const {
  getJournals,
  createJournal,
  updateJournal,
  deleteJournal,
  getStudyTasks,
  createStudyTask,
  deleteStudyTask,
  updateStudyTask,
  getFaqs,
  getPublicFaqs,
  getMyPendingFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
} = require('../controllers/momentumController');

const router = express.Router();

// Journal routes
router.get('/journals', getJournals);
router.post('/journals', createJournal);
router.put('/journals/:id', updateJournal);
router.delete('/journals/:id', deleteJournal);

// Study Task routes
router.get('/study-tasks', getStudyTasks);
router.post('/study-tasks', createStudyTask);
router.put('/study-tasks/:id', updateStudyTask);
router.delete('/study-tasks/:id', deleteStudyTask);

// FAQ routes
router.get('/faqs', getFaqs);
router.get('/faqs/public', getPublicFaqs);
router.post('/faqs/my-pending', getMyPendingFaqs);
router.post('/faqs', createFaq);
router.put('/faqs/:id', updateFaq);
router.delete('/faqs/:id', deleteFaq);

module.exports = router;
