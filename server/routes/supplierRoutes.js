const express = require('express');
const { 
  getSuppliers, 
  getSupplierDetailsByEmail, 
  createSupplier, 
  loginSupplier, 
  deleteSupplier,
  getSupplierProfile,
  updateSupplierProfile
} = require('../controllers/supplierController.js');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');


const supplierRouter = express.Router();

// Get all suppliers
supplierRouter.get('/', getSuppliers);

// Profile management
supplierRouter.get('/me', protect, authorize('supplier'), getSupplierProfile);
supplierRouter.put('/update-profile', protect, authorize('supplier'), updateSupplierProfile);

// Auth routes
supplierRouter.post('/register', createSupplier);
supplierRouter.post('/login', loginSupplier);

// Get specific supplier details
supplierRouter.get('/:email', getSupplierDetailsByEmail);

// Delete supplier (Admin Only)
supplierRouter.delete('/:id', protect, authorize('admin', 'supplier'), deleteSupplier);


module.exports = supplierRouter;

