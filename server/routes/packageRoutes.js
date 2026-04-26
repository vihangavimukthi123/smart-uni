const express = require('express');
const router = express.Router();
const { 
  createPackage, 
  getAllPackages, 
  getSupplierPackages, 
  getAdminPackages, 
  updatePackage, 
  deletePackage 
} = require('../controllers/packageController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllPackages);

// Supplier routes
router.post('/', protect, createPackage);
router.get('/supplier', protect, getSupplierPackages);
router.put('/:id', protect, updatePackage);
router.delete('/:id', protect, deletePackage);

// Admin routes
router.get('/admin', protect, getAdminPackages);

module.exports = router;
