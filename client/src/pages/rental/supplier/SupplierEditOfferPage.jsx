// SupplierEditOfferPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import api from "../../../api/axios";
import toast from "react-hot-toast";
import { BiSave, BiArrowBack, BiGift, BiTag, BiCalendar, BiAlignLeft, BiTrendingUp, BiRefresh, BiTargetLock, BiTime } from "react-icons/bi";
import { useTheme } from "../../../context/ThemeContext";

export default function SupplierEditOfferPage() {
  const { darkMode } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    offerType: "PACKAGE_DISCOUNT",
    targetId: "",
    discountType: "percentage",
    discountValue: 0,
    startDate: "",
    endDate: "",
    isActive: true
  });

  const [targets, setTargets] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true);
        
        let offerData;
        if (location.state) {
          offerData = { ...location.state };
          if (offerData.startDate) offerData.startDate = new Date(offerData.startDate).toISOString().split('T')[0];
          if (offerData.endDate) offerData.endDate = new Date(offerData.endDate).toISOString().split('T')[0];
          setFormData(offerData);
        } else {
          const res = await api.get(`/rental/offers/${id}`);
          offerData = res.data.data;
          if (offerData.startDate) offerData.startDate = new Date(offerData.startDate).toISOString().split('T')[0];
          if (offerData.endDate) offerData.endDate = new Date(offerData.endDate).toISOString().split('T')[0];
          setFormData(offerData);
        }

        if (offerData.offerType === "PACKAGE_DISCOUNT") {
          const pkgRes = await api.get("/rental/packages/supplier");
          setTargets(pkgRes.data.data);
        } else if (offerData.offerType === "ITEM_DISCOUNT") {
          const prodRes = await api.get("/rental/products");
          setTargets(prodRes.data);
        }
      } catch (err) {
        toast.error("Failed to load offer details");
        navigate("/supplier/offers");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, [id, location.state, navigate]);

  useEffect(() => {
    if (initialLoading) return;
    if (formData.offerType === "PACKAGE_DISCOUNT") {
      api.get("/rental/packages/supplier").then(res => setTargets(res.data.data)).catch(() => toast.error("Failed to load packages"));
    } else if (formData.offerType === "ITEM_DISCOUNT") {
      api.get("/rental/products").then(res => setTargets(res.data)).catch(() => toast.error("Failed to load products"));
    } else {
      setTargets([]);
    }
  }, [formData.offerType, initialLoading]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.offerType !== "ORDER_DISCOUNT" && !formData.targetId) {
      return toast.error("Please select a target for this offer");
    }

    try {
      setLoading(true);
      await api.put(`/rental/offers/${id}`, formData);
      toast.success("Offer updated successfully");
      navigate("/supplier/offers");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update offer");
    } finally {
      setLoading(false);
    }
  };

  const textPrimary = darkMode ? 'white' : '#0f172a';
  const textSecondary = '#64748b';
  const bgColor = darkMode ? '#0f172a' : 'white';
  const borderColor = darkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0';

  if (initialLoading) {
    return (
      <div className="flex-center py-40">
        <div style={{ width: '40px', height: '40px', border: '4px solid rgba(168, 85, 247, 0.1)', borderTop: '4px solid #a855f7', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="page-wrapper pb-20 anim-fadeIn">
      {/* Navigation Header */}
      <div style={{ marginBottom: '48px' }}>
        <Link to="/supplier/offers" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: textSecondary, textDecoration: 'none', marginBottom: '24px' }} className="group">
          <BiArrowBack className="group-hover:-translate-x-1 transition-transform" />
          <span style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Back to Promotions</span>
        </Link>
        <h1 style={{ fontSize: '36px', fontWeight: '900', color: textPrimary, letterSpacing: '-0.02em', marginBottom: '8px' }}>Edit Special Offer</h1>
        <p style={{ color: textSecondary, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Syncing specifications for <span style={{ color: '#a855f7' }}>#{id}</span>
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1000px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Promotion Strategy Section */}
          <div style={{ 
            backgroundColor: bgColor, borderRadius: '32px', border: `1px solid ${borderColor}`, overflow: 'hidden',
            boxShadow: darkMode ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.02)'
          }}>
            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: 'rgba(168, 85, 247, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                  <BiGift size={24} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '900', color: textPrimary }}>Promotion Strategy</h3>
                  <span style={{ fontSize: '9px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Core offer details & targeting</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Offer Title</label>
                  <div style={{ position: 'relative' }}>
                    <BiGift style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: textSecondary, opacity: '0.5' }} size={18} />
                    <input
                      type="text" name="title" value={formData.title} onChange={handleChange}
                      placeholder="e.g. Summer Flash Sale"
                      style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '16px 20px 16px 52px', color: textPrimary, fontSize: '14px', fontWeight: '800', outline: 'none' }}
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Promotional Scope</label>
                  <div style={{ position: 'relative' }}>
                    <BiTrendingUp style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: textSecondary, opacity: '0.5' }} size={18} />
                    <select 
                      name="offerType" value={formData.offerType} onChange={handleChange} 
                      style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '16px 20px 16px 52px', color: textPrimary, fontSize: '14px', fontWeight: '800', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="PACKAGE_DISCOUNT">Specific Rental Package</option>
                      <option value="ITEM_DISCOUNT">Specific Hardware Product</option>
                      <option value="ORDER_DISCOUNT">Global Order Discount</option>
                    </select>
                  </div>
                </div>
              </div>

              {formData.offerType !== "ORDER_DISCOUNT" && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} className="anim-slideUp">
                  <label style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>
                    Target {formData.offerType === "PACKAGE_DISCOUNT" ? "Bundle" : "Component"}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <BiTargetLock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: textSecondary, opacity: '0.5' }} size={18} />
                    <select 
                      name="targetId" value={formData.targetId} onChange={handleChange} 
                      style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '16px 20px 16px 52px', color: textPrimary, fontSize: '14px', fontWeight: '800', outline: 'none', cursor: 'pointer' }}
                      required
                    >
                      <option value="">Select target...</option>
                      {targets.map(t => (
                        <option key={t.packageId || t.productID} value={t.packageId || t.productID}>
                          {t.packageName || t.name} — (#{t.packageId || t.productID})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Schedule Section */}
          <div style={{ 
            backgroundColor: bgColor, borderRadius: '32px', border: `1px solid ${borderColor}`, padding: '40px',
            boxShadow: darkMode ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: 'rgba(99, 102, 241, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                <BiCalendar size={24} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '900', color: textPrimary }}>Pricing & Schedule</h3>
                <span style={{ fontSize: '9px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Financial configuration & duration</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Discount Configuration</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <select 
                    name="discountType" value={formData.discountType} onChange={handleChange} 
                    style={{ width: '120px', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '16px', color: textPrimary, fontSize: '12px', fontWeight: '900', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="percentage">% Ratio</option>
                    <option value="fixed">Fixed LKR</option>
                  </select>
                  <input
                    type="number" name="discountValue" value={formData.discountValue} onChange={handleChange}
                    placeholder="Amount"
                    style={{ flex: 1, backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '16px 20px', color: textPrimary, fontSize: '14px', fontWeight: '800', outline: 'none' }}
                    required min="0"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Validity Window</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <BiTime style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: textSecondary, opacity: '0.5' }} size={16} />
                    <input
                      type="date" name="startDate" value={formData.startDate} onChange={handleChange}
                      style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '14px 14px 14px 40px', color: textPrimary, fontSize: '11px', fontWeight: '800', outline: 'none', textTransform: 'uppercase' }}
                      required
                    />
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: '950', color: textSecondary, opacity: '0.3' }}>TO</span>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <BiTime style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: textSecondary, opacity: '0.5' }} size={16} />
                    <input
                      type="date" name="endDate" value={formData.endDate} onChange={handleChange}
                      style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '14px 14px 14px 40px', color: textPrimary, fontSize: '11px', fontWeight: '800', outline: 'none', textTransform: 'uppercase' }}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Offer Description</label>
              <div style={{ position: 'relative' }}>
                <BiAlignLeft style={{ position: 'absolute', left: '16px', top: '20px', color: textSecondary, opacity: '0.5' }} size={18} />
                <textarea
                  name="description" value={formData.description} onChange={handleChange}
                  placeholder="Highlight terms..."
                  style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '20px', padding: '20px 20px 20px 52px', color: textPrimary, fontSize: '14px', fontWeight: '600', minHeight: '140px', lineHeight: '1.6', outline: 'none', resize: 'none' }}
                  required
                />
              </div>
            </div>

            {/* Visibility & Actions */}
            <div style={{ pt: '40px', borderTop: `1px solid ${borderColor}`, marginTop: '40px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
               <label style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : '#f1f5f9', padding: '14px 24px', borderRadius: '100px', cursor: 'pointer', border: `1px solid ${borderColor}` }} className="group">
                <div style={{ position: 'relative', width: '44px', height: '24px' }}>
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} style={{ opacity: 0, width: 0, height: 0 }} />
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: formData.isActive ? '#a855f7' : 'rgba(0,0,0,0.1)', borderRadius: '24px', transition: 'all 0.4s' }} />
                  <div style={{ position: 'absolute', left: formData.isActive ? '22px' : '4px', top: '4px', width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%', transition: 'all 0.4s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: '950', color: textPrimary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Immediately Active</span>
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Link 
                  to="/supplier/offers" 
                  style={{ color: textSecondary, textDecoration: 'none', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '14px 24px', borderRadius: '16px', border: `1px solid ${borderColor}` }}
                >
                  Discard Changes
                </Link>
                <button 
                  type="submit" disabled={loading}
                  style={{ 
                    backgroundColor: '#a855f7', color: 'white', padding: '16px 40px', borderRadius: '18px', 
                    fontWeight: '950', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '12px',
                    cursor: 'pointer', border: 'none', boxShadow: '0 10px 20px rgba(168, 85, 247, 0.2)', transition: 'all 0.3s ease',
                    textTransform: 'uppercase', letterSpacing: '0.1em', background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)'
                  }}
                >
                  {loading ? <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.2)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <BiRefresh size={22} />}
                  <span>Synchronize Updates</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
