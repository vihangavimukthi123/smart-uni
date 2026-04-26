const Offer = require('../models/Offer');
const { isSupplier } = require('./supplierController');
const { isOfferValid } = require('../utils/offerResolver');

// Create Offer (Supplier only)
async function createOffer(req, res) {
  if (!isSupplier(req)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  try {
    const newOffer = new Offer({
      ...req.body,
      supplierId: req.supplier._id,
      supplierEmail: req.supplier.email,
    });

    await newOffer.save();
    res.status(201).json({ success: true, message: 'Offer created successfully', data: newOffer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating offer', error: error.message });
  }
}

// Get All Active Offers (for Students)
async function getAllOffers(req, res) {
  try {
    const offers = await Offer.find({ isActive: true });
    res.json({ success: true, data: offers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching offers', error: error.message });
  }
}

// Get Supplier's own offers
async function getSupplierOffers(req, res) {
  if (!isSupplier(req)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  try {
    const offers = await Offer.find({ supplierEmail: req.supplier.email });
    res.json({ success: true, data: offers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching supplier offers', error: error.message });
  }
}

// Get Admin Offers (with Supplier details)
async function getAdminOffers(req, res) {
  try {
    const offers = await Offer.aggregate([
      {
        $lookup: {
          from: 'suppliers',
          localField: 'supplierEmail',
          foreignField: 'semail',
          as: 'supplierDetails'
        }
      },
      {
        $addFields: {
          supplierName: {
            $cond: {
              if: { $gt: [{ $size: '$supplierDetails' }, 0] },
              then: { $concat: [{ $arrayElemAt: ['$supplierDetails.firstName', 0] }, ' ', { $arrayElemAt: ['$supplierDetails.lastName', 0] }] },
              else: 'Unknown Supplier'
            }
          }
        }
      },
      { $project: { supplierDetails: 0 } }
    ]);
    res.json({ success: true, data: offers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching admin offers', error: error.message });
  }
}

// Update Offer
async function updateOffer(req, res) {
  if (!isSupplier(req)) return res.status(403).json({ success: false, message: 'Forbidden' });

  try {
    const { id } = req.params;
    const offer = await Offer.findOneAndUpdate(
      { offerId: id, supplierEmail: req.supplier.email },
      req.body,
      { new: true }
    );

    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    res.json({ success: true, message: 'Offer updated successfully', data: offer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating offer', error: error.message });
  }
}

// Delete Offer
async function deleteOffer(req, res) {
  if (!isSupplier(req)) return res.status(403).json({ success: false, message: 'Forbidden' });

  try {
    const { id } = req.params;
    const offer = await Offer.findOneAndDelete({ offerId: id, supplierEmail: req.supplier.email });

    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    res.json({ success: true, message: 'Offer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting offer', error: error.message });
  }
}

module.exports = {
  createOffer,
  getAllOffers,
  getSupplierOffers,
  getAdminOffers,
  updateOffer,
  deleteOffer
};
