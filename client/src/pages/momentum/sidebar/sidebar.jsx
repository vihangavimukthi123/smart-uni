import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useNotifications } from "../../../context/NotificationContext";

const PRIMARY = "#1a4fd6";

const sidebarItems = [
  { label: "Dashboard", path: "/momentum" },
  { label: "Study Tracker", path: "/momentum/tracker" },
  { label: "Learning Journal", path: "/momentum/learning-journal" },
  { label: "Generate Workplan", path: "/momentum/workplan" },
  { label: "Academic Vault", path: "/momentum/vault" },
  { label: "FAQs", path: "/momentum/faqs" },
];


function Sidebar() {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div style={{ display: "flex" }}>

      {/* Sidebar */}
      {isSidebarOpen && (
        <aside
          style={{
            width: 232,
            background: "#fff",
            borderRight: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            // removed justifyContent: "space-between" — that was pushing nav down
            height: "100vh",
            position: "sticky",
            top: 0,
            flexShrink: 0,
          }}
        >

          {/* Logo + Toggle */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px",
              borderBottom: "1px solid #e5e7eb",
              fontWeight: "bold",
              fontSize: 18,
              color: PRIMARY,
              flexShrink: 0,
            }}
          >
            ⚡ Momentum
            <button
              onClick={toggleSidebar}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 18,
              }}
            >
              ←
            </button>
          </div>

          {/* Navigation — sits directly below logo */}
          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              padding: "18px 12px 0",
              flexShrink: 0,
            }}
          >
            {sidebarItems.map(({ label, path }) => (
              <NavLink
                key={label}
                to={path}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  paddingLeft: isActive ? 14 : 17,
                  borderRadius: 8,
                  background: isActive ? "#eef2fd" : "transparent",
                  color: isActive ? PRIMARY : "#6b7280",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 14,
                  textDecoration: "none",
                  cursor: "pointer",
                  width: "100%",
                  borderLeft: isActive ? `3px solid ${PRIMARY}` : "none",
                })}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Spacer pushes user profile to bottom */}
          <div style={{ flex: 1 }} />


          {/* User Profile */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 16px",
              borderTop: "1px solid #e5e7eb",
              flexShrink: 0,
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
              alt="user"
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: PRIMARY }}>
                Alex Johnson
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>
                Student ID: 45021
              </div>
            </div>
          </div>

        </aside>
      )}

      {/* Main Content */}
      <div style={{ flex: 1 }}>
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            style={{
              position: "fixed",
              left: 10,
              top: 10,
              border: "none",
              background: PRIMARY,
              color: "#fff",
              padding: "6px 10px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            →
          </button>
        )}
        <Outlet />
      </div>

    </div>
  );
}

export default Sidebar;