/**
 * Offer Resolver Engine
 * Centralizes all logic for validating and applying discounts.
 */

const isOfferValid = (offer) => {
  if (!offer || !offer.isActive) return false;
  const now = new Date();
  const start = new Date(offer.startDate);
  const end = new Date(offer.endDate);
  return now >= start && now <= end;
};

/**
 * Resolves the best offer among a list of candidates.
 * Following deterministic rules:
 * 1. Package > Item > Order
 * 2. Highest discount value wins
 * 3. Latest created wins (tie-break)
 * 4. Deterministic sort by ID (final tie-break)
 */
const resolveBestOffer = (offers) => {
  if (!offers || offers.length === 0) return null;

  const validOffers = offers.filter(isOfferValid);
  if (validOffers.length === 0) return null;

  return validOffers.sort((a, b) => {
    // 1. Priority by OfferType
    const typePriority = { PACKAGE_DISCOUNT: 3, ITEM_DISCOUNT: 2, ORDER_DISCOUNT: 1 };
    const priorityA = typePriority[a.offerType] || 0;
    const priorityB = typePriority[b.offerType] || 0;

    if (priorityA !== priorityB) return priorityB - priorityA;

    // 2. Highest Discount Value
    if (a.discountValue !== b.discountValue) return b.discountValue - a.discountValue;

    // 3. Latest Created
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    if (dateA !== dateB) return dateB - dateA;

    // 4. Deterministic Tie-break
    return String(b._id).localeCompare(String(a._id));
  })[0];
};

/**
 * Calculates the final price for a set of items and active offers/packages.
 * This is the SINGLE SOURCE OF TRUTH for pricing.
 */
const calculateFinalPricing = (items, selectedPackage = null, availableOffers = []) => {
  let originalPrice = 0;
  let packageDiscount = 0;
  let itemDiscounts = 0;
  let orderDiscount = 0;
  let appliedOfferId = null;
  let discountSource = null;

  // Calculate Base Price
  originalPrice = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // 1. Check for Package Discount (Highest Priority)
  if (selectedPackage) {
    if (selectedPackage.discountType === 'percentage') {
      packageDiscount = (originalPrice * selectedPackage.discountValue) / 100;
    } else {
      packageDiscount = selectedPackage.discountValue;
    }
    appliedOfferId = selectedPackage.packageId;
    discountSource = 'PACKAGE';
  } else {
    // 2. Resolve Item/Order Discounts
    // For simplicity, we apply the best valid offer from the global list
    // A more advanced version would handle per-item offers
    const bestOffer = resolveBestOffer(availableOffers);
    
    if (bestOffer) {
      appliedOfferId = bestOffer.offerId;
      discountSource = bestOffer.offerType.replace('_DISCOUNT', '');

      if (bestOffer.discountType === 'percentage') {
        orderDiscount = (originalPrice * bestOffer.discountValue) / 100;
      } else {
        orderDiscount = bestOffer.discountValue;
      }
    }
  }

  const discountAmount = packageDiscount + itemDiscounts + orderDiscount;
  const finalPrice = Math.max(0, originalPrice - discountAmount);

  const explanations = [];
  if (selectedPackage) explanations.push(`Package deal: ${selectedPackage.packageName} applied.`);
  if (packageDiscount > 0) explanations.push(`Bundle discount saved you Rs.${packageDiscount.toFixed(2)}.`);
  if (orderDiscount > 0) explanations.push(`Special Offer discount saved you Rs.${orderDiscount.toFixed(2)}.`);

  return {
    originalPrice,
    discountAmount,
    finalPrice,
    appliedOfferId,
    discountSource,
    priceBreakdown: explanations, // Changed to array for UI compatibility
    rawBreakdown: {
      basePrice: originalPrice,
      packageDiscount,
      itemDiscounts,
      offerDiscount: orderDiscount
    }
  };
};

module.exports = {
  isOfferValid,
  resolveBestOffer,
  calculateFinalPricing
};
