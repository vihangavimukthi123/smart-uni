// PackagesBrowsePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../../api/axios";
import toast from "react-hot-toast";
import { BiPackage, BiCalendar, BiCartAdd, BiArrowBack } from "react-icons/bi";
import { useTheme } from "../../../context/ThemeContext";
import { useCart } from "../../../context/CartContext";

export default function PackagesBrowsePage() {
  const { darkMode } = useTheme();
  const { clearCart, addToCart } = useCart();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState({
    pickup: "",
    return: ""
  });
  const navigate = useNavigate();

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const params = dates.pickup && dates.return ? `?pickup=${dates.pickup}&return=${dates.return}` : "";
      const response = await api.get(`/rental/packages${params}`);
      setPackages(response.data.data);
    } catch (error) {
      toast.error("Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [dates]);

  const handleBook = (pkg) => {
    clearCart();
    pkg.items.forEach(item => {
      // Mapping bundle item structure to cart item structure expected by addToCart
      addToCart({
        productID: item.productId,
        name: item.productName || item.productId,
        price: item.unitPrice || 0, // Original price, discount will be applied in preview
        image: item.image,
        supplierEmail: item.supplierEmail
      }, item.quantity);
    });
    navigate("/rental/checkout", { 
      state: { 
        appliedPackageId: pkg.packageId,
        pickupDate: dates.pickup,
        returnDate: dates.return
      } 
    });
  };

  return (
    <div className="page-wrapper pb-20 anim-fadeIn">
      <Link to="/rental/items" 
        style={{ 
          display: 'flex', alignItems: 'center', gap: '8px', 
          padding: '0 0 24px 0', width: 'fit-content',
          textDecoration: 'none', transition: 'all 0.2s ease', color: darkMode ? '#94a3b8' : '#64748b'
        }}
        className="group hover:opacity-80"
      >
        <BiArrowBack className="text-lg group-hover:-translate-x-1 transition-transform" />
        <span style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Back to Registry</span>
      </Link>

      <div className="flex flex-col gap-10 mb-16">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '32px', flexWrap: 'wrap' }}>
          <div className="flex flex-col gap-1">
            <h1 style={{ fontSize: '40px', fontWeight: '900', letterSpacing: '-0.02em', lineHeight: '1.1', color: darkMode ? 'white' : '#0f172a' }}>Hardware Bundles</h1>
            <p style={{ color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Curated equipment sets optimized for university-scale performance</p>
          </div>
          
          <div style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : 'white', backdropFilter: 'blur(15px)', display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: '40px', padding: '24px 32px', borderRadius: '24px', border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0', boxShadow: '0 15px 35px rgba(0,0,0,0.03)' }}>
            <div className="flex items-center gap-4">
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                <BiCalendar size={20} />
              </div>
              <div className="space-y-1">
                <label style={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#64748b' }}>Event Pickup</label>
                <input 
                  type="date" 
                  style={{ backgroundColor: 'transparent', border: 'none', color: darkMode ? 'white' : '#0f172a', fontWeight: '900', fontSize: '14px', outline: 'none', cursor: 'pointer', padding: '0', textTransform: 'uppercase', display: 'block' }} 
                  value={dates.pickup} 
                  onChange={(e) => setDates(prev => ({ ...prev, pickup: e.target.value }))}
                />
              </div>
            </div>
            <div style={{ display: 'block', height: '32px', width: '1px', backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }} />
            <div className="flex items-center gap-4">
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                <BiCalendar size={20} />
              </div>
              <div className="space-y-1">
                <label style={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#64748b' }}>Event Return</label>
                <input 
                  type="date" 
                  style={{ backgroundColor: 'transparent', border: 'none', color: darkMode ? 'white' : '#0f172a', fontWeight: '900', fontSize: '14px', outline: 'none', cursor: 'pointer', padding: '0', textTransform: 'uppercase', display: 'block' }} 
                  value={dates.return} 
                  onChange={(e) => setDates(prev => ({ ...prev, return: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-center py-40">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-indigo/20 border-t-indigo rounded-full animate-spin" />
            <p className="text-muted font-bold tracking-widest uppercase text-[10px]">Synchronizing Availability...</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '40px' }}>
          {packages.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '100px 0', textAlign: 'center', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderRadius: '32px', border: darkMode ? '2px dashed rgba(255,255,255,0.05)' : '2px dashed #e2e8f0' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: darkMode ? 'rgba(37, 99, 235, 0.1)' : '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#2563eb' }}>
                <BiPackage size={40} />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '900', color: darkMode ? 'white' : '#0f172a' }}>No Bundles Identified</h3>
              <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', maxWidth: '400px', margin: '12px auto 0' }}>We couldn't find any packages matching these specific dates. Try adjusting your event schedule.</p>
            </div>
          ) : (
            packages.map((pkg) => (
              <div 
                key={pkg.packageId} 
                style={{ 
                  backgroundColor: darkMode ? '#0f172a' : 'white', 
                  borderRadius: '32px', 
                  padding: '40px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '32px', 
                  border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0',
                  boxShadow: darkMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 20px 40px -10px rgba(0, 0, 0, 0.05)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', top: '0', right: '0', width: '150px', height: '150px', background: darkMode ? 'radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h3 style={{ fontSize: '28px', fontWeight: '900', color: darkMode ? 'white' : '#0f172a', letterSpacing: '-0.03em', lineHeight: '1.1' }}>{pkg.packageName}</h3>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>ID: #{pkg.packageId}</span>
                  </div>
                  <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '8px 16px', borderRadius: '100px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <span style={{ color: '#10b981', fontWeight: '900', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                      {pkg.discountType === 'percentage' ? `${pkg.discountValue}% SAVING` : `LKR ${pkg.discountValue.toLocaleString()} OFF`}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '15px', color: darkMode ? '#94a3b8' : '#64748b', lineHeight: '1.6', fontWeight: '500', margin: '0' }}>
                  {pkg.description || "A professional-grade hardware bundle optimized for university-scale event performance and reliability."}
                </p>

                <div style={{ height: '1px', backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9', width: '100%' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Market Price</span>
                    <span style={{ fontSize: '15px', color: darkMode ? '#475569' : '#94a3b8', fontWeight: '700', textDecoration: 'line-through' }}>LKR {pkg.originalPrice?.toLocaleString()}</span>
                  </div>
                  <div style={{ width: '1px', height: '40px', backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bundle Price</span>
                    <span style={{ fontSize: '28px', fontWeight: '950', color: darkMode ? 'white' : '#0f172a', letterSpacing: '-0.02em' }}>LKR {pkg.finalPrice?.toLocaleString()}</span>
                  </div>
                </div>

                <div style={{ flex: '1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Bundle Contents</h4>
                    <span style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '900' }}>{pkg.items.length} Assets</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {pkg.items.slice(0, 4).map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', padding: '14px 16px', borderRadius: '16px', border: darkMode ? '1px solid rgba(255,255,255,0.03)' : '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: darkMode ? '#e2e8f0' : '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{item.productName || item.productId}</span>
                        <span style={{ fontSize: '11px', fontWeight: '900', color: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>x{item.quantity}</span>
                      </div>
                    ))}
                    {pkg.items.length > 4 && (
                      <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: '700', color: '#64748b', marginTop: '8px' }}>+ {pkg.items.length - 4} MORE ASSETS</div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', padding: '12px 16px', borderRadius: '14px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Stock Status</span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      {pkg.availability === null ? (
                        <span style={{ fontSize: '11px', fontWeight: '900', color: '#f59e0b' }}>SELECT DATES</span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: pkg.availability > 0 ? '#10b981' : '#f43f5e', boxShadow: pkg.availability > 0 ? '0 0 8px #10b981' : 'none' }} />
                          <span style={{ fontSize: '11px', fontWeight: '900', color: pkg.availability > 0 ? '#10b981' : '#f43f5e' }}>{pkg.availability > 0 ? `${pkg.availability} UNITS READY` : 'DEPLETED'}</span>
                        </div>
                      )}
                      {dates.pickup && dates.return && (
                        <span style={{ fontSize: '9px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {new Date(dates.pickup).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(dates.return).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => handleBook(pkg)}
                    disabled={pkg.availability === 0}
                    style={{ 
                      width: '100%', padding: '18px', borderRadius: '16px', 
                      backgroundColor: pkg.availability === 0 ? (darkMode ? '#1e293b' : '#f1f5f9') : '#2563eb', 
                      color: pkg.availability === 0 ? '#64748b' : 'white', 
                      fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', 
                      letterSpacing: '0.15em', border: 'none', 
                      cursor: pkg.availability === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                      boxShadow: pkg.availability === 0 ? 'none' : '0 10px 25px rgba(37, 99, 235, 0.2)'
                    }}
                  >
                    <BiCartAdd size={24} />
                    {pkg.availability === 0 ? 'Depleted' : 'Secure Bundle'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
