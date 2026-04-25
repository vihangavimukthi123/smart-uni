const mongoose = require('mongoose');
const Peer = require('./models/Peer');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const shanilka = await Peer.findOne({ name: /Shanilka/i });
  const ravindu = await Peer.findOne({ name: /Ravindu/i });
  
  console.log('SHANILKA PROFILE:');
  console.log(JSON.stringify(shanilka, null, 2));
  
  console.log('\nRAVINDU PROFILE:');
  console.log(JSON.stringify(ravindu, null, 2));
  
  process.exit(0);
}

check();
