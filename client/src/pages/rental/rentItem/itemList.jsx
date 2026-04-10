//itemList.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import Navbar from "../../../components/layout/Navbar";
// import Sidebar from "../../../components/layout/Sidebar";
import api from "../../../api/axios";

const PRIMARY = "#1a4fd6";

function StarRating({ rating }) {
  return (
    <span style={{ color: "#f59e0b", fontSize: 14 }}>
      {"★".repeat(Math.floor(rating))}
      {rating % 1 >= 0.5 ? "½" : ""}
    </span>
  );
}

function ProductCard({ product }) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        border: "1px solid #e5e7eb",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative" }}>
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: "100%",
            height: 180,
            objectFit: "cover",
            display: "block",
          }}
          onError={(e) => {
            e.target.style.background = "#e5e7eb";
            e.target.src = "";
          }}
        />
        <span
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "#fff",
            color: PRIMARY,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
            padding: "3px 9px",
            borderRadius: 20,
            border: `1px solid #d1d9f7`,
          }}
        >
          {product.tag}
        </span>
      </div>

      {/* Body */}
      <div
        style={{
          padding: "14px 16px 16px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {/* Rating + Price */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <StarRating rating={product.rating} />
            <span style={{ fontSize: 13, color: "#6b7280" }}>
              ({product.reviews})
            </span>
          </span>
          <span style={{ color: PRIMARY, fontWeight: 700, fontSize: 15 }}>
            Rs. {Number(product.price).toLocaleString()}
            <span style={{ fontWeight: 400, color: "#6b7280", fontSize: 13 }}>
              /day
            </span>
          </span>
        </div>

        {/* Name */}
        <div
          style={{
            fontWeight: 700,
            fontSize: 16,
            color: "#111827",
            lineHeight: 1.3,
          }}
        >
          {product.name}
        </div>

        {/* Desc */}
        <div
          style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5, flex: 1 }}
        >
          {product.desc}
        </div>

        {/* Button */}
        <button
          onClick={() => navigate(`/rental/items/${product.id}`)}
          style={{
            marginTop: 12,
            background: PRIMARY,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "11px 0",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Rent Now
        </button>
      </div>
    </div>
  );
}

export default function ItemList() {
  const [products, setProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [activePage, setActivePage] = useState(1);

  const ITEMS_PER_PAGE = 12;

  // Fetch products
  useEffect(() => {
    document.title = "UniEvent Rentals – Item List";

    if (!loaded) {
      api
        .get("/rental/products")
        .then((res) => {
          setProducts(res.data);
          setLoaded(true);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [loaded]);

  // Pagination logic
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const currentProducts = products.slice(startIndex, endIndex);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePage]);

  return (
    <div>
      <main style={{ flex: 1 }}>
          {/* Count */}
          <p style={{ marginBottom: 22 }}>
            <strong>{products.length}</strong> items available for your campus
            events
          </p>

          {/* Product Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 20,
              marginBottom: 36,
            }}
          >
            {currentProducts.map((product) => (
              <ProductCard
                key={product.productID}
                product={{
                  id: product.productID,
                  name: product.name,
                  desc: product.description,
                  price: product.price,
                  image: product.images?.[0] || "",
                  tag: product.category?.toUpperCase(),
                  rating: 4.5,
                  reviews: 0,
                }}
              />
            ))}
          </div>

          {/* Pagination */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12, // more space between buttons
              marginTop: 20,
            }}
          >
            {/* Prev */}
            <button
              onClick={() => setActivePage((p) => Math.max(1, p - 1))}
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                border: "1px solid #d1d5db",
                background: "#fff",
                cursor: "pointer",
                fontSize: 18,
                color: "#374151",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f3f4f6")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
              ‹
            </button>

            {/* Pages */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setActivePage(page)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  border: page === activePage ? "none" : "1px solid #d1d5db",
                  background: page === activePage ? PRIMARY : "#fff",
                  color: page === activePage ? "#fff" : "#374151",
                  fontWeight: page === activePage ? 700 : 500,
                  fontSize: 16,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (page !== activePage)
                    e.currentTarget.style.background = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  if (page !== activePage)
                    e.currentTarget.style.background = "#fff";
                }}
              >
                {page}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => setActivePage((p) => Math.min(totalPages, p + 1))}
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                border: "1px solid #d1d5db",
                background: "#fff",
                cursor: "pointer",
                fontSize: 18,
                color: "#374151",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f3f4f6")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
              ›
            </button>
          </div>
        </main>
    </div>
  );
}



