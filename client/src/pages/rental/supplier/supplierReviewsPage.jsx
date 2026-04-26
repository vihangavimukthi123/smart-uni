// supplierReviewsPage.jsx
import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { BiStar, BiUser, BiPackage, BiBuildings, BiCalendar, BiCommentDetail, BiMessageSquareDetail } from "react-icons/bi";
import { useTheme } from "../../../context/ThemeContext";

const StarIcon = ({ filled = true }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1L8.545 5.09H13L9.5 7.59L10.91 12L7 9.25L3.09 12L4.5 7.59L1 5.09H5.455L7 1Z" fill={filled ? "#f59e0b" : "rgba(255,255,255,0.1)"} stroke={filled ? "#f59e0b" : "rgba(255,255,255,0.1)"} strokeWidth="0.5" />
  </svg>
);

const Stars = ({ rating }) => (
  <div style={{ display: 'flex', gap: '4px' }}>
    {[1, 2, 3, 4, 5].map((i) => <StarIcon key={i} filled={i <= rating} />)}
  </div>
);

export default function SupplierReviewsPage() {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("company");

  useEffect(() => {
    if (user?.email) {
      fetchReviews();
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/rental/reviews/supplier/${user.email}`);
      setReviews(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const companyReviews = reviews.filter(r => !r.productID);
  const productReviews = reviews.filter(r => r.productID);

  const textPrimary = darkMode ? 'white' : '#0f172a';
  const textSecondary = '#64748b';
  const bgColor = darkMode ? '#0f172a' : 'white';
  const borderColor = darkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0';

  if (loading) return (
    <div className="flex-center py-40">
      <div className="flex flex-col items-center gap-4">
        <div style={{ width: '40px', height: '40px', border: '4px solid rgba(37, 99, 235, 0.1)', borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: textSecondary, fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Loading Reviews...</p>
      </div>
    </div>
  );

  const currentReviews = activeTab === "company" ? companyReviews : productReviews;

  return (
    <div className="page-wrapper pb-20 anim-fadeIn">
      <div style={{ marginBottom: '48px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '900', color: textPrimary, letterSpacing: '-0.02em' }}>Review Management</h1>
        <p style={{ color: textSecondary, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Monitor both your company profile and individual product performance</p>
      </div>

      <div className="w-full">
        {/* Tab Controls */}
        <div style={{ 
          display: 'flex', gap: '8px', marginBottom: '40px', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', 
          padding: '6px', borderRadius: '18px', width: 'fit-content', border: `1px solid ${borderColor}` 
        }}>
          {[
            { id: 'company', label: 'Company Feedback', count: companyReviews.length, icon: <BiBuildings /> },
            { id: 'product', label: 'Product Feedback', count: productReviews.length, icon: <BiPackage /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ 
                padding: '12px 24px', borderRadius: '14px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', 
                letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.3s ease', border: 'none',
                display: 'flex', alignItems: 'center', gap: '10px',
                backgroundColor: activeTab === tab.id ? '#6366f1' : 'transparent',
                color: activeTab === tab.id ? 'white' : textSecondary,
                boxShadow: activeTab === tab.id ? '0 10px 20px rgba(99, 102, 241, 0.2)' : 'none'
              }}
            >
              {tab.icon}
              <span>{tab.label} ({tab.count})</span>
            </button>
          ))}
        </div>

        <div style={{ 
          backgroundColor: bgColor, borderRadius: '24px', border: `1px solid ${borderColor}`, 
          boxShadow: darkMode ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.02)',
          overflow: 'hidden'
        }}>
          {currentReviews.length === 0 ? (
            <div style={{ padding: '100px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(37, 99, 235, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                <BiMessageSquareDetail size={40} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '900', color: textPrimary }}>No reviews found</h3>
                <p style={{ color: textSecondary, fontSize: '14px', fontWeight: '500' }}>Feedback from students regarding your performance will appear here.</p>
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                <thead>
                  <tr style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderBottom: `1px solid ${borderColor}` }}>
                    <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', minWidth: '220px' }}>Student Entity</th>
                    <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Target Asset</th>
                    <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Protocol Rating</th>
                    <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', minWidth: '350px' }}>Commentary</th>
                    <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {currentReviews.map((r) => (
                    <tr key={r._id} style={{ borderBottom: `1px solid ${borderColor}`, transition: 'background-color 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = darkMode ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                      <td style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', textTransform: 'uppercase', fontSize: '16px' }}>
                            {r.studentEmail[0]}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '900', color: textPrimary }}>{r.studentEmail.split('@')[0]}</span>
                            <span style={{ fontSize: '11px', color: textSecondary, fontWeight: '700', opacity: '0.7' }}>{r.studentEmail}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '32px' }}>
                        {r.productID ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', padding: '6px 12px', borderRadius: '100px', width: 'fit-content' }}>
                            <BiPackage size={14} />
                            <span style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>{r.productName || "Hardware"}</span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f1f5f9', color: textSecondary, padding: '6px 12px', borderRadius: '100px', width: 'fit-content', border: `1px solid ${borderColor}` }}>
                            <BiBuildings size={14} />
                            <span style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>Supplier Profile</span>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '32px' }}><Stars rating={r.rating} /></td>
                      <td style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <BiCommentDetail style={{ color: textSecondary, opacity: '0.3', marginTop: '4px' }} size={16} />
                          <div style={{ fontSize: '14px', color: textSecondary, fontWeight: '500', lineHeight: '1.6', maxWidth: '400px' }}>
                            {r.comment}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: textSecondary }}>
                          <BiCalendar size={16} style={{ opacity: '0.4' }} />
                          <span style={{ fontSize: '11px', fontWeight: '900' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
