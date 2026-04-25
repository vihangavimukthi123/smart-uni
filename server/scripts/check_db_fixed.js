
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Product = require('../models/Product');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await Product.countDocuments();
        const availableCount = await Product.countDocuments({ isAvailable: true });
        console.log('Total Products:', count);
        console.log('Available Products:', availableCount);
        
        if (availableCount > 0) {
            const products = await Product.find({ isAvailable: true }).limit(2);
            console.log('Sample Products:', JSON.stringify(products, null, 2));
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.connection.close();
    }
}

run();
