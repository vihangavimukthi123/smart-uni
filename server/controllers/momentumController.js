const FAQ = require('../models/FAQ');
const MomentumTask = require('../models/MomentumTask');
const JournalEntry = require('../models/JournalEntry');

// ── HELPERS ──────────────────────────────────────────────────────────────────
// Simple wrapper to avoid try/catch blocks if desired, 
// but we'll use standard try/catch here for simplicity as per existing pattern.

// ── FAQ CONTROLLERS ─────────────────────────────────────────────────────────

// Fetch all published FAQs
const getPublicFaqs = async (req, res) => {
  try {
    const faqs = await FAQ.find({ isPublished: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: faqs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Fetch pending FAQs for a user
const getMyPendingFaqs = async (req, res) => {
  try {
    const { ids } = req.body;
    const userId = req.user?._id;
    
    let filter = { isPublished: false };
    if (userId) {
      filter.userId = userId;
    } else if (ids && Array.isArray(ids)) {
      filter._id = { $in: ids };
    } else {
      return res.status(200).json({ success: true, data: [] });
    }

    const pendingFaqs = await FAQ.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: pendingFaqs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Fetch all submitted FAQs for admin review
const getAdminFaqs = async (req, res) => {
  try {
    const faqs = await FAQ.find({ submittedByUser: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: faqs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Fetch all FAQs (Admin view)
const getFaqs = async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ createdAt: -1 });
    res.json({ success: true, data: faqs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a new FAQ
const createFaq = async (req, res) => {
  try {
    const { question, category } = req.body;
    const newFaq = await FAQ.create({
      question,
      category,
      isPublished: false,
      submittedByUser: true,
      userId: req.user?._id
    });
    res.status(201).json({ success: true, data: newFaq });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update an FAQ (Admin or Owner)
const updateFaq = async (req, res) => {
  try {
    let updateData = { ...req.body };
    
    // Auto-publish if an answer is provided
    if (updateData.answer && updateData.answer.trim() !== '') {
      updateData.isPublished = true;
    }

    const faq = await FAQ.findById(req.params.id);
    if (!faq) return res.status(404).json({ success: false, message: "FAQ not found" });

    // Authorization: Admin or the Student who submitted it
    if (req.user.role !== 'admin' && (!faq.userId || faq.userId.toString() !== req.user._id.toString())) {
      return res.status(403).json({ success: false, message: "Not authorized to update this inquiry" });
    }

    const updated = await FAQ.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete an FAQ
const deleteFaq = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) return res.status(404).json({ success: false, message: "FAQ not found" });

    if (req.user.role !== 'admin' && (!faq.userId || faq.userId.toString() !== req.user._id.toString())) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this inquiry" });
    }

    await faq.deleteOne();
    res.json({ success: true, message: "FAQ record removed successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── STUDY TASK CONTROLLERS ──────────────────────────────────────────────────

// Fetch study tasks for current user
const getStudyTasks = async (req, res) => {
  try {
    const tasks = await MomentumTask.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a study task
const createStudyTask = async (req, res) => {
  try {
    const taskData = { ...req.body, userId: req.user._id };
    const task = await MomentumTask.create(taskData);
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update a study task
const updateStudyTask = async (req, res) => {
  try {
    const task = await MomentumTask.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    if (task.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const updated = await MomentumTask.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a study task
const deleteStudyTask = async (req, res) => {
  try {
    const task = await MomentumTask.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    if (task.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await task.deleteOne();
    res.json({ success: true, message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── JOURNAL ENTRY CONTROLLERS ──────────────────────────────────────────────

// Fetch journal entries for current user
const getJournals = async (req, res) => {
  try {
    const entries = await JournalEntry.find({ userId: req.user._id }).sort({ entryDate: -1 });
    res.json({ success: true, data: entries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a journal entry
const createJournal = async (req, res) => {
  try {
    const entryData = { ...req.body, userId: req.user._id };
    const entry = await JournalEntry.create(entryData);
    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update a journal entry
const updateJournal = async (req, res) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: "Journal entry not found" });

    if (entry.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const updated = await JournalEntry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a journal entry
const deleteJournal = async (req, res) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: "Journal entry not found" });

    if (entry.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await entry.deleteOne();
    res.json({ success: true, message: "Journal entry deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
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
};
