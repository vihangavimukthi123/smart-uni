// supplierDetails.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { BiStar, BiSolidStar, BiCheckCircle, BiArrowBack, BiInfoCircle, BiMessageSquareDetail, BiPackage, BiCalendar, BiTimeFive } from "react-icons/bi";
import { useTheme } from "../../context/ThemeContext";

const StarIcon = ({ filled = true, onClick, size = 16, interactive = false, darkMode }) => {
  const Icon = filled ? BiSolidStar : BiStar;
  return (
    <Icon
      size={size}
      style={{ 
        color: filled ? '#fbbf24' : (darkMode ? 'rgba(255,255,255,0.2)' : '#cbd5e1'), 
        cursor: interactive ? 'pointer' : 'default',
        transition: 'all 0.2s ease'
      }}
      className={interactive ? "hover:scale-110" : ""}
      onClick={onClick}
    />
  );
};

const Stars = ({ rating, interactive = false, onRate, size = 16, darkMode }) => (
  <span className="inline-flex gap-1 items-center">
    {[1, 2, 3, 4, 5].map((i) => (
      <StarIcon
        key={i}
        size={size}
        interactive={interactive}
        onClick={() => interactive && onRate(i)}
        filled={i <= Math.floor(rating)}
        darkMode={darkMode}
      />
    ))}
  </span>
);

