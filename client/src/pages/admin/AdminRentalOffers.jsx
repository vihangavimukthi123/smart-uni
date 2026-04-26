// AdminRentalOffers.jsx
import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { BiSearch, BiSolidOffer, BiTargetLock, BiCalendar, BiUserCircle, BiCheckCircle, BiXCircle, BiTrendingUp } from "react-icons/bi";
import { useTheme } from "../../context/ThemeContext";

export default function AdminRentalOffers() {
  const { darkMode } = useTheme();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOffers();
  }, []);

  async function fetchOffers() {
    try {
      const res = await api.get("/rental/offers/admin");
      setOffers(res.data.data);
    } catch (err) {
      toast.error("Failed to load offers");
    } finally {
      setLoading(false);
    }
  }

  const filteredOffers = offers.filter(o => 
    o.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.offerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.supplierName && o.supplierName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const textPrimary = darkMode ? 'white' : '#0f172a';
  const textSecondary = '#64748b';
  const bgColor = darkMode ? '#0f172a' : 'white';
  const borderColor = darkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0';

  if (loading) return (
    <div style={{ padding: "100px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid rgba(37, 99, 235, 0.1)', borderTop: '4px solid #8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: textSecondary, fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Analyzing Market Impact...</p>
    </div>
  );

  return (
    <div className="page-wrapper pb-20 anim-fadeIn">
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h1 style={{ fontSize: '40px', fontWeight: '950', color: textPrimary, letterSpacing: '-0.03em', margin: 0 }}>Global Promotion Hub</h1>
            <p style={{ color: textSecondary, fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Unified administrative oversight of <strong style={{ color: '#8b5cf6' }}>{offers.length}</strong> marketing campaigns
            </p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ backgroundColor: bgColor, borderRadius: '24px', border: `1px solid ${borderColor}`, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: darkMode ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
                <BiTrendingUp size={24} />
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Campaign Pulse</div>
                <div style={{ fontSize: '18px', fontWeight: '950', color: textPrimary }}>{offers.filter(o => o.isActive).length} <span style={{ fontSize: '11px', color: textSecondary }}>LIVE OFFERS</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', maxWidth: '600px', marginBottom: '40px' }}>
          <BiSearch style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: textSecondary }} size={24} />
          <input 
            type="text" 
            placeholder="Search campaigns by title, ID or supplier..." 
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
                  <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', width: '120px' }}>Tracking ID</th>
                  <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', width: '350px' }}>Campaign Context</th>
                  <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', width: '150px' }}>Incentive</th>
                  <th style={{ textAlign: 'center', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', width: '120px' }}>Savings</th>
                  <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', width: '180px' }}>Validity Period</th>
                  <th style={{ textAlign: 'left', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', width: '220px' }}>Ownership</th>
                  <th style={{ textAlign: 'center', padding: '24px 32px', fontSize: '11px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', width: '120px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOffers.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <div style={{ padding: '100px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                        <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
                          <BiSolidOffer size={40} />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: '900', color: textPrimary }}>No Active Campaigns</h3>
                        <p style={{ color: textSecondary, fontSize: '14px', fontWeight: '500', maxWidth: '400px' }}>No promotions currently match your specialized administrative search parameters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOffers.map((offer) => (
                    <tr key={offer._id} style={{ borderBottom: `1px solid ${borderColor}`, transition: 'background-color 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = darkMode ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                      <td style={{ padding: '32px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '900', color: '#8b5cf6', fontFamily: 'monospace', opacity: 0.8 }}>#{offer.offerId}</span>
                      </td>
                      <td style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ fontSize: '15px', fontWeight: '950', color: textPrimary, letterSpacing: '-0.01em', lineHeight: '1.2' }}>{offer.title}</div>
                          {offer.description && (
                            <div style={{ fontSize: '11px', color: textSecondary, fontWeight: '500', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{offer.description}</div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(139, 92, 246, 0.05)', padding: '8px 16px', borderRadius: '12px', border: `1px solid rgba(139, 92, 246, 0.1)`, width: 'fit-content' }}>
                          <BiTargetLock size={16} color="#8b5cf6" />
                          <span style={{ fontSize: '10px', fontWeight: '950', color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {offer.offerType?.replace('_DISCOUNT', '').replace('ITEM', 'PRODUCT')}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '32px', textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: '950', color: '#8b5cf6', letterSpacing: '-0.02em' }}>
                          {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `LKR ${offer.discountValue.toLocaleString()}`}
                        </div>
                        <div style={{ fontSize: '9px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '2px' }}>Net Savings</div>
                      </td>
                      <td style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BiCalendar size={14} color="#8b5cf6" />
                            <span style={{ fontSize: '12px', fontWeight: '800', color: textPrimary }}>{new Date(offer.startDate).toLocaleDateString()}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.6 }}>
                            <div style={{ width: '14px', height: '1px', backgroundColor: textSecondary, marginLeft: '4px' }} />
                            <span style={{ fontSize: '12px', fontWeight: '800', color: '#f43f5e' }}>{new Date(offer.endDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '14px', backgroundColor: 'rgba(139, 92, 246, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', fontSize: '16px', fontWeight: '950', border: `1px solid ${borderColor}` }}>
                            {offer.supplierName?.charAt(0) || <BiUserCircle size={20} />}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                            <div style={{ fontSize: '14px', fontWeight: '900', color: textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{offer.supplierName}</div>
                            <div style={{ fontSize: '11px', fontWeight: '700', color: textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{offer.supplierEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '32px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: offer.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)', padding: '6px 16px', borderRadius: '100px' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: offer.isActive ? '#10b981' : '#f43f5e', boxShadow: offer.isActive ? '0 0 8px #10b981' : '0 0 8px #f43f5e' }} />
                          <span style={{ fontSize: '10px', fontWeight: '950', color: offer.isActive ? '#10b981' : '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{offer.isActive ? 'LIVE' : 'ENDED'}</span>
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
