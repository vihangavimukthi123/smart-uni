//productController.js
const Product = require('../models/Product');
const { isSupplier } = require('./supplierController.js');

function createProduct(req, res) {
  if (!isSupplier(req)) {
    res.status(403).json({
      message: "Forbidden",
    });
    return;
  }

  // const product = new Product(req.body);
  const product = new Product({
    ...req.body,
    supplierEmail: req.supplier.email, // ✅ attach supplier
  });

  product
    .save()
    .then(() => {
      res.json({
        message: "Product created successfully",
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Error creating product",
        error: error.message,
      });
    });
}

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

module.exports = { createProduct, deleteProduct, updateProduct, getProductByID, getAllProducts, searchProducts };
