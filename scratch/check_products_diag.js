const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });
const Product = require('./server/models/Product');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const products = await Product.find({ productID: { $in: ['UNI015', 'UNI013', 'UNI021', 'UNI024'] } });
        console.log('Found products:', products.map(p => ({ id: p.productID, name: p.name, price: p.price })));
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
