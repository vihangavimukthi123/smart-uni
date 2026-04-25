/**
 * Resource seed script — creates sample learning resources only
 * Run: node scripts/seedResources.js
 */
require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');
};

const seedResources = async () => {
  await connectDB();

  const User = require('../models/User');
  const LearningResource = require('../models/LearningResource');

  const studentUser = await User.findOne({ email: 'user@campus.edu' });
  const adminUser = await User.findOne({ email: 'admin@campus.edu' });

  if (!studentUser || !adminUser) {
    console.error('Missing default users. Run "node scripts/seed.js" first.');
    process.exit(1);
  }

  const resources = [
    {
      title: 'Introduction to Project Management',
      description: 'Overview notes covering project scope, timeline and stakeholder basics.',
      subject: 'IT Project Management',
      module: 'Computer Science 101',
      category: 'Notes',
      fileType: 'PDF',
      fileUrl: 'https://example.com/resources/project-management-intro.pdf',
      author: 'Shanilka Perera',
      userId: String(studentUser._id),
    },
    {
      title: 'Human Computer Interaction Lecture',
      description: 'Recommended video lecture with usability and UX principles.',
      subject: 'HCI',
      module: 'UI/UX Design',
      category: 'YouTube Links',
      fileType: 'LINK',
      fileUrl: 'https://www.youtube.com/watch?v=Ovj4hFxko7c',
      author: 'Dulani Fernando',
      userId: String(adminUser._id),
    },
    {
      title: 'Data Structures Revision Pack',
      description: 'Past-paper style revision set for linked lists, trees and graphs.',
      subject: 'Data Structures',
      module: 'Data Structures',
      category: 'Past Papers',
      fileType: 'PDF',
      fileUrl: 'https://example.com/resources/data-structures-revision-pack.pdf',
      author: 'Shanilka Perera',
      userId: String(studentUser._id),
    },
    {
      title: 'Machine Learning Assignment Template',
      description: 'Template and marking rubric for supervised learning assignment.',
      subject: 'Machine Learning',
      module: 'Machine Learning',
      category: 'Assignments',
      fileType: 'DOCX',
      fileUrl: 'https://example.com/resources/ml-assignment-template.docx',
      author: 'Dulani Fernando',
      userId: String(adminUser._id),
    },
  ];

  for (const resource of resources) {
    const exists = await LearningResource.findOne({ title: resource.title, module: resource.module });
    if (!exists) {
      await LearningResource.create(resource);
      console.log(`✅ Resource created: ${resource.title}`);
    } else {
      await LearningResource.updateOne(
        { _id: exists._id },
        { $set: { author: resource.author, userId: resource.userId } }
      );
      console.log(`🔁 Resource updated: ${resource.title}`);
    }
  }

  console.log('\n🎉 Resource seed complete!');
  process.exit(0);
};

seedResources().catch((err) => {
  console.error(err);
  process.exit(1);
});
