const mongoose = require('mongoose');
const Product = require('../models/Product');
const Package = require('../models/Package');
require('dotenv').config({ path: '../.env' });

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const products = await Product.find({}, 'productID name price');
  console.log('Sample Products:', products.slice(0, 5));

  const packages = await Package.find({});
  console.log('Sample Packages Items:', packages[0]?.items);

  await mongoose.disconnect();
}

check();
