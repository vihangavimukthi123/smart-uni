const mongoose = require('mongoose');
const Package = require('../models/Package');
const Product = require('../models/Product');
const { isSupplier } = require('./supplierController');
const { calculateStockRemaining } = require('./productController');

// Create Package (Supplier only)
async function createPackage(req, res) {
  if (!isSupplier(req)) {
    return res.status(403).json({ success: false, message: 'Forbidden: Only suppliers can create packages' });
  }

  try {
    const { packageId, items } = req.body;

    // Validate that all items exist and belong to the supplier
    for (const item of items) {
      const product = await Product.findOne({ productID: item.productId, supplierEmail: req.supplier.email });
      if (!product) {
        return res.status(400).json({ 
          success: false, 
          message: `Product ${item.productId} not found or doesn't belong to you.` 
        });
      }
    }

    const newPackage = new Package({
      ...req.body,
      supplierId: req.supplier._id,
      supplierEmail: req.supplier.email,
    });

    await newPackage.save();
    res.status(201).json({ success: true, message: 'Package created successfully', data: newPackage });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating package', error: error.message });
  }
}

// Helper to populate package items and calculate prices
async function populatePackageDetails(pkg) {
  let originalPrice = 0;
  const populatedItems = [];

  for (const item of pkg.items) {
    const product = await Product.findOne({ productID: item.productId });
    if (product) {
      const itemPrice = product.price || 0;
      const itemTotal = itemPrice * item.quantity;
      originalPrice += itemTotal;
      
      populatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        productName: product.name,
        unitPrice: itemPrice,
        itemTotal: itemTotal,
        image: product.images?.[0],
        supplierEmail: product.supplierEmail
      });
    } else {
      populatedItems.push(item); // Fallback to raw item if product not found
    }
  }

  const pkgObj = pkg.toObject ? pkg.toObject() : pkg;
  pkgObj.items = populatedItems;
  pkgObj.originalPrice = originalPrice;
  
  if (pkgObj.discountType === 'percentage') {
    pkgObj.discountAmount = (originalPrice * pkgObj.discountValue) / 100;
  } else {
    pkgObj.discountAmount = pkgObj.discountValue;
  }
  
  pkgObj.finalPrice = originalPrice - pkgObj.discountAmount;
  return pkgObj;
}

// Get All Packages (for Students) - with Dynamic Stock
async function getAllPackages(req, res) {
  try {
    const { pickup, return: returnDate } = req.query;
    const packages = await Package.find({ isActive: true });

    const populatedPackages = await Promise.all(packages.map(async (pkg) => {
      const pkgWithPrices = await populatePackageDetails(pkg);
      
      // Stock calculation is specific to student view with dates
      if (pickup && returnDate) {
        let minAvailable = Infinity;
        for (const item of pkg.items) {
          const stockInfo = await calculateStockRemaining(item.productId, pickup, returnDate);
          const availableForPackage = Math.floor(stockInfo.availableStock / item.quantity);
          if (availableForPackage < minAvailable) {
            minAvailable = availableForPackage;
          }
        }
        pkgWithPrices.availability = Math.max(0, minAvailable);
        pkgWithPrices.isBookable = pkgWithPrices.availability > 0;
      } else {
        pkgWithPrices.availability = null;
        pkgWithPrices.isBookable = true;
      }
      
      return pkgWithPrices;
    }));

    res.json({ success: true, data: populatedPackages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching packages', error: error.message });
  }
}

// Get Supplier's own packages
async function getSupplierPackages(req, res) {
  if (!isSupplier(req)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  try {
    const packages = await Package.find({ supplierEmail: req.supplier.email });
    const populated = await Promise.all(packages.map(p => populatePackageDetails(p)));
    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching supplier packages', error: error.message });
  }
}

// Get Admin Packages (with Supplier details)
async function getAdminPackages(req, res) {
  try {
    const packages = await Package.find({});
    
    const populatedPackages = await Promise.all(packages.map(async (pkg) => {
      const pkgObj = await populatePackageDetails(pkg);
      
      // Fetch supplier name manually since we're not using aggregate
      const Supplier = mongoose.model('Supplier'); // Dynamic access to avoid circular dependency if any
      const supplier = await Supplier.findOne({ semail: pkg.supplierEmail });
      
      if (supplier) {
        pkgObj.supplierName = `${supplier.firstName} ${supplier.lastName}`;
        pkgObj.supplierEmail = supplier.semail;
      } else {
        pkgObj.supplierName = 'Unknown Supplier';
      }
      
      return pkgObj;
    }));

    res.json({ success: true, data: populatedPackages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching admin packages', error: error.message });
  }
}

// Update Package
async function updatePackage(req, res) {
  if (!isSupplier(req)) return res.status(403).json({ success: false, message: 'Forbidden' });

  try {
    const { id } = req.params;
    const pkg = await Package.findOneAndUpdate(
      { packageId: id, supplierEmail: req.supplier.email },
      req.body,
      { new: true }
    );

    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
    res.json({ success: true, message: 'Package updated successfully', data: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating package', error: error.message });
  }
}

// Delete Package
async function deletePackage(req, res) {
  if (!isSupplier(req)) return res.status(403).json({ success: false, message: 'Forbidden' });

  try {
    const { id } = req.params;
    const pkg = await Package.findOneAndDelete({ packageId: id, supplierEmail: req.supplier.email });

    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
    res.json({ success: true, message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting package', error: error.message });
  }
}

module.exports = {
  createPackage,
  getAllPackages,
  getSupplierPackages,
  getAdminPackages,
  updatePackage,
  deletePackage
};
