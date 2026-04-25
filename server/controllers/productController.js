//productController.js
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const { isSupplier } = require('./supplierController.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const { asyncHandler } = require('../middleware/errorHandler');

const createProduct = asyncHandler(async (req, res) => {
  console.log("[DEBUG] createProduct called");
  console.log("[DEBUG] req.body:", req.body);
  
  if (!isSupplier(req)) {
    console.log("[DEBUG] Authorization failed: Not a supplier");
    return res.status(403).json({
      message: "Forbidden: Only verified suppliers can register products",
    });
  }

  const supplierEmail = req.supplier.email || req.supplier.semail;
  if (!supplierEmail) {
    console.error("[DEBUG] Error: req.supplier is missing email", req.supplier);
    return res.status(500).json({
      message: "Internal Server Error: Could not identify supplier account",
    });
  }

  // Pre-check for duplicate ID to give a better message than the generic one
  const existingProduct = await Product.findOne({ productID: req.body.productID });
  if (existingProduct) {
    console.log(`[DEBUG] Duplicate ID check failed for: ${req.body.productID}`);
    return res.status(409).json({
      message: `The Asset Tracking ID "${req.body.productID}" is already in use by another product. Please use a unique identifier.`,
      error: "Duplicate ID",
    });
  }

  const product = new Product({
    ...req.body,
    supplierEmail: supplierEmail,
  });

  console.log("[DEBUG] Attempting to save product:", product.productID);
  
  await product.save();
  
  console.log("[DEBUG] Product created successfully");
  res.status(201).json({
    success: true,
    message: "Product registered successfully",
    product
  });
});

// async function getAllProducts(req, res) {

// 	try {
// 		if (isSupplier(req)) {
// 			// Product.find()
// 			// 	.then((products) => {
// 			// 		res.json(products);
// 			// 	})
// 			// 	.catch((error) => {
// 			// 		res.status(500).json({
// 			// 			message: "Error fetching products",
// 			// 			error: error.message,
// 			// 		});
// 			// 	});

// 			// Using async-await

// 			const products = await Product.find();

// 			res.json(products);
// 		} else {
// 			Product.find({ isAvailable: true })
// 				.then((products) => {
// 					res.json(products);
// 				})
// 				.catch((error) => {
// 					res.status(500).json({
// 						message: "Error fetching products",
// 						error: error.message,
// 					});
// 				});
// 		}
// 	} catch (error) {
// 		res.status(500).json({
// 			message: "Error fetching products",
// 			error: error,
// 		});
// 	}
// }
async function getAllProducts(req, res) {
  try {
    if (isSupplier(req)) {
      // ✅ Only this supplier's products
      const products = await Product.find({
        supplierEmail: req.supplier.email,
      });

      return res.json(products);
    } else {
      const products = await Product.find({ isAvailable: true });
      return res.json(products);
    }
  } catch (error) {
    res.status(500).json({
      message: "Error fetching products",
      error: error.message,
    });
  }
}

function deleteProduct(req, res) {
  if (!isSupplier(req)) {
    res.status(403).json({
      message: "Only admin can delete products",
    });
    return;
  }

  const productID = req.params.productID;

  Product.deleteOne({ productID: productID }).then(() => {
    res.json({
      message: "Product deleted successfully",
    });
  });
}

function updateProduct(req, res) {
  if (!isSupplier(req)) {
    res.status(403).json({
      message: "Only admin can update products",
    });
    return;
  }

  const productID = req.params.productID;

  Product.updateOne({ productID: productID }, req.body).then(() => {
    res.json({
      message: "Product updated successfully",
    });
  });
}

function getProductByID(req, res) {
  const productID = req.params.productID;

  Product.findOne({ productID: productID })
    .then((product) => {
      if (product == null) {
        res.status(404).json({
          message: "Product not found",
        });
      } else {
        if (product.isAvailable) {
          res.json(product);
        } else {
          if (isSupplier(req)) {
            res.json(product);
          } else {
            res.status(404).json({
              message: "Product not found",
            });
          }
        }
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Error fetching product",
        error: error.message,
      });
    });
}

