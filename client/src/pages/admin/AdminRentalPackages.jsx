// AdminRentalPackages.jsx
import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { BiSearch, BiPackage, BiUserCircle, BiCheckCircle, BiXCircle, BiTrendingUp, BiDollar, BiBuildings } from "react-icons/bi";
import { useTheme } from "../../context/ThemeContext";

export default function AdminRentalPackages() {
  const { darkMode } = useTheme();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPackages();
  }, []);

  async function fetchPackages() {
    try {
      const res = await api.get("/rental/packages/admin");
      setPackages(res.data.data);
    } catch (err) {
      toast.error("Failed to load packages");
    } finally {
      setLoading(false);
    }
  }

  const filteredPackages = packages.filter(p => 
    p.packageName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.packageId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.supplierName && p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const textPrimary = darkMode ? 'white' : '#0f172a';
  const textSecondary = '#64748b';
  const bgColor = darkMode ? '#0f172a' : 'white';
  const borderColor = darkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0';

  if (loading) return (
    <div style={{ padding: "100px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid rgba(37, 99, 235, 0.1)', borderTop: '4px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: textSecondary, fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Aggregating Global Data...</p>
    </div>
  );

  return (
    <div className="page-wrapper pb-20 anim-fadeIn">
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h1 style={{ fontSize: '40px', fontWeight: '950', color: textPrimary, letterSpacing: '-0.03em', margin: 0 }}>Global Bundle Registry</h1>
            <p style={{ color: textSecondary, fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Cross-supplier monitoring of all <strong style={{ color: '#6366f1' }}>{packages.length}</strong> hardware packages
            </p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ backgroundColor: bgColor, borderRadius: '24px', border: `1px solid ${borderColor}`, padding: '12px 24px', display: 'flex', itemsCenter: 'center', gap: '16px', boxShadow: darkMode ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <BiTrendingUp size={24} />
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Active Ecosystem</div>
                <div style={{ fontSize: '18px', fontWeight: '950', color: textPrimary }}>{packages.filter(p => p.isActive).length} <span style={{ fontSize: '11px', color: textSecondary }}>LIVE BUNDLES</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Action Bar */}
        <div style={{ position: 'relative', maxWidth: '600px', marginBottom: '40px' }}>
          <BiSearch style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: textSecondary }} size={24} />
          <input 
            type="text" 
            placeholder="Search registry by bundle name, ID or supplier..." 
            style={{ 
              width: '100%', backgroundColor: bgColor, border: `1px solid ${borderColor}`, borderRadius: '20px', 
              padding: '18px 20px 18px 60px', fontSize: '15px', fontWeight: '600', color: textPrimary, outline: 'none',
              boxShadow: darkMode ? 'inset 0 2px 4px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.02)'
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table Container */}
        <div style={{ backgroundColor: bgColor, borderRadius: '32px', border: `1px solid ${borderColor}`, boxShadow: darkMode ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
              <thead>
                <tr style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderBottom: `1px solid ${borderColor}` }}>
                  <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', width: '120px' }}>Reference</th>
                  <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', width: '250px' }}>Bundle Identity</th>
                  <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Inventory Matrix</th>
                  <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', width: '150px' }}>Financials</th>
                  <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', width: '220px' }}>Ownership</th>
                  <th style={{ textAlign: 'center', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', width: '120px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPackages.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <div style={{ padding: '100px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                        <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                          <BiPackage size={40} />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: '900', color: textPrimary }}>No Records Identified</h3>
                        <p style={{ color: textSecondary, fontSize: '14px', fontWeight: '500', maxWidth: '400px' }}>No packages currently match your specialized administrative search parameters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPackages.map((pkg) => (
                    <tr key={pkg._id} style={{ borderBottom: `1px solid ${borderColor}`, transition: 'background-color 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = darkMode ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                      <td style={{ padding: '32px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '900', color: '#6366f1', fontFamily: 'monospace', opacity: 0.8 }}>#{pkg.packageId}</span>
                      </td>
                      <td style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ fontSize: '15px', fontWeight: '950', color: textPrimary, letterSpacing: '-0.01em', lineHeight: '1.2' }}>{pkg.packageName}</div>
                          {pkg.description && (
                            <div style={{ fontSize: '11px', color: textSecondary, fontWeight: '500', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{pkg.description}</div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '32px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                          {pkg.items.slice(0, 4).map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', padding: '10px 14px', borderRadius: '12px', border: `1px solid ${borderColor}` }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '11px', fontWeight: '900', color: textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.productName || item.productId}</div>
                                <div style={{ fontSize: '9px', fontWeight: '700', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>LKR {Number(item.unitPrice).toLocaleString()}</div>
                              </div>
                              <span style={{ fontSize: '10px', fontWeight: '950', color: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>x{item.quantity}</span>
                            </div>
                          ))}
                          {pkg.items.length > 4 && (
                            <div style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, padding: '10px', textTransform: 'uppercase', opacity: 0.5 }}>+ {pkg.items.length - 4} MORE ASSETS</div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <span style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', fontSize: '9px', fontWeight: '950', padding: '4px 10px', borderRadius: '100px', width: 'fit-content', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {pkg.discountType === 'percentage' ? `${pkg.discountValue}% SAVINGS` : `LKR ${pkg.discountValue.toLocaleString()} OFF`}
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '10px', fontWeight: '800', color: textSecondary, textDecoration: 'line-through', opacity: 0.5 }}>LKR {Number(pkg.originalPrice).toLocaleString()}</span>
                            <span style={{ fontSize: '16px', fontWeight: '950', color: '#10b981', letterSpacing: '-0.02em' }}>LKR {Number(pkg.finalPrice).toLocaleString()}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '14px', backgroundColor: 'rgba(99, 102, 241, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontSize: '16px', fontWeight: '950', border: `1px solid ${borderColor}` }}>
                            {pkg.supplierName?.charAt(0) || <BiUserCircle size={20} />}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                            <div style={{ fontSize: '14px', fontWeight: '900', color: textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pkg.supplierName}</div>
                            <div style={{ fontSize: '11px', fontWeight: '700', color: textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pkg.supplierEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '32px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: pkg.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)', padding: '6px 16px', borderRadius: '100px' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: pkg.isActive ? '#10b981' : '#f43f5e', boxShadow: pkg.isActive ? '0 0 8px #10b981' : '0 0 8px #f43f5e' }} />
                          <span style={{ fontSize: '10px', fontWeight: '950', color: pkg.isActive ? '#10b981' : '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{pkg.isActive ? 'LIVE' : 'RESTRICTED'}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
