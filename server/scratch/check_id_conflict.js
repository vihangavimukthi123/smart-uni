const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

async function checkProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const count = await Product.countDocuments();
    console.log(`Total products: ${count}`);
    
    const existing = await Product.findOne({ productID: '1' });
    if (existing) {
      console.log('Product with ID "1" already exists!');
      console.log(existing);
    } else {
      console.log('Product with ID "1" is available.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkProducts();
