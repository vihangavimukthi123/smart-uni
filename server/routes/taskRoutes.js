const express = require('express');
const {
  createTask,
  getTasks,
  getUserTasks,
  deleteTask,
  updateTask,
} = require('../controllers/taskController.js');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post("/", protect, createTask);
router.get("/", getTasks);
router.get("/user/:userId", protect, getUserTasks);
router.delete("/:id", protect, deleteTask);
router.put("/:id", protect, updateTask);


module.exports = router;