async function searchProducts(req, res) {
  const query = req.params.query;

  try {
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { altNames: { $elemMatch: { $regex: query, $options: "i" } } },
      ],
      isAvailable: true,
    });

    return res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Error searching products",
      error: error.message,
    });
  }
}

async function getAdminProducts(req, res) {
  try {
    const products = await Product.aggregate([
      {
        $lookup: {
          from: "suppliers",
          localField: "supplierEmail",
          foreignField: "semail",
          as: "supplierDetails"
        }
      },
      {
        $addFields: {
          supplierName: {
            $cond: {
              if: { $gt: [{ $size: "$supplierDetails" }, 0] },
              then: { $concat: [{ $arrayElemAt: ["$supplierDetails.firstName", 0] }, " ", { $arrayElemAt: ["$supplierDetails.lastName", 0] }] },
              else: "System admin"
            }
          }
        }
      },
      {
        $project: {
          supplierDetails: 0
        }
      },
      {
        $sort: { productID: 1 }
      }
    ]);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch admin products", error: error.message });
  }
}

// Helper to calculate daily cumulative usage for a product in a requested range
const getDateRangeUsage = (orders, productId, pickupDate, returnDate) => {
  const usageMap = {};
  const start = new Date(pickupDate);
  const end = new Date(returnDate);

  // Iterate through overlapping orders
  orders.forEach(order => {
    // Find the overlap between this order's range and the requested range
    const orderItem = order.items.find(item => item.productId === productId);
    if (!orderItem) return;

    const oStart = new Date(order.rentalDates.pickup);
    const oEnd = new Date(order.rentalDates.return);

    // Calculate the overlap start and end (clamped to requested range)
    const scanStart = new Date(Math.max(start, oStart));
    const scanEnd = new Date(Math.min(end, oEnd));

    // Fill the usageMap for each day in the overlap
    for (let d = new Date(scanStart); d <= scanEnd; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      usageMap[dateKey] = (usageMap[dateKey] || 0) + orderItem.qty;
    }
  });

  return usageMap;
};

// Helper to calculate stock remaining for a product in a requested range (Internal)
const calculateStockRemaining = async (productID, pickup, returnDate) => {
  const Product = require('../models/Product');
  const Order = require('../models/Order');

  const start = new Date(pickup);
  const end = new Date(returnDate);

  const product = await Product.findOne({ productID });
  if (!product) throw new Error("Product not found");

  // Find all overlapping orders for this product
  const overlappingOrders = await Order.find({
    'items.productId': productID,
    'rentalDates.pickup': { $lte: end },
    'rentalDates.return': { $gte: start },
    'status': { $ne: 'Cancelled' }
  });

  const usageMap = getDateRangeUsage(overlappingOrders, productID, start, end);
  const peakUsage = Object.values(usageMap).length > 0 ? Math.max(...Object.values(usageMap)) : 0;
  const availableStock = Math.max(0, product.stock - peakUsage);

  return {
    totalStock: product.stock,
    peakUsage,
    availableStock
  };
};

async function getProductAvailability(req, res) {
  try {
    const { productID } = req.params;
    const { pickup, return: returnDate } = req.query;

    if (!pickup || !returnDate) {
      return res.status(400).json({ message: "Pickup and Return dates are required" });
    }

    const start = new Date(pickup);
    const end = new Date(returnDate);

    if (start > end) {
      return res.status(400).json({ message: "Invalid date range: Pickup must be before return" });
    }

    const result = await calculateStockRemaining(productID, start, end);
    res.status(200).json(result);

  } catch (error) {
    res.status(error.message === "Product not found" ? 404 : 500).json({ 
      message: error.message || "Error checking availability" 
    });
  }
}

async function bulkCreateProducts(req, res) {
  if (!isSupplier(req)) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  try {
    const productsData = req.body.map((item) => ({
      ...item,
      supplierEmail: req.supplier.email,
    }));

    const products = await Product.insertMany(productsData);
    res.status(201).json({
      message: "Bulk products created successfully",
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating products in bulk",
      error: error.message,
    });
  }
}

/**
 * Retries an AI generation task with exponential backoff on 429 (Quota) errors.
 */
