const FAQ = require('../models/FAQ');
const MomentumTask = require('../models/MomentumTask');
const JournalEntry = require('../models/JournalEntry');

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

// Fetch pending FAQs for a user based on IDs stored in localStorage
const getMyPendingFaqs = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: "Invalid IDs" });
    }
    const pendingFaqs = await FAQ.find({ _id: { $in: ids }, isPublished: false }).sort({ createdAt: -1 });
    res.json({ success: true, data: pendingFaqs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a new FAQ (initially unpublished)
const createFaq = async (req, res) => {
  try {
    const { question, category } = req.body;
    const newFaq = await FAQ.create({
      question,
      category,
      isPublished: false,
    });
    res.status(201).json({ success: true, data: newFaq });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update an FAQ
const updateFaq = async (req, res) => {
  try {
    const updated = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "FAQ not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete an FAQ
const deleteFaq = async (req, res) => {
  try {
    const deleted = await FAQ.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "FAQ not found" });
    res.json({ success: true, message: "FAQ deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── STUDY TASK CONTROLLERS ──────────────────────────────────────────────────

// Fetch all study tasks (optionally for a user)
const getStudyTasks = async (req, res) => {
  try {
    // For now, fetching all to populate the dashboard as per frontend mock requirements
    // Ideally should be filtered by userId
    const tasks = await MomentumTask.find().sort({ createdAt: -1 });
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
    const updated = await MomentumTask.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Task not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a study task
const deleteStudyTask = async (req, res) => {
  try {
    const deleted = await MomentumTask.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Task not found" });
    res.json({ success: true, message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── JOURNAL ENTRY CONTROLLERS ──────────────────────────────────────────────

// Fetch all journal entries
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
    const updated = await JournalEntry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Journal entry not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a journal entry
const deleteJournal = async (req, res) => {
  try {
    const deleted = await JournalEntry.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Journal entry not found" });
    res.json({ success: true, message: "Journal entry deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
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
};
