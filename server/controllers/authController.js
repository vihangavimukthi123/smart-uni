const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorHandler');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
  return { accessToken, refreshToken };
};

// @POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  const { name, email, password, role } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'Email already registered' });
  }
  // Only allow admin creation via first-user or manually
  const allowedRole = ['student', 'scheduler', 'supplier'].includes(role) ? role : 'student';
  const user = await User.create({ name, email, password, role: allowedRole });
  const { accessToken, refreshToken } = generateTokens(user._id);
  await User.findByIdAndUpdate(user._id, { refreshToken });
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: { user, accessToken, refreshToken },
  });
});

// @POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'Account is deactivated' });
  }
  const { accessToken, refreshToken } = generateTokens(user._id);
  await User.findByIdAndUpdate(user._id, { refreshToken, lastLogin: new Date(), lastActiveAt: new Date() });
  const userObj = user.toJSON();
  res.json({
    success: true,
    message: 'Login successful',
    data: { user: userObj, accessToken, refreshToken },
  });
});

// @POST /api/auth/refresh
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Refresh token required' });
  }
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
  const { accessToken, refreshToken: newRefresh } = generateTokens(user._id);
  await User.findByIdAndUpdate(user._id, { refreshToken: newRefresh });
  res.json({ success: true, data: { accessToken, refreshToken: newRefresh } });
});

// @POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  res.json({ success: true, message: 'Logged out successfully' });
});

// @GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});


// @GET /api/auth/users (Admin Only)
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort('-createdAt');
  res.json({ success: true, data: { users, total: users.length } });
});

// @PUT /api/auth/users/:id/role (Admin Only)
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['admin', 'scheduler', 'student', 'supplier'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, message: 'Role updated', data: { user } });
});

// @PUT /api/auth/profile — update profile info & avatar (base64)
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, bio, avatar } = req.body;
  const updateData = {};
  if (name) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (bio !== undefined) updateData.bio = bio;
  if (avatar !== undefined) updateData.avatar = avatar;

  const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true });
  res.json({ success: true, message: 'Profile updated', data: { user } });
});

// @PUT /api/auth/password — change own password
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current and new password required' });
  }
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect' });
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
});

// @PUT /api/auth/settings — update notification/darkmode/2fa preferences
const updateSettings = asyncHandler(async (req, res) => {
  const { twoFactorEnabled, notificationsEnabled, prefersDarkMode } = req.body;
  const updateData = {};
  if (twoFactorEnabled !== undefined) updateData.twoFactorEnabled = twoFactorEnabled;
  if (notificationsEnabled !== undefined) updateData.notificationsEnabled = notificationsEnabled;
  if (prefersDarkMode !== undefined) updateData.prefersDarkMode = prefersDarkMode;

  const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });
  res.json({ success: true, message: 'Settings updated', data: { user } });
});

<<<<<<< HEAD
// @GET /api/auth/find-user/:email
const getUserByEmail = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.params.email.toLowerCase().trim() });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: { _id: user._id, name: user.name } });
});

module.exports = { register, login, refreshToken, logout, getMe, getAllUsers, updateUserRole, updateProfile, updatePassword, updateSettings, getUserByEmail };
=======
// @DELETE /api/auth/users/:id (Admin Only)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Cleanup if user is a supplier
  if (user.role === 'supplier') {
    await Supplier.deleteOne({ semail: user.email });
    await Product.deleteMany({ supplierEmail: user.email });
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({ success: true, message: 'User deleted successfully' });
});

module.exports = { register, login, refreshToken, logout, getMe, getAllUsers, updateUserRole, updateProfile, updatePassword, updateSettings, deleteUser };
>>>>>>> 559b96d3abc906c898bc3dfe0ac0644db2c33c97

