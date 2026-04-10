const User = require('../models/User')
const Supplier = require('../models/Supplier')
const Product = require('../models/Product')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function getSuppliers(req, res){
	User.find({ role: 'supplier' }).then((suppliers) => {
		res.json(suppliers);
	});
}

async function createSupplier(req, res){
	try {
		const data = req.body;
		
		const existingSupplier = await Supplier.findOne({ semail: data.email });
		if (existingSupplier) {
			return res.status(400).json({ message: "Supplier already exists with this email" });
		}

		const hashedPassword = bcrypt.hashSync(data.password, 10);

		const supplier = new Supplier({
			semail: data.email,
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
		res.status(500).json({ message: "Server error during registration" });
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
		const supplier = await User.findOne({ email }).select("-password");

		if (!supplier) {
			return res.status(404).json({ message: "Supplier not found" });
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
module.exports = { getSuppliers, createSupplier, isSupplier, loginSupplier, getSupplierDetailsByEmail };


