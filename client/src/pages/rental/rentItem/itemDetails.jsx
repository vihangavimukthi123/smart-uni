// itemDetails.jsx
import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../../../context/CartContext";
import api from "../../../api/axios";
import toast from "react-hot-toast";
import { BiStar, BiSolidStar, BiPlus, BiMinus, BiArrowBack, BiShoppingBag, BiCheckShield, BiMessageSquareDetail, BiTimeFive, BiInfoCircle, BiTag, BiPackage, BiShieldQuarter } from "react-icons/bi";
import { useTheme } from "../../../context/ThemeContext";

const Stars = ({ rating, interactive = false, onRate, size = 16, darkMode }) => (
  <span style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
    {[1, 2, 3, 4, 5].map((i) => {
      const Icon = i <= rating ? BiSolidStar : BiStar;
      return (
        <Icon
          key={i}
          size={size}
          style={{ 
            color: i <= rating ? '#fbbf24' : (darkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
            cursor: interactive ? 'pointer' : 'default',
            transition: 'all 0.2s ease'
          }}
          onClick={() => interactive && onRate(i)}
        />
      );
    })}
  </span>
);

export default function ItemDetails() {
  const { darkMode } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const textPrimary = darkMode ? 'white' : '#0f172a';
  const textSecondary = '#64748b';
  const bgColor = darkMode ? '#0f172a' : 'white';
  const borderColor = darkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0';

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
      setNewRating(0);
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post review");
    } finally {
      setIsPosting(false);
    }
  };

  if (loading) return (
    <div className="flex-center py-40">
      <div style={{ width: '40px', height: '40px', border: '4px solid rgba(99, 102, 241, 0.1)', borderTop: '4px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );
  
  if (!product) return (
    <div className="page-wrapper flex-center py-40 flex-col gap-6" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '80px', height: '80px', backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BiInfoCircle size={40} style={{ color: textSecondary }} />
      </div>
      <h2 style={{ fontSize: '24px', fontWeight: '900', color: textPrimary }}>Asset Not Identified</h2>
      <Link to="/rental/items" style={{ padding: '12px 24px', borderRadius: '12px', backgroundColor: '#6366f1', color: 'white', fontWeight: '800', textDecoration: 'none' }}>Back to Inventory</Link>
    </div>
  );

  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1);

  return (
    <div className="page-wrapper pb-20 anim-fadeIn">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Link to="/rental/items" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: textSecondary, textDecoration: 'none', marginBottom: '40px' }} className="group">
          <BiArrowBack className="group-hover:-translate-x-1 transition-transform" />
          <span style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Back to Inventory</span>
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '64px', alignItems: 'flex-start' }}>
          {/* Left - Image Gallery */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ backgroundColor: bgColor, borderRadius: '32px', border: `1px solid ${borderColor}`, padding: '16px', boxShadow: darkMode ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
              <img 
                src={product.images?.[0] ? `/images/${product.images[0].split('/').pop()}` : "/images/placeholder.jpg"} 
                style={{ width: '100%', aspectRatio: '1.4 / 1', borderRadius: '20px', objectFit: 'cover' }} 
                alt={product.name} 
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {product.images?.slice(1, 5).map((img, i) => (
                <div key={i} style={{ backgroundColor: bgColor, borderRadius: '16px', border: `1px solid ${borderColor}`, padding: '8px', cursor: 'pointer', transition: 'all 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6366f1'} onMouseLeave={(e) => e.currentTarget.style.borderColor = borderColor}>
                  <img src={`/images/${img.split('/').pop()}`} style={{ width: '100%', aspectRatio: '1', borderRadius: '10px', objectFit: 'cover' }} alt="" />
                </div>
              ))}
            </div>
          </div>

          {/* Right - Basic Info & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{product.category || 'ASSET'}</span>
                {product.stock > 0 && (
                  <span style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>In Stock</span>
                )}
              </div>
              <h1 style={{ fontSize: '48px', fontWeight: '950', color: textPrimary, letterSpacing: '-0.03em', lineHeight: '1.1', margin: '0' }}>{product.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Stars rating={avgRating} size={20} darkMode={darkMode} />
                  <span style={{ fontSize: '15px', fontWeight: '900', color: textPrimary }}>{avgRating.toFixed(1)}</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.6 }}>({reviews.length} reviews)</span>
                </div>
              </div>
            </div>

            <div style={{ 
              backgroundColor: bgColor, borderRadius: '32px', border: `1px solid ${borderColor}`, padding: '40px',
              boxShadow: darkMode ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.02)',
              backgroundImage: 'linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, transparent 100%)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>Rental Rate</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '32px', fontWeight: '950', color: textPrimary, letterSpacing: '-0.02em' }}>LKR {Number(product.price).toLocaleString()}</span>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: textSecondary, textTransform: 'uppercase' }}>/ Day</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>Availability</p>
                  <p style={{ fontSize: '14px', fontWeight: '900', color: '#10b981', margin: '0' }}>{product.stock} Units Available</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '20px', overflow: 'hidden', minWidth: '140px' }}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '48px', border: 'none', background: 'transparent', cursor: 'pointer', color: textPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BiMinus size={20} /></button>
                  <span style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '900', color: textPrimary }}>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} style={{ width: '48px', border: 'none', background: 'transparent', cursor: 'pointer', color: textPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BiPlus size={20} /></button>
                </div>
                <button 
                  onClick={() => { addToCart(product, quantity); navigate("/rental/cart"); }} 
                  style={{ flex: 1, padding: '18px', borderRadius: '20px', border: 'none', backgroundColor: '#6366f1', color: 'white', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 15px 30px rgba(99, 102, 241, 0.2)', transition: 'all 0.3s ease' }}
                >
                  <BiShoppingBag size={22} />
                  <span>Secure for Event</span>
                </button>
              </div>
              <p style={{ fontSize: '9px', fontWeight: '800', color: textSecondary, textAlign: 'center', marginTop: '24px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
                Official University ID required upon equipment handover
              </p>
            </div>

            <div 
              onClick={() => navigate(`/rental/supplier-details?email=${product.supplierEmail}`)} 
              style={{ backgroundColor: bgColor, borderRadius: '24px', border: `1px solid ${borderColor}`, padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.3s ease' }}
              className="group"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(99, 102, 241, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontSize: '18px', fontWeight: '950' }}>
                  {product.supplierEmail?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '900', color: textPrimary }}>{product.supplierEmail}</div>
                  <div style={{ fontSize: '9px', fontWeight: '900', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <BiCheckShield size={14} /> Certified Supplier
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '900', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Profile ›</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '64px', marginTop: '80px' }}>
          {/* Details & Reviews */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '64px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '950', color: textPrimary, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '12px', margin: '0' }}>
                <BiInfoCircle style={{ color: '#6366f1' }} size={24} /> Specifications & Usage
              </h2>
              <div style={{ backgroundColor: bgColor, borderRadius: '24px', border: `1px solid ${borderColor}`, padding: '32px' }}>
                <p style={{ fontSize: '15px', color: textSecondary, fontWeight: '500', lineHeight: '1.8', margin: '0', whiteSpace: 'pre-wrap' }}>
                  {product.description}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '950', color: textPrimary, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '12px', margin: '0' }}>
                  <BiMessageSquareDetail style={{ color: '#6366f1' }} size={24} /> Student Testimonials
                </h2>
                <div style={{ padding: '6px 12px', borderRadius: '100px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', fontSize: '10px', fontWeight: '900' }}>{reviews.length} Feedbacks</div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {reviews.length === 0 ? (
                  <div style={{ backgroundColor: bgColor, borderRadius: '24px', border: `1px solid ${borderColor}`, padding: '48px', textAlign: 'center' }}>
                    <p style={{ fontSize: '14px', color: textSecondary, fontWeight: '700', fontStyle: 'italic', opacity: 0.5 }}>No peer reviews recorded for this asset yet.</p>
                  </div>
                ) : (
                  reviews.map(r => (
                    <div key={r._id} style={{ backgroundColor: bgColor, borderRadius: '24px', border: `1px solid ${borderColor}`, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '900', color: textSecondary }}>
                            {r.studentEmail?.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '13px', fontWeight: '900', color: textPrimary }}>{r.studentEmail}</span>
                            <div style={{ marginTop: '2px' }}><Stars rating={r.rating} size={12} darkMode={darkMode} /></div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: '900', color: textSecondary, opacity: 0.4 }}>
                          <BiTimeFive size={14} /> {new Date(r.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <p style={{ fontSize: '14px', color: textSecondary, fontWeight: '500', lineHeight: '1.6', fontStyle: 'italic', margin: '0' }}>"{r.comment}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Post Review Form */}
          <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '24px' }}>
            <div style={{ backgroundColor: bgColor, borderRadius: '32px', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px', boxShadow: '0 20px 40px rgba(99, 102, 241, 0.05)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '950', color: textPrimary, letterSpacing: '-0.02em', margin: '0' }}>Audit Asset Quality</h3>
                <p style={{ fontSize: '10px', fontWeight: '800', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>Share your experience with peers</p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Rating Integrity</label>
                <div style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: `1px solid ${borderColor}`, padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'center' }}>
                  <Stars rating={newRating} interactive={true} onRate={setNewRating} size={32} darkMode={darkMode} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Testimonial Detail</label>
                <textarea 
                  value={newComment} onChange={e => setNewComment(e.target.value)}
                  placeholder="Elaborate on equipment condition, delivery speed, and supplier professionalism..."
                  style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '20px', padding: '20px', fontSize: '14px', fontWeight: '500', color: textPrimary, outline: 'none', resize: 'none', minHeight: '140px' }}
                />
              </div>

              <button 
                onClick={handlePostReview} disabled={isPosting} 
                style={{ width: '100%', padding: '18px', borderRadius: '18px', border: 'none', backgroundColor: '#6366f1', color: 'white', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '0.2em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 15px 30px rgba(99, 102, 241, 0.2)', transition: 'all 0.3s ease' }}
              >
                {isPosting ? <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.2)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <BiMessageSquareDetail size={22} />}
                <span>Submit Audit</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
