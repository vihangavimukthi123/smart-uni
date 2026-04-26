const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Supplier = require('../models/Supplier');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    // Check User collection first
    let user = await User.findById(decoded.id).select('-password');
    if (user) console.log(`[AUTH] Found User: ${user.name}`);
    
    // If not found in User, check Supplier collection
    if (!user) {
      const supplier = await Supplier.findById(decoded.id).select('-password');
      if (supplier) {
        console.log(`[AUTH] Found Supplier: ${supplier.firstName} ${supplier.lastName}`);
        // Map Supplier to a user-like object for compatibility
        user = supplier.toObject();
        user.name = `${supplier.firstName} ${supplier.lastName}`.trim();
        user.email = supplier.semail; // Mapping semail to email for consistency
        user.isActive = !supplier.isBlocked;
        user.phone = supplier.phone;
        user.bio = supplier.description; // Mapping description to bio for profile page
      }
    }

    if (!user) {
        console.error(`[AUTH] FAILED: No User or Supplier found with ID ${decoded.id}`);
    }

    if (user && !user.isActive) {
        console.error(`[AUTH] FAILED: Account ${user.name} is deactivated/blocked`);
    }

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Account not found or deactivated' });
    }

    
    req.user = user;
    if (user.role === 'supplier') req.supplier = user; // Compatibility for product routes
    if (user.role === 'student' || user.role === 'user') req.student = user; // Compatibility for review/order routes

    // Update lastActiveAt (throttled to 2 mins)
    const now = new Date();
    const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt) : null;
    if (!lastActive || (now - lastActive) > 2 * 60 * 1000) {
      // Fire and forget to avoid blocking the request
      User.findByIdAndUpdate(user._id, { lastActiveAt: now }).catch(err => console.error('Activity track error:', err));
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      
      let user = await User.findById(decoded.id).select('-password');
      if (!user) {
        const supplier = await Supplier.findById(decoded.id).select('-password');
        if (supplier) {
          user = supplier.toObject();
          user.name = `${supplier.firstName} ${supplier.lastName}`.trim();
          user.email = supplier.semail;
        }
      }
      req.user = user;
      if (user?.role === 'supplier') req.supplier = user;
      if (user?.role === 'student' || user?.role === 'user') req.student = user;
    }
    next();


  } catch {
    next();
  }
};

module.exports = { protect, optionalAuth };

