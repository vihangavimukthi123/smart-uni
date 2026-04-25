require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const Peer = require('./models/Peer');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const peer = await Peer.findOne({ name: /Ravindu/i });
    console.log("Peer Email:", peer.email);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
