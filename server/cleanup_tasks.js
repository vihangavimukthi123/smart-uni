const mongoose = require('mongoose');
const Task = require('./models/Task');
require('dotenv').config();

async function cleanupDuplicates() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const allTasks = await Task.find({});
  const seen = new Set();
  const toDelete = [];

  allTasks.forEach(task => {
    // Create a unique key based on title and description
    const key = `${task.title}|${task.description}`.toLowerCase().trim();
    
    if (seen.has(key)) {
      toDelete.push(task._id);
    } else {
      seen.add(key);
    }
  });

  if (toDelete.length > 0) {
    await Task.deleteMany({ _id: { $in: toDelete } });
    console.log(`Successfully removed ${toDelete.length} duplicate tasks!`);
  } else {
    console.log("No duplicate tasks found.");
  }

  process.exit(0);
}

cleanupDuplicates();