async function retryWithExponentialBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      const isQuotaError = error.status === 429 || (error.message && error.message.includes("429"));
      if (isQuotaError && retries < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, retries);
        console.log(`AI Quota hit. Retrying in ${delay}ms... (Attempt ${retries + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
      } else {
        throw error;
      }
    }
  }
}

/**
 * Generates a mock kit for testing when AI is unavailable or over quota.
 */
async function generateMockKit(description, products, suppliers) {
  console.log("🛠️ Generating MOCK kit for development fallback...");
  const lowerDesc = description.toLowerCase();
  
  // Simple keyword-based logic (can be expanded)
  let itemsToPick = [];
  if (lowerDesc.includes("music") || lowerDesc.includes("sound") || lowerDesc.includes("show")) {
    itemsToPick = products.filter(p => 
      p.name.toLowerCase().includes("speaker") || 
      p.name.toLowerCase().includes("mic") || 
      p.name.toLowerCase().includes("sound")
    );
  } else if (lowerDesc.includes("conference") || lowerDesc.includes("lecture") || lowerDesc.includes("meeting")) {
    itemsToPick = products.filter(p => 
      p.name.toLowerCase().includes("projector") || 
      p.name.toLowerCase().includes("screen") || 
      p.name.toLowerCase().includes("laptop")
    );
  }

  // Fallback to top products if no keyword matches or fewer than 2 matches
  if (itemsToPick.length < 2) {
    itemsToPick = products.slice(0, 5);
  }

  const selectedItems = itemsToPick.slice(0, 5).map((p, idx) => ({
    id: p.productID,
    qty: 1,
    reason: "Standard equipment for this event"
  }));

  const suggestedSupplierEmails = suppliers.slice(0, 2).map(s => s.semail || s.email);

  return { selectedItems, suggestedSupplierEmails };
}

async function generateKit(req, res) {
  // Store products and suppliers in outer scope for catch block access
  let products = [];
  let suppliers = [];

  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ message: "Description is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "GEMINI_API_KEY is not configured in the server environment." });
    }

    // 1. Fetch available products & suppliers
    products = await Product.find({ isAvailable: true }).lean();
    suppliers = await Supplier.find({ isVerified: true }).lean();

    // Optimized catalog: removing descriptions to save tokens and avoid quota issues
    const catalog = products.map(p => ({
      id: p.productID,
      name: p.name,
      price: p.price,
      supplierEmail: p.supplierEmail,
    }));

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      You are an Event Planning AI Assistant. 
      A user has requested an equipment kit for the following event description:
      "${description}"
      
      Below is our inventory catalog. Only pick items from this catalog by their ID.
      ${JSON.stringify(catalog)}
      
      Respond thoughtfully with a valid raw JSON object strictly adhering to this schema:
      {
        "selectedItems": [
          {
            "id": "item productID here",
            "qty": number (suggested quantity based on event size),
            "reason": "short 3 word reason"
          }
        ],
        "suggestedSupplierEmails": ["email1", "email2"]
      }

      Do NOT wrap response in markdown blocks like \`\`\`json. Return raw json.
    `;

    // Use retry logic to handle transient 429 Quota errors
    const result = await retryWithExponentialBackoff(() => model.generateContent(prompt));
    const response = await result.response;
    let outputText = response.text();

    console.log("Gemini Raw Response:", outputText);

    // Clean up potential markdown formatting and conversational text
    const jsonMatch = outputText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      outputText = jsonMatch[0];
    } else {
      outputText = outputText.replace(/```json/g, '').replace(/```/g, '').trim();
    }
    
    console.log("Cleaned AI Response:", outputText);
    
    let parsed;
    try {
      parsed = JSON.parse(outputText);
    } catch (parseErr) {
      console.error("Failed to parse Gemini JSON:", outputText);
      throw new Error("AI returned invalid data format");
    }

    // 2. Hydrate response
    const hydratedItems = (parsed.selectedItems || []).map(itemInfo => {
      const dbProduct = products.find(p => p.productID === itemInfo.id);
      if (!dbProduct) return null;
      return {
        id: dbProduct.productID,
        name: dbProduct.name,
        subtitle: itemInfo.reason || dbProduct.category,
        qty: itemInfo.qty || 1,
        price: dbProduct.price || 0, // UNIT Price for cart compatibility
        supplierEmail: dbProduct.supplierEmail,
        checked: true,
        img: (dbProduct.images && dbProduct.images.length > 0) ? dbProduct.images[0] : "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=60&h=60&fit=crop"
      };
    }).filter(Boolean);

    const hydratedSuppliers = (parsed.suggestedSupplierEmails || []).map(email => {
      const dbSupplier = suppliers.find(s => s.semail === email || s.email === email);
      if (!dbSupplier) return null;
      return {
        id: dbSupplier.semail,
        name: `${dbSupplier.firstName} ${dbSupplier.lastName}`,
        rating: dbSupplier.rating || 4.5,
        reviews: dbSupplier.reviewsCount || 12,
        tags: [dbSupplier.status || "VERIFIED", "Reliable"],
        topRated: (dbSupplier.rating || 0) > 4.7,
        icon: "🏢"
      };
    }).filter(Boolean);

    return res.status(200).json({
      items: hydratedItems,
      suppliers: hydratedSuppliers
    });

  } catch (error) {
    const fs = require('fs');
    const path = require('path');
    const logPath = path.join(__dirname, '../ai_debug.log');
    const logMsg = `[${new Date().toISOString()}] AI Error: ${error.message} (Status: ${error.status})\n`;
    fs.appendFileSync(logPath, logMsg);

    console.error("AI Kit Generation Error:", error);

    // FALLBACK: Return a mock kit for ANY quota or AI-related failure to keep the user unblocked
    const isQuotaError = error.status === 429 || (error.message && error.message.includes("limit")) || (error.message && error.message.includes("quota"));
    
    if (isQuotaError || error.status === 503 || error.status === 504) {
      const { description } = req.body;
      const parsed = await generateMockKit(description, products, suppliers);
      
      const hydratedItems = (parsed.selectedItems || []).map(itemInfo => {
        const dbProduct = products.find(p => p.productID === itemInfo.id);
        if (!dbProduct) return null;
        return {
          id: dbProduct.productID,
          name: dbProduct.name,
          subtitle: `[DEBUG FALLBACK] ${itemInfo.reason}`,
          qty: itemInfo.qty,
          price: dbProduct.price || 0, // UNIT Price for cart compatibility
          supplierEmail: dbProduct.supplierEmail,
          checked: true,
          img: (dbProduct.images && dbProduct.images.length > 0) ? dbProduct.images[0] : "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=60&h=60&fit=crop"
        };
      }).filter(Boolean);

      const hydratedSuppliers = (parsed.suggestedSupplierEmails || []).map(email => {
        const dbSupplier = suppliers.find(s => s.semail === email || s.email === email);
        if (!dbSupplier) return null;
        return {
          id: dbSupplier.semail,
          name: `[DEBUG] ${dbSupplier.firstName} ${dbSupplier.lastName}`,
          rating: 4.8,
          reviews: 24,
          tags: ["VERIFIED", "Reliable"],
          topRated: true,
          icon: "🏢"
        };
      }).filter(Boolean);

      console.log("⚠️ Emergency Mock Fallback Triggered.");
      return res.status(200).json({
        items: hydratedItems,
        suppliers: hydratedSuppliers,
        isMock: true,
        debug: "Quota exceeded, returned sample data"
      });
    }
    
    let errorMessage = "Failed to generate kit";
    let statusCode = 500;

    if (error.status === 429 || (error.message && error.message.includes("429"))) {
      if (error.message && error.message.includes("per day")) {
        errorMessage = "AI Daily Quota Reached. Your account has reached the maximum requests allowed for today. It will reset at midnight.";
      } else {
        errorMessage = "AI Quota Exceeded (Too Many Requests). Please wait a few seconds for the rate limit to reset and try again.";
      }
      statusCode = 429;
    } else if (error.status === 404) {
      errorMessage = "AI Model not found on the server.";
      statusCode = 404;
    } else if (error.message) {
      errorMessage = `AI Error: ${error.message}`;
    }

    res.status(statusCode).json({ 
      success: false,
      message: errorMessage, 
      details: error.message 
    });
  }
}

module.exports = { createProduct, deleteProduct, updateProduct, getProductByID, getAllProducts, searchProducts, getAdminProducts, getProductAvailability, calculateStockRemaining, bulkCreateProducts, generateKit };
