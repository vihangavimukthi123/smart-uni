const express = require('express');
const {
  createTask,
  getTasks,
  getUserTasks,
  deleteTask,
  updateTask,
} = require('../controllers/taskController.js');

const router = express.Router();

router.post("/", createTask);
router.get("/", getTasks);
router.get("/user/:userId", getUserTasks);
router.delete("/:id", deleteTask);
router.put("/:id", updateTask);


module.exports = router;
