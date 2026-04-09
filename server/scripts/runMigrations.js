require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
};

const User = require('../models/User');
const Order = require('../models/Order');
const Peer = require('../models/Peer');
const Task = require('../models/Task');
const LearningResource = require('../models/LearningResource');

async function runMigrations() {
    await connectDB();
    const db = mongoose.connection.db;

    console.log("--- Starting Migrations ---");

    // 1. Migrate Students to Users
    const studentsCollection = db.collection('students');
    const students = await studentsCollection.find({}).toArray();
    console.log(`Found ${students.length} students to migrate`);
    for (const student of students) {
        let existingUser = await User.findOne({ email: student.email });
        if (!existingUser) {
            await User.create({
                name: `${student.firstName} ${student.lastName}`,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                password: student.password, // preserve hashed password
                role: 'student',
                phone: student.phone,
                isBlocked: student.isBlocked,
                isEmailVerified: student.isEmailVerified,
                isActive: !student.isBlocked
            });
            console.log(`Migrated student ${student.email}`);
        } else {
            console.log(`User ${student.email} already exists`);
            // Ensure they have the student role or at least their data
            if(existingUser.role !== 'admin' && existingUser.role !== 'scheduler') {
                existingUser.role = 'student';
                await existingUser.save();
            }
        }
    }

    // 2. Migrate Suppliers to Users
    const suppliersCollection = db.collection('suppliers');
    const suppliers = await suppliersCollection.find({}).toArray();
    console.log(`Found ${suppliers.length} suppliers to migrate`);
    for (const supplier of suppliers) {
        let existingUser = await User.findOne({ email: supplier.email });
        if (!existingUser) {
            await User.create({
                name: `${supplier.firstName} ${supplier.lastName}`,
                firstName: supplier.firstName,
                lastName: supplier.lastName,
                email: supplier.email,
                password: supplier.password, // preserve hashed password
                role: 'supplier',
                phone: supplier.phone ? String(supplier.phone) : "",
                isBlocked: supplier.isBlocked,
                isEmailVerified: supplier.isEmailVerified,
                isActive: !supplier.isBlocked,
                supplierProfile: {
                    description: supplier.description,
                    tags: supplier.tags,
                    profileImage: supplier.profileImage,
                    rating: supplier.rating,
                    reviewsCount: supplier.reviewsCount,
                    status: supplier.status,
                    isVerified: supplier.isVerified
                }
            });
            console.log(`Migrated supplier ${supplier.email}`);
        } else {
            console.log(`User ${supplier.email} already exists`);
            existingUser.role = 'supplier';
            existingUser.supplierProfile = {
                description: supplier.description,
                tags: supplier.tags,
                profileImage: supplier.profileImage,
                rating: supplier.rating,
                reviewsCount: supplier.reviewsCount,
                status: supplier.status,
                isVerified: supplier.isVerified
            };
            await existingUser.save();
        }
    }

    // 3. Update Order references
    console.log("Updating Order references...");
    const orders = await Order.find({});
    for (const order of orders) {
        if (!order.studentId && order.studentEmail) {
            const user = await User.findOne({ email: order.studentEmail });
            if (user) {
                // Update collection directly since schema may not have studentId yet if not fully deployed
                await db.collection('orders').updateOne({ _id: order._id }, { $set: { studentId: user._id } });
                console.log(`Linked order ${order._id} to user ${user.email}`);
            }
        }
    }

    console.log("--- Migrations Complete ---");
    process.exit(0);
}

runMigrations();
