//itemDetails.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../../../context/CartContext";
import api from "../../../api/axios";
import toast from "react-hot-toast";
import Navbar from "../../../components/layout/Navbar";
import Sidebar from "../../../components/layout/Sidebar";

const PRIMARY = "#1a4fd6";

const StarIcon = ({ filled = true, onClick, size = 14, interactive = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 14 14"
    fill={filled ? "#FBBF24" : "#D1D5DB"}
    style={{ cursor: interactive ? "pointer" : "default" }}
    onClick={onClick}
  >
    <path d="M7 1l1.545 3.13L12 4.635l-2.5 2.435.59 3.44L7 8.885l-3.09 1.625.59-3.44L2 4.635l3.455-.505L7 1z" />
  </svg>
);

const Stars = ({ rating, interactive = false, onRate, size = 14 }) => (
  <span style={{ display: "inline-flex", gap: "4px", alignItems: "center" }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <StarIcon
        key={i}
        size={size}
        interactive={interactive}
        onClick={() => interactive && onRate(i)}
        filled={i <= rating}
      />
    ))}
  </span>
);

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/rental/products/${id}`);
      setProduct(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/rental/reviews/product/${id}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Reviews load error", err);
    }
  };

  const handlePostReview = async () => {
    if (!newComment.trim()) return toast.error("Please enter a comment");
    
    setIsPosting(true);
    try {
      await api.post("/rental/reviews", {
        supplierEmail: product.supplierEmail,
        productID: id,
        productName: product.name,
        rating: newRating,
        comment: newComment
      });
      
      toast.success("Product review posted!");
      setNewComment("");
      setNewRating(5);
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post review");
    } finally {
      setIsPosting(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: PRIMARY }}>Loading Product Details...</div>;
  if (!product) return <div style={{ padding: 40 }}>Product not found</div>;

  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#f3f4f6" }}>

      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />

        <main style={{ flex: 1, padding: "24px 32px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "32px", maxWidth: "1100px", width: "100%", alignItems: "flex-start" }}>
            
            {/* Left - Image */}
            <div style={{ flex: 1, backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #E5E7EB", padding: "16px" }}>
              <img src={product.images?.[0]} style={{ width: "100%", borderRadius: "8px", objectFit: "cover" }} alt={product.name} />
            </div>

            {/* Right - Basic Info & Actions */}
            <div style={{ flex: 0.8 }}>
              <div style={{ color: PRIMARY, fontSize: "11px", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px" }}>{product.category}</div>
              <h1 style={{ fontSize: "28px", fontWeight: "800", margin: "0 0 12px 0" }}>{product.name}</h1>
              
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <span style={{ fontSize: "28px", fontWeight: "800", color: PRIMARY }}>Rs.{product.price}<span style={{ fontSize: "14px", fontWeight: "400", color: "#6B7280" }}>/day</span></span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", borderLeft: "1px solid #E5E7EB", paddingLeft: "12px" }}>
                   <Stars rating={avgRating} />
                   <span style={{ fontWeight: "700" }}>{avgRating.toFixed(1)}</span>
                   <span style={{ color: "#9CA3AF", fontSize: "12px" }}>({reviews.length} reviews)</span>
                </div>
              </div>

              <div style={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "24px", marginBottom: "20px" }}>
                 <p style={{ margin: "0 0 12px 0", fontSize: "13px", fontWeight: "600" }}>Availability: <span style={{ color: "#16A34A" }}>{product.stock} in stock</span></p>
                 <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                    <div style={{ display: "flex", border: "1px solid #E5E7EB", borderRadius: "8px", overflow: "hidden" }}>
                       <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: "8px 16px", background: "#fff", border: "none", borderRight: "1px solid #E5E7EB", cursor: "pointer" }}>-</button>
                       <span style={{ padding: "8px 16px", fontWeight: "700" }}>{quantity}</span>
                       <button onClick={() => setQuantity(quantity + 1)} style={{ padding: "8px 16px", background: "#fff", border: "none", borderLeft: "1px solid #E5E7EB", cursor: "pointer" }}>+</button>
                    </div>
                    <button onClick={() => { addToCart(product, quantity); navigate("/rental/cart"); }} style={{ flex: 1, background: PRIMARY, color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>Add to Cart</button>
                 </div>
                 <p style={{ fontSize: "11px", color: "#9CA3AF", textAlign: "center", margin: 0 }}>University ID required for pickup.</p>
              </div>

              <div onClick={() => navigate(`/rental/supplier-details?email=${product.supplierEmail}`)} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                 <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "36px", height: "36px", background: "#EFF6FF", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>🏢</div>
                    <div>
                      <div style={{ fontWeight: "700", fontSize: "14px" }}>{product.supplierEmail}</div>
                      <div style={{ fontSize: "11px", color: "#16A34A", fontWeight: "600" }}>Verified Supplier</div>
                    </div>
                 </div>
                 <span style={{ color: PRIMARY, fontWeight: "700", fontSize: "12px" }}>View Profile ›</span>
              </div>
            </div>
          </div>

          <div style={{ maxWidth: "1100px", width: "100%", marginTop: "32px", display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "32px" }}>
             {/* Description */}
             <div>
                <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
                   <h2 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "16px" }}>Item Description</h2>
                   <p style={{ lineHeight: "1.6", color: "#4B5563" }}>{product.description}</p>
                </div>

                {/* Real Reviews */}
                <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "24px" }}>
                   <h2 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "24px" }}>Student Reviews</h2>
                   {reviews.length === 0 ? <p style={{ color: "#9CA3AF", textAlign: "center", padding: "20px" }}>No reviews for this product yet.</p> : reviews.map(r => (
                     <div key={r._id} style={{ borderBottom: "1px solid #F3F4F6", paddingBottom: "16px", marginBottom: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                           <span style={{ fontWeight: "700", color: PRIMARY, fontSize: "14px" }}>{r.studentEmail}</span>
                           <span style={{ color: "#9CA3AF", fontSize: "12px" }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div style={{ marginBottom: "8px" }}><Stars rating={r.rating} /></div>
                        <p style={{ margin: 0, fontSize: "14px", color: "#374151" }}>{r.comment}</p>
                     </div>
                   ))}
                </div>
             </div>

             {/* Post Review Form */}
             <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "24px", height: "fit-content", position: "sticky", top: "24px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "16px" }}>Post a Review</h2>
                <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "20px" }}>How was your experience with this item?</p>
                
                <div style={{ marginBottom: "20px" }}>
                   <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "8px" }}>RATING</label>
                   <Stars rating={newRating} interactive={true} onRate={setNewRating} size={24} />
                </div>

                <div style={{ marginBottom: "20px" }}>
                   <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "8px" }}>COMMENT</label>
                   <textarea 
                     value={newComment}
                     onChange={e => setNewComment(e.target.value)}
                     placeholder="Write your feedback here..."
                     style={{ width: "100%", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "8px", outline: "none", height: "120px", fontFamily: "inherit", resize: "none" }}
                   />
                </div>

                <button 
                  onClick={handlePostReview} 
                  disabled={isPosting} 
                  style={{ width: "100%", padding: "12px", background: PRIMARY, color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", opacity: isPosting ? 0.7 : 1 }}
                >
                  {isPosting ? "Posting..." : "Submit Review"}
                </button>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}



