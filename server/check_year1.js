require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const Peer = require('./models/Peer');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const realUsers = await User.find({ role: 'student', isActive: true }, 'email').lean();
    const realEmails = realUsers.map(u => String(u.email).toLowerCase());
    
    console.log(`Total real students in User collection: ${realEmails.length}`);
    
    const realPeers = await Peer.find({ email: { $in: realEmails } }).lean();
    console.log(`Total real peers (found in Peer collection): ${realPeers.length}`);
    
    const year1Peers = realPeers.filter(p => p.year === 1);
    console.log(`Real peers in Year 1: ${year1Peers.length}`);
    
    year1Peers.forEach(p => console.log(`- ${p.name} (${p.email})`));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
