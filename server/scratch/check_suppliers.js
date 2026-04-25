const mongoose = require('mongoose');
const User = require('../models/User');
const Supplier = require('../models/Supplier');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const userSuppliers = await User.find({ role: 'supplier' });
  const supplierCollItems = await Supplier.find();
  
  console.log('Suppliers in User collection:', userSuppliers.length);
  userSuppliers.forEach(s => console.log(`  - ${s.email}`));
  
  console.log('Suppliers in Supplier collection:', supplierCollItems.length);
  supplierCollItems.forEach(s => console.log(`  - ${s.semail}`));
  
  process.exit(0);
}

check();
