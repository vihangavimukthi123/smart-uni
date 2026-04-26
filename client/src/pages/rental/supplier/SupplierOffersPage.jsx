// SupplierOffersPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../../api/axios";
import toast from "react-hot-toast";
import { BiPlus, BiSolidOffer, BiTrash, BiEdit, BiCalendar, BiTargetLock, BiTimeFive, BiRocket } from "react-icons/bi";
import { useTheme } from "../../../context/ThemeContext";

export default function SupplierOffersPage() {
  const { darkMode } = useTheme();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/rental/offers/supplier");
      setOffers(response.data.data);
    } catch (error) {
      toast.error("Failed to load offers");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleDelete = async (offerId) => {
    if (!window.confirm("Are you sure you want to delete this special offer? This action cannot be undone.")) return;
    try {
      await api.delete(`/rental/offers/${offerId}`);
      toast.success("Offer deleted successfully");
      fetchOffers();
    } catch (error) {
      toast.error("Failed to delete offer");
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
          <h1 style={{ fontSize: '36px', fontWeight: '900', color: textPrimary, letterSpacing: '-0.02em' }}>Promotional Catalog</h1>
          <p style={{ color: textSecondary, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Configure and monitor your active discounts and rental offers</p>
        </div>
        <Link 
          to="/supplier/add-offer" 
          style={{ 
            background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)', color: 'white', padding: '16px 32px', borderRadius: '16px', 
            fontWeight: '900', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '12px',
            textDecoration: 'none', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)', transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(99, 102, 241, 0.3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(99, 102, 241, 0.2)'; }}
        >
          <BiPlus size={20} /> 
          <span>LAUNCH NEW PROMOTION</span>
        </Link>
      </div>

      <div style={{ 
        backgroundColor: bgColor, borderRadius: '24px', border: `1px solid ${borderColor}`, 
        boxShadow: darkMode ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.02)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '100px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid rgba(124, 58, 237, 0.1)', borderTop: '4px solid #7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: textSecondary, fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Calibrating Offers...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
              <thead>
                <tr style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderBottom: `1px solid ${borderColor}` }}>
                  <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Ref ID</th>
                  <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', minWidth: '240px' }}>Promotion Intel</th>
                  <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Targeting</th>
                  <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Saving Impact</th>
                  <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', minWidth: '180px' }}>Validity Window</th>
                  <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</th>
                  <th style={{ textAlign: 'center', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Management</th>
                </tr>
              </thead>
              <tbody>
                {offers.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <div style={{ padding: '100px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(124, 58, 237, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                          <BiSolidOffer size={40} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <h3 style={{ fontSize: '20px', fontWeight: '900', color: textPrimary }}>No Active Campaigns</h3>
                          <p style={{ color: textSecondary, fontSize: '14px', fontWeight: '500', maxWidth: '400px' }}>Boost your visibility during exams or semester ends by launching targeted rental promotions.</p>
                        </div>
                        <Link to="/supplier/add-offer" style={{ backgroundColor: '#7c3aed', color: 'white', padding: '14px 28px', borderRadius: '12px', fontWeight: '900', fontSize: '12px', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          Launch First Campaign
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  offers.map((offer) => (
                    <tr key={offer.offerId} style={{ borderBottom: `1px solid ${borderColor}`, transition: 'background-color 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = darkMode ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                      <td style={{ padding: '32px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '900', color: '#7c3aed', fontFamily: 'monospace', opacity: '0.8' }}>#{offer.offerId}</span>
                      </td>
                      <td style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '15px', fontWeight: '900', color: textPrimary }}>{offer.title}</span>
                          <span style={{ fontSize: '11px', color: textSecondary, fontWeight: '500', lineClamp: '1', display: '-webkit-box', WebkitLineClamp: '1', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{offer.description}</span>
                        </div>
                      </td>
                      <td style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : '#f1f5f9', padding: '6px 12px', borderRadius: '100px', width: 'fit-content', border: `1px solid ${borderColor}` }}>
                          <BiTargetLock size={14} style={{ color: '#6366f1' }} />
                          <span style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase' }}>
                            {offer.offerType.replace('_DISCOUNT', '').replace('ITEM', 'PRODUCT')}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '32px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '900', color: '#6366f1', letterSpacing: '-0.01em' }}>
                          {offer.discountType === 'percentage' ? `${offer.discountValue}% SAVINGS` : `LKR ${offer.discountValue.toLocaleString()} OFF`}
                        </span>
                      </td>
                      <td style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BiTimeFive size={14} style={{ color: textSecondary, opacity: '0.5' }} />
                            <span style={{ fontSize: '11px', fontWeight: '800', color: textSecondary }}>{new Date(offer.startDate).toLocaleDateString()}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '14px', display: 'flex', justifyContent: 'center' }}>
                              <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: textSecondary, opacity: '0.3' }} />
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: textSecondary, opacity: '0.5' }}>{new Date(offer.endDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: offer.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)', padding: '6px 12px', borderRadius: '100px', width: 'fit-content' }}>
                          <BiRocket size={14} style={{ color: offer.isActive ? '#10b981' : '#f43f5e' }} />
                          <span style={{ fontSize: '10px', fontWeight: '900', color: offer.isActive ? '#10b981' : '#f43f5e' }}>{offer.isActive ? 'ACTIVE' : 'EXPIRED'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
                          <button
                            onClick={() => navigate(`/supplier/edit-offer/${offer.offerId}`, { state: offer })}
                            style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: `1px solid ${borderColor}`, color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#7c3aed'; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc'; e.currentTarget.style.color = '#7c3aed'; }}
                          >
                            <BiEdit size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(offer.offerId)}
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
