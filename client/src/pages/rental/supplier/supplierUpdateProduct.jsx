// supplierUpdateProduct.jsx
import api from "../../../api/axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { BiArrowBack, BiHash, BiCube, BiTag, BiMoney, BiCloudUpload, BiSave, BiChevronRight, BiInfoCircle } from "react-icons/bi";
import uploadFile from "../utils/mediaUpload";
import { useTheme } from "../../../context/ThemeContext";

export default function SupplierUpdateProductPage() {
  const { darkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  if (!location.state) {
    window.location.href = "/supplier";
    return null;
  }

  const [productID] = useState(location.state.productID);
  const [name, setName] = useState(location.state.name);
  const [altName, setAltName] = useState(location.state.altName.join(", "));
  const [description, setDescription] = useState(location.state.description);
  const [price, setPrice] = useState(location.state.price);
  const [files, setFiles] = useState([]);
  const [category, setCategory] = useState(location.state.category);
  const [brand, setBrand] = useState(location.state.brand);
  const [model, setModel] = useState(location.state.model);
  const [stock, setStock] = useState(location.state.stock);
  const [isAvailable, setIsAvailable] = useState(location.state.isAvailable);
  const [loading, setLoading] = useState(false);

  async function updateProduct() {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("You must be logged in as a supplier");
      navigate("/login");
      return;
    }

    if (!name || !description || !category || !brand || !model) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      let images = location.state.images;
      if (files.length > 0) {
        const imagePromises = files.map(file => uploadFile(file));
        images = await Promise.all(imagePromises);
      }

      const altNamesInArray = altName.split(",").map(n => n.trim());
      await api.put(`/rental/products/${productID}`, {
        name,
        altName: altNamesInArray,
        description,
        price,
        images,
        category,
        brand,
        model,
        stock,
        isAvailable,
      });
      toast.success("Product updated successfully!");
      navigate("/supplier");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating product");
    } finally {
      setLoading(false);
    }
  }

  const textPrimary = darkMode ? 'white' : '#0f172a';
  const textSecondary = '#64748b';
  const bgColor = darkMode ? '#0f172a' : 'white';
  const borderColor = darkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0';

  return (
    <div className="page-wrapper pb-20 anim-fadeIn">
      {/* Navigation Header */}
      <div style={{ marginBottom: '48px' }}>
        <Link to="/supplier" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: textSecondary, textDecoration: 'none', marginBottom: '24px' }} className="group">
          <BiArrowBack className="group-hover:-translate-x-1 transition-transform" />
          <span style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Back to Inventory</span>
        </Link>
        <h1 style={{ fontSize: '36px', fontWeight: '900', color: textPrimary, letterSpacing: '-0.02em', marginBottom: '8px' }}>Refine Component</h1>
        <p style={{ color: textSecondary, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Syncing specifications for <span style={{ color: '#6366f1' }}>#{productID}</span>
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1000px' }}>
        {/* Hardware Identity Section */}
        <div style={{ 
          backgroundColor: bgColor, borderRadius: '32px', border: `1px solid ${borderColor}`, overflow: 'hidden',
          boxShadow: darkMode ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.02)'
        }}>
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: 'rgba(99, 102, 241, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                <BiCube size={24} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '900', color: textPrimary }}>Hardware Identity</h3>
                <span style={{ fontSize: '9px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Asset identification & branding</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Asset Tracking ID (Locked)</label>
                <div style={{ position: 'relative' }}>
                  <BiHash style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: textSecondary, opacity: '0.5' }} size={18} />
                  <input
                    type="text" value={productID} disabled
                    style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.03)', border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '16px 20px 16px 52px', color: textSecondary, fontSize: '14px', fontWeight: '900', opacity: '0.6', cursor: 'not-allowed' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Market Recognition Name</label>
                <div style={{ position: 'relative' }}>
                  <BiCube style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: textSecondary, opacity: '0.5' }} size={18} />
                  <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. SLIIT Event Laptop"
                    style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '16px 20px 16px 52px', color: textPrimary, fontSize: '14px', fontWeight: '800', outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Search Keywords</label>
              <div style={{ position: 'relative' }}>
                <BiTag style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: textSecondary, opacity: '0.5' }} size={18} />
                <input
                  type="text" value={altName} onChange={(e) => setAltName(e.target.value)}
                  placeholder="laptop, computer, notebook"
                  style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '16px 20px 16px 52px', color: textPrimary, fontSize: '14px', fontWeight: '800', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Tech Description</label>
              <textarea
                value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed specifications and rental terms..."
                style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '20px', padding: '20px', color: textPrimary, fontSize: '14px', fontWeight: '600', minHeight: '140px', lineHeight: '1.6', outline: 'none', resize: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Logistics & Market Strategy Section */}
        <div style={{ 
          backgroundColor: bgColor, borderRadius: '32px', border: `1px solid ${borderColor}`, padding: '40px',
          boxShadow: darkMode ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: 'rgba(16, 185, 129, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <BiMoney size={24} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '900', color: textPrimary }}>Logistics & Strategy</h3>
              <span style={{ fontSize: '9px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Market parameters & deployment</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Daily Rental Rate</label>
              <div style={{ position: 'relative' }}>
                <BiMoney style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#10b981' }} size={18} />
                <input
                  type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                  style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '16px 20px 16px 52px', color: textPrimary, fontSize: '14px', fontWeight: '800', outline: 'none' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Deployment Category</label>
              <select
                value={category} onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '16px 20px', color: textPrimary, fontSize: '14px', fontWeight: '800', outline: 'none', cursor: 'pointer' }}
              >
                <option value="Audio & Visual Equipment">Audio & Visual</option>
                <option value="Lighting & Effects">Lighting & Effects</option>
                <option value="Furniture & Seating">Furniture & Seating</option>
                <option value="Tents & Canopies">Tents & Canopies</option>
                <option value="Catering & Food Service">Catering & Food</option>
                <option value="Decor & Theming">Decor & Theming</option>
                <option value="Stage & Platforms">Stage & Platforms</option>
                <option value="Photo & Video Booths">Photo & Video</option>
                <option value="Games & Entertainment">Entertainment</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Brand</label>
              <input
                type="text" value={brand} onChange={(e) => setBrand(e.target.value)}
                style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '16px 20px', color: textPrimary, fontSize: '14px', fontWeight: '800', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Model</label>
              <input
                type="text" value={model} onChange={(e) => setModel(e.target.value)}
                style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '16px 20px', color: textPrimary, fontSize: '14px', fontWeight: '800', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Active Stock</label>
              <input
                type="number" value={stock} onChange={(e) => setStock(e.target.value)}
                style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '16px 20px', color: textPrimary, fontSize: '14px', fontWeight: '800', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Asset Priority</label>
              <select
                value={isAvailable} onChange={(e) => setIsAvailable(e.target.value === "true")}
                style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '16px 20px', color: textPrimary, fontSize: '14px', fontWeight: '800', outline: 'none', cursor: 'pointer' }}
              >
                <option value={true}>Live on Market</option>
                <option value={false}>Internal Review</option>
              </select>
            </div>
          </div>
        </div>

        {/* Visual Assets Section */}
        <div style={{ 
          backgroundColor: bgColor, borderRadius: '32px', border: `1px solid ${borderColor}`, padding: '40px',
          boxShadow: darkMode ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.02)'
        }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: 'rgba(99, 102, 241, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
              <BiCloudUpload size={24} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '900', color: textPrimary }}>Visual Assets</h3>
              <span style={{ fontSize: '9px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Update product imagery</span>
            </div>
          </div>

          <div style={{ position: 'relative' }} className="group">
            <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files))} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }} />
            <div style={{ border: `2px dashed ${borderColor}`, borderRadius: '24px', padding: '64px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.03)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = borderColor; e.currentTarget.style.backgroundColor = 'transparent'; }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '20px', backgroundColor: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                <BiCloudUpload size={32} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '14px', fontWeight: '900', color: textPrimary, marginBottom: '4px' }}>
                  {files.length > 0 ? `${files.length} New Assets Staged` : "Drag new visuals here to update"}
                </p>
                <p style={{ fontSize: '10px', fontWeight: '800', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Keeps existing visuals if no files are uploaded</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px' }}>
           <button 
             onClick={() => navigate('/supplier')}
             style={{ backgroundColor: 'transparent', color: textSecondary, padding: '14px 32px', borderRadius: '16px', fontWeight: '900', fontSize: '12px', border: `1px solid ${borderColor}`, cursor: 'pointer', textTransform: 'uppercase' }}
           >
             Cancel Edits
           </button>
           <button
             onClick={updateProduct}
             disabled={loading}
             style={{ 
               backgroundColor: '#6366f1', color: 'white', padding: '16px 40px', borderRadius: '18px', 
               fontWeight: '950', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '12px',
               cursor: 'pointer', border: 'none', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)', transition: 'all 0.3s ease',
               textTransform: 'uppercase', letterSpacing: '0.1em'
             }}
             onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(99, 102, 241, 0.3)'; }}
             onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(99, 102, 241, 0.2)'; }}
           >
             {loading ? <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.2)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <BiSave size={20} />}
             <span>Synchronize Updates</span>
           </button>
        </div>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
