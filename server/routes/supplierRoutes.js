const express = require('express');
const { getSuppliers, getSupplierDetailsByEmail, createSupplier, loginSupplier } = require('../controllers/supplierController.js');


const supplierRouter = express.Router();

// Get all suppliers
supplierRouter.get('/', getSuppliers);

// Auth routes
supplierRouter.post('/register', createSupplier);
supplierRouter.post('/login', loginSupplier);

// Get specific supplier details
supplierRouter.get('/:email', getSupplierDetailsByEmail);


module.exports = supplierRouter;

