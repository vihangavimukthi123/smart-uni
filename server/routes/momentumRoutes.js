const express = require('express');
const {
  getFaqs,
  getPublicFaqs,
  getAdminFaqs,
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
const { 
  generateWorkplan, 
  getAllPlans, 
  getSinglePlan,
  updatePlan, 
  deletePlan 
} = require('../controllers/workPlanController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ── PUBLIC ROUTES ────────────────────────────────────────────────────────────
router.get('/faqs/public', getPublicFaqs);

// ── PROTECTED ROUTES ─────────────────────────────────────────────────────────
router.use(protect);

// Global FAQ View (Admin/User)
router.get('/faqs', getFaqs); 
router.get('/faqs/admin', getAdminFaqs); // Submitted inquiries for review

// Personal FAQ Inquiries
router.post('/faqs/my-pending', getMyPendingFaqs);
router.post('/faqs', createFaq);
router.put('/faqs/:id', updateFaq);
router.delete('/faqs/:id', deleteFaq);

// Workplan Generation & Vault
router.post('/generate-plan', generateWorkplan);
router.get('/workplans/user/:userId', getAllPlans);
router.get('/workplans/single/:id', getSinglePlan);
router.put('/workplans/:id', updatePlan);
router.delete('/workplans/:id', deletePlan);

// Study Tracker
router.get('/study-tasks', getStudyTasks);
router.post('/study-tasks', createStudyTask);
router.put('/study-tasks/:id', updateStudyTask);
router.delete('/study-tasks/:id', deleteStudyTask);

// Learning Journal
router.get('/journals', getJournals);
router.post('/journals', createJournal);
router.put('/journals/:id', updateJournal);
router.delete('/journals/:id', deleteJournal);

module.exports = router;
