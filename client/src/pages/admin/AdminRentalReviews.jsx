// AdminRentalReviews.jsx
import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { MdStar, MdStarBorder, MdFeedback } from "react-icons/md";

export default function AdminRentalReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      const res = await api.get("/rental/reviews/admin");
      setReviews(res.data);
    } catch (err) {
      console.error("Fetch admin reviews error", err);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }

  const renderStars = (rating) => {
    const clamped = Math.round(Math.min(Math.max(rating, 0), 5));
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) =>
          i < clamped
            ? <MdStar     key={i} size={16} style={{ color: "#f59e0b" }} />
            : <MdStarBorder key={i} size={16} style={{ color: "#d1d5db" }} />
        )}
      </div>
    );
  };

  if (loading) return (
    <div className="flex-center h-[100vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-indigo/20 border-t-indigo rounded-full animate-spin" />
        <p className="text-muted font-bold tracking-widest uppercase text-[10px]">Auditing Feedback...</p>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper pb-20 anim-fadeIn">
      <div className="mb-12">
        <h1 className="text-4xl font-black mb-2 tracking-tight text-primary">Quality & Feedback Audit</h1>
        <p className="text-secondary text-sm font-bold uppercase tracking-widest opacity-70">Monitor all student reviews and supplier service quality in one view</p>
      </div>

      <div className="table-wrapper glass-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '140px' }}>Rating</th>
              <th style={{ minWidth: '280px' }}>Review & Comment</th>
              <th style={{ minWidth: '220px' }}>Product</th>
              <th style={{ minWidth: '220px' }}>Supplier</th>
              <th style={{ minWidth: '220px' }}>Reviewed By</th>
              <th style={{ width: '160px' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review._id} className="group">
                <td>
                  <div className="flex flex-col gap-1">
                    {renderStars(review.rating)}
                    <span className="text-xs font-bold text-primary">{review.rating}.0 / 5.0</span>
                  </div>
                </td>
                <td className="max-w-[300px]">
                  <div 
                    className="text-sm font-medium text-secondary italic truncate" 
                    title={review.comment}
                  >
                    "{review.comment}"
                  </div>
                </td>
                <td>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-primary group-hover:text-indigo transition-colors truncate max-w-[200px]">
                      {review.productDisplayName}
                    </span>
                    <span className="text-[10px] font-mono text-muted uppercase tracking-tight">
                      ID: {review.productID || 'N/A'}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-primary truncate max-w-[200px]">
                      {review.supplierName}
                    </span>
                    <span className="text-[10px] font-semibold text-email truncate max-w-[200px]">
                      {review.supplierEmail}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-primary truncate max-w-[200px]">
                      {review.studentName}
                    </span>
                    <span className="text-[10px] font-semibold text-email truncate max-w-[200px]">
                      {review.studentEmail}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="text-xs font-bold text-primary">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reviews.length === 0 && (
          <div className="py-32 flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex-center mb-2">
              <MdFeedback className="text-indigo/20" size={40} />
            </div>
            <h3 className="text-xl font-black tracking-tight text-primary">No Reviews Found</h3>
            <p className="text-muted text-sm font-bold max-w-sm">No student feedback has been submitted for rental services yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
