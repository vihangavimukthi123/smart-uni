//supplierPage.jsx
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { LuClipboardList, LuBoxes } from "react-icons/lu";
import { FiUsers } from "react-icons/fi";
import { MdOutlineRateReview } from "react-icons/md";
import SupplierAddProductPage from "./supplier/supplierAddProductPage";
import SupplierProductsPage from "./supplier/supplierProductsPage";
import SupplierUpdateProductPage from "./supplier/supplierUpdateProduct";
import SupplierOrdersPage from "./supplier/supplierOrdersPage";
import SupplierReviewsPage from "./supplier/supplierReviewsPage";
import HeadNavbar from "../../components/layout/Navbar";

export default function SupplierPage() {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { to: "/supplier", label: "Products", icon: <LuBoxes size={18} /> },
    {
      to: "/supplier/orders",
      label: "Orders",
      icon: <LuClipboardList size={18} />,
    },
    {
      to: "/supplier/reviews",
      label: "Reviews",
      icon: <MdOutlineRateReview size={18} />,
    },
    { to: "/supplier/users", label: "Profile", icon: <FiUsers size={18} /> },
  ];

  const isActive = (to) => {
    if (to === "/supplier") return path === "/supplier";
    return path.startsWith(to);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100vh",
        fontFamily: "'Segoe UI', sans-serif",
        backgroundColor: "#F3F4F6",
      }}
    >
      <HeadNavbar />
      <div style={{ display: "flex", flex: 1 }}>
        <aside
          style={{
            width: "240px",
            flexShrink: 0,
            backgroundColor: "#1E40AF",
            display: "flex",
            flexDirection: "column",
            height: "100vh",
          }}
        >
          <div
            style={{
              height: "64px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "0 20px",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                color: "#FFFFFF",
                fontSize: "17px",
                fontWeight: "700",
                letterSpacing: "-0.2px",
              }}
            >
              Supplier Panel
            </span>
          </div>

          <nav style={{ flex: 1, paddingTop: "16px" }}>
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "11px 20px",
                  textDecoration: "none",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: isActive(item.to) ? "600" : "400",
                  backgroundColor: isActive(item.to)
                    ? "#1E3A8A"
                    : "transparent",
                  borderLeft: isActive(item.to)
                    ? "3px solid #93C5FD"
                    : "3px solid transparent",
                  transition: "background-color 0.15s",
                }}
              >
                <span style={{ opacity: isActive(item.to) ? 1 : 0.8 }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div
          style={{
            flex: 1,
            height: "100vh",
            overflowY: "auto",
            backgroundColor: "#F3F4F6",
          }}
        >
          <Routes>
            <Route index element={<SupplierProductsPage />} />
            <Route path="add-product" element={<SupplierAddProductPage />} />
            <Route path="update-product" element={<SupplierUpdateProductPage />} />
            <Route path="orders" element={<SupplierOrdersPage />} />
            <Route path="reviews" element={<SupplierReviewsPage />} />
            <Route path="users" element={<h1>Profile Settings</h1>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

