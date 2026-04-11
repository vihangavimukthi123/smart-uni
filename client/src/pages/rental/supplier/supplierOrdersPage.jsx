import { useState, useEffect } from "react";
import api from "../../../api/axios";
import toast from "react-hot-toast";

export default function SupplierOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchSupplierOrders();
  }, []);

  async function fetchSupplierOrders() {
    try {
      const res = await api.get("/rental/orders/supplier");
      setOrders(res.data);
    } catch (err) {
      console.error("Fetch supplier orders error", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateItem(orderId, productId, status, supplierNote) {
    try {
      await api.put("/rental/orders/item-status", {
        orderId,
        productId,
        status,
        supplierNote
      });
      toast.success("Order updated successfully");
      fetchSupplierOrders();
      setSelectedOrder(null);
    } catch (err) {
      toast.error("Failed to update order");
    }
  }

  if (loading) return <div style={{ padding: "40px", textAlign: "center", color: "#6B7280" }}>Loading orders...</div>;

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#111827", margin: "0 0 8px 0" }}>Order Management</h1>
        <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>Review logistics and coordinate rentals with students.</p>
      </div>

      {orders.length === 0 ? (
        <div style={{ backgroundColor: "#fff", padding: "80px 40px", borderRadius: "16px", textAlign: "center", border: "1px dotted #D1D5DB" }}>
          <p style={{ fontSize: "16px", color: "#4B5563", fontWeight: "600" }}>No customer orders found</p>
          <p style={{ color: "#9CA3AF", fontSize: "14px" }}>Active rentals will appear here once placed by students.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {orders.map((order) => (
            <div key={order._id} style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid #E5E7EB", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", overflow: "hidden" }}>
              <div style={{ padding: "16px 24px", backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: "800", color: "#9CA3AF", letterSpacing: "0.05em" }}>ORDER ID</span>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>#{order.orderId || order._id?.slice(-8)}</div>
                  </div>
                  <span style={{
                    fontSize: "10px", fontWeight: "900", padding: "4px 10px", borderRadius: "20px",
                    background: order.status === "Completed" ? "#DCFCE7" : order.status === "Cancelled" ? "#FEE2E2" : "#DBEAFE",
                    color: order.status === "Completed" ? "#166534" : order.status === "Cancelled" ? "#991B1B" : "#1E40AF",
                    border: "1px solid currentColor"
                  }}>
                    {(order.status || "Pending").toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedOrder(order)}
                  style={{ padding: "8px 20px", background: "#1E40AF", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
                >
                  View Details & Manage
                </button>
              </div>

              <div style={{ padding: "24px" }}>
                {(order.items || []).map((item, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "20px", alignItems: "center", marginBottom: idx === (order.items || []).length - 1 ? 0 : "20px" }}>
                    <img src={item.image} alt="" style={{ width: "56px", height: "56px", borderRadius: "12px", objectFit: "cover", background: "#F3F4F6" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "700", color: "#111827", fontSize: "15px" }}>{item.name}</div>
                      <div style={{ fontSize: "13px", color: "#6B7280" }}>Quantity: {item.qty} · Rs.{item.price}/day</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                      <span style={{ fontSize: "10px", fontWeight: "800", color: "#9CA3AF" }}>QUICK UPDATE</span>
                      <select
                        value={item.status || "Pending"}
                        onChange={(e) => handleUpdateItem(order._id, item.productId, e.target.value, item.supplierNote)}
                        style={{
                          padding: "4px 8px", borderRadius: "6px", border: "1px solid #D1D5DB",
                          fontSize: "12px", fontWeight: "700", cursor: "pointer",
                          backgroundColor: item.status === "Delivered" ? "#DCFCE7" : item.status === "Processing" ? "#DBEAFE" : item.status === "Cancelled" ? "#FEE2E2" : "#FFF9DB",
                          color: item.status === "Delivered" ? "#166534" : item.status === "Processing" ? "#1E40AF" : item.status === "Cancelled" ? "#B91C1C" : "#854D0E"
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ padding: "16px 24px", backgroundColor: "#fff", borderTop: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: "13px", color: "#4B5563" }}><strong>Customer:</strong> {order.contactInfo?.organizer}</div>
                <div style={{ fontSize: "13px", color: "#4B5563" }}><strong>Delivery:</strong> {order.deliveryDetails?.campus === "sliit" ? "Kandy Campus" : "Other"}</div>
                <div style={{ fontSize: "13px", color: "#1E40AF", fontWeight: "700" }}>Rental Start: {new Date(order.rentalDates?.pickup).toLocaleDateString()} at {order.rentalDates?.pickupTime || "09:00"}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <ManageOrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={handleUpdateItem}
        />
      )}
    </div>
  );
}

function ManageOrderModal({ order, onClose, onUpdate }) {
  const [status, setStatus] = useState(order.items[0].status || "Pending");
  const [note, setNote] = useState(order.items[0].supplierNote || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    setIsUpdating(true);
    // Passing null for productId to update all items belonging to this supplier in this order
    await onUpdate(order._id, null, status, note);
    setIsUpdating(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", backdropFilter: "blur(4px)" }}>
      <div style={{ backgroundColor: "#fff", borderRadius: "20px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
        <div style={{ padding: "24px", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 10 }}>
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#111827", margin: 0 }}>Order Details & Management</h2>
          <button onClick={onClose} style={{ border: "none", background: "#F3F4F6", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontWeight: "bold" }}>×</button>
        </div>

        <div style={{ padding: "32px" }}>
          {/* Order Details Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "20px" }}>
            <div>
              <label style={{ fontSize: "11px", fontWeight: "800", color: "#9CA3AF", display: "block", marginBottom: "6px" }}>STUDENT CONTACT</label>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>{order.contactInfo?.organizer}</div>
              <div style={{ fontSize: "13px", color: "#6B7280" }}>{order.contactInfo?.phone}</div>
              <div style={{ fontSize: "12px", color: "#1E40AF" }}>{order.contactInfo?.email}</div>
            </div>
            <div>
              <label style={{ fontSize: "11px", fontWeight: "800", color: "#9CA3AF", display: "block", marginBottom: "6px" }}>DELIVERY LOCATION</label>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>{order.deliveryDetails?.campus === "sliit" ? "SLIIT Kandy Uni" : "Other Location"}</div>
              <p style={{ fontSize: "12px", color: "#6B7280", margin: "4px 0 0 0" }}>{order.deliveryDetails?.location}</p>
            </div>
          </div>

          <div style={{ marginBottom: "32px", backgroundColor: "#EFF6FF", padding: "12px 16px", borderRadius: "10px", border: "1px solid #DBEAFE" }}>
            <label style={{ fontSize: "11px", fontWeight: "800", color: "#1E40AF", display: "block", marginBottom: "6px", letterSpacing: "0.05em" }}>RENTAL PERIOD</label>
            <div style={{ fontSize: "15px", fontWeight: "800", color: "#1E3A8A" }}>
              {new Date(order.rentalDates?.pickup).toLocaleDateString()} at {order.rentalDates?.pickupTime || "09:00"} — {new Date(order.rentalDates?.return).toLocaleDateString()}
            </div>
          </div>

          {/* Itemized Summary */}
          <div style={{ marginBottom: "32px" }}>
            <label style={{ fontSize: "11px", fontWeight: "800", color: "#9CA3AF", display: "block", marginBottom: "12px" }}>ORDER SUMMARY</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "#F9FAFB", padding: "16px", borderRadius: "12px", border: "1px solid #F3F4F6" }}>
              {order.items.map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: "14px", color: "#374151" }}>
                    <span style={{ fontWeight: "700" }}>{item.qty}x</span> {item.name}
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>Rs.{(item.price * item.qty).toFixed(2)}</div>
                </div>
              ))}
              <div style={{ height: "1px", background: "#E5E7EB", margin: "4px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>Total Amount</span>
                <span style={{ fontSize: "18px", fontWeight: "800", color: "#1E40AF" }}>Rs.{order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div style={{ height: "1px", background: "#F3F4F6", marginBottom: "32px" }} />

          {/* Action Form */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "13px", fontWeight: "700", color: "#374151", display: "block", marginBottom: "8px" }}>Update Item Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #D1D5DB", outline: "none", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}
            >
              <option value="Pending">Pending Audit</option>
              <option value="Processing">Processing Order</option>
              <option value="Delivered">Successfully Delivered</option>
              <option value="Cancelled">Decline/Cancel</option>
            </select>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <label style={{ fontSize: "13px", fontWeight: "700", color: "#374151", display: "block", marginBottom: "8px" }}>Message to Student</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write a message (e.g., 'Pickup at Gate 3')..."
              style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #D1D5DB", outline: "none", fontSize: "14px", height: "100px", fontFamily: "inherit", resize: "none" }}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={isUpdating}
            style={{ width: "100%", padding: "14px", background: "#1E40AF", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "15px", cursor: "pointer", transition: "all 0.2s" }}
          >
            {isUpdating ? "Saving Changes..." : "Apply Updates"}
          </button>
        </div>
      </div>
    </div>
  );
}



