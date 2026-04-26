// kitGenerator.jsx
import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";
import { 
  BiBot, BiEditAlt, BiCartAlt, BiPackage, 
  BiStar, BiCheck, BiChevronRight, BiShoppingBag, BiArrowBack,
  BiPlus, BiInfoCircle, BiBuildings, BiTask, BiMoney
} from "react-icons/bi";
import { useTheme } from "../../context/ThemeContext";

const initialItems = [
  {
    id: 1,
    name: "10×10 Commercial Grade Tent",
    subtitle: "Weather-proof, white",
    qty: 10,
    price: 450.0,
    checked: true,
    img: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=60&h=60&fit=crop",
  },
  {
    id: 2,
    name: "Padded Folding Chairs",
    subtitle: "Lightweight, ergonomic",
    qty: 200,
    price: 600.0,
    checked: true,
    img: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=60&h=60&fit=crop",
  },
  {
    id: 3,
    name: "Portable PA System Kit",
    subtitle: "2 Speakers + Wireless Mic",
    qty: 1,
    price: 185.0,
    checked: true,
    img: "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=60&h=60&fit=crop",
  },
  {
    id: 4,
    name: "Registration Desk (6ft)",
    subtitle: "Includes black table skirting",
    qty: 4,
    price: 120.0,
    checked: true,
    img: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=60&h=60&fit=crop",
  },
];

const suppliersList = [
  {
    id: 1,
    name: "Elite Rental Co.",
    rating: 4.9,
    reviews: 124,
    tags: ["Tent Specialist", "Logistics Pro"],
    topRated: true,
    icon: "🛻",
  },
  {
    id: 2,
    name: "Campus Tech & AV",
    rating: 4.7,
    reviews: 89,
    tags: ["AV Specialist", "Tech Support"],
    topRated: false,
    icon: "📷",
  },
  {
    id: 3,
    name: "UniEvents Supply",
    rating: 4.5,
    reviews: 210,
    tags: ["Furniture", "Decor"],
    topRated: false,
    icon: "🪑",
  },
];

