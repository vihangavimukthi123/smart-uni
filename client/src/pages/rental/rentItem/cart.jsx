// cart.jsx
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import { BiTrash, BiCalendar, BiPlus, BiMinus, BiArrowBack, BiChevronRight, BiInfoCircle, BiShoppingBag, BiStar, BiPackage } from "react-icons/bi";
import { useTheme } from "../../../context/ThemeContext";

// ── Static add-ons ────────────────────────────────────────────────────────────
const addons = [
  {
    id: 1,
    name: "Heavy-Duty Speaker Stands",
    price: 1500,
    image: "/images/P002.jpg",
  },
  {
    id: 2,
    name: "Extra XLR Cable Kit (50ft)",
    price: 800,
    image: "/images/P001.jpg",
  },
];

export default function CartPage() {
  const { darkMode } = useTheme();
  const { cartItems, removeItem, updateQty } = useCart();
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((s, i) => s + i.total, 0);
  const delivery = 500.0;
  const tax = +(subtotal * 0.02).toFixed(2);
  const total = +(subtotal + delivery + tax).toFixed(2);

  const cardStyle = {
    backgroundColor: darkMode ? '#0f172a' : 'white',
    borderRadius: '24px',
    border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0',
    boxShadow: darkMode ? '0 20px 40px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.03)',
    transition: 'all 0.3s ease'
  };

  const textPrimary = darkMode ? 'white' : '#0f172a';
  const textSecondary = '#64748b';

  return (
    <div className="page-wrapper pb-20 anim-fadeIn">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="flex flex-col gap-8">
          <Link to="/rental/items" className="group inline-flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors">
            <BiArrowBack className="text-lg group-hover:-translate-x-1 transition-transform" />
            <span style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Continue Browsing</span>
          </Link>
          <div className="flex flex-col gap-1">
            <h1 style={{ fontSize: '40px', fontWeight: '900', letterSpacing: '-0.02em', lineHeight: '1.1', color: textPrimary }}>Hardware Cart</h1>
            <p style={{ color: textSecondary, fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Review your event equipment selection</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', gap: '48px', alignItems: 'flex-start', width: '100%', flexWrap: 'wrap' }}>
          {/* LEFT - Cart Content */}
          <div style={{ flex: '1', minWidth: '400px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {cartItems.length === 0 ? (
              <div style={{ ...cardStyle, padding: '100px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(37, 99, 235, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                  <BiShoppingBag size={40} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: '900', color: textPrimary }}>Your cart is empty</h3>
                  <p style={{ color: textSecondary, fontSize: '14px', fontWeight: '600', maxWidth: '320px', margin: '0 auto' }}>Start adding hardware from our certified inventory to build your event stack.</p>
                </div>
                <Link to="/rental/items" style={{ backgroundColor: '#2563eb', color: 'white', padding: '16px 32px', borderRadius: '16px', fontWeight: '900', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.1em', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)' }}>
                  Explore Inventory
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {cartItems.map((item) => (
                  <div key={item.id} style={{ ...cardStyle, padding: '32px' }} className="group">
                    <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                      {/* Image */}
                      <div style={{ width: '120px', height: '120px', borderRadius: '20px', overflow: 'hidden', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9', flexShrink: 0 }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      </div>

                      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '900', color: textPrimary }}>{item.name}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: textSecondary, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                              <BiCalendar size={14} style={{ color: '#2563eb' }} />
                              <span>{item.dates || "Not specified"}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#fef2f2', border: 'none', color: '#f43f5e', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f43f5e'; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = darkMode ? 'rgba(255,255,255,0.02)' : '#fef2f2'; e.currentTarget.style.color = '#f43f5e'; }}
                          >
                            <BiTrash size={18} />
                          </button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: darkMode ? '1px solid rgba(255,255,255,0.03)' : '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', padding: '6px', borderRadius: '14px', border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0' }}>
                            <button
                              onClick={() => updateQty(item.id, -1)}
                              style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'transparent', border: 'none', color: textPrimary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <BiMinus size={16} />
                            </button>
                            <span style={{ fontSize: '14px', fontWeight: '900', color: textPrimary, minWidth: '24px', textAlign: 'center' }}>{item.qty}</span>
                            <button
                              onClick={() => updateQty(item.id, 1)}
                              style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'transparent', border: 'none', color: textPrimary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <BiPlus size={16} />
                            </button>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '10px', fontWeight: '800', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              LKR {item.pricePerDay?.toLocaleString()} / Day
                            </div>
                            <div style={{ fontSize: '20px', fontWeight: '900', color: '#2563eb' }}>LKR {item.total?.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recommended Add-ons */}
            {cartItems.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '900', color: textPrimary, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <BiStar style={{ color: '#2563eb' }} /> 
                  <span>Smart Complements</span>
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                  {addons.map((addon) => (
                    <div key={addon.id} style={{ ...cardStyle, padding: '24px' }} className="group">
                      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#f8fafc', flexShrink: 0 }}>
                          <img src={addon.image} alt={addon.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '800', color: textPrimary }}>{addon.name}</h4>
                            <span style={{ fontSize: '10px', fontWeight: '700', color: textSecondary }}>LKR {addon.price?.toLocaleString()} / Day</span>
                          </div>
                          <button style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', padding: '8px 16px', borderRadius: '100px', fontSize: '10px', fontWeight: '900', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content' }}>
                            <BiPlus size={14} />
                            ADD TO STACK
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Order Summary */}
          <div style={{ width: '380px', flexShrink: 0, position: 'sticky', top: '24px' }}>
            <div style={{ ...cardStyle, padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '900', color: textPrimary, letterSpacing: '-0.02em' }}>Order Architecture</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { label: 'Subtotal', value: subtotal },
                  { label: 'Campus Delivery', value: delivery },
                  { label: 'Audit Tax (2%)', value: tax }
                ].map((row, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{row.label}</span>
                    <span style={{ fontSize: '14px', fontWeight: '900', color: textPrimary }}>LKR {row.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div style={{ paddingTop: '32px', borderTop: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Total Value</span>
                  <span style={{ fontSize: '32px', fontWeight: '950', color: '#2563eb', letterSpacing: '-0.03em', lineHeight: '1' }}>LKR {total.toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <button
                    onClick={() => cartItems.length > 0 && navigate(`/rental/checkout`)}
                    disabled={cartItems.length === 0}
                    style={{ 
                      width: '100%', padding: '20px', borderRadius: '20px', 
                      backgroundColor: cartItems.length === 0 ? '#1e293b' : '#2563eb', 
                      color: 'white', fontSize: '14px', fontWeight: '900', 
                      textTransform: 'uppercase', letterSpacing: '0.15em', border: 'none', 
                      cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                      boxShadow: cartItems.length === 0 ? 'none' : '0 10px 25px rgba(37, 99, 235, 0.2)'
                    }}
                  >
                    <span>Proceed to Checkout</span>
                    <BiChevronRight size={24} />
                  </button>

                  <button
                    onClick={() => navigate(`/rental/items`)}
                    style={{ width: '100%', padding: '16px', borderRadius: '16px', backgroundColor: 'transparent', border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0', color: textSecondary, fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <BiArrowBack size={18} />
                    <span>Back to Registry</span>
                  </button>
                </div>

                <div style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', padding: '20px', borderRadius: '20px', border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9', display: 'flex', gap: '16px' }}>
                  <BiInfoCircle size={20} style={{ color: '#2563eb', flexShrink: 0 }} />
                  <p style={{ fontSize: '10px', color: textSecondary, fontWeight: '600', lineHeight: '1.6', margin: '0' }}>
                    Official University ID is mandatory for equipment handover. Assets must be returned to the logistics hub by 17:00 on the return date.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
