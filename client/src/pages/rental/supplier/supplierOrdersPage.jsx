import { useState, useEffect } from "react";
import api from "../../../api/axios";
import toast from "react-hot-toast";
import { BiPackage, BiTimeFive, BiMap, BiUser, BiChevronRight, BiCheckCircle, BiXCircle, BiMessageSquareDetail, BiCalendar, BiInfoCircle } from "react-icons/bi";
import { useTheme } from "../../../context/ThemeContext";

import OrderChatModal from "../components/OrderChatModal";

export default function SupplierOrdersPage() {
  const { darkMode } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [chatOrder, setChatOrder] = useState(null);

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

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'All') return true;
    return order.status?.toLowerCase() === activeTab.toLowerCase();
  });

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

  const textPrimary = darkMode ? 'white' : '#0f172a';
  const textSecondary = '#64748b';
  const bgColor = darkMode ? '#0f172a' : 'white';
  const borderColor = darkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0';

  if (loading) return (
    <div style={{ padding: "100px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid rgba(37, 99, 235, 0.1)', borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: textSecondary, fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Synchronizing Orders...</p>
    </div>
  );

  return (
    <div className="page-wrapper pb-20 anim-fadeIn">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '950', color: textPrimary, letterSpacing: '-0.03em', margin: 0 }}>Order Management</h1>
            <p style={{ color: textSecondary, fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Review logistics and coordinate <strong style={{ color: '#6366f1' }}>{filteredOrders.length}</strong> {activeTab.toLowerCase()} rentals
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {['All', 'Pending', 'Active', 'Completed'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                style={{ 
                  padding: '10px 20px', borderRadius: '12px', 
                  backgroundColor: tab === activeTab ? '#6366f1' : (darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc'), 
                  color: tab === activeTab ? 'white' : textSecondary, 
                  border: 'none', fontSize: '12px', fontWeight: '900', cursor: 'pointer', transition: 'all 0.2s ease',
                  boxShadow: tab === activeTab ? '0 10px 15px -3px rgba(99, 102, 241, 0.3)' : 'none'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {orders.length === 0 ? (
          <div style={{ backgroundColor: bgColor, borderRadius: '32px', border: `2px dashed ${borderColor}`, padding: '100px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
              <BiPackage size={40} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '900', color: textPrimary }}>No customer orders found</h3>
              <p style={{ color: textSecondary, fontSize: '14px', fontWeight: '500', maxWidth: '400px' }}>Active rentals will appear here once placed by students.</p>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {filteredOrders.map((order) => (
              <div key={order._id} style={{ backgroundColor: bgColor, borderRadius: '32px', border: `1px solid ${borderColor}`, boxShadow: darkMode ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.02)', overflow: "hidden", transition: 'transform 0.3s ease' }} className="group">
                {/* Card Header */}
                <div style={{ padding: "24px 32px", backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderBottom: `1px solid ${borderColor}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: 'wrap', gap: '20px' }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                    <div>
                      <span style={{ fontSize: "10px", fontWeight: "900", color: textSecondary, textTransform: 'uppercase', letterSpacing: "0.1em", display: 'block', marginBottom: '4px' }}>LOGISTICS ID</span>
                      <div style={{ fontSize: "15px", fontWeight: "900", color: textPrimary }}>#{order.orderId || order._id?.slice(-8)}</div>
                    </div>
                    <div style={{ width: '1px', height: '32px', backgroundColor: borderColor }} />
                    {(() => {
                      const sItems = order.items || [];
                      const allCancelled = sItems.length > 0 && sItems.every(i => i.status === "Cancelled");
                      const allDelivered = sItems.length > 0 && sItems.every(i => i.status === "Delivered");
                      const anyActive = sItems.some(i => i.status === "Processing" || i.status === "Delivered");
                      
                      const displayStatus = allCancelled ? "Cancelled" : allDelivered ? "Completed" : anyActive ? "Active" : (order.status === "Cancelled" ? "Cancelled" : "Pending");
                      const statusColor = displayStatus === "Completed" ? "#10b981" : displayStatus === "Cancelled" ? "#f43f5e" : "#6366f1";
                      const statusBg = displayStatus === "Completed" ? "rgba(16, 185, 129, 0.1)" : displayStatus === "Cancelled" ? "rgba(244, 63, 94, 0.1)" : "rgba(99, 102, 241, 0.1)";

                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: statusBg, padding: "8px 16px", borderRadius: "100px" }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusColor, boxShadow: `0 0 8px ${statusColor}` }} />
                          <span style={{ fontSize: "10px", fontWeight: "950", color: statusColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{displayStatus.toUpperCase()}</span>
                        </div>
                      );
                    })()}
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      onClick={() => setChatOrder(order.orderId || order._id)}
                      style={{ padding: "12px 20px", background: darkMode ? 'rgba(99, 102, 241, 0.1)' : "#eef2ff", color: "#6366f1", border: "none", borderRadius: "14px", fontSize: "12px", fontWeight: "950", textTransform: 'uppercase', letterSpacing: '0.1em', cursor: "pointer", display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <BiMessageSquareDetail size={18} /> Chat
                    </button>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      style={{ padding: "12px 24px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "14px", fontSize: "12px", fontWeight: "950", textTransform: 'uppercase', letterSpacing: '0.1em', cursor: "pointer", display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)', transition: 'all 0.2s ease' }}
                    >
                      View <BiChevronRight size={18} />
                    </button>
                  </div>
                </div>

                {/* Card Content - Items */}
                <div style={{ padding: "32px" }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "24px", alignItems: "center", paddingBottom: idx === (order.items || []).length - 1 ? 0 : "24px", borderBottom: idx === (order.items || []).length - 1 ? 'none' : `1px solid ${borderColor}` }}>
                        <div style={{ width: "80px", height: "80px", borderRadius: "20px", overflow: 'hidden', border: `1px solid ${borderColor}`, flexShrink: 0 }}>
                          <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "18px", fontWeight: "900", color: textPrimary, marginBottom: '4px' }}>{item.name}</div>
                          <div style={{ fontSize: "14px", color: textSecondary, fontWeight: '700' }}>
                            Quantity: <span style={{ color: '#6366f1' }}>{item.qty}</span> · LKR {Number(item.price).toLocaleString()}/day
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                          <span style={{ fontSize: "9px", fontWeight: "900", color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Quick Update</span>
                          <select
                            value={item.status || "Pending"}
                            onChange={(e) => handleUpdateItem(order._id, item.productId, e.target.value, item.supplierNote)}
                            style={{
                              padding: "10px 16px", borderRadius: "12px", border: `1px solid ${borderColor}`,
                              fontSize: "12px", fontWeight: "900", cursor: "pointer", outline: 'none',
                              backgroundColor: item.status === "Delivered" ? "rgba(16, 185, 129, 0.1)" : item.status === "Processing" ? "rgba(99, 102, 241, 0.1)" : item.status === "Cancelled" ? "rgba(244, 63, 94, 0.1)" : (darkMode ? 'rgba(255,255,255,0.02)' : '#fff9db'),
                              color: item.status === "Delivered" ? "#10b981" : item.status === "Processing" ? "#6366f1" : item.status === "Cancelled" ? "#f43f5e" : "#854d0e",
                              textTransform: 'uppercase', letterSpacing: '0.05em'
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
                </div>

                {/* Card Footer - Customer & Delivery */}
                <div style={{ padding: "20px 32px", backgroundColor: darkMode ? 'rgba(255,255,255,0.01)' : '#fff', borderTop: `1px solid ${borderColor}`, display: "flex", justifyContent: "space-between", flexWrap: 'wrap', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}><BiUser size={18} /></div>
                    <div style={{ fontSize: "13px", color: textPrimary, fontWeight: '800' }}>{order.contactInfo?.organizer}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}><BiMap size={18} /></div>
                    <div style={{ fontSize: "13px", color: textPrimary, fontWeight: '800' }}>{order.deliveryDetails?.campus === "sliit" ? "Kandy Campus HUB" : "Other Hub"}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}><BiCalendar size={18} /></div>
                    <div style={{ fontSize: "13px", color: "#6366f1", fontWeight: "900" }}>Start: {new Date(order.rentalDates?.pickup).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <ManageOrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={handleUpdateItem}
          darkMode={darkMode}
          onChat={() => {
            setChatOrder(selectedOrder.orderId || selectedOrder._id);
            setSelectedOrder(null);
          }}
        />
      )}

      {chatOrder && (
        <OrderChatModal 
          orderId={chatOrder} 
          onClose={() => setChatOrder(null)} 
        />
      )}

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ManageOrderModal({ order, onClose, onUpdate, darkMode, onChat }) {
  const [status, setStatus] = useState(order.items[0].status || "Pending");
  const [note, setNote] = useState(order.items[0].supplierNote || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const textPrimary = darkMode ? 'white' : '#0f172a';
  const textSecondary = '#64748b';
  const bgColor = darkMode ? '#111827' : 'white';
  const borderColor = darkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0';

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleSave = async () => {
    setIsUpdating(true);
    await onUpdate(order._id, null, status, note);
    setIsUpdating(false);
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", backdropFilter: "blur(12px)" }}>
      <div style={{ backgroundColor: bgColor, borderRadius: "32px", width: "100%", maxWidth: "720px", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", border: `1px solid ${borderColor}`, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: "32px", borderBottom: `1px solid ${borderColor}`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, backgroundColor: bgColor, zIndex: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h2 style={{ fontSize: "24px", fontWeight: "950", color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>Order Details</h2>
            <p style={{ fontSize: '11px', fontWeight: '800', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Order: #{order.orderId || order._id?.slice(-8)}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={onClose} style={{ border: "none", background: darkMode ? 'rgba(255,255,255,0.05)' : "#F3F4F6", width: "40px", height: "40px", borderRadius: "14px", cursor: "pointer", color: textPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BiXCircle size={24} /></button>
          </div>

        </div>

        <div style={{ padding: "40px" }}>
          {/* Order Details Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: "40px" }}>
            <div style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', padding: '24px', borderRadius: '24px', border: `1px solid ${borderColor}` }}>
              <label style={{ fontSize: "10px", fontWeight: "950", color: textSecondary, display: "block", marginBottom: "12px", textTransform: 'uppercase', letterSpacing: '0.1em' }}><BiUser size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Student Authorized</label>
              <div style={{ fontSize: "16px", fontWeight: "900", color: textPrimary, marginBottom: '4px' }}>{order.contactInfo?.organizer}</div>
              <div style={{ fontSize: "13px", color: textSecondary, fontWeight: '700' }}>{order.contactInfo?.phone}</div>
              <div style={{ fontSize: "12px", color: "#6366f1", fontWeight: '800', marginTop: '4px' }}>{order.contactInfo?.email}</div>
            </div>
            <div style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', padding: '24px', borderRadius: '24px', border: `1px solid ${borderColor}` }}>
              <label style={{ fontSize: "10px", fontWeight: "950", color: textSecondary, display: "block", marginBottom: "12px", textTransform: 'uppercase', letterSpacing: '0.1em' }}><BiMap size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Target Hub</label>
              <div style={{ fontSize: "16px", fontWeight: "900", color: textPrimary, marginBottom: '4px' }}>{order.deliveryDetails?.campus === "sliit" ? "SLIIT Kandy Uni HUB" : "Other Location"}</div>
              <p style={{ fontSize: "13px", color: textSecondary, fontWeight: '700', margin: "4px 0 0 0" }}>{order.deliveryDetails?.location || 'Standard Handover Area'}</p>
            </div>
          </div>

          <div style={{ marginBottom: "40px", backgroundColor: "rgba(99, 102, 241, 0.05)", padding: "20px 24px", borderRadius: "24px", border: "1px solid rgba(99, 102, 241, 0.1)", display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}><BiTimeFive size={24} /></div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "10px", fontWeight: "950", color: "#6366f1", display: "block", marginBottom: "4px", textTransform: 'uppercase', letterSpacing: '0.1em' }}>Scheduled Window</label>
              <div style={{ fontSize: "16px", fontWeight: "950", color: textPrimary }}>
                {new Date(order.rentalDates?.pickup).toLocaleDateString()} at {order.rentalDates?.pickupTime || "09:00"}
              </div>
            </div>
          </div>

          {/* Itemized Summary */}
          <div style={{ marginBottom: "40px" }}>
            <label style={{ fontSize: "11px", fontWeight: "950", color: textSecondary, display: "block", marginBottom: "16px", textTransform: 'uppercase', letterSpacing: '0.1em' }}>Asset Inventory Summary</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", backgroundColor: darkMode ? 'rgba(255,255,255,0.01)' : "#F9FAFB", padding: "24px", borderRadius: "24px", border: `1px solid ${borderColor}` }}>
              {order.items.map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: "14px", color: textPrimary, fontWeight: '700' }}>
                    <span style={{ color: '#6366f1', fontWeight: "900", marginRight: '8px' }}>{item.qty}x</span> {item.name}
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "900", color: textPrimary }}>LKR {Number(item.price * item.qty).toLocaleString()}</div>
                </div>
              ))}
              <div style={{ height: "1px", background: borderColor, margin: "12px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: "900", color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registry Value</span>
                <span style={{ fontSize: "24px", fontWeight: "950", color: "#6366f1", letterSpacing: '-0.02em' }}>LKR {Number(order.totalAmount).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div style={{ height: "1px", background: borderColor, marginBottom: "40px" }} />

          {/* Action Form */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: "11px", fontWeight: "950", color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}><BiInfoCircle size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Update Item Logistics</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: "100%", padding: "16px", borderRadius: "16px", border: `1px solid ${borderColor}`, outline: "none", fontSize: "14px", fontWeight: "900", cursor: "pointer", backgroundColor: bgColor, color: textPrimary }}
              >
                <option value="Pending">Pending Audit</option>
                <option value="Processing">Processing Order</option>
                <option value="Delivered">Successfully Delivered</option>
                <option value="Cancelled">Decline/Cancel</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: "11px", fontWeight: "950", color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}><BiMessageSquareDetail size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Logistics Direct Message</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write handover instructions (e.g., 'Pickup at Kandy Campus HUB, Level 2')..."
                style={{ width: "100%", padding: "20px", borderRadius: "20px", border: `1px solid ${borderColor}`, outline: "none", fontSize: "14px", height: "120px", fontFamily: "inherit", resize: "none", backgroundColor: bgColor, color: textPrimary, fontWeight: '500' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={onClose}
                style={{ flex: 1, padding: "18px", background: darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9', color: textPrimary, border: "none", borderRadius: "18px", fontWeight: "950", fontSize: "13px", textTransform: 'uppercase', letterSpacing: '0.1em', cursor: "pointer", transition: "all 0.2s" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isUpdating}
                style={{ flex: 2, padding: "18px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "18px", fontWeight: "950", fontSize: "13px", textTransform: 'uppercase', letterSpacing: '0.1em', cursor: "pointer", boxShadow: '0 15px 30px rgba(99, 102, 241, 0.2)', transition: "all 0.2s" }}
              >
                {isUpdating ? "Processing..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
