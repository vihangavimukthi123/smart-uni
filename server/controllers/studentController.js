//studentController.js
const User = require('../models/User')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function getStudents(req, res){
	User.find().then((students) => {
		res.json(students);
	});
}

function createStudent(req, res){
	const data = req.body;

	const hashedPassword = bcrypt.hashSync(data.password, 10);

	const student = new Student({
		email: data.email,
		firstName: data.firstName,
		lastName: data.lastName,
		phone: data.phone, 
		password: hashedPassword,
		role: "student",
	})

	student.save().then(() => {
		res.status(201).json({
			message: "Student registered successfully",
		});
	}).catch(err => {
		res.status(500).json({
			message: "Failed to register student",
			error: err.message
		});
	});
}

async function loginStudent(req, res) {
	try {
		const { email, password } = req.body;
		const student = await User.findOne({ email });

		if (!student) {
			return res.status(401).json({
				message: "Student not found",
			});
		}
		const isPasswordCorrect = bcrypt.compareSync(password, student.password);

		if (!isPasswordCorrect) {
			return res.status(401).json({
				message: "Invalid password",
			});
		}

		if (student.isBlocked) {
			return res.status(403).json({
				message: "Your account is blocked",
			});
		}

		const payload = {
			email: student.email,
			firstName: student.firstName,
			lastName: student.lastName,
			role: student.role,
			isEmailVerified: student.isEmailVerified,
		};

		const token = jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: "150h",
		});

		return res.status(200).json({
			message: "Login successful",
			token,
			role: student.role,
		});

	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: "Server error",
		});
	}
}

function isStudent(req) {
	if (req.student == null) {
		return false;
	}
	if (req.student.role != "student") {
		return false;
	}

	return true;
}
module.exports = { getStudents, createStudent, isStudent, loginStudent };

