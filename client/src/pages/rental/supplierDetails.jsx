//supplierDetails.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";

const StarIcon = ({ filled = true, half = false, onClick, size = "14", interactive = false }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 14 14" 
    fill="none" 
    style={{ cursor: interactive ? "pointer" : "default" }}
    onClick={onClick}
  >
    <path
      d="M7 1L8.545 5.09H13L9.5 7.59L10.91 12L7 9.25L3.09 12L4.5 7.59L1 5.09H5.455L7 1Z"
      fill={filled ? "#F59E0B" : half ? "url(#half)" : "#E5E7EB"}
      stroke={filled || half ? "#F59E0B" : "#E5E7EB"}
      strokeWidth="0.5"
    />
    {half && (
      <defs>
        <linearGradient id="half" x1="0" x2="1" y1="0" y2="0">
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#E5E7EB" />
        </linearGradient>
      </defs>
    )}
  </svg>
);

const Stars = ({ rating, interactive = false, onRate, size = "14" }) => (
  <span style={{ display: "inline-flex", gap: "4px", alignItems: "center" }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <StarIcon
        key={i}
        size={size}
        interactive={interactive}
        onClick={() => interactive && onRate(i)}
        filled={i <= Math.floor(rating)}
        half={!interactive && i === Math.ceil(rating) && rating % 1 !== 0}
      />
    ))}
  </span>
);

const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E40AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

export default function SupplierDetails() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [data, setData] = useState({ supplier: null, products: [] });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("rental");
  
  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (email) {
      fetchSupplierDetails();
      fetchReviews();
    }
  }, [email]);

  const fetchSupplierDetails = async () => {
    try {
      const res = await api.get(`/rental/suppliers/${email}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load supplier profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/rental/reviews/supplier/${email}`);
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostReview = async () => {
    if (!newComment.trim()) return toast.error("Please enter a comment");
    
    setIsPosting(true);
    try {
      await api.post("/rental/reviews", {
        supplierEmail: email,
        rating: newRating,
        comment: newComment
      });
      
      toast.success("Review posted!");
      setNewComment("");
      setNewRating(5);
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post review");
    } finally {
      setIsPosting(false);
    }
  };


  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-blue-600 animate-pulse font-bold">Loading Supplier Info...</p></div>;

  const { supplier, products } = data;
  if (!supplier) return <div className="min-h-screen flex items-center justify-center">Supplier not found</div>;

  return (
    <div style={{ flex: 1 }}>
          
          {/* Header */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "24px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <div style={{ display: "flex", gap: "24px" }}>
              <div style={{ width: "100px", height: "100px", background: "#EFF6FF", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>🏢</div>
              <div>
                <h1 style={{ fontSize: "28px", fontWeight: "800", margin: "0 0 8px 0" }}>{supplier.firstName} {supplier.lastName}</h1>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <Stars rating={reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1) || 5} />
                  <span style={{ fontWeight: "700" }}>{(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)).toFixed(1)}</span>
                  <span style={{ color: "#9CA3AF" }}>• {reviews.length} Reviews</span>
                </div>
                <p style={{ color: "#4B5563", maxWidth: "700px" }}>{supplier.description || "Trusted university event equipment provider."}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", overflow: "hidden" }}>
             <div style={{ borderBottom: "1px solid #E5E7EB", padding: "0 24px", display: "flex", gap: "32px" }}>
                <button onClick={() => setActiveTab("rental")} style={{ padding: "16px 0", border: "none", background: "none", cursor: "pointer", fontSize: "14px", fontWeight: "700", color: activeTab === "rental" ? "#1E40AF" : "#6B7280", borderBottom: activeTab === "rental" ? "2px solid #1E40AF" : "none" }}>Catalog ({products.length})</button>
                <button onClick={() => setActiveTab("reviews")} style={{ padding: "16px 0", border: "none", background: "none", cursor: "pointer", fontSize: "14px", fontWeight: "700", color: activeTab === "reviews" ? "#1E40AF" : "#6B7280", borderBottom: activeTab === "reviews" ? "2px solid #1E40AF" : "none" }}>Reviews ({reviews.length})</button>
             </div>

             <div style={{ padding: "24px" }}>
                {activeTab === "rental" ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px" }}>
                    {products.map(p => (
                      <div key={p.productID} style={{ border: "1px solid #E5E7EB", borderRadius: "10px", padding: "16px" }}>
                        <img src={p.images?.[0]} style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "8px", marginBottom: "12px" }} alt="" />
                        <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "4px" }}>{p.name}</h3>
                        <p style={{ fontSize: "18px", fontWeight: "800", color: "#1E40AF" }}>Rs.{p.price}<span style={{ fontSize: "11px", color: "#9CA3AF" }}>/day</span></p>
                        <button onClick={() => navigate(`/itemdetails/${p.productID}`)} style={{ width: "100%", marginTop: "12px", padding: "8px", background: "#EFF6FF", color: "#1E40AF", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}>View</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    {/* Review Form */}
                    <div style={{ backgroundColor: "#F9FAFB", padding: "20px", borderRadius: "12px", marginBottom: "32px", border: "1px solid #E5E7EB" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "16px" }}>Write a Review</h3>
                      <div style={{ marginBottom: "16px" }}>
                        <p style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>Rating</p>
                        <Stars rating={newRating} interactive={true} onRate={setNewRating} size="24" />
                      </div>
                      <textarea 
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Share your experience with this supplier..."
                        style={{ width: "100%", padding: "12px", border: "1px solid #D1D5DB", borderRadius: "8px", outline: "none", height: "100px", fontFamily: "inherit" }}
                      />
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
                        <button onClick={handlePostReview} disabled={isPosting} style={{ padding: "10px 24px", background: "#1E40AF", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", opacity: isPosting ? 0.7 : 1 }}>
                          {isPosting ? "Posting..." : "Post Review"}
                        </button>
                      </div>
                    </div>

                    {/* Review List */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      {reviews.length === 0 ? <p style={{ textAlign: "center", color: "#9CA3AF", padding: "40px" }}>Be the first to review this supplier!</p> : reviews.map(r => (
                        <div key={r._id} style={{ borderBottom: "1px solid #F3F4F6", paddingBottom: "20px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                            <div style={{ fontWeight: "700", color: "#1E40AF", fontSize: "14px" }}>{r.studentEmail}</div>
                            <div style={{ fontSize: "12px", color: "#9CA3AF" }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                          </div>
                          <div style={{ marginBottom: "8px" }}><Stars rating={r.rating} /></div>
                          <p style={{ color: "#374151", margin: 0, fontSize: "14px", lineHeight: "1.5" }}>{r.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
             </div>
          </div>

    </div>
  );
}
