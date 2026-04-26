//productRouter.js
const express = require('express')
const { createProduct, deleteProduct, getAllProducts, getProductByID, updateProduct, getAdminProducts, getProductAvailability, bulkCreateProducts, generateKit } = require('../controllers/productController.js')
const { protect } = require('../middleware/authMiddleware.js');
const { authorize } = require('../middleware/roleMiddleware.js');
const productRouter = express.Router()

// Admin Global View
productRouter.get("/admin", protect, authorize('admin'), getAdminProducts);

// Bulk insert
productRouter.post("/bulk", protect, bulkCreateProducts)

productRouter.post("/generate-kit", protect, generateKit)

productRouter.post("/", protect, createProduct)
productRouter.put("/:productID", protect, updateProduct)
productRouter.delete("/:productID", protect, deleteProduct)

productRouter.get("/",protect , getAllProducts)

productRouter.get("/trending", (req,res)=>{
    res.json(
        {message : "trending products endpoint"}
    )
})

productRouter.get("/:productID/availability", getProductAvailability)
productRouter.get("/:productID", getProductByID)

// productRouter.delete("/:productID", deleteProduct)

// productRouter.put("/:productID", updateProduct) 

module.exports = productRouter;
