// SupplierPackagesPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../../api/axios";
import toast from "react-hot-toast";
import { BiPlus, BiPackage, BiTrash, BiEdit, BiShoppingBag, BiDetail, BiLayer } from "react-icons/bi";
import { useTheme } from "../../../context/ThemeContext";

export default function SupplierPackagesPage() {
  const { darkMode } = useTheme();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await api.get("/rental/packages/supplier");
      setPackages(response.data.data);
    } catch (error) {
      toast.error("Failed to load packages");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleDelete = async (packageId) => {
    if (!window.confirm("Are you sure you want to delete this package? This action cannot be undone.")) return;
    try {
      await api.delete(`/rental/packages/${packageId}`);
      toast.success("Package deleted successfully");
      fetchPackages();
    } catch (error) {
      toast.error("Failed to delete package");
    }
  };

  const textPrimary = darkMode ? 'white' : '#0f172a';
  const textSecondary = '#64748b';
  const bgColor = darkMode ? '#0f172a' : 'white';
  const borderColor = darkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0';

  return (
    <div className="page-wrapper pb-20 anim-fadeIn">
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '900', color: textPrimary, letterSpacing: '-0.02em' }}>My Rental Bundles</h1>
          <p style={{ color: textSecondary, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Manage your hardware collections and bulk pricing strategies</p>
        </div>
        <Link 
          to="/supplier/add-package" 
          style={{ 
            backgroundColor: '#2563eb', color: 'white', padding: '16px 32px', borderRadius: '16px', 
            fontWeight: '900', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '12px',
            textDecoration: 'none', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)', transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(37, 99, 235, 0.3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(37, 99, 235, 0.2)'; }}
        >
          <BiPlus size={20} /> 
          <span>CREATE NEW BUNDLE</span>
        </Link>
      </div>

      <div style={{ 
        backgroundColor: bgColor, borderRadius: '24px', border: `1px solid ${borderColor}`, 
        boxShadow: darkMode ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.02)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '100px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid rgba(37, 99, 235, 0.1)', borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: textSecondary, fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Synchronizing Inventory...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
              <thead>
                <tr style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderBottom: `1px solid ${borderColor}` }}>
                  <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Bundle ID</th>
                  <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', minWidth: '220px' }}>Configuration Name</th>
                  <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', minWidth: '280px' }}>Components</th>
                  <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Savings Logic</th>
                  <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</th>
                  <th style={{ textAlign: 'center', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Management</th>
                </tr>
              </thead>
              <tbody>
                {packages.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <div style={{ padding: '100px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(37, 99, 235, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                          <BiPackage size={40} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <h3 style={{ fontSize: '20px', fontWeight: '900', color: textPrimary }}>No Bundles Configured</h3>
                          <p style={{ color: textSecondary, fontSize: '14px', fontWeight: '500', maxWidth: '400px' }}>Elevate your supplier profile by grouping related hardware into convenient sets for students.</p>
                        </div>
                        <Link to="/supplier/add-package" style={{ backgroundColor: '#2563eb', color: 'white', padding: '14px 28px', borderRadius: '12px', fontWeight: '900', fontSize: '12px', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          Configure Initial Bundle
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  packages.map((pkg) => (
                    <tr key={pkg.packageId} style={{ borderBottom: `1px solid ${borderColor}`, transition: 'background-color 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = darkMode ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                      <td style={{ padding: '32px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '900', color: '#6366f1', fontFamily: 'monospace', opacity: '0.8' }}>#{pkg.packageId}</span>
                      </td>
                      <td style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '15px', fontWeight: '900', color: textPrimary }}>{pkg.packageName}</span>
                          <span style={{ fontSize: '10px', fontWeight: '700', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hardware Collection</span>
                        </div>
                      </td>
                      <td style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                          {pkg.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : '#f1f5f9', padding: '6px 12px', borderRadius: '10px', border: `1px solid ${borderColor}` }}>
                              <span style={{ fontSize: '10px', fontWeight: '800', color: textSecondary }}>{item.productId}</span>
                              <span style={{ fontSize: '10px', fontWeight: '900', color: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', fontSize: '10px', fontWeight: '900', padding: '6px 12px', borderRadius: '100px', width: 'fit-content' }}>
                            {pkg.discountType === 'percentage' ? `${pkg.discountValue}% SAVINGS` : `LKR ${pkg.discountValue.toLocaleString()} OFF`}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: pkg.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)', padding: '6px 12px', borderRadius: '100px', width: 'fit-content' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: pkg.isActive ? '#10b981' : '#f43f5e', boxShadow: pkg.isActive ? '0 0 8px #10b981' : '0 0 8px #f43f5e' }} />
                          <span style={{ fontSize: '10px', fontWeight: '900', color: pkg.isActive ? '#10b981' : '#f43f5e' }}>{pkg.isActive ? 'LIVE' : 'HIDDEN'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
                          <button
                            onClick={() => navigate(`/supplier/edit-package/${pkg.packageId}`, { state: pkg })}
                            style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: `1px solid ${borderColor}`, color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#6366f1'; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc'; e.currentTarget.style.color = '#6366f1'; }}
                          >
                            <BiEdit size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(pkg.packageId)}
                            style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: `1px solid ${borderColor}`, color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f43f5e'; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc'; e.currentTarget.style.color = '#f43f5e'; }}
                          >
                            <BiTrash size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
