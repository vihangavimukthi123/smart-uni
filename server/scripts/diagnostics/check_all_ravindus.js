require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const users = await User.find({ name: /Ravindu/i });
    console.log("Users:", users.map(u => ({ email: u.email, lastLogin: u.lastLogin })));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
