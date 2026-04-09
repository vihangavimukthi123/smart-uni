//supplierReviewsPage.jsx
import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import toast from "react-hot-toast";

const StarIcon = ({ filled = true }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1L8.545 5.09H13L9.5 7.59L10.91 12L7 9.25L3.09 12L4.5 7.59L1 5.09H5.455L7 1Z" fill={filled ? "#F59E0B" : "#E5E7EB"} stroke={filled ? "#F59E0B" : "#E5E7EB"} strokeWidth="0.5" />
  </svg>
);

const Stars = ({ rating }) => (
  <span style={{ display: "inline-flex", gap: "2px" }}>
    {[1, 2, 3, 4, 5].map((i) => <StarIcon key={i} filled={i <= rating} />)}
  </span>
);

export default function SupplierReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("company");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("token");
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const res = await api.get(`/rental/reviews/supplier/${decoded.email}`);
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

  if (loading) return <div style={{ padding: "40px", textAlign: "center", color: "#6B7280" }}>Loading Reviews...</div>;

  const currentReviews = activeTab === "company" ? companyReviews : productReviews;

  return (
    <div style={{ padding: "32px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#111827", margin: 0 }}>Review Management</h1>
        <p style={{ color: "#6B7280", fontSize: "14px", marginTop: "4px" }}>Monitor both your company profile and individual product performance.</p>
      </div>

      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "#F3F4F6", padding: "4px", borderRadius: "10px", width: "fit-content" }}>
        <button 
          onClick={() => setActiveTab("company")} 
          style={{ padding: "8px 16px", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer", background: activeTab === "company" ? "#fff" : "transparent", color: activeTab === "company" ? "#111827" : "#6B7280", boxShadow: activeTab === "company" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}
        >
          Company Feedback ({companyReviews.length})
        </button>
        <button 
          onClick={() => setActiveTab("product")} 
          style={{ padding: "8px 16px", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer", background: activeTab === "product" ? "#fff" : "transparent", color: activeTab === "product" ? "#111827" : "#6B7280", boxShadow: activeTab === "product" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}
        >
          Product Feedback ({productReviews.length})
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
        {currentReviews.length === 0 ? (
          <div style={{ padding: "80px 20px", textAlign: "center" }}>
            <p style={{ color: "#9CA3AF", margin: 0 }}>No reviews found for this category.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                <th style={{ textAlign: "left", padding: "16px 24px", fontSize: "12px", fontWeight: "600", color: "#6B7280", textTransform: "uppercase" }}>Student Email</th>
                <th style={{ textAlign: "left", padding: "16px 24px", fontSize: "12px", fontWeight: "600", color: "#6B7280", textTransform: "uppercase" }}>Target</th>
                <th style={{ textAlign: "left", padding: "16px 24px", fontSize: "12px", fontWeight: "600", color: "#6B7280", textTransform: "uppercase" }}>Rating</th>
                <th style={{ textAlign: "left", padding: "16px 24px", fontSize: "12px", fontWeight: "600", color: "#6B7280", textTransform: "uppercase" }}>Comment</th>
                <th style={{ textAlign: "left", padding: "16px 24px", fontSize: "12px", fontWeight: "600", color: "#6B7280", textTransform: "uppercase" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {currentReviews.map((r) => (
                <tr key={r._id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#1E40AF" }}>{r.studentEmail}</div>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ fontSize: "12px", color: "#4B5563" }}>
                      {r.productID ? (
                        <span style={{ background: "#EFF6FF", color: "#1E40AF", padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" }}>
                          ITEM: {r.productName || "Product"}
                        </span>
                      ) : (
                        <span style={{ color: "#6B7280", fontStyle: "italic" }}>Company Review</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px" }}><Stars rating={r.rating} /></td>
                  <td style={{ padding: "16px 24px", fontSize: "14px", color: "#374151", maxWidth: "400px" }}>{r.comment}</td>
                  <td style={{ padding: "16px 24px", fontSize: "13px", color: "#9CA3AF" }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}


