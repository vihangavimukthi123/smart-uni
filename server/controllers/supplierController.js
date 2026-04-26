const User = require('../models/User')
const Supplier = require('../models/Supplier')
const Product = require('../models/Product')
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function getSuppliers(req, res) {
	Supplier.find().then((suppliers) => {
		res.json(suppliers);
	}).catch(err => {
		res.status(500).json({ success: false, message: "Error fetching suppliers", error: err.message });
	});
}

async function createSupplier(req, res) {
	try {
		const data = req.body;
		const emailToUse = data.email || data.semail;

		if (!emailToUse) {
			return res.status(400).json({ success: false, message: "Email is required" });
		}

		const existingSupplier = await Supplier.findOne({ semail: emailToUse });
		if (existingSupplier) {
			return res.status(400).json({ success: false, message: "Supplier already exists with this email" });
		}

		if (!data.password) {
			return res.status(400).json({ success: false, message: "Password is required" });
		}

		const hashedPassword = bcrypt.hashSync(data.password, 10);

		const supplier = new Supplier({
			semail: emailToUse,
			firstName: data.firstName,
			lastName: data.lastName,
			phone: data.phone,
			password: hashedPassword,
			role: 'supplier',
			description: data.description || "Council certified university resource provider."
		})

		await supplier.save();
		res.status(201).json({
			success: true,
			message: "Supplier created successfully",
		});
	} catch (error) {
		console.error("Error creating supplier:", error);
		if (error.name === 'ValidationError') {
			return res.status(400).json({ success: false, message: error.message });
		}
		res.status(500).json({ success: false, message: "Server error during registration" });
	}
}


async function loginSupplier(req, res) {
	try {
		const { email, password } = req.body;

		// Find supplier in the specialized Supplier collection
		const supplier = await Supplier.findOne({ semail: email });

		if (!supplier) {
			return res.status(401).json({
				success: false,
				message: "Supplier not found",
			});
		}

		const isPasswordCorrect = bcrypt.compareSync(password, supplier.password);
		if (!isPasswordCorrect) {
			return res.status(401).json({
				success: false,
				message: "Invalid password",
			});
		}

		// Generate tokens matching the standard auth system
		const accessToken = jwt.sign({ id: supplier._id }, process.env.JWT_ACCESS_SECRET, {
			expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
		});
		const refreshToken = jwt.sign({ id: supplier._id }, process.env.JWT_REFRESH_SECRET, {
			expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
		});

		// Ensure role is explicitly "supplier"
		const supplierObj = supplier.toObject();
		supplierObj.role = 'supplier';
		delete supplierObj.password;

		return res.status(200).json({
			success: true,
			message: "Login successful",
			data: {
				user: supplierObj,
				accessToken,
				refreshToken
			},
		});

	} catch (error) {
		console.error("Supplier Login Error:", error);
		return res.status(500).json({
			success: false,
			message: "Server error during login",
		});
	}
}


async function getSupplierDetailsByEmail(req, res) {
	try {
		const { email } = req.params;
		const supplier = await Supplier.findOne({ semail: email }).select("-password");

		if (!supplier) {
			return res.status(404).json({ message: "Supplier not found in specialist collection" });
		}

		// Find products owned by this supplier that are available
		const products = await Product.find({
			supplierEmail: email,
			isAvailable: true
		});

		res.json({
			supplier,
			products
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error fetching supplier details" });
	}
}

function isSupplier(req) {
	if (req.supplier == null) {
		return false;
	}
	if (req.supplier.role != "supplier") {
		return false;
	}

	return true;
}
async function deleteSupplier(req, res) {
	try {
		const { id } = req.params;
		let supplier;

		// Check if the id is a valid MongoDB ObjectId before trying to find by ID
		if (mongoose.Types.ObjectId.isValid(id)) {
			supplier = await Supplier.findById(id);
		}

		if (!supplier) {
			// Try finding by email
			const supplierByEmail = await Supplier.findOne({ semail: id });
			if (!supplierByEmail) {
				return res.status(404).json({ success: false, message: "Supplier not found" });
			}

			const email = supplierByEmail.semail;
			await Supplier.deleteOne({ _id: supplierByEmail._id });
			await User.findOneAndDelete({ email: email });
			await Product.deleteMany({ supplierEmail: email });

			return res.json({
				success: true,
				message: "Supplier and all associated products deleted successfully"
			});
		}

		const email = supplier.semail;

		// Delete from Supplier collection
		await Supplier.findByIdAndDelete(id);

		// Delete from User collection (if they exist there)
		await User.findOneAndDelete({ email: email });

		// Delete associated products
		await Product.deleteMany({ supplierEmail: email });

		res.json({
			success: true,
			message: "Supplier and all associated products deleted successfully"
		});
	} catch (error) {
		console.error("Error deleting supplier:", error);
		res.status(500).json({ success: false, message: "Server error during deletion" });
	}
}

async function getSupplierProfile(req, res) {
	try {
		const supplier = await Supplier.findById(req.user._id).select("-password");
		if (!supplier) {
			return res.status(404).json({ success: false, message: "Supplier profile not found" });
		}
		res.status(200).json({ success: true, data: supplier });
	} catch (error) {
		console.error("Error fetching supplier profile:", error);
		res.status(500).json({ success: false, message: "Server error fetching profile" });
	}
}

async function updateSupplierProfile(req, res) {
	try {
		const { firstName, lastName, phone, description, profileImage } = req.body;
		
		const updatedSupplier = await Supplier.findByIdAndUpdate(
			req.user._id,
			{ 
				$set: { 
					firstName, 
					lastName, 
					phone, 
					description, 
					profileImage 
				} 
			},
			{ new: true, runValidators: true }
		).select("-password");

		if (!updatedSupplier) {
			return res.status(404).json({ success: false, message: "Supplier profile not found" });
		}

		res.status(200).json({ 
			success: true, 
			message: "Profile updated successfully", 
			data: updatedSupplier 
		});
	} catch (error) {
		console.error("Error updating supplier profile:", error);
		res.status(500).json({ success: false, message: "Server error updating profile" });
	}
}

module.exports = { 
	getSuppliers, 
	createSupplier, 
	isSupplier, 
	loginSupplier, 
	getSupplierDetailsByEmail, 
	deleteSupplier,
	getSupplierProfile,
	updateSupplierProfile
};


