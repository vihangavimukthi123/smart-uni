// SupplierAddPackagePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../../api/axios";
import toast from "react-hot-toast";
import { BiSave, BiArrowBack, BiPlus, BiTrash, BiPackage, BiTag, BiMoney, BiAlignLeft, BiChevronDown, BiCheckShield, BiCollection } from "react-icons/bi";
import { useTheme } from "../../../context/ThemeContext";

export default function SupplierAddPackagePage() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    packageName: "",
    description: "",
    items: [{ productId: "", quantity: 1 }],
    discountType: "percentage",
    discountValue: 0,
    totalPrice: "",
    isActive: true
  });

  useEffect(() => {
    api.get("/rental/products")
      .then(res => setProducts(res.data))
      .catch(() => toast.error("Failed to load products"));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: "", quantity: 1 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return;
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.some(item => !item.productId)) {
      return toast.error("Please select a product for all items");
    }

    try {
      setLoading(true);
      const packageId = `PKG-${Date.now().toString().slice(-6)}`;
      await api.post("/rental/packages", { ...formData, packageId });
      toast.success("Package created successfully");
      navigate("/supplier/packages");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create package");
    } finally {
      setLoading(false);
    }
  };

  const textPrimary = darkMode ? 'white' : '#0f172a';
  const textSecondary = '#64748b';
  const bgColor = darkMode ? '#0f172a' : 'white';
  const borderColor = darkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0';

  return (
    <div className="page-wrapper pb-20 anim-fadeIn">
      {/* Navigation Header */}
      <div style={{ marginBottom: '48px' }}>
        <Link to="/supplier/packages" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: textSecondary, textDecoration: 'none', marginBottom: '24px' }} className="group">
          <BiArrowBack className="group-hover:-translate-x-1 transition-transform" />
          <span style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Back to Collection</span>
        </Link>
        <h1 style={{ fontSize: '36px', fontWeight: '900', color: textPrimary, letterSpacing: '-0.02em', marginBottom: '8px' }}>Create Rental Bundle</h1>
        <p style={{ color: textSecondary, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Combine products into strategic packages with professional descriptions
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1000px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Bundle Configuration Section */}
          <div style={{ 
            backgroundColor: bgColor, borderRadius: '32px', border: `1px solid ${borderColor}`, overflow: 'hidden',
            boxShadow: darkMode ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.02)'
          }}>
            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: 'rgba(99, 102, 241, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                  <BiPackage size={24} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '900', color: textPrimary }}>Bundle Configuration</h3>
                  <span style={{ fontSize: '9px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Basic identification & pricing strategy</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Package Identity</label>
                  <div style={{ position: 'relative' }}>
                    <BiPackage style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: textSecondary, opacity: '0.5' }} size={18} />
                    <input
                      type="text" name="packageName" value={formData.packageName} onChange={handleChange}
                      placeholder="e.g. Audio-Visual Power Setup"
                      style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '16px 20px 16px 52px', color: textPrimary, fontSize: '14px', fontWeight: '800', outline: 'none' }}
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Promotional Strategy</label>
                  <div style={{ position: 'relative' }}>
                    <BiTag style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: textSecondary, opacity: '0.5' }} size={18} />
                    <select 
                      name="discountType" value={formData.discountType} onChange={handleChange} 
                      style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '16px 20px 16px 52px', color: textPrimary, fontSize: '14px', fontWeight: '800', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="percentage">Percentage Off (%)</option>
                      <option value="fixed">Fixed Price Reduction (LKR)</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Discount Magnitude</label>
                  <div style={{ position: 'relative' }}>
                    <BiMoney style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#10b981' }} size={18} />
                    <input
                      type="number" name="discountValue" value={formData.discountValue} onChange={handleChange}
                      style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '16px 20px 16px 52px', color: textPrimary, fontSize: '14px', fontWeight: '800', outline: 'none' }}
                      required min="0"
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '10px', fontWeight: '900', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Fixed Total Override</label>
                  <div style={{ position: 'relative' }}>
                    <BiMoney style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6366f1', opacity: '0.5' }} size={18} />
                    <input
                      type="number" name="totalPrice" value={formData.totalPrice} onChange={handleChange}
                      placeholder="Calculated automatically if blank"
                      style={{ width: '100%', backgroundColor: 'rgba(99, 102, 241, 0.03)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '16px', padding: '16px 20px 16px 52px', color: textPrimary, fontSize: '14px', fontWeight: '900', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Marketing Description</label>
                <div style={{ position: 'relative' }}>
                  <BiAlignLeft style={{ position: 'absolute', left: '16px', top: '20px', color: textSecondary, opacity: '0.5' }} size={18} />
                  <textarea
                    name="description" value={formData.description} onChange={handleChange}
                    placeholder="Provide a compelling overview for potential renters..."
                    style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '20px', padding: '20px 20px 20px 52px', color: textPrimary, fontSize: '14px', fontWeight: '600', minHeight: '140px', lineHeight: '1.6', outline: 'none', resize: 'none' }}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bundle Inventory Section */}
          <div style={{ 
            backgroundColor: bgColor, borderRadius: '32px', border: `1px solid ${borderColor}`, padding: '40px',
            boxShadow: darkMode ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: 'rgba(168, 85, 247, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                  <BiCollection size={24} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '900', color: textPrimary }}>Bundle Inventory</h3>
                  <span style={{ fontSize: '9px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Component list for this curated set</span>
                </div>
              </div>
              <button 
                type="button" onClick={addItem} 
                style={{ backgroundColor: 'transparent', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '12px', padding: '10px 20px', fontSize: '10px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textTransform: 'uppercase' }}
              >
                <BiPlus size={18} /> 
                <span>Add Selection</span>
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formData.items.map((item, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 60px', gap: '16px', alignItems: 'flex-end', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', padding: '24px', borderRadius: '24px', border: `1px solid ${borderColor}` }} className="anim-slideUp">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '9px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Select Product</label>
                    <select 
                      value={item.productId} onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                      style={{ width: '100%', backgroundColor: bgColor, border: `1px solid ${borderColor}`, borderRadius: '14px', padding: '12px 16px', color: textPrimary, fontSize: '14px', fontWeight: '800', outline: 'none', cursor: 'pointer' }}
                      required
                    >
                      <option value="">Choose from inventory...</option>
                      {products.map(p => (
                        <option key={p.productID} value={p.productID}>{p.name} (#{p.productID})</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '9px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Quantity</label>
                    <input
                      type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value))}
                      style={{ width: '100%', backgroundColor: bgColor, border: `1px solid ${borderColor}`, borderRadius: '14px', padding: '12px 16px', color: textPrimary, fontSize: '14px', fontWeight: '800', outline: 'none' }}
                      required
                    />
                  </div>
                  <button 
                    type="button" onClick={() => removeItem(index)} disabled={formData.items.length === 1}
                    style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: 'rgba(244, 63, 94, 0.05)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: formData.items.length === 1 ? 'not-allowed' : 'pointer', opacity: formData.items.length === 1 ? 0.3 : 1, transition: 'all 0.3s ease' }}
                  >
                    <BiTrash size={22} />
                  </button>
                </div>
              ))}
            </div>

            {/* Visibility & Actions */}
            <div style={{ pt: '40px', borderTop: `1px solid ${borderColor}`, marginTop: '40px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : '#f1f5f9', padding: '14px 24px', borderRadius: '100px', cursor: 'pointer', border: `1px solid ${borderColor}` }} className="group">
                <div style={{ position: 'relative', width: '44px', height: '24px' }}>
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} style={{ opacity: 0, width: 0, height: 0 }} />
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: formData.isActive ? '#6366f1' : 'rgba(0,0,0,0.1)', borderRadius: '24px', transition: 'all 0.4s' }} />
                  <div style={{ position: 'absolute', left: formData.isActive ? '22px' : '4px', top: '4px', width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%', transition: 'all 0.4s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: '950', color: textPrimary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live Market Visibility</span>
              </label>

              <button 
                type="submit" disabled={loading}
                style={{ 
                  backgroundColor: '#2563eb', color: 'white', padding: '16px 40px', borderRadius: '18px', 
                  fontWeight: '950', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '12px',
                  cursor: 'pointer', border: 'none', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)', transition: 'all 0.3s ease',
                  textTransform: 'uppercase', letterSpacing: '0.1em'
                }}
              >
                {loading ? <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.2)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <BiSave size={22} />}
                <span>Finish & Deploy Bundle</span>
              </button>
            </div>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
