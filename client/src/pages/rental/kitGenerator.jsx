import { useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";

const initialItems = [
  {
    id: 1,
    name: "10×10 Commercial Grade Tent",
    subtitle: "Weather-proof, white",
    qty: 10,
    price: 450.0,
    checked: true,
    img: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=60&h=60&fit=crop",
  },
  {
    id: 2,
    name: "Padded Folding Chairs",
    subtitle: "Lightweight, ergonomic",
    qty: 200,
    price: 600.0,
    checked: true,
    img: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=60&h=60&fit=crop",
  },
  {
    id: 3,
    name: "Portable PA System Kit",
    subtitle: "2 Speakers + Wireless Mic",
    qty: 1,
    price: 185.0,
    checked: true,
    img: "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=60&h=60&fit=crop",
  },
  {
    id: 4,
    name: "Registration Desk (6ft)",
    subtitle: "Includes black table skirting",
    qty: 4,
    price: 120.0,
    checked: true,
    img: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=60&h=60&fit=crop",
  },
];

const suppliers = [
  {
    id: 1,
    name: "Elite Rental Co.",
    rating: 4.9,
    reviews: 124,
    tags: ["Tent Specialist", "Logistics Pro"],
    topRated: true,
    icon: "🛻",
  },
  {
    id: 2,
    name: "Campus Tech & AV",
    rating: 4.7,
    reviews: 89,
    tags: ["AV Specialist", "Tech Support"],
    topRated: false,
    icon: "📷",
  },
  {
    id: 3,
    name: "UniEvents Supply",
    rating: 4.5,
    reviews: 210,
    tags: ["Furniture", "Decor"],
    topRated: false,
    icon: "🪑",
  },
];

// SVG Icons
const GridIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);
const SparkleIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
);
const BuildingIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="3" width="18" height="18" rx="1" />
    <path d="M3 9h18M9 21V9" />
  </svg>
);
const ClockIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);
const BellIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const HelpIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const EditIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const CartIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const RobotIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#3b5bdb"
    strokeWidth="1.8"
  >
    <rect x="3" y="8" width="18" height="12" rx="2" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    <circle cx="9" cy="13" r="1.5" fill="#3b5bdb" stroke="none" />
    <circle cx="15" cy="13" r="1.5" fill="#3b5bdb" stroke="none" />
    <path d="M9 17h6" strokeLinecap="round" />
    <path d="M12 8v1" strokeLinecap="round" />
  </svg>
);
const ShieldIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const MailIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#888"
    strokeWidth="1.6"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const QuestionBoxIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#888"
    strokeWidth="1.6"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const ShieldFootIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#888"
    strokeWidth="1.6"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export default function EventKitGenerator() {
  const [items, setItems] = useState(initialItems);
  const [activeNav, setActiveNav] = useState("Event Kit Generator");

  const toggleCheck = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  const selectAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, checked: true })));
  };

  const totalEstimate = items
    .filter((i) => i.checked)
    .reduce((sum, i) => sum + i.price, 0);

  const navIcons = {
    Products: <GridIcon />,
    "Event Kit Generator": <SparkleIcon />,
    Suppliers: <BuildingIcon />,
    History: <ClockIcon />,
  };

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', sans-serif",
        background: "#f0f2f5",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />

      <div style={{ display: "flex", flex: 1, alignItems: "stretch" }}>
        <Sidebar />

        {/* Right side: content + bottom bar + footer stacked */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "#f0f2f5",
          }}
        >
          {/* Scrollable main content */}
          <div
            style={{
              flex: 1,
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Event Header Card */}
            <div
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    background: "#eef0fb",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <RobotIcon />
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: "700",
                      fontSize: "18px",
                      color: "#111",
                    }}
                  >
                    Event: Outdoor Career Fair for 200 students
                  </div>
                  <div
                    style={{
                      color: "#888",
                      fontSize: "14px",
                      marginTop: "2px",
                    }}
                  >
                    AI generated kit based on your specific space and attendance
                    requirements.
                  </div>
                </div>
              </div>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  border: "1px solid #d0d4e0",
                  background: "#fff",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "#333",
                  fontWeight: "500",
                  whiteSpace: "nowrap",
                }}
              >
                <EditIcon /> Edit Description
              </button>
            </div>

            {/* Two-column layout */}
            <div
              style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}
            >
              {/* Recommended Items Table */}
              <div
                style={{
                  flex: 1,
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "20px 24px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "700",
                        fontSize: "17px",
                        color: "#111",
                      }}
                    >
                      Recommended Rental Items
                    </span>
                    <span
                      style={{
                        background: "#f0f2f5",
                        color: "#555",
                        fontSize: "12px",
                        fontWeight: "600",
                        padding: "2px 10px",
                        borderRadius: "20px",
                      }}
                    >
                      8 Items
                    </span>
                  </div>
                  <button
                    onClick={selectAll}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#1a3bbf",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    Select All
                  </button>
                </div>

                {/* Column Headers */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "32px 1fr 80px 100px 60px",
                    alignItems: "center",
                    padding: "0 0 8px 0",
                    borderBottom: "1px solid #eef0f4",
                  }}
                >
                  <div />
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#aaa",
                      letterSpacing: "0.08em",
                    }}
                  >
                    ITEM DETAILS
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#aaa",
                      letterSpacing: "0.08em",
                      textAlign: "center",
                    }}
                  >
                    QTY
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#aaa",
                      letterSpacing: "0.08em",
                      textAlign: "center",
                    }}
                  >
                    PRICE
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#aaa",
                      letterSpacing: "0.08em",
                      textAlign: "center",
                    }}
                  >
                    ACTION
                  </div>
                </div>

                {items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "32px 1fr 80px 100px 60px",
                      alignItems: "center",
                      padding: "14px 0",
                      borderBottom: "1px solid #f5f6fa",
                    }}
                  >
                    <div
                      onClick={() => toggleCheck(item.id)}
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "5px",
                        cursor: "pointer",
                        background: item.checked ? "#1a3bbf" : "#fff",
                        border: item.checked
                          ? "2px solid #1a3bbf"
                          : "2px solid #ccc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {item.checked && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="#fff"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "52px",
                          height: "48px",
                          borderRadius: "6px",
                          overflow: "hidden",
                          flexShrink: 0,
                          background: "#eee",
                        }}
                      >
                        <img
                          src={item.img}
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
                      <div>
                        <div
                          style={{
                            fontWeight: "600",
                            fontSize: "14px",
                            color: "#111",
                          }}
                        >
                          {item.name}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#999",
                            marginTop: "2px",
                          }}
                        >
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: "14px",
                        color: "#333",
                      }}
                    >
                      {item.qty}
                    </div>
                    <div
                      style={{
                        textAlign: "center",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#333",
                      }}
                    >
                      ${item.price.toFixed(2)}
                    </div>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <button
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#1a3bbf",
                        }}
                      >
                        <CartIcon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Suggested Suppliers */}
              <div style={{ width: "280px", flexShrink: 0 }}>
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "17px",
                    color: "#111",
                    marginBottom: "16px",
                  }}
                >
                  Suggested Suppliers
                </div>
                {suppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    style={{
                      background: "#fff",
                      borderRadius: "12px",
                      padding: "16px",
                      marginBottom: "14px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            background: "#eef0fb",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px",
                          }}
                        >
                          {supplier.icon}
                        </div>
                        <div>
                          <div
                            style={{
                              fontWeight: "700",
                              fontSize: "14px",
                              color: "#111",
                            }}
                          >
                            {supplier.name}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              marginTop: "2px",
                            }}
                          >
                            <span
                              style={{ color: "#f5a623", fontSize: "13px" }}
                            >
                              ★
                            </span>
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: "600",
                                color: "#333",
                              }}
                            >
                              {supplier.rating}
                            </span>
                            <span style={{ fontSize: "12px", color: "#888" }}>
                              ({supplier.reviews} reviews)
                            </span>
                          </div>
                        </div>
                      </div>
                      {supplier.topRated && (
                        <span
                          style={{
                            background: "#1a3bbf",
                            color: "#fff",
                            fontSize: "10px",
                            fontWeight: "700",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            letterSpacing: "0.03em",
                            whiteSpace: "nowrap",
                          }}
                        >
                          TOP RATED
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        flexWrap: "wrap",
                        marginBottom: "12px",
                      }}
                    >
                      {supplier.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            background: "#f5f6fa",
                            color: "#555",
                            fontSize: "11px",
                            padding: "3px 10px",
                            borderRadius: "20px",
                            fontWeight: "500",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      style={{
                        width: "100%",
                        padding: "9px",
                        border: "1.5px solid #1a3bbf",
                        borderRadius: "8px",
                        background: "#fff",
                        color: "#1a3bbf",
                        fontWeight: "700",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      View Supplier
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar — inside right column, below content */}
          {/* <div
            style={{
              background: "#fff",
              borderTop: "1px solid #e8eaf0",
              padding: "16px 32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#aaa",
                  letterSpacing: "0.08em",
                }}
              >
                TOTAL ESTIMATED RENTAL
              </div>
              <div
                style={{ fontSize: "28px", fontWeight: "700", color: "#111" }}
              >
                $
                {totalEstimate.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
            <button
              style={{
                background: "#1a3bbf",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "14px 28px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              Bulk Add to Cart <ArrowRightIcon />
            </button>
          </div> */}

          
        </div>

      </div>
      {/* <Footer /> */}
    </div>
  );
}

