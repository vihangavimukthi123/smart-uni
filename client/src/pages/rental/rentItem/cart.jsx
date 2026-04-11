//cart.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
// import Sidebar from "../../../components/layout/Sidebar";
// import Navbar from "../../../components/layout/Navbar";

// ── Icons ────────────────────────────────────────────────────────────────────
const GridIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);
const SparkleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
  >
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
);
const BoxIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
  </svg>
);
const HistoryIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
  >
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
  </svg>
);
const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#9CA3AF"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const CartNavIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#374151"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);
const UserIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#374151"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const CalIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#6B7280"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const TrashIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#9CA3AF"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const InfoIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1E40AF"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const ArrowRight = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const ArrowLeft = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#374151"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);
const SparkleSmall = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1E40AF"
    strokeWidth="2"
  >
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
);
const PlusSmall = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1E40AF"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// ── Sidebar nav ───────────────────────────────────────────────────────────────
const sidebarItems = [
  { label: "Products", icon: "grid", active: true },
  { label: "Event Kit\nGenerator", icon: "sparkle" },
  { label: "Suppliers", icon: "box" },
  { label: "History", icon: "history" },
];

// ── Static add-ons ────────────────────────────────────────────────────────────
const addons = [
  {
    id: 1,
    name: "Heavy-Duty Speaker Stands",
    price: 10,
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=200&q=80",
  },
  {
    id: 2,
    name: "Extra XLR Cable Kit (50ft)",
    price: 5,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80",
  },
];