export default function SupplierDetails() {
  const { darkMode } = useTheme();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [data, setData] = useState({ supplier: null, products: [] });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("rental");

  const [newRating, setNewRating] = useState(0);
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
      <div className="w-10 h-10 border-4 border-indigo/20 border-t-indigo rounded-full animate-spin" />
    </div>
  );

  const { supplier, products } = data;
  if (!supplier) return (
    <div className="page-wrapper flex-center py-40 flex-col gap-6">
      <div className="w-20 h-20 bg-white/5 rounded-full flex-center">
        <BiInfoCircle size={40} className="text-muted" />
      </div>
      <h2 className="text-2xl font-black text-primary">Supplier Not Identified</h2>
      <Link to="/rental/suppliers" className="btn btn-secondary px-8">Back to Suppliers</Link>
    </div>
  );

  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1);

  return (
    <div className="page-wrapper pb-20 pt-10 anim-fadeIn">
      <div className="max-w-7xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        <Link to="/rental/suppliers" 
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            textDecoration: 'none', transition: 'all 0.2s ease', color: darkMode ? '#94a3b8' : '#64748b'
          }}
          className="group hover:opacity-80"
        >
          <BiArrowBack className="text-lg group-hover:-translate-x-1 transition-transform" />
          <span style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Back to Partners</span>
        </Link>

        {/* Profile Hero Section */}
        <section style={{ 
          position: 'relative', 
          padding: '60px', 
          background: darkMode ? 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
          borderRadius: '48px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          gap: '64px',
          border: darkMode ? '1px solid rgba(255,255,255,0.05)' : 'none',
          boxShadow: darkMode ? '0 40px 100px -20px rgba(0,0,0,0.5)' : '0 40px 100px -20px rgba(99, 102, 241, 0.3)'
        }}>
          <div style={{ flexShrink: 0, position: 'relative', zIndex: 2 }}>
            <div style={{ width: '160px', height: '160px', borderRadius: '40px', backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '32px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {supplier.profileImage ? (
                  <img src={supplier.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ fontSize: '48px', fontWeight: '950', color: 'white', textTransform: 'uppercase' }}>{supplier.firstName?.charAt(0)}{supplier.lastName?.charAt(0)}</div>
                )}
              </div>
              {supplier.isVerified && (
                <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', backgroundColor: 'white', borderRadius: '50%', padding: '6px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BiCheckCircle size={28} color="#10b981" />
                </div>
              )}
            </div>
          </div>

          <div style={{ flex: 1, position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '8px 16px', borderRadius: '100px', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '0.2em', backdropFilter: 'blur(10px)' }}>
                  Certified Partner
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Stars rating={avgRating} size={16} darkMode={darkMode} />
                  <span style={{ fontSize: '13px', fontWeight: '800', color: 'white', marginLeft: '4px' }}>{avgRating.toFixed(1)}</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>({reviews.length} Feedbacks)</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: '950', color: 'white', letterSpacing: '-0.04em', lineHeight: '1', margin: 0 }}>
                  {supplier.firstName} {supplier.lastName}
                </h1>
                <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)', fontWeight: '500', lineHeight: '1.6', maxWidth: '700px', margin: 0 }}>
                  {supplier.description || "A trusted university event equipment provider, committed to delivering high-quality assets and seamless logistics for campus scale operations."}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <BiPackage size={18} /> {products.length} Products
                </div>
                <div style={{ width: '1px', height: '12px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <BiCalendar size={18} /> Active since {new Date(supplier.createdAt || Date.now()).getFullYear()}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs & Content Container */}
        <div style={{ backgroundColor: darkMode ? '#0f172a' : 'white', borderRadius: '32px', border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9', padding: '0 40px', backgroundColor: darkMode ? 'rgba(255,255,255,0.01)' : '#fafafa' }}>
            {[
              { id: "rental", label: "Inventory Catalog", icon: <BiPackage size={20} />, count: products.length },
              { id: "reviews", label: "Peer Reviews", icon: <BiMessageSquareDetail size={20} />, count: reviews.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{ 
                  padding: '24px 32px', 
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
                  color: activeTab === tab.id ? '#2563eb' : (darkMode ? '#94a3b8' : '#64748b'),
                  fontSize: '11px',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                className="group"
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span style={{ 
                  fontSize: '10px', 
                  padding: '2px 8px', 
                  borderRadius: '6px', 
                  backgroundColor: activeTab === tab.id ? 'rgba(37, 99, 235, 0.1)' : (darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9'),
                  color: activeTab === tab.id ? '#2563eb' : '#64748b',
                  fontWeight: '800'
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div style={{ padding: '40px' }}>
            {activeTab === "rental" ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px' }}>
                {products.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', padding: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', opacity: 0.5 }}>
                    <BiPackage size={64} color={darkMode ? '#94a3b8' : '#64748b'} />
                    <p style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>No products listed by this partner</p>
                  </div>
                ) : (
                  products.map(p => (
                    <div key={p.productID} style={{ 
                      backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : 'white', 
                      borderRadius: '24px', 
                      padding: '24px', 
                      border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)'
                    }} className="group hover:shadow-2xl">
                      <div style={{ aspectRatio: '4/3', borderRadius: '16px', overflow: 'hidden', border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9' }}>
                        <img src={p.images?.[0]} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s ease' }} className="group-hover:scale-110" alt="" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '950', color: darkMode ? 'white' : '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '900', color: '#2563eb' }}>LKR</span>
                          <span style={{ fontSize: '20px', fontWeight: '950', color: darkMode ? 'white' : '#0f172a', letterSpacing: '-0.02em' }}>{p.price?.toLocaleString()}</span>
                          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', marginLeft: '4px' }}>/ day</span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/rental/items/${p.productID}`)}
                        style={{ 
                          width: '100%', padding: '12px', borderRadius: '12px', 
                          backgroundColor: '#2563eb', border: 'none',
                          color: 'white', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.2s ease',
                          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                        }}
                        className="hover:scale-[1.03] active:scale-[0.97]"
                      >
                        View
                      </button>
                    </div>
                  )))}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '64px', alignItems: 'start' }}>
                {/* Review Form */}
                <div style={{ position: 'sticky', top: '100px' }}>
                  <div style={{ backgroundColor: darkMode ? '#0f172a' : 'white', borderRadius: '32px', padding: '40px', border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <h3 style={{ fontSize: '24px', fontWeight: '950', color: darkMode ? 'white' : '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Post Peer Review</h3>
                      <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Evaluate partner professionalism</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <label style={{ fontSize: '10px', fontWeight: '950', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Service Rating</label>
                      <div style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderRadius: '20px', padding: '24px', border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0', display: 'flex', justifyContent: 'center' }}>
                        <Stars rating={newRating} interactive={true} onRate={setNewRating} size={32} darkMode={darkMode} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <label style={{ fontSize: '10px', fontWeight: '950', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Testimonial</label>
                      <textarea
                        style={{ 
                          width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderRadius: '20px', padding: '24px', 
                          border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0',
                          color: darkMode ? 'white' : '#0f172a', fontSize: '14px', fontWeight: '500', minHeight: '160px', resize: 'none', outline: 'none'
                        }}
                        className="focus:border-blue-500 transition-all"
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Discuss equipment condition, delivery reliability, and overall partnership quality..."
                      />
                    </div>

                    <button
                      onClick={handlePostReview}
                      disabled={isPosting}
                      style={{ 
                        width: '100%', padding: '18px', borderRadius: '16px', 
                        backgroundColor: '#2563eb', color: 'white', border: 'none', 
                        fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '0.2em', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)'
                      }}
                      className="hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      {isPosting ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <BiMessageSquareDetail size={20} />
                          <span>Submit Evaluation</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Review List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '950', color: darkMode ? 'white' : '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <BiMessageSquareDetail className="text-blue-600" size={24} /> Partner Testimonials
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {reviews.length === 0 ? (
                      <div style={{ padding: '80px', textAlign: 'center', border: darkMode ? '2px dashed rgba(255,255,255,0.05)' : '2px dashed #f1f5f9', borderRadius: '32px', opacity: 0.5 }}>
                        <BiMessageSquareDetail size={48} style={{ margin: '0 auto 16px' }} />
                        <p style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>No reviews identified yet</p>
                      </div>
                    ) : (
                      reviews.map(r => (
                        <div key={r._id} style={{ 
                          backgroundColor: darkMode ? '#0f172a' : 'white', borderRadius: '24px', padding: '32px', 
                          border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0',
                          display: 'flex', flexDirection: 'column', gap: '20px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '950', color: '#64748b' }}>
                                {r.studentEmail?.charAt(0).toUpperCase()}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '14px', fontWeight: '900', color: darkMode ? 'white' : '#0f172a' }}>{r.studentEmail}</span>
                                <Stars rating={r.rating} size={14} darkMode={darkMode} />
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                              <BiTimeFive size={14} /> {new Date(r.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <p style={{ fontSize: '15px', color: darkMode ? '#94a3b8' : '#475569', fontWeight: '500', lineHeight: '1.7', margin: 0, fontStyle: 'italic', paddingLeft: '64px' }}>
                            "{r.comment}"
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
