// AdminRentalOrders.jsx
import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { BiChevronDown, BiChevronUp, BiPackage, BiUser, BiCalendar, BiMap, BiReceipt, BiInfoCircle, BiTimeFive } from "react-icons/bi";
import { useTheme } from "../../context/ThemeContext";

export default function AdminRentalOrders() {
  const { darkMode } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await api.get("/rental/orders/admin");
      setOrders(res.data);
    } catch (err) {
      console.error("Fetch admin orders error", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  const toggleExpand = (id) => {
    setExpandedOrders(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const textPrimary = darkMode ? 'white' : '#0f172a';
  const textSecondary = '#64748b';
  const bgColor = darkMode ? '#0f172a' : 'white';
  const borderColor = darkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0';

  const formatAmount = (n) => (n ?? 0).toLocaleString("en-LK", { minimumFractionDigits: 0 });

  if (loading) return (
    <div style={{ padding: "100px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid rgba(37, 99, 235, 0.1)', borderTop: '4px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: textSecondary, fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Synchronizing Global Orders...</p>
    </div>
  );

  return (
    <div className="page-wrapper pb-20 anim-fadeIn">
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '40px', fontWeight: '950', color: textPrimary, letterSpacing: '-0.03em', margin: 0 }}>Global Order Management</h1>
          <p style={{ color: textSecondary, fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Oversee all rental transactions and track fulfillment across <strong style={{ color: '#6366f1' }}>{orders.length}</strong> active orders
          </p>
        </div>

        {/* Orders Table */}
        <div style={{ backgroundColor: bgColor, borderRadius: '32px', border: `1px solid ${borderColor}`, boxShadow: darkMode ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1100px' }}>
              <thead>
                <tr style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderBottom: `1px solid ${borderColor}` }}>
                  <th style={{ width: '60px', padding: '24px' }}></th>
                  <th style={{ textAlign: 'left', padding: '24px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Order ID</th>
                  <th style={{ textAlign: 'left', padding: '24px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Ordered By</th>
                  <th style={{ textAlign: 'left', padding: '24px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Financials</th>
                  <th style={{ textAlign: 'left', padding: '24px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Stakeholders</th>
                  <th style={{ textAlign: 'center', padding: '24px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Registry Status</th>
                  <th style={{ textAlign: 'left', padding: '24px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Timeline</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <div style={{ padding: '100px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                        <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                          <BiReceipt size={40} />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: '900', color: textPrimary }}>No Orders Recorded</h3>
                        <p style={{ color: textSecondary, fontSize: '14px', fontWeight: '500', maxWidth: '400px' }}>No rental transactions have been recorded in the system yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <React.Fragment key={order._id}>
                      <tr 
                        style={{ borderBottom: `1px solid ${borderColor}`, cursor: 'pointer', transition: 'background-color 0.2s ease' }} 
                        onClick={() => toggleExpand(order._id)}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = darkMode ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)'; }} 
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <td style={{ padding: '32px 24px', textAlign: 'center' }}>
                          {expandedOrders[order._id] ? <BiChevronUp size={24} color="#6366f1" /> : <BiChevronDown size={24} color={textSecondary} />}
                        </td>
                        <td style={{ padding: '32px 24px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '950', color: textPrimary }}>#{order.orderId}</span>
                            <span style={{ fontSize: '10px', fontWeight: '700', color: textSecondary, fontFamily: 'monospace', opacity: 0.6 }}>{order._id.slice(-12)}</span>
                          </div>
                        </td>
                        <td style={{ padding: '32px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                              <BiUser size={20} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '14px', fontWeight: '900', color: textPrimary }}>{order.contactInfo?.organizer}</span>
                              <span style={{ fontSize: '11px', fontWeight: '700', color: textSecondary }}>{order.studentEmail}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '32px 24px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '16px', fontWeight: '950', color: '#6366f1', letterSpacing: '-0.02em' }}>LKR {formatAmount(order.totalAmount)}</span>
                            <span style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase' }}>{order.items?.length} Assets Secured</span>
                          </div>
                        </td>
                        <td style={{ padding: '32px 24px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {[...new Set(order.items?.map(item => item.supplierName))].map((name, i) => (
                              <span key={i} style={{ backgroundColor: 'rgba(99, 102, 241, 0.05)', color: '#6366f1', fontSize: '9px', fontWeight: '950', padding: '6px 12px', borderRadius: '8px', border: `1px solid ${borderColor}`, textTransform: 'uppercase' }}>
                                {name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '32px 24px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: order.status === "Completed" ? 'rgba(16, 185, 129, 0.1)' : order.status === "Cancelled" ? 'rgba(244, 63, 94, 0.1)' : 'rgba(99, 102, 241, 0.1)', padding: '6px 16px', borderRadius: '100px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: order.status === "Completed" ? '#10b981' : order.status === "Cancelled" ? '#f43f5e' : '#6366f1', boxShadow: order.status === "Completed" ? '0 0 8px #10b981' : '0 0 8px #f43f5e' }} />
                            <span style={{ fontSize: '10px', fontWeight: '950', color: order.status === "Completed" ? '#10b981' : order.status === "Cancelled" ? '#f43f5e' : '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{order.status || "PENDING"}</span>
                          </div>
                        </td>
                        <td style={{ padding: '32px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: textSecondary }}>
                            <BiCalendar size={14} />
                            <span style={{ fontSize: '13px', fontWeight: '800' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                      </tr>

                      {expandedOrders[order._id] && (
                        <tr style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.01)' : '#fafafa' }}>
                          <td colSpan="7" style={{ padding: '48px 64px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                              {/* Order Items & Specifications */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{ width: '2px', height: '16px', backgroundColor: '#6366f1', borderRadius: '2px' }} />
                                  <h4 style={{ fontSize: '11px', fontWeight: '950', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>Order Items & Specifications</h4>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                                  {order.items?.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '20px', alignItems: 'center', backgroundColor: bgColor, padding: '24px', borderRadius: '24px', border: `1px solid ${borderColor}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                      <img src={item.image} alt="" style={{ width: '72px', height: '72px', borderRadius: '16px', objectFit: 'cover', border: `1px solid ${borderColor}` }} />
                                      <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '16px', fontWeight: '950', color: textPrimary, marginBottom: '4px' }}>{item.name}</div>
                                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Supplier: {item.supplierName}</div>
                                        <div style={{ fontSize: '10px', fontWeight: '700', color: textSecondary, opacity: 0.6 }}>{item.supplierEmail}</div>
                                      </div>
                                      <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Registry Net</div>
                                        <div style={{ fontSize: '15px', fontWeight: '950', color: '#10b981' }}>LKR {formatAmount(item.price * item.qty)}</div>
                                        <div style={{ fontSize: '11px', fontWeight: '800', color: textSecondary }}>Qty: {item.qty}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Rental Timeline & Logistics */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                                <div style={{ backgroundColor: bgColor, padding: '32px', borderRadius: '24px', border: `1px solid ${borderColor}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                                      <BiTimeFive size={20} />
                                    </div>
                                    <h5 style={{ fontSize: '11px', fontWeight: '950', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Rental Timeline</h5>
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderRadius: '12px' }}>
                                      <span style={{ fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase' }}>Pickup Window</span>
                                      <span style={{ fontSize: '13px', fontWeight: '950', color: textPrimary }}>{new Date(order.rentalDates?.pickup).toLocaleDateString()} @ {order.rentalDates?.pickupTime}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderRadius: '12px' }}>
                                      <span style={{ fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase' }}>Return Registry</span>
                                      <span style={{ fontSize: '13px', fontWeight: '950', color: textPrimary }}>{new Date(order.rentalDates?.return).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>

                                <div style={{ backgroundColor: bgColor, padding: '32px', borderRadius: '24px', border: `1px solid ${borderColor}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                                      <BiMap size={20} />
                                    </div>
                                    <h5 style={{ fontSize: '11px', fontWeight: '950', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>LOCATION</h5>
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderRadius: '12px' }}>
                                      <span style={{ fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase' }}>Primary Hub</span>
                                      <span style={{ fontSize: '13px', fontWeight: '950', color: '#6366f1' }}>{order.deliveryDetails?.campus?.toUpperCase()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 16px', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderRadius: '12px' }}>
                                      <span style={{ fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', marginTop: '4px' }}>Handover Area</span>
                                      <span style={{ fontSize: '13px', fontWeight: '950', color: textPrimary, textAlign: 'right', maxWidth: '180px' }}>{order.deliveryDetails?.location}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
