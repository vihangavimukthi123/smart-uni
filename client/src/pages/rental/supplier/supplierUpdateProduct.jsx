//supplierUpdateProduct.jsx
import api from "../../../api/axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineProduct } from "react-icons/ai";
import uploadFile from "../utils/mediaUpload";

export default function SupplierUpdateProductPage() {
  const location = useLocation();
  const [productID, setProductID] = useState(location.state.productID);
  const [name, setName] = useState(location.state.name);
  const [altName, setAltName] = useState(location.state.altName.join(","));
  const [description, setDescription] = useState(location.state.description);
  const [price, setPrice] = useState(location.state.price);
  // const [labelledPrice, setLabelledPrice] = useState(location.state.labelledPrice);
  const [files, setFiles] = useState([]);
  const [category, setCategory] = useState(location.state.category);
  const [brand, setBrand] = useState(location.state.brand);
  const [model, setModel] = useState(location.state.model);
  const [stock, setStock] = useState(location.state.stock);
  const [isAvailable, setIsAvailable] = useState(location.state.isAvailable);
  const navigate = useNavigate();

  if (!location.state) {
    window.location.href = "/supplier";
  }

  async function updateProduct() {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("You must be logged in as a supplier to update products.");
      navigate("/login");
      return;
    }

    const imagePromises = [];

    //10
    for (let i = 0; i < files.length; i++) {
      const promise = uploadFile(files[i]);
      imagePromises.push(promise);
    }

    let images = await Promise.all(imagePromises).catch((err) => {
      toast.error("Error uploading images. Please try again.");
      console.log("Error uploading images:");
      console.log(err);
      return;
    });

    if (images.length == 0) {
      images = location.state.images;
    }

    if (
      productID == "" ||
      name == "" ||
      description == "" ||
      category == "" ||
      brand == "" ||
      model == ""
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const altNamesInArray = altName.split(",");
      await api.put(
        "/rental/products/" + productID,
        {
          name: name,
          altName: altNamesInArray,
          description: description,
          price: price,
          // labelledPrice : labelledPrice,
          images: images,
          category: category,
          brand: brand,
          model: model,
          stock: stock,
          isAvailable: isAvailable,
        }
      );
      toast.success("Product updated successfully!");
      navigate("/supplier");
    } catch (err) {
      toast.error("Error updating product. Please try again.");
      console.log("Error updating product:");
      console.log(err);
    }
  }

  return (
    <div className="page-wrapper">
      <div className="glass-card-static" style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--space-2xl)' }}>
        <div className="flex items-center gap-md mb-xl">
          <div className="sidebar-logo" style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}>
            <AiOutlineProduct />
          </div>
          <div>
            <h1 className="gradient-text">Update Product</h1>
            <p className="text-sm text-secondary">Modify product details and inventory settings.</p>
          </div>
        </div>

        <div className="flex flex-col gap-lg">
          <div className="grid-2 gap-lg">
            <div className="form-group">
              <label className="form-label">Product ID</label>
              <input
                disabled
                type="text"
                value={productID}
                className="form-input"
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder="Enter product name"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Alternative Names</label>
            <input
              type="text"
              value={altName}
              onChange={(e) => setAltName(e.target.value)}
              className="form-input"
              placeholder="e.g. laptop, computer, notebook"
            />
            <p className="text-xs text-muted mt-xs">Separate multiple names with commas</p>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              placeholder="Provide a detailed description of the product..."
              style={{ minHeight: '120px' }}
            />
          </div>

          <div className="grid-3 gap-lg">
            <div className="form-group">
              <label className="form-label">Price (Rs.)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
              >
                <option value="Audio & Visual Equipment">Audio & Visual Equipment</option>
                <option value="Lighting & Effects">Lighting & Effects</option>
                <option value="Furniture & Seating">Furniture & Seating</option>
                <option value="Tents & Canopies">Tents & Canopies</option>
                <option value="Catering & Food Service">Catering & Food Service</option>
                <option value="Decor & Theming">Decor & Theming</option>
                <option value="Stage & Platforms">Stage & Platforms</option>
                <option value="Photo & Video Booths">Photo & Video Booths</option>
                <option value="Games & Entertainment">Games & Entertainment</option>
                <option value="Party Supplies">Party Supplies</option>
                <option value="Transportation & Parking">Transportation & Parking</option>
                <option value="Tents & Outdoor Gear">Tents & Outdoor Gear</option>
                <option value="Audio-Visual Accessories">Audio-Visual Accessories</option>
                <option value="Safety & Sanitation">Safety & Sanitation</option>
                <option value="Specialty Rentals">Specialty Rentals</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="form-input"
                placeholder="Product brand"
              />
            </div>
          </div>

          <div className="grid-3 gap-lg">
            <div className="form-group">
              <label className="form-label">Model</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="form-input"
                placeholder="Product model"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Available Stock</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Availability Status</label>
              <select
                value={isAvailable}
                onChange={(e) => setIsAvailable(e.target.value === "true")}
                className="form-select"
              >
                <option value={true}>In Stock</option>
                <option value={false}>Out of Stock</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Update Images</label>
            <div className="flex flex-col gap-sm">
              <input
                type="file"
                multiple
                onChange={(e) => setFiles(e.target.files)}
                className="form-input"
                style={{ padding: '8px' }}
              />
              <p className="text-xs text-muted">Leave empty to keep current images.</p>
            </div>
          </div>

          <div className="divider"></div>

          <div className="grid-2 gap-md" style={{ marginTop: 'var(--space-md)', maxWidth: '400px', margin: 'var(--space-md) auto 0' }}>
            <Link
              to="/supplier"
              className="btn btn-secondary"
              style={{ justifyContent: 'center' }}
            >
              Cancel
            </Link>
            <button
              onClick={updateProduct}
              className="btn btn-primary"
              style={{ justifyContent: 'center' }}
            >
              Update Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



