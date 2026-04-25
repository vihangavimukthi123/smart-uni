// AdminRentalProducts.jsx
import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import {
  MdSearch,
  MdFilterList,
  MdInventory,
  MdCategory,
} from "react-icons/md";
import { HiOutlineCube, HiOutlineUserGroup } from "react-icons/hi2";

/** Map category string → CSS class */
function catClass(category = "") {
  const c = category.toLowerCase();
  if (c.includes("stage") || c.includes("platform")) return "inv-cat-stage";
  if (c.includes("decor") || c.includes("theming"))   return "inv-cat-decor";
  if (c.includes("audio") || c.includes("visual"))    return "inv-cat-audio";
  return "inv-cat-default";
}

/** Format price with commas */
const fmt = (n) => (n ?? 0).toLocaleString("en-LK");

export default function AdminRentalProducts() {
  const [products, setProducts]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [searchTerm, setSearchTerm]       = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    try {
      const res = await api.get("/rental/products/admin");
      setProducts(res.data);
    } catch (err) {
      console.error("Fetch admin products error", err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.productID.toLowerCase().includes(q) ||
      p.supplierName.toLowerCase().includes(q);
    const matchesCategory =
      filterCategory === "All" || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const uniqueSuppliers = new Set(products.map((p) => p.supplierEmail)).size;

  /* ── Loading ──────────────────────────────────────────────────────────── */
  if (loading)
    return (
      <div className="flex-center h-[100vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo/20 border-t-indigo rounded-full animate-spin" />
          <p className="text-muted font-bold tracking-widest uppercase text-[10px]">
            Loading Inventory...
          </p>
        </div>
      </div>
    );

  /* ── Page ─────────────────────────────────────────────────────────────── */
  return (
    <div className="page-wrapper pb-20 anim-fadeIn">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-1 tracking-tight text-primary">
          Rental Inventory
        </h1>
        <p className="text-secondary text-sm font-medium opacity-70">
          Monitor all rental products across the university ecosystem
        </p>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <div className="inv-stats-row mb-8">
        <div className="inv-stat-card">
          <div className="inv-stat-icon indigo">
            <HiOutlineCube />
          </div>
          <div>
            <div className="inv-stat-label">Total Items</div>
            <div className="inv-stat-value">{products.length}</div>
          </div>
        </div>

        <div className="inv-stat-card">
          <div className="inv-stat-icon emerald">
            <HiOutlineUserGroup />
          </div>
          <div>
            <div className="inv-stat-label">Suppliers</div>
            <div className="inv-stat-value">{uniqueSuppliers}</div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter ─────────────────────────────────────────────── */}
      <div className="inv-toolbar">
        {/* Search */}
        <div className="inv-search-wrap">
          <MdSearch className="inv-search-icon" size={20} />
          <input
            type="text"
            className="inv-search-input"
            placeholder="Search by name, ID, or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter */}
        <div className="inv-filter-wrap">
          <MdFilterList className="inv-filter-icon" size={20} />
          <select
            className="inv-filter-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="inv-table-card">
        <div className="inv-table-scroll">
          <table className="inv-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Specifications</th>
                <th>Rate</th>
                <th className="col-stock">Stock</th>
                <th>Status</th>
                <th>Supplier</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const inStock = product.isAvailable && product.stock > 0;
                return (
                  <tr key={product._id} className="inv-row">

                    {/* Product ID */}
                    <td>
                      <span className="inv-product-id">#{product.productID}</span>
                    </td>

                    {/* Image */}
                    <td>
                      <div className="inv-img-wrap">
                        <img
                          src={product.images?.[0] || "https://via.placeholder.com/72x60"}
                          alt={product.name}
                        />
                      </div>
                    </td>

                    {/* Name */}
                    <td>
                      <span className="inv-name">{product.name}</span>
                    </td>

                    {/* Category */}
                    <td>
                      <span className={`inv-cat-badge ${catClass(product.category)}`}>
                        {product.category}
                      </span>
                    </td>

                    {/* Specifications */}
                    <td>
                      <div className="inv-spec-primary">{product.brand || "Generic"}</div>
                      <div className="inv-spec-secondary">{product.model || "Standard"}</div>
                    </td>

                    {/* Rate */}
                    <td>
                      <div className="inv-rate-amount">LKR {fmt(product.price)}</div>
                      <div className="inv-rate-units">{product.stock} units</div>
                    </td>

                    {/* Stock */}
                    <td className="col-stock">
                      <span className="inv-stock-num">{product.stock}</span>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`inv-status-badge ${inStock ? "inv-status-in" : "inv-status-out"}`}>
                        <span className="inv-status-dot" />
                        {inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>

                    {/* Supplier */}
                    <td>
                      <div className="inv-supplier-row">
                        <div className="inv-supplier-avatar">
                          {product.supplierName?.charAt(0)?.toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div className="inv-supplier-name">{product.supplierName}</div>
                          <div className="inv-supplier-email" title={product.supplierEmail}>
                            {product.supplierEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Empty state */}
          {filteredProducts.length === 0 && (
            <div className="py-24 flex flex-col items-center text-center gap-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex-center mb-2">
                <MdInventory className="text-indigo/20" size={40} />
              </div>
              <h3 className="text-xl font-black tracking-tight text-primary">
                No Assets Found
              </h3>
              <p className="text-muted text-sm font-medium max-w-sm">
                No products match your current search criteria or category
                filter. Try adjusting your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
