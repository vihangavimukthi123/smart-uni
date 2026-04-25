//itemList.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { BiPackage, BiCheckCircle, BiStar, BiChevronRight, BiChevronLeft, BiShoppingBag, BiSearch } from "react-icons/bi";
import { useTheme } from "../../../context/ThemeContext";

const PRIMARY = "#1a4fd6";

function StarRating({ rating }) {
  return (
    <div style={{ display: 'flex', gap: '2px', color: "#f59e0b" }}>
      {[...Array(5)].map((_, i) => (
        <BiStar key={i} size={14} style={{ fill: i < Math.floor(rating) ? '#f59e0b' : 'transparent', stroke: '#f59e0b' }} />
      ))}
    </div>
  );
}

function ProductCard({ product, darkMode, borderColor, textPrimary, textSecondary, bgColor }) {
  const navigate = useNavigate();

  return (
    <div
      className="group"
      style={{
        background: bgColor,
        borderRadius: 24,
        border: `1px solid ${borderColor}`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: darkMode ? "0 10px 30px rgba(0,0,0,0.3)" : "0 10px 30px rgba(0,0,0,0.02)",
        transition: 'all 0.3s ease',
        position: 'relative'
      }}
    >
      {/* Image Container */}
      <div style={{ position: "relative", height: 220, overflow: 'hidden' }}>
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: 'transform 0.5s ease'
          }}
          className="group-hover:scale-110"
          onError={(e) => {
            e.target.style.background = darkMode ? "#1e293b" : "#f1f5f9";
            e.target.src = "";
          }}
        />
        <div style={{
          position: "absolute",
          top: 16,
          right: 16,
          background: "rgba(255,255,255,0.9)",
          backdropFilter: 'blur(4px)',
          color: PRIMARY,
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: "0.1em",
          padding: "6px 14px",
          borderRadius: 100,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textTransform: 'uppercase'
        }}>
          {product.tag}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <StarRating rating={product.rating} />
          <div style={{ fontSize: 18, fontWeight: 950, color: PRIMARY, letterSpacing: '-0.02em' }}>
            Rs. {Number(product.price).toLocaleString()}
            <span style={{ fontWeight: 700, color: textSecondary, fontSize: 12 }}>/day</span>
          </div>
        </div>

        <h3 style={{ fontWeight: 900, fontSize: 18, color: textPrimary, margin: 0, letterSpacing: '-0.01em', display: '-webkit-box', WebkitLineClamp: '1', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.name}
        </h3>

        <p style={{ fontSize: 13, color: textSecondary, lineHeight: 1.6, flex: 1, margin: 0, display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', fontWeight: '500' }}>
          {product.desc}
        </p>

        <button
          onClick={() => navigate(`/rental/items/${product.id}`)}
          style={{
            marginTop: 8,
            background: PRIMARY,
            color: "#fff",
            border: "none",
            borderRadius: 16,
            padding: "14px 0",
            fontWeight: 900,
            fontSize: 14,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            cursor: "pointer",
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 10px 20px rgba(26, 79, 214, 0.2)'
          }}
          className="hover:scale-[1.02] hover:shadow-blue-500/40"
        >
          <BiShoppingBag size={18} /> Rent Now
        </button>
      </div>
    </div>
  );
}

export default function ItemList() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const ITEMS_PER_PAGE = 12;

  const textPrimary = darkMode ? 'white' : '#0f172a';
  const textSecondary = '#64748b';
  const bgColor = darkMode ? '#0f172a' : 'white';
  const borderColor = darkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0';

  useEffect(() => {
    document.title = "UniEvent Rentals – Item List";
    if (!loaded) {
      api.get("/rental/products")
        .then((res) => {
          setProducts(res.data);
          setLoaded(true);
        })
        .catch((err) => console.log(err));
    }
  }, [loaded]);

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    if (loaded) {
      const element = document.getElementById('inventory-grid');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [activePage, loaded]);

  if (!loaded) return (
    <div style={{ padding: "100px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid rgba(26, 79, 214, 0.1)', borderTop: '4px solid #1a4fd6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: textSecondary, fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Loading Assets...</p>
    </div>
  );

  return (
    <div className="page-wrapper pb-32 anim-fadeIn" style={{ backgroundColor: darkMode ? '#0f172a' : '#f8fafc' }}>
      {/* Premium Hero Section */}
      <section style={{ 
        position: 'relative', 
        padding: '60px 40px', 
        marginBottom: '64px',
        background: darkMode ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
        borderRadius: '40px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '40px'
      }}>
        {/* Abstract Background Decoration */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(26, 79, 214, 0.05) 0%, transparent 70%)', borderRadius: '50%' }} />
        
        <div style={{ flex: 1, position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '700px' }}>
            <span style={{ backgroundColor: 'rgba(26, 79, 214, 0.1)', color: PRIMARY, padding: '8px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '0.1em', width: 'fit-content' }}>
              Premium Equipment Registry
            </span>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: '950', color: textPrimary, letterSpacing: '-0.04em', lineHeight: '1.05', margin: 0 }}>
              The Equipment You Need for Your <span style={{ color: PRIMARY }}>Next University Event</span>
            </h1>
            <p style={{ fontSize: '18px', color: textSecondary, lineHeight: '1.6', fontWeight: '600', maxWidth: '600px', margin: 0 }}>
              Rent high-quality event gear in minutes. We connect campus organizers with the best local item suppliers.
            </p>
            <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}><BiPackage size={20} /></div>
                <div style={{ fontSize: '12px', fontWeight: '800', color: textSecondary }}>Direct Campus<br/>Delivery Hubs</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}><BiCheckCircle size={20} /></div>
                <div style={{ fontSize: '12px', fontWeight: '800', color: textSecondary }}>Verified Asset<br/>Quality Checks</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ 
          flex: 1, 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center',
          position: 'relative', 
          zIndex: 2,
          backgroundImage: "url('/images/land_img.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '32px',
          height: '400px',
          boxShadow: darkMode ? 'inset 0 0 0 1000px rgba(15, 23, 42, 0.2)' : 'inset 0 0 0 1000px rgba(255, 255, 255, 0.05)'
        }}>
        </div>
      </section>

      {/* Search Bar & Section Header */}
      <div id="inventory-grid" style={{ margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '950', color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>Available Equipment</h2>
            <p style={{ fontSize: '14px', color: textSecondary, fontWeight: '700' }}>Showing {filteredProducts.length} results from verified university suppliers</p>
          </div>
          
          {/* High-Fidelity Search Bar */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <BiSearch style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: textSecondary }} size={24} />
            <input 
              type="text" 
              placeholder="Search by name, category or description..." 
              style={{ 
                width: '100%', backgroundColor: bgColor, border: `1px solid ${borderColor}`, borderRadius: '20px', 
                padding: '16px 20px 16px 60px', fontSize: '15px', fontWeight: '600', color: textPrimary, outline: 'none',
                boxShadow: darkMode ? 'inset 0 2px 4px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.02)'
              }}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setActivePage(1); }}
            />
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div style={{ padding: '100px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', backgroundColor: bgColor, borderRadius: '32px', border: `1px solid ${borderColor}` }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(26, 79, 214, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: PRIMARY }}>
              <BiPackage size={40} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: textPrimary }}>No Assets Found</h3>
            <p style={{ color: textSecondary, fontSize: '14px', fontWeight: '500', maxWidth: '400px' }}>Try adjusting your search criteria to see more university event equipment.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 32, marginBottom: 64 }}>
            {currentProducts.map((product) => (
              <ProductCard
                key={product.productID}
                darkMode={darkMode}
                borderColor={borderColor}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                bgColor={bgColor}
                product={{
                  id: product.productID,
                  name: product.name,
                  desc: product.description,
                  price: product.price,
                  image: product.images?.[0] || "",
                  tag: product.category?.toUpperCase() || "General",
                  rating: 4.5,
                  reviews: 0,
                }}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <button
              onClick={() => setActivePage((p) => Math.max(1, p - 1))}
              disabled={activePage === 1}
              style={{ width: 48, height: 48, borderRadius: 16, border: `1px solid ${borderColor}`, background: bgColor, cursor: activePage === 1 ? 'not-allowed' : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", opacity: activePage === 1 ? 0.3 : 1, color: textPrimary }}
            >
              <BiChevronLeft size={24} />
            </button>

            {(() => {
              let start = Math.max(1, activePage - 2);
              let end = Math.min(totalPages, start + 4);
              if (end === totalPages) start = Math.max(1, end - 4);
              
              return Array.from({ length: end - start + 1 }, (_, i) => start + i).map((page) => (
                <button
                  key={page}
                  onClick={() => setActivePage(page)}
                  style={{
                    width: 48, height: 48, borderRadius: 16, border: page === activePage ? "none" : `1px solid ${borderColor}`,
                    background: page === activePage ? PRIMARY : bgColor,
                    color: page === activePage ? "#fff" : textPrimary,
                    fontWeight: 900, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
                    boxShadow: page === activePage ? '0 10px 20px rgba(26, 79, 214, 0.2)' : 'none'
                  }}
                >
                  {page}
                </button>
              ));
            })()}

            <button
              onClick={() => setActivePage((p) => Math.min(totalPages, p + 1))}
              disabled={activePage === totalPages}
              style={{ width: 48, height: 48, borderRadius: 16, border: `1px solid ${borderColor}`, background: bgColor, cursor: activePage === totalPages ? 'not-allowed' : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", opacity: activePage === totalPages ? 0.3 : 1, color: textPrimary }}
            >
              <BiChevronRight size={24} />
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
