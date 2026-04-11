const Journal = require('../models/Journal');
const StudyTask = require('../models/StudyTask');
const Faq = require('../models/Faq');
const { asyncHandler } = require('../middleware/errorHandler');

// ─── Journal Controllers ──────────────────────────────────────────────────────

// @GET /api/momentum/journals
const getJournals = asyncHandler(async (req, res) => {
  const journals = await Journal.find().sort('-entryDate');
  res.json({ success: true, data: journals });
});

// @POST /api/momentum/journals
const createJournal = asyncHandler(async (req, res) => {
  const journal = await Journal.create(req.body);
  res.status(201).json({ success: true, data: journal });
});

// @PUT /api/momentum/journals/:id
const updateJournal = asyncHandler(async (req, res) => {
  const journal = await Journal.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!journal) {
    return res.status(404).json({ success: false, message: 'Journal not found' });
  }
  res.json({ success: true, data: journal });
});

// @DELETE /api/momentum/journals/:id
const deleteJournal = asyncHandler(async (req, res) => {
  const journal = await Journal.findByIdAndDelete(req.params.id);
  if (!journal) {
    return res.status(404).json({ success: false, message: 'Journal not found' });
  }
  res.json({ success: true, message: 'Journal entry deleted' });
});

// ─── Study Task Controllers ───────────────────────────────────────────────────

// @GET /api/momentum/study-tasks
const getStudyTasks = asyncHandler(async (req, res) => {
  const tasks = await StudyTask.find().sort('-createdAt');
  res.json({ success: true, data: tasks });
});

// @POST /api/momentum/study-tasks
const createStudyTask = asyncHandler(async (req, res) => {
  const task = await StudyTask.create(req.body);
  res.status(201).json({ success: true, data: task });
});

// @DELETE /api/momentum/study-tasks/:id
const deleteStudyTask = asyncHandler(async (req, res) => {
  const task = await StudyTask.findByIdAndDelete(req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  res.json({ success: true, message: 'Study task deleted' });
});

// @PUT /api/momentum/study-tasks/:id
const updateStudyTask = asyncHandler(async (req, res) => {
  const task = await StudyTask.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }
  res.json({ success: true, data: task });
});

// ─── FAQ Controllers ──────────────────────────────────────────────────────────

// @GET /api/momentum/faqs (Admin)
const getFaqs = asyncHandler(async (req, res) => {
  const faqs = await Faq.find().sort('order');
  res.json({ success: true, data: faqs });
});

// @GET /api/momentum/faqs/public (Public)
const getPublicFaqs = asyncHandler(async (req, res) => {
  const faqs = await Faq.find({ isPublished: true }).sort('order');
  res.json({ success: true, data: faqs });
});

// @POST /api/momentum/faqs/my-pending (Public)
const getMyPendingFaqs = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  const faqs = await Faq.find({ _id: { $in: ids } }).sort('-createdAt');
  res.json({ success: true, data: faqs });
});

// @POST /api/momentum/faqs
const createFaq = asyncHandler(async (req, res) => {
  const faq = await Faq.create(req.body);
  res.status(201).json({ success: true, data: faq });
});

// @PUT /api/momentum/faqs/:id
const updateFaq = asyncHandler(async (req, res) => {
  const faq = await Faq.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!faq) {
    return res.status(404).json({ success: false, message: 'FAQ not found' });
  }
  res.json({ success: true, data: faq });
});

// @DELETE /api/momentum/faqs/:id
const deleteFaq = asyncHandler(async (req, res) => {
  const faq = await Faq.findByIdAndDelete(req.params.id);
  if (!faq) {
    return res.status(404).json({ success: false, message: 'FAQ not found' });
  }
  res.json({ success: true, message: 'FAQ deleted' });
});

module.exports = {
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
};
