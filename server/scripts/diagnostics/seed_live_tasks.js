const mongoose = require('mongoose');
const Task = require('./models/Task');
const Peer = require('./models/Peer');
require('dotenv').config();

async function seedTasks() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Clear existing tasks to avoid confusion
  await Task.deleteMany({});
  
  const ravindu = await Peer.findOne({ name: /Ravindu Perera/i });
  const anjalee = await Peer.findOne({ name: /Anjalee/i });
  
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  const deadlineStr = futureDate.toISOString().split('T')[0];

  const tasks = [];

  if (ravindu) {
    tasks.push({
      title: "Help with Node.js Middleware",
      category: "Programming Applications and Frameworks",
      module: "Programming Applications and Frameworks",
      description: "I'm struggling with implementing custom authentication middleware in Express. Need some guidance on how to structure it properly.",
      deadlineDate: futureDate,
      deadline: "7 days left",
      deadlineUrgent: false,
      author: ravindu.name,
      avatar: "RP",
      userId: ravindu.email,
      year: 3,
      semester: 2,
      categoryColor: "purple"
    });
  }

  if (anjalee) {
    tasks.push({
      title: "SQL Query Optimization",
      category: "Database Systems",
      module: "Database Systems",
      description: "Need help optimizing some complex JOIN queries. They are running quite slow on my local environment.",
      deadlineDate: futureDate,
      deadline: "7 days left",
      deadlineUrgent: false,
      author: anjalee.name,
      avatar: "AK",
      userId: anjalee.email,
      year: 3,
      semester: 2,
      categoryColor: "green"
    });
  }

  if (tasks.length > 0) {
    await Task.insertMany(tasks);
    console.log(`Successfully added ${tasks.length} tasks!`);
  } else {
    console.log("Could not find Ravindu or Anjalee to post tasks.");
  }

  process.exit(0);
}

seedTasks();
