//productRouter.js
const express = require('express')
const { createProduct, deleteProduct, getAllProducts, getProductByID, updateProduct } = require('../controllers/productController.js')
const { protect } = require('../middleware/authMiddleware.js');
const productRouter = express.Router()

// productRouter.post("/", createProduct)

productRouter.post("/", protect, createProduct)
productRouter.put("/:productID", protect, updateProduct)
productRouter.delete("/:productID", protect, deleteProduct)

productRouter.get("/",protect , getAllProducts)

productRouter.get("/trending", (req,res)=>{
    res.json(
        {message : "trending products endpoint"}
    )
})

productRouter.get("/:productID", getProductByID)

// productRouter.delete("/:productID", deleteProduct)

// productRouter.put("/:productID", updateProduct) 

module.exports = productRouter;
