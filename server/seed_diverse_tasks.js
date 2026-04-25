const mongoose = require('mongoose');
const Task = require('./models/Task');
const Peer = require('./models/Peer');
require('dotenv').config();

async function seedDiverseTasks() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Keep previous tasks, just add more from different years
  const peers = await Peer.find({
    name: { $in: [/Nethmi Senanayake/i, /Hasitha Perera/i, /Dulani Ranasinghe/i] }
  });
  
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 10);
  const deadlineStr = futureDate.toISOString().split('T')[0];

  const tasks = [];

  peers.forEach(peer => {
    if (peer.name.match(/Nethmi/i)) {
      tasks.push({
        title: "Python Dictionary Help",
        category: "Introduction to Programming",
        module: "Introduction to Programming",
        description: "Year 1 student here. I'm confused about nested dictionaries in Python. Can someone explain how to access deep values?",
        deadlineDate: futureDate,
        deadline: "10 days left",
        deadlineUrgent: false,
        author: peer.name,
        avatar: "NS",
        userId: peer.email,
        year: 1,
        semester: 1,
        categoryColor: "blue"
      });
    } else if (peer.name.match(/Hasitha/i)) {
      tasks.push({
        title: "UML Diagram Review",
        category: "Software Process Modeling",
        module: "Software Process Modeling",
        description: "Need someone to review my Class Diagram for the assignment. Not sure if the associations are correct.",
        deadlineDate: futureDate,
        deadline: "10 days left",
        deadlineUrgent: false,
        author: peer.name,
        avatar: "HP",
        userId: peer.email,
        year: 2,
        semester: 2,
        categoryColor: "teal"
      });
    } else if (peer.name.match(/Dulani/i)) {
      tasks.push({
        title: "Final Year Project Architecture",
        category: "IT Project",
        module: "IT Project",
        description: "Looking for advice on microservices architecture for my FYP. Would love to chat with someone who has experience in Docker.",
        deadlineDate: futureDate,
        deadline: "10 days left",
        deadlineUrgent: false,
        author: peer.name,
        avatar: "DR",
        userId: peer.email,
        year: 4,
        semester: 2,
        categoryColor: "purple"
      });
    }
  });

  if (tasks.length > 0) {
    await Task.insertMany(tasks);
    console.log(`Successfully added ${tasks.length} diverse tasks!`);
  } else {
    console.log("Could not find suitable peers for diverse tasks.");
  }

  process.exit(0);
}

seedDiverseTasks();
