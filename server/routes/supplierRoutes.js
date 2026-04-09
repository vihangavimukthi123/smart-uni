const express = require('express');
const { getSuppliers, getSupplierDetailsByEmail } = require('../controllers/supplierController.js');

const supplierRouter = express.Router();

// Get all suppliers
supplierRouter.get('/', getSuppliers);

// Get specific supplier details
supplierRouter.get('/:email', getSupplierDetailsByEmail);

module.exports = supplierRouter;
