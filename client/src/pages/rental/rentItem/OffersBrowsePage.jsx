// OffersBrowsePage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../api/axios";
import toast from "react-hot-toast";
import { BiSolidOffer, BiInfoCircle, BiTimeFive, BiArrowBack, BiGift, BiRocket } from "react-icons/bi";
import { useTheme } from "../../../context/ThemeContext";

export default function OffersBrowsePage() {
  const { darkMode } = useTheme();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/rental/offers");
      setOffers(response.data.data);
    } catch (error) {
      toast.error("Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

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

      {/* Header Section */}
      <div className="flex flex-col gap-10 mb-16">
        <div className="flex flex-col gap-1">
          <h1 style={{ fontSize: '40px', fontWeight: '900', letterSpacing: '-0.02em', lineHeight: '1.1', color: darkMode ? 'white' : '#0f172a' }}>Premium Offers</h1>
          <p style={{ color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unlock exclusive university-wide savings on top-tier equipment</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid rgba(147, 51, 234, 0.2)', borderTop: '4px solid #9333ea', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#64748b', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.2em' }}>Curating Best Deals...</p>
          </div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '40px' }}>
          {offers.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '100px 0', textAlign: 'center', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderRadius: '32px', border: darkMode ? '2px dashed rgba(255,255,255,0.05)' : '2px dashed #e2e8f0' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(147, 51, 234, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#9333ea' }}>
                <BiSolidOffer size={40} />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '900', color: darkMode ? 'white' : '#0f172a' }}>No Promotions Active</h3>
              <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', maxWidth: '400px', margin: '12px auto 0' }}>Check back soon for upcoming campus event discounts and seasonal promotions.</p>
            </div>
          ) : (
            offers.map((offer) => {
              const isLive = new Date() >= new Date(offer.startDate);
              return (
                <div 
                  key={offer.offerId} 
                  style={{ 
                    background: darkMode ? 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)' : 'white', 
                    borderRadius: '32px', 
                    padding: '40px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '24px', 
                    border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0',
                    boxShadow: darkMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 20px 40px -10px rgba(0, 0, 0, 0.05)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease'
                  }}
                >
                  {/* Status Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ backgroundColor: 'rgba(147, 51, 234, 0.1)', color: '#9333ea', padding: '6px 12px', borderRadius: '100px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {offer.offerType.replace('_DISCOUNT', '')}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: isLive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', padding: '6px 12px', borderRadius: '100px', border: isLive ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isLive ? '#10b981' : '#f59e0b', boxShadow: isLive ? '0 0 8px #10b981' : 'none' }} />
                      <span style={{ color: isLive ? '#10b981' : '#f59e0b', fontWeight: '900', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{isLive ? 'Live Now' : 'Coming Soon'}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h3 style={{ fontSize: '28px', fontWeight: '900', color: darkMode ? 'white' : '#0f172a', letterSpacing: '-0.03em', lineHeight: '1.2' }}>{offer.title}</h3>
                    <p style={{ fontSize: '15px', color: darkMode ? '#94a3b8' : '#64748b', lineHeight: '1.6', fontWeight: '500', margin: '0', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {offer.description || "Limited time offer for campus events. Secure your items now!"}
                    </p>
                  </div>

                  {/* Savings Card */}
                  <div style={{ 
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#fafafa', 
                    borderRadius: '24px', 
                    padding: '32px', 
                    textAlign: 'center', 
                    border: darkMode ? '1px solid rgba(255,255,255,0.03)' : '1px solid #f1f5f9',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginTop: '8px'
                  }}>
                    <span style={{ fontSize: '10px', fontWeight: '900', color: '#9333ea', textTransform: 'uppercase', letterSpacing: '0.3em' }}>Guaranteed Savings</span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                      <span style={{ fontSize: '56px', fontWeight: '950', color: darkMode ? 'white' : '#0f172a', letterSpacing: '-0.05em', lineHeight: '1' }}>
                        {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `Rs.${offer.discountValue.toLocaleString()}`}
                      </span>
                      <BiGift size={48} style={{ color: '#9333ea' }} />
                    </div>
                  </div>

                  {/* Validity Info */}
                  <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', padding: '16px', borderRadius: '18px', border: darkMode ? '1px solid rgba(255,255,255,0.03)' : '1px solid #f1f5f9' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(147, 51, 234, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333ea' }}>
                        <BiTimeFive size={22} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '9px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Validity Period</span>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: darkMode ? 'white' : '#475569' }}>
                          {new Date(offer.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} — {new Date(offer.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#9333ea', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: '0.8' }}>
                      <BiRocket size={14} />
                      <span>Auto-applied at checkout</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
