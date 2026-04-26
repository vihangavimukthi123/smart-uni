const express = require('express');
const router = express.Router();
const { 
  createOffer, 
  getAllOffers, 
  getSupplierOffers, 
  getAdminOffers, 
  updateOffer, 
  deleteOffer 
} = require('../controllers/offerController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllOffers);

// Supplier routes
router.post('/', protect, createOffer);
router.get('/supplier', protect, getSupplierOffers);
router.put('/:id', protect, updateOffer);
router.delete('/:id', protect, deleteOffer);

// Admin routes
router.get('/admin', protect, getAdminOffers);

module.exports = router;
