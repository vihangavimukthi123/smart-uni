import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../../context/CartContext";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import api from "../../api/axios";

// ── Icon helpers ─────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E40AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const CancelIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ── Order Details Modal ───────────────────────────────────────────────────────
function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;
  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ backgroundColor: "#fff", borderRadius: "16px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
        <div style={{ padding: "24px", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 10 }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#111827", margin: 0 }}>Order Details</h2>
            <p style={{ fontSize: "13px", color: "#6B7280", margin: "4px 0 0 0" }}>ID: {order._id}</p>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "#F9FAFB", padding: "8px", borderRadius: "8px", cursor: "pointer" }}><CloseIcon /></button>
        </div>
        <div style={{ padding: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#9CA3AF", letterSpacing: "0.05em", marginBottom: "8px" }}>ORDER STATUS</div>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#1E40AF", backgroundColor: "#EFF6FF", padding: "6px 14px", borderRadius: "20px" }}>
                {(order.status || "PENDING").toUpperCase()}
              </span>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#9CA3AF", letterSpacing: "0.05em", marginBottom: "8px" }}>RENTAL PERIOD</div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                {new Date(order.rentalDates?.pickup).toLocaleDateString()} - {new Date(order.rentalDates?.return).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#9CA3AF", letterSpacing: "0.05em", marginBottom: "8px" }}>DELIVERY LOCATION</div>
              <div style={{ fontSize: "14px", color: "#374151", lineHeight: "1.5" }}>
                <strong>{order.deliveryDetails?.campus === "sliit" ? "SLIIT Kandy Campus" : "Other Location"}</strong><br />
                {order.deliveryDetails?.location || "No specific room provided"}<br />
                <span style={{ fontSize: "12px", color: "#6B7280" }}>{order.deliveryDetails?.instructions && `Note: ${order.deliveryDetails.instructions}`}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#9CA3AF", letterSpacing: "0.05em", marginBottom: "8px" }}>CONTACT INFO</div>
              <div style={{ fontSize: "14px", color: "#374151", lineHeight: "1.5" }}>
                <strong>{order.contactInfo?.organizer}</strong><br />
                ID: {order.contactInfo?.uniId}<br />
                Ph: {order.contactInfo?.phone}
              </div>
            </div>
          </div>
          <div style={{ height: "1px", backgroundColor: "#F3F4F6", marginBottom: "24px" }} />
          <div style={{ marginBottom: "32px" }}>
            <div style={{ fontSize: "11px", fontWeight: "800", color: "#9CA3AF", letterSpacing: "0.05em", marginBottom: "16px" }}>RENTED ITEMS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {order.items?.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <img src={item.image} alt="" style={{ width: "52px", height: "52px", borderRadius: "10px", objectFit: "cover", backgroundColor: "#F9FAFB" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>{item.name}</div>
                    <div style={{ fontSize: "12px", color: "#6B7280" }}>Qty: {item.qty} · Rs.{item.price}/day · <span style={{ color: "#1E40AF", fontWeight: "600" }}>{item.status}</span></div>
                    {item.supplierNote && (
                      <div style={{ marginTop: "6px", padding: "6px 10px", backgroundColor: "#F9FAFB", border: "1px dashed #BFDBFE", borderRadius: "6px", fontSize: "12px", color: "#1D4ED8" }}>
                        <strong>Supplier Note:</strong> "{item.supplierNote}"
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: "700", color: "#111827" }}>Rs.{(item.price * item.qty).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ backgroundColor: "#F9FAFB", borderRadius: "12px", padding: "20px" }}>
             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontSize: "14px", color: "#6B7280" }}>Total Amount</span>
                <span style={{ fontSize: "20px", fontWeight: "800", color: "#1E40AF" }}>Rs.{order.totalAmount?.toFixed(2)}</span>
             </div>
             <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>* Includes delivery and service fees.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();
  const { loadOrderIntoCart } = useCart();

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await api.get("/rental/orders/student");
      setOrders(res.data);
    } catch (err) {
      console.error("Fetch history error", err);
      toast.error("Failed to load order history");
    } finally {
      setLoading(false);
    }
  }

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;
    try {
      await api.patch(`/rental/orders/${orderId}/cancel`);
      toast.success("Order cancelled");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel order");
    }
  };

  const handleEditOrder = (order) => {
    loadOrderIntoCart(order);
    navigate("/checkout");
  };

  const isEditable = (pickupDate) => {
    const pickup = new Date(pickupDate);
    const diff = pickup.getTime() - new Date().getTime();
    return diff > (24 * 60 * 60 * 1000);
  };

  const filteredOrders = orders.filter(o => 
    o._id?.toLowerCase().includes(search.toLowerCase()) || 
    (o.contactInfo?.organizer || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", backgroundColor: "#F3F4F6" }}>
      <Navbar />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar/>
        <div style={{ flex: 1, padding: "32px 36px", display: "flex", flexDirection: "column" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#111827", margin: "0 0 4px 0" }}>Order History</h1>
              <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>Manage and review your past university event rentals.</p>
            </div>
          </div>

          <div style={{
            backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E5E7EB",
            padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px",
            marginBottom: "20px",
          }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
              <SearchIcon />
              <input
                type="text"
                placeholder="Search by Order ID or Organizer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: "none", outline: "none", fontSize: "14px", color: "#374151", width: "100%", backgroundColor: "transparent" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
            {loading ? (
              <p style={{ textAlign: "center", paddingTop: "40px", color: "#6B7280" }}>Loading your orders...</p>
            ) : filteredOrders.length === 0 ? (
              <div style={{ textAlign: "center", paddingTop: "60px" }}>
                <p style={{ fontSize: "18px", fontWeight: "600", color: "#374151" }}>No orders found</p>
                <p style={{ color: "#6B7280" }}>{search ? "Try a different search term." : "You haven't placed any rentals yet."}</p>
              </div>
            ) : filteredOrders.map((order) => (
              <div key={order._id} style={{
                backgroundColor: "#FFFFFF", borderRadius: "10px",
                border: "1px solid #E5E7EB", padding: "20px 24px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <span style={{
                      fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px",
                      color: order.status === "Cancelled" ? "#991B1B" : "#1E40AF", 
                      backgroundColor: order.status === "Cancelled" ? "#FEE2E2" : "#DBEAFE",
                      padding: "3px 10px", borderRadius: "20px",
                    }}>
                      {(order.status || "PENDING").toUpperCase()}
                    </span>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>Order #{order._id?.slice(-6)}</span>
                    <span style={{ fontSize: "13px", color: "#6B7280" }}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Date unknown"}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "10px", fontWeight: "700", color: "#9CA3AF", marginBottom: "2px" }}>TOTAL COST</div>
                    <div style={{ fontSize: "24px", fontWeight: "800", color: "#111827" }}>Rs.{(order.totalAmount || 0).toFixed(2)}</div>
                  </div>
                </div>

                <div style={{ fontSize: "17px", fontWeight: "700", color: "#111827", marginBottom: "14px" }}>
                  {(order.contactInfo?.organizer || "Student")}'s Event
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ display: "flex", gap: "-10px" }}>
                      {(order.items || []).slice(0, 3).map((item, i) => (
                        <img key={i} src={item.image} alt="" style={{ width: "40px", height: "40px", border: "2px solid #FFF", borderRadius: "8px", objectFit: "cover", backgroundColor: "#F3F4F6", position: "relative", zIndex: 3-i }} />
                      ))}
                      {(order.items || []).length > 3 && (
                        <div style={{ width: "40px", height: "40px", border: "2px solid #FFF", borderRadius: "8px", backgroundColor: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "600", color: "#374151" }}>+{(order.items || []).length - 3}</div>
                      )}
                    </div>
                    <span style={{ fontSize: "13px", color: "#6B7280" }}>{(order.items || []).length} items · {order.rentalDates?.pickup ? new Date(order.rentalDates.pickup).toLocaleDateString() : ""} to {order.rentalDates?.return ? new Date(order.rentalDates.return).toLocaleDateString() : ""}</span>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      style={{ height: "38px", padding: "0 14px", backgroundColor: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#374151", display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      <EyeIcon /> Details
                    </button>

                    {order.status !== "Cancelled" && isEditable(order.rentalDates?.pickup) && (
                      <>
                        <button 
                          onClick={() => handleEditOrder(order)}
                          style={{ height: "38px", padding: "0 14px", backgroundColor: "#E0E7FF", border: "1px solid #C7D2FE", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#4338CA", display: "flex", alignItems: "center", gap: "6px" }}
                        >
                          <EditIcon /> Edit
                        </button>
                        <button 
                          onClick={() => handleCancelOrder(order._id)}
                          style={{ height: "38px", padding: "0 14px", backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#B91C1C", display: "flex", alignItems: "center", gap: "6px" }}
                        >
                          <CancelIcon /> Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
}


