//suplierController.js
const User = require('../models/User')
const Product = require('../models/Product')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function getSuppliers(req, res){
	User.find({ role: 'supplier' }).then((suppliers) => {
		res.json(suppliers);
	});
}

function createSupplier(req, res){
	const data = req.body;

	const hashedPassword = bcrypt.hashSync(data.password, 10);

	const supplier = new Supplier({
		email: data.email,
		firstName: data.firstName,
		lastName: data.lastName,
		phone: data.phone, 
		password: hashedPassword,
		role: data.role,
	})

	supplier.save().then(() => {
		res.json({
			message: "Supplier created successfully",
		});
	});
}

async function loginSupplier(req, res) {
	try {
		const { email, password } = req.body;
		const supplier = await User.findOne({ email });

		if (!supplier) {
			return res.status(401).json({
				message: "Supplier not found",
			});
		}
		const isPasswordCorrect = bcrypt.compareSync(password, supplier.password);

		if (!isPasswordCorrect) {
			return res.status(401).json({
				message: "Invalid password",
			});
		}

		const payload = {
			email: supplier.email,
			firstName: supplier.firstName,
			lastName: supplier.lastName,
			role: supplier.role,
			isEmailVerified: supplier.isEmailVerified,

		};

		const token = jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: "150h",
		});

		return res.status(200).json({
			message: "Login successful",
			token,
			role: supplier.role,
		});

	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: "Server error",
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