export default function EventKitGenerator() {
  const { darkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const rawItems = location.state?.kitData?.items || initialItems;
  const rawSuppliers = location.state?.kitData?.suppliers || suppliersList;
  const eventDesc = location.state?.eventDescription || "Outdoor Career Fair for 200 students";

  const [items, setItems] = useState(rawItems);

  const toggleCheck = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  const selectAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, checked: true })));
  };

  const totalEstimate = items
    .filter((i) => i.checked)
    .reduce((sum, i) => sum + (i.price * i.qty), 0);

  const handleEditDescription = () => {
    navigate("/rental/kit-generator/input", { state: { initialDescription: eventDesc } });
  };

  const handleAddToCart = (item) => {
    const product = {
      productID: item.id,
      name: item.name,
      price: item.price,
      image: item.img,
      supplierEmail: item.supplierEmail
    };
    addToCart(product, item.qty);
    toast.success(`Added ${item.qty} x ${item.name} to cart`);
  };

  const handleBulkAddToCart = () => {
    const selectedItems = items.filter(i => i.checked);
    if (selectedItems.length === 0) {
      toast.error("No items selected");
      return;
    }
    selectedItems.forEach(item => {
      addToCart({
        productID: item.id,
        name: item.name,
        price: item.price,
        image: item.img,
        supplierEmail: item.supplierEmail
      }, item.qty);
    });
    toast.success(`Successfully added ${selectedItems.length} items to your cart!`);
    navigate("/rental/cart");
  };

  const handleViewSupplier = (supplier) => {
    navigate(`/rental/supplier-details?email=${supplier.id}`);
  };

  const textPrimary = darkMode ? 'white' : '#0f172a';
  const textSecondary = '#64748b';

  return (
    <div className="page-wrapper pb-40 pt-10 anim-fadeIn">
      {/* Top Navigation */}
      <div className="max-w-7xl mx-auto mb-10">
        <Link to="/rental/kit-generator/input" 
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            textDecoration: 'none', transition: 'all 0.2s ease', color: darkMode ? '#94a3b8' : '#64748b'
          }}
          className="group hover:opacity-80"
        >
          <BiArrowBack className="text-lg group-hover:-translate-x-1 transition-transform" />
          <span style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Adjust Requirements</span>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '64px' }}>
        {/* Cinematic Output Header */}
        <section style={{ 
          position: 'relative', 
          padding: '60px', 
          background: darkMode ? 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
          borderRadius: '48px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '64px',
          border: darkMode ? '1px solid rgba(255,255,255,0.05)' : 'none',
          boxShadow: darkMode ? '0 40px 100px -20px rgba(0,0,0,0.5)' : '0 40px 100px -20px rgba(99, 102, 241, 0.3)'
        }}>
          <div style={{ flex: 1, position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px 16px', borderRadius: '100px', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '0.2em', backdropFilter: 'blur(10px)' }}>
                  Synthesized Result
                </div>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'white', boxShadow: '0 0 10px white' }} />
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Protocol: AI Logistics Manifest</span>
              </div>
              <h1 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: '950', color: 'white', letterSpacing: '-0.03em', lineHeight: '1.2', margin: 0 }}>
                Event: "{eventDesc}"
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={handleEditDescription} style={{ padding: '12px 24px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease' }} className="hover:bg-white hover:text-blue-900">
                  <BiEditAlt size={18} />
                  <span>Edit prompt</span>
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: '700' }}>
                  <BiCheck size={18} className="text-emerald-400" />
                  Logic validated by Neural Engine
                </div>
              </div>
            </div>
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '48px', alignItems: 'start' }}>
          {/* Main Item List */}
          <div style={{ backgroundColor: darkMode ? '#0f172a' : 'white', borderRadius: '32px', border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '32px 40px', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.03)' : '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BiPackage size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '950', color: textPrimary, margin: 0, letterSpacing: '-0.02em' }}>Recommended Stack</h2>
                  <p style={{ fontSize: '11px', color: textSecondary, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{items.length} Engineered Components</p>
                </div>
              </div>
              <button onClick={selectAll} style={{ fontSize: '10px', fontWeight: '900', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BiCheck size={18} /> Select All
              </button>
            </div>

            <div style={{ padding: '0 40px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: darkMode ? '1px solid rgba(255,255,255,0.03)' : '1px solid #f1f5f9' }}>
                    <th style={{ padding: '24px 0', width: '48px' }}></th>
                    <th style={{ padding: '24px 0', textAlign: 'left', fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Allocation Details</th>
                    <th style={{ padding: '24px 0', textAlign: 'center', fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', width: '100px' }}>Density</th>
                    <th style={{ padding: '24px 0', textAlign: 'right', fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', width: '150px' }}>Valuation</th>
                    <th style={{ padding: '24px 0', width: '80px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} style={{ borderBottom: darkMode ? '1px solid rgba(255,255,255,0.02)' : '1px solid #f8fafc' }} className="group">
                      <td style={{ padding: '24px 0' }}>
                        <div 
                          onClick={() => toggleCheck(item.id)}
                          style={{ 
                            width: '20px', height: '20px', borderRadius: '6px', 
                            border: item.checked ? '2px solid #2563eb' : (darkMode ? '2px solid rgba(255,255,255,0.1)' : '2px solid #e2e8f0'),
                            backgroundColor: item.checked ? '#2563eb' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease'
                          }}
                        >
                          {item.checked && <BiCheck size={16} color="white" />}
                        </div>
                      </td>
                      <td style={{ padding: '24px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '56px', height: '56px', borderRadius: '12px', overflow: 'hidden', border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0' }}>
                            <img src={item.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div style={{ fontSize: '15px', fontWeight: '900', color: textPrimary }}>{item.name}</div>
                            <div style={{ fontSize: '12px', color: textSecondary, fontWeight: '600' }}>{item.subtitle}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '24px 0', textAlign: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: '950', color: textPrimary }}>{item.qty}</span>
                      </td>
                      <td style={{ padding: '24px 0', textAlign: 'right' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '15px', fontWeight: '950', color: '#2563eb' }}>LKR {(item.price * item.qty).toLocaleString()}</span>
                          <span style={{ fontSize: '10px', color: textSecondary, fontWeight: '800', textTransform: 'uppercase' }}>LKR {item.price.toLocaleString()} unit</span>
                        </div>
                      </td>
                      <td style={{ padding: '24px 0', textAlign: 'right' }}>
                        <button onClick={() => handleAddToCart(item)} style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'transparent', border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0', color: textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }} className="hover:border-blue-500 hover:text-blue-500">
                          <BiPlus size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Suppliers Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <p style={{ fontSize: '10px', fontWeight: '950', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0 }}>Recommended Partners</p>
            {rawSuppliers.map((supplier) => (
              <div key={supplier.id} style={{ backgroundColor: darkMode ? '#0f172a' : 'white', borderRadius: '24px', padding: '24px', border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    {supplier.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: '950', color: textPrimary }}>{supplier.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <BiStar className="text-amber-400" />
                      <span style={{ fontSize: '12px', fontWeight: '800', color: textPrimary }}>{supplier.rating}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {supplier.tags.map(tag => (
                    <span key={tag} style={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', padding: '4px 8px', borderRadius: '6px', backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9', color: textSecondary }}>{tag}</span>
                  ))}
                </div>
                <button onClick={() => handleViewSupplier(supplier)} style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'transparent', border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', color: textPrimary, fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} className="hover:bg-blue-600 hover:text-white hover:border-blue-600">
                  <span>View Portfolio</span>
                  <BiChevronRight size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Summary Bar */}
      <div style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, width: 'calc(100% - 80px)', maxWidth: '900px' }}>
        <div style={{ backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '20px 32px', border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.5)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
            <div>
              <p style={{ fontSize: '9px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '4px' }}>Estimated Total</p>
              <div style={{ fontSize: '28px', fontWeight: '950', color: textPrimary, letterSpacing: '-0.02em' }}>
                <span style={{ fontSize: '14px', color: '#2563eb', marginRight: '4px' }}>LKR</span>
                {totalEstimate.toLocaleString()}
              </div>
            </div>
            <div style={{ width: '1px', height: '40px', backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }} />
            <div>
              <p style={{ fontSize: '9px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '4px' }}>Active Selection</p>
              <div style={{ fontSize: '20px', fontWeight: '950', color: textPrimary }}>{items.filter(i => i.checked).length} Items</div>
            </div>
          </div>
          <button onClick={handleBulkAddToCart} style={{ padding: '16px 40px', borderRadius: '16px', backgroundColor: '#2563eb', color: 'white', border: 'none', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)' }} className="hover:scale-[1.03] transition-transform">
            <BiCartAlt size={22} />
            <span>Deploy Manifest</span>
            <BiChevronRight size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
