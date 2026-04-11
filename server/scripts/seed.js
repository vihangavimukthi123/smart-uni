/**
 * Seed Script — creates default admin user + sample rooms
 * Run: node scripts/seed.js
 */
require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');
};

const seed = async () => {
  await connectDB();
  const User = require('../models/User');
  const Room = require('../models/Room');

  // Create admin
  const existing = await User.findOne({ email: 'admin@campus.edu' });
  if (!existing) {
    await User.create({
      name: 'System Admin',
      email: 'admin@campus.edu',
      password: 'Admin@1234',
      role: 'admin',
    });
    console.log('✅ Admin user created: admin@campus.edu / Admin@1234');
  }

  // Create standard user
  const existingUser = await User.findOne({ email: 'user@campus.edu' });
  if (!existingUser) {
    await User.create({
      name: 'Student User',
      email: 'user@campus.edu',
      password: 'User@1234',
      role: 'user',
    });
    console.log('✅ Standard user created: user@campus.edu / User@1234');
  }

  // Create Shanilka user
  const existingShanilka = await User.findOne({ email: 'shanilka.samarakoon@campus.edu' });
  if (!existingShanilka) {
    await User.create({
      name: 'Shanilka Samarakoon',
      email: 'shanilka.samarakoon@campus.edu',
      password: 'shani@1234',
      role: 'student',
    });
    console.log('✅ Student user created: shanilka.samarakoon@campus.edu / shani@1234');
  }

  // Create Dinusha user
  const existingDinusha = await User.findOne({ email: 'dinusha.fernando@campus.edu' });
  if (!existingDinusha) {
    await User.create({
      name: 'Dinusha Fernando',
      email: 'dinusha.fernando@campus.edu',
      password: 'dinu@1234',
      role: 'student',
    });
    console.log('✅ Student user created: dinusha.fernando@campus.edu / dinu@1234');
  }

  // Create sample rooms
  const rooms = [
    { name: 'Hall A-101', capacity: 120, equipment: ['projector', 'whiteboard', 'microphone', 'AC'], type: 'lecture_hall', building: 'Block A', floor: 1 },
    { name: 'Lab B-201', capacity: 40, equipment: ['computers', 'projector', 'whiteboard', 'AC'], type: 'lab', building: 'Block B', floor: 2 },
    { name: 'Seminar Room C-301', capacity: 30, equipment: ['projector', 'whiteboard', 'AC'], type: 'seminar_room', building: 'Block C', floor: 3 },
    { name: 'Auditorium D-001', capacity: 500, equipment: ['projector', 'microphone', 'AC', 'stage', 'sound_system'], type: 'auditorium', building: 'Block D', floor: 0 },
    { name: 'Conference Room E-401', capacity: 20, equipment: ['TV_screen', 'whiteboard', 'AC', 'video_conferencing'], type: 'conference_room', building: 'Block E', floor: 4 },
    { name: 'Hall A-102', capacity: 80, equipment: ['projector', 'whiteboard', 'AC'], type: 'lecture_hall', building: 'Block A', floor: 1 },
    { name: 'Lab B-202', capacity: 35, equipment: ['computers', 'whiteboard', 'AC'], type: 'lab', building: 'Block B', floor: 2 },
    { name: 'Hall F-101', capacity: 60, equipment: ['projector', 'whiteboard'], type: 'lecture_hall', building: 'Block F', floor: 1 },
  ];

  for (const r of rooms) {
    const ex = await Room.findOne({ name: r.name });
    if (!ex) {
      await Room.create(r);
      console.log(`✅ Room created: ${r.name}`);
    }
  }

  console.log('\n🎉 Seed complete!');
  process.exit(0);
};

seed().catch((e) => { console.error(e); process.exit(1); });
