const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  firstName: { type: String, trim: true },
  lastName:  { type: String, trim: true },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'scheduler', 'student', 'supplier'],
    default: 'student',
  },
  isBlocked: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  // Supplier-specific profile
  supplierProfile: {
    description: { type: String, default: "Premier provider of university event solutions." },
    tags: { type: [String], default: ["Rental", "Logistics"] },
    profileImage: { type: String, default: "" },
    rating: { type: Number, default: 5.0 },
    reviewsCount: { type: Number, default: 0 },
    status: { type: String, default: "UNIVERSITY CERTIFIED" },
    isVerified: { type: Boolean, default: true }
  },
  refreshToken: { type: String, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  lastActiveAt: { type: Date },
  phone: { type: String, trim: true },
  bio: { type: String, maxlength: 200 },
  avatar: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },
  notificationsEnabled: { type: Boolean, default: true },
  prefersDarkMode: { type: Boolean, default: true },
  loginHistory: [{
    ip: String,
    device: String,
    location: String,
    time: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
