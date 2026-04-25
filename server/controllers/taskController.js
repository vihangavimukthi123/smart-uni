const Task = require('../models/Task');

// CREATE TASK
const createTask = async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      userId: req.user.email.toLowerCase().trim(),
      author: req.user.name
    };
    const task = await Task.create(taskData);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET ALL TASKS
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET USER TASKS
const getUserTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.params.userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json(err);
  }
};

// DELETE TASK
const deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
};

// UPDATE TASK
const updateTask = async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json(err);
  }
};
module.exports = { createTask, getTasks, getUserTasks, deleteTask, updateTask };