// ── Main ─────────────────────────────────────────────────────────────────────
export default function CartPage() {
  const [search, setSearch] = useState("");
  const { cartItems, removeItem, updateQty } = useCart();
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((s, i) => s + i.total, 0);
  const delivery = 500.0;
  const tax = +(subtotal * 0.02).toFixed(2);
  const total = +(subtotal + delivery + tax).toFixed(2);

  return (
    <div
      style={{
        display: "flex",
        gap: "24px",
        alignItems: "flex-start",
      }}
    >
      {/* LEFT */}
      <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: "800",
                color: "#111827",
                margin: "0 0 24px 0",
                letterSpacing: "-0.3px",
              }}
            >
              Shopping Cart
            </h1>

            {/* Cart items */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                padding: "8px 0",
                marginBottom: "28px",
              }}
            >
              {cartItems.length === 0 && (
                <div
                  style={{
                    padding: "48px",
                    textAlign: "center",
                    color: "#6B7280",
                    fontSize: "14px",
                  }}
                >
                  Your cart is empty
                </div>
              )}

              {cartItems.map((item, idx) => (
                <div key={item.id}>
                  <div
                    style={{
                      padding: "20px 24px",
                      display: "flex",
                      gap: "18px",
                      alignItems: "flex-start",
                    }}
                  >
                    {/* Image */}
                    <div
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        flexShrink: 0,
                        backgroundColor: "#F3F4F6",
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Name + trash */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "6px",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "16px",
                            fontWeight: "700",
                            color: "#111827",
                            margin: 0,
                          }}
                        >
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            padding: "2px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <TrashIcon />
                        </button>
                      </div>

                      {/* Dates */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          marginBottom: "14px",
                        }}
                      >
                        <CalIcon />
                        <span style={{ fontSize: "13px", color: "#6B7280" }}>
                          {item.dates}
                        </span>
                      </div>

                      {/* Qty + price */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: "10px",
                              fontWeight: "700",
                              color: "#9CA3AF",
                              letterSpacing: "0.8px",
                              marginBottom: "6px",
                            }}
                          >
                            QUANTITY
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              border: "1px solid #E5E7EB",
                              borderRadius: "8px",
                              overflow: "hidden",
                              width: "fit-content",
                            }}
                          >
                            <button
                              onClick={() => updateQty(item.id, -1)}
                              style={{
                                width: "34px",
                                height: "34px",
                                border: "none",
                                background: "#FAFAFA",
                                cursor: "pointer",
                                fontSize: "18px",
                                color: "#374151",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              −
                            </button>
                            <span
                              style={{
                                width: "36px",
                                textAlign: "center",
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#111827",
                                borderLeft: "1px solid #E5E7EB",
                                borderRight: "1px solid #E5E7EB",
                                height: "34px",
                                lineHeight: "34px",
                                display: "inline-block",
                              }}
                            >
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQty(item.id, 1)}
                              style={{
                                width: "34px",
                                height: "34px",
                                border: "none",
                                background: "#FAFAFA",
                                cursor: "pointer",
                                fontSize: "18px",
                                color: "#374151",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#6B7280",
                              marginBottom: "2px",
                            }}
                          >
                            Rs.{item.pricePerDay?.toFixed(2)}/day
                          </div>
                          <div
                            style={{
                              fontSize: "20px",
                              fontWeight: "800",
                              color: "#1152D4",
                            }}
                          >
                            Rs.{item.total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {idx < cartItems.length - 1 && (
                    <div
                      style={{
                        height: "1px",
                        backgroundColor: "#F3F4F6",
                        margin: "0 24px",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Recommended Add-ons */}
            <div>
              <h2
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                  color: "#111827",
                  margin: "0 0 16px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <SparkleSmall />
                Recommended Add-ons
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                }}
              >
                {addons.map((addon) => (
                  <div
                    key={addon.id}
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: "10px",
                      border: "1px solid #E5E7EB",
                      padding: "14px",
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        flexShrink: 0,
                        backgroundColor: "#F3F4F6",
                      }}
                    >
                      <img
                        src={addon.image}
                        alt={addon.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "#111827",
                          marginBottom: "3px",
                          lineHeight: "1.3",
                        }}
                      >
                        {addon.name}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6B7280",
                          marginBottom: "10px",
                        }}
                      >
                        Rs.{addon.price.toFixed(2)}/day
                      </div>
                      <button
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "5px 12px",
                          border: "1px solid #BFDBFE",
                          borderRadius: "6px",
                          backgroundColor: "#EFF6FF",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#1E40AF",
                        }}
                      >
                        <PlusSmall />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Order Summary */}
          <div
            style={{
              width: "272px",
              flexShrink: 0,
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              border: "1px solid #E5E7EB",
              padding: "24px",
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "800",
                color: "#111827",
                margin: "0 0 20px 0",
              }}
            >
              Order Summary
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginBottom: "18px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "14px", color: "#374151" }}>
                  Subtotal
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#111827",
                  }}
                >
                  Rs.{subtotal.toFixed(2)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "14px", color: "#374151" }}>
                  Campus Delivery Fee
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#111827",
                  }}
                >
                  Rs.{delivery.toFixed(2)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "14px", color: "#374151" }}>
                  Estimated Tax
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#111827",
                  }}
                >
                  Rs.{tax.toFixed(2)}
                </span>
              </div>
            </div>

            <div
              style={{
                height: "1px",
                backgroundColor: "#E5E7EB",
                marginBottom: "16px",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: "800",
                  color: "#111827",
                }}
              >
                Total
              </span>
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: "800",
                  color: "#1152D4",
                }}
              >
                Rs.{total.toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => cartItems.length > 0 && navigate(`/rental/checkout`)}
              disabled={cartItems.length === 0}
              style={{
                width: "100%",
                padding: "13px 0",
                backgroundColor: cartItems.length === 0 ? "#E5E7EB" : "#1152D4",
                border: "none",
                borderRadius: "9px",
                color: cartItems.length === 0 ? "#9CA3AF" : "#FFFFFF",
                fontSize: "15px",
                fontWeight: "700",
                cursor: cartItems.length === 0 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              Proceed to Checkout
              <ArrowRight />
            </button>

            <div style={{ textAlign: "center", marginBottom: "18px" }}>
              <button
                onClick={() => navigate(`/rental/items`)}
                style={{
                  width: "100%",
                  padding: "13px 0",
                  backgroundColor: "#ffffff",
                  border: "none",
                  borderRadius: "9px",
                  color: "#374151",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                <ArrowLeft />
                Continue Browsing
              </button>
            </div>

            <div
              style={{
                height: "1px",
                backgroundColor: "#E5E7EB",
                marginBottom: "16px",
              }}
            />

            <div
              style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}
            >
              <div style={{ flexShrink: 0, marginTop: "1px" }}>
                <InfoIcon />
              </div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#6B7280",
                  margin: 0,
                  lineHeight: "1.6",
                }}
              >
                University items require a valid student or staff ID upon
                delivery. Rentals must be returned by 5 PM on the end date.
              </p>
            </div>
          </div>
        </div>
      );
    }
