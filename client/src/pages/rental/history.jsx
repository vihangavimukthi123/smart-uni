import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../../context/CartContext";
import { useSocket } from "../../context/SocketContext";
import { useTheme } from "../../context/ThemeContext";
// import Navbar from "../../components/layout/Navbar";
// import Sidebar from "../../components/layout/Sidebar";
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
const ReorderIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

import OrderChatModal from "./components/OrderChatModal";

// ── Order Details Modal ───────────────────────────────────────────────────────
function OrderDetailsModal({ order, onClose }) {
  const [chatSupplier, setChatSupplier] = useState(null);
  if (!order) return null;

  // Group items by supplier
  const suppliers = order.items?.reduce((acc, item) => {
    if (!acc[item.supplierEmail]) {
      acc[item.supplierEmail] = {
        email: item.supplierEmail,
        items: []
      };
    }
    acc[item.supplierEmail].items.push(item);
    return acc;
  }, {});

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
              <span style={{ 
                fontSize: "13px", fontWeight: "700", 
                color: order.status === "Cancelled" ? "#991B1B" : "#1E40AF", 
                backgroundColor: order.status === "Cancelled" ? "#FEE2E2" : "#EFF6FF", 
                padding: "6px 14px", borderRadius: "20px" 
              }}>
                {(order.status || "PENDING").toUpperCase()}
              </span>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: "800", color: "#9CA3AF", letterSpacing: "0.05em", marginBottom: "8px" }}>RENTAL PERIOD</div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                {new Date(order.rentalDates?.pickup).toLocaleDateString()} at {order.rentalDates?.pickupTime || "09:00"} - {new Date(order.rentalDates?.return).toLocaleDateString()}
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
            <div style={{ fontSize: "11px", fontWeight: "800", color: "#9CA3AF", letterSpacing: "0.05em", marginBottom: "16px" }}>ORDER ITEMS BY SUPPLIER</div>
            {Object.values(suppliers || {}).map((sup, idx) => (
              <div key={idx} style={{ marginBottom: "24px", padding: "16px", backgroundColor: "#F9FAFB", borderRadius: "12px", border: "1px solid #F3F4F6" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: "#1E40AF" }}>Supplier: {sup.email}</div>
                  <button 
                    onClick={() => setChatSupplier(sup.email)}
                    style={{ 
                      padding: "6px 12px", backgroundColor: "#E0E7FF", color: "#4338CA", 
                      border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: "700", 
                      cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" 
                    }}
                  >
                    Chat with Supplier
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                  {sup.items.map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>{item.name}</div>
                          <div style={{ fontSize: "12px", color: "#6B7280" }}>Qty: {item.qty} × LKR {item.price.toLocaleString()}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>LKR {(item.qty * item.price).toLocaleString()}</div>
                          <div style={{ 
                            fontSize: "10px", 
                            fontWeight: "800", 
                            textTransform: "uppercase", 
                            marginTop: "4px",
                            color: item.status === "Cancelled" ? "#EF4444" : item.status === "Delivered" ? "#10B981" : "#6366f1",
                            backgroundColor: item.status === "Cancelled" ? "#FEE2E2" : item.status === "Delivered" ? "#DCFCE7" : "#EEF2FF",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            display: "inline-block"
                          }}>
                            {item.status || "Pending"}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: "#F9FAFB", borderRadius: "12px", padding: "20px" }}>
             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontSize: "14px", color: "#6B7280" }}>Total Amount</span>
                <span style={{ fontSize: "20px", fontWeight: "800", color: "#1E40AF" }}>Rs.{order.totalAmount?.toFixed(2)}</span>
             </div>
          </div>
        </div>
      </div>
      {chatSupplier && (
        <OrderChatModal 
          orderId={order._id} 
          supplierEmail={chatSupplier} 
          onClose={() => setChatSupplier(null)} 
        />
      )}
    </div>
  );
}


// ── Main Page ────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelConfirmationId, setCancelConfirmationId] = useState(null);
  const navigate = useNavigate();
  const { loadOrderIntoCart, reorderIntoCart } = useCart();
  const { socket } = useSocket();
  const { darkMode } = useTheme();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    const handleStatusUpdate = (data) => {
      toast.success(data.message || "An order status has been updated", {
        icon: '📦',
        style: { borderRadius: '12px', background: darkMode ? '#1e293b' : '#fff', color: darkMode ? '#fff' : '#0f172a' }
      });
      fetchOrders();
    };

    socket.on('order_status_update', handleStatusUpdate);
    return () => socket.off('order_status_update', handleStatusUpdate);
  }, [socket, darkMode]);

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

  const handleCancelOrder = (orderId) => {
    setCancelConfirmationId(orderId);
  };

  const confirmCancellation = async () => {
    if (!cancelConfirmationId) return;
    
    try {
      await api.put(`/rental/orders/${cancelConfirmationId}`, { status: "Cancelled" });
      toast.success("Order cancelled");
      setCancelConfirmationId(null);
      fetchOrders();
    } catch (err) {
      console.error("CANCELLATION FAILED:", err);
      toast.error(err.response?.data?.message || "Failed to cancel order");
    }
  };

  const handleEditOrder = (order) => {
    loadOrderIntoCart(order);
    navigate("/rental/checkout");
  };

  const isEditable = (pickupDate) => {
    if (!pickupDate) return false;
    const pickup = new Date(pickupDate);
    const now = new Date();
    const diff = pickup.getTime() - now.getTime();
    return diff > (24 * 60 * 60 * 1000);
  };

  const canReorder = (order) => {
    // Already delivered and complete or cancelled
    if (order.status === "Cancelled" || order.status === "Completed") return true;
    
    // Day after returned date
    if (order.rentalDates?.return) {
      const returnDate = new Date(order.rentalDates.return);
      const now = new Date();
      // If now is strictly after the return date, it's considered finished
      return now > returnDate;
    }
    return false;
  };

  const handleReorder = (order) => {
    reorderIntoCart(order);
    toast.success("Past items loaded into cart!");
    navigate("/rental/cart");
  };

  const filteredOrders = orders.filter(o => 
    o._id?.toLowerCase().includes(search.toLowerCase()) || 
    (o.contactInfo?.organizer || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          
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
                    {(() => {
                      const anyCancelled = (order.items || []).some(i => i.status === "Cancelled");
                      const allCancelled = order.status === "Cancelled";
                      
                      const statusLabel = allCancelled ? "CANCELLED" : anyCancelled ? "PARTIALLY CANCELLED" : (order.status || "PENDING").toUpperCase();
                      const statusColor = allCancelled ? "#991B1B" : anyCancelled ? "#C2410C" : (order.status === "Completed") ? "#166534" : (order.status === "Active") ? "#1E40AF" : "#854D0E";
                      const statusBg = allCancelled ? "#FEE2E2" : anyCancelled ? "#FFEDD5" : (order.status === "Completed") ? "#DCFCE7" : (order.status === "Active") ? "#DBEAFE" : "#FFF9DB";

                      return (
                        <span style={{ 
                          fontSize: "11px", fontWeight: "900", letterSpacing: "0.05em",
                          color: statusColor, 
                          backgroundColor: statusBg,
                          padding: "3px 10px", borderRadius: "20px",
                        }}>
                          {statusLabel}
                        </span>
                      );
                    })()}
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
                    <span style={{ fontSize: "13px", color: "#6B7280" }}>{(order.items || []).length} items · {order.rentalDates?.pickup ? `${new Date(order.rentalDates.pickup).toLocaleDateString()} at ${order.rentalDates.pickupTime || "09:00"}` : ""} to {order.rentalDates?.return ? new Date(order.rentalDates.return).toLocaleDateString() : ""}</span>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      style={{ height: "38px", padding: "0 14px", backgroundColor: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#374151", display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      <EyeIcon /> Details
                    </button>

                    {(() => {
                      const anyCancelled = (order.items || []).some(i => i.status === "Cancelled");
                      const allCancelled = order.status === "Cancelled";
                      const isModifiable = !allCancelled && !anyCancelled && isEditable(order.rentalDates?.pickup);

                      return (
                        <>
                          <button 
                            onClick={() => {
                              if (isModifiable) {
                                handleEditOrder(order);
                              } else if (allCancelled || anyCancelled) {
                                toast.error("Cannot edit an order with cancelled items");
                              } else {
                                toast.error("Deadline passed: Cannot edit order within 24 hours of rental start");
                              }
                            }}
                            style={{ 
                              height: "38px", padding: "0 14px", 
                              backgroundColor: isModifiable ? "#E0E7FF" : "#F3F4F6", 
                              border: `1px solid ${isModifiable ? "#C7D2FE" : "#E5E7EB"}`, 
                              borderRadius: "8px", cursor: isModifiable ? "pointer" : "not-allowed", 
                              fontSize: "13px", fontWeight: "600", 
                              color: isModifiable ? "#4338CA" : "#9CA3AF", 
                              display: "flex", alignItems: "center", gap: "6px",
                              opacity: isModifiable ? 1 : 0.6
                            }}
                            title={!isModifiable ? "Cannot edit this order" : "Edit this order"}
                          >
                            <EditIcon /> Edit
                          </button>
                          <button 
                            onClick={() => {
                              if (isModifiable) {
                                handleCancelOrder(order._id);
                              }
                            }}
                            style={{ 
                              height: "38px", padding: "0 14px", 
                              backgroundColor: isModifiable ? "#FEF2F2" : "#F3F4F6", 
                              border: `1px solid ${isModifiable ? "#FECACA" : "#E5E7EB"}`, 
                              borderRadius: "8px", cursor: isModifiable ? "pointer" : "not-allowed", 
                              fontSize: "13px", fontWeight: "600", 
                              color: isModifiable ? "#B91C1C" : "#9CA3AF", 
                              display: "flex", alignItems: "center", gap: "6px",
                              opacity: isModifiable ? 1 : 0.6,
                              pointerEvents: isModifiable ? "auto" : "none"
                            }}
                            title={!isModifiable ? "Cannot cancel this order" : "Cancel this order"}
                          >
                            <CancelIcon /> Cancel
                          </button>
                        </>
                      );
                    })()}


                    {canReorder(order) && (
                      <button 
                        onClick={() => handleReorder(order)}
                        style={{ 
                          height: "38px", padding: "0 14px", 
                          backgroundColor: "#DBEAFE", 
                          border: "1px solid #BFDBFE", 
                          borderRadius: "8px", cursor: "pointer", 
                          fontSize: "13px", fontWeight: "700", 
                          color: "#1E40AF", 
                          display: "flex", alignItems: "center", gap: "6px" 
                        }}
                      >
                        <ReorderIcon /> Re-order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
      {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
      
      {cancelConfirmationId && (
        <div style={{
          position: "fixed", inset: 0, 
          backgroundColor: "rgba(15, 23, 42, 0.4)", 
          backdropFilter: "blur(8px)", 
          zIndex: 1000, 
          display: "flex", alignItems: "center", justifyContent: "center", 
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "#fff", 
            borderRadius: "20px", 
            width: "100%", maxWidth: "400px", 
            padding: "32px", 
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            textAlign: "center"
          }}>
            <div style={{ 
              width: "64px", height: "64px", 
              backgroundColor: "#FEF2F2", 
              color: "#EF4444", 
              borderRadius: "50%", 
              display: "flex", alignItems: "center", justifyContent: "center", 
              margin: "0 auto 20px"
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#111827", marginBottom: "12px" }}>Cancel Order?</h2>
            <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: "1.6", marginBottom: "28px" }}>
              Are you sure you want to cancel this order? This action will release the items and cannot be undone.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button 
                onClick={confirmCancellation}
                style={{ 
                  width: "100%", padding: "12px", 
                  backgroundColor: "#EF4444", color: "#fff", 
                  border: "none", borderRadius: "12px", 
                  fontWeight: "700", cursor: "pointer", 
                  transition: "background-color 0.2s"
                }}
              >
                Yes, Cancel Order
              </button>
              <button 
                onClick={() => setCancelConfirmationId(null)}
                style={{ 
                  width: "100%", padding: "12px", 
                  backgroundColor: "#F3F4F6", color: "#374151", 
                  border: "none", borderRadius: "12px", 
                  fontWeight: "600", cursor: "pointer"
                }}
              >
                Keep My Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
