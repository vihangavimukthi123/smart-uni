// kitGeneratorInput.jsx
import { useState, useEffect, useRef } from "react";
import api from "../../api/axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { 
  BiStar, BiChevronRight, BiPackage, BiBuildings, 
  BiMoney, BiAlignLeft, BiCheck, BiBot, BiArrowBack, 
  BiInfoCircle, BiSearch, BiRefresh, BiChip, BiAnalyse, BiTask
} from "react-icons/bi";
import { useTheme } from "../../context/ThemeContext";

const EXAMPLES = [
  "A 200-person outdoor graduation ceremony with live music and a stage...",
  "Tech conference for 500 students, multiple breakout rooms, projectors needed...",
  "Freshmen welcome mixer in the main hall, casual vibe, 150 attendees...",
  "Annual gala dinner for 300 guests, formal setting, full AV setup...",
  "Career fair across 3 rooms, 80 company booths, lighting and tables...",
  "Workshop with projectors & mics...",
];

const OUTPUTS = [
  { icon: <BiPackage size={32} />, title: "Hardware Stack", desc: "Tailored equipment matched to your event scale and logistics type" },
  { icon: <BiBuildings size={32} />, title: "Partner Match", desc: "Top campus-verified suppliers synchronized for your requirements" },
  { icon: <BiMoney size={32} />, title: "Financial Audit", desc: "Transparent, real-time pricing and university discount estimates" },
  { icon: <BiAlignLeft size={32} />, title: "Logistics Quote", desc: "Itemized manifest with procurement paths for every component" },
];

const QUICK_STARTS = [
  "Outdoor graduation ceremony",
  "Tech conference, 500 students",
  "Formal gala dinner, 300 guests",
  "Career fair with 80 booths",
  "Welcome mixer, 150 people",
  "Workshop with projectors",
];

export default function EventKitGeneratorPage() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [description, setDescription] = useState(location.state?.initialDescription || "");
  const [placeholder, setPlaceholder] = useState(EXAMPLES[0]);
  const [exIdx, setExIdx] = useState(0);
  const [fadePlaceholder, setFade] = useState(true);
  const [charCount, setCharCount] = useState(location.state?.initialDescription?.length || 0);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setExIdx(i => {
          const next = (i + 1) % EXAMPLES.length;
          setPlaceholder(EXAMPLES[next]);
          return next;
        });
        setFade(true);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleInput = (e) => {
    setDescription(e.target.value);
    setCharCount(e.target.value.length);
  };

  const handleQuickStart = (text) => {
    setDescription(text);
    setCharCount(text.length);
    textareaRef.current?.focus();
  };

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    try {
      const response = await api.post("/rental/products/generate-kit", { description });
      navigate("/rental/kit-generator", { state: { kitData: response.data, eventDescription: description } });
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Error generating kit";
      alert(`${errorMsg}. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    backgroundColor: darkMode ? '#0f172a' : 'white',
    borderRadius: '32px',
    border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0',
    boxShadow: darkMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 20px 40px -10px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden'
  };

  const textPrimary = darkMode ? 'white' : '#0f172a';
  const textSecondary = '#64748b';

  return (
    <div className="page-wrapper pb-32 pt-10 anim-fadeIn">
      {/* Top Navigation */}
      <div className="max-w-6xl mx-auto mb-10">
        <Link to="/rental/items" 
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            textDecoration: 'none', transition: 'all 0.2s ease', color: darkMode ? '#94a3b8' : '#64748b'
          }}
          className="group hover:opacity-80"
        >
          <BiArrowBack className="text-lg group-hover:-translate-x-1 transition-transform" />
          <span style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Back to Inventory</span>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
        {/* Cinematic Header Section */}
        <section style={{ 
          position: 'relative', 
          padding: '80px 60px', 
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
          {/* Abstract Neural Decorations */}
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-50px', left: '20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)', borderRadius: '50%' }} />

          <div style={{ flex: 1, position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px 16px', borderRadius: '100px', backgroundColor: 'rgba(255, 255, 255, 0.15)', color: 'white', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '0.2em', backdropFilter: 'blur(10px)' }}>
                  Next-Gen Logistics
                </div>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'white', boxShadow: '0 0 10px white' }} />
                <span style={{ fontSize: '11px', fontWeight: '800', color: darkMode ? '#94a3b8' : 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Neural Engine v2.0</span>
              </div>
              <h1 style={{ fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: '950', color: 'white', letterSpacing: '-0.04em', lineHeight: '1.05', margin: 0 }}>
                Build Your Event <span style={{ color: darkMode ? '#6366f1' : '#c7d2fe' }}>With AI Precision</span>
              </h1>
              <p style={{ fontSize: '18px', color: darkMode ? '#94a3b8' : 'rgba(255,255,255,0.9)', lineHeight: '1.7', fontWeight: '500', maxWidth: '600px', margin: 0 }}>
                Describe your event requirements in natural language. Our neural engine will architect a complete list of items in seconds.
              </p>
            </div>
          </div>


        </section>

        {/* Input & Presets Group */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '64px' }}>
          {/* Textarea Input Card */}
          <div style={{ 
            ...cardStyle, 
            padding: '2px', 
            transition: 'all 0.3s ease',
            border: focused ? '1px solid #6366f1' : (darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0'),
            boxShadow: focused ? '0 0 40px rgba(99, 102, 241, 0.15)' : (darkMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 20px 40px -10px rgba(0, 0, 0, 0.05)')
          }}>
            <div style={{ padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.03)' : '1px solid #f1f5f9', backgroundColor: darkMode ? 'rgba(255,255,255,0.01)' : '#fafafa' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BiChip style={{ color: '#6366f1' }} size={20} />
                <span style={{ fontSize: '10px', fontWeight: '900', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.15em' }}>System Input: Requirement Definition</span>
              </div>
              <div style={{ fontSize: '9px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.2em', opacity: '0.5' }}>
                Neural Engine: Active
              </div>
            </div>

            <textarea
              ref={textareaRef}
              value={description}
              onChange={handleInput}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              maxLength={800}
              rows={2}
              placeholder={placeholder}
              style={{ 
                width: '100%', 
                backgroundColor: 'transparent', 
                border: 'none', 
                outline: 'none', 
                padding: '24px 32px', 
                fontSize: '18px', 
                fontWeight: '500', 
                color: textPrimary, 
                resize: 'none', 
                lineHeight: '1.8',
                opacity: fadePlaceholder ? 1 : 0.4,
                transition: 'opacity 0.4s ease'
              }}
            />

            <div style={{ padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: darkMode ? '1px solid rgba(255,255,255,0.03)' : '1px solid #f1f5f9', backgroundColor: darkMode ? 'rgba(255,255,255,0.01)' : '#fafafa' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6366f1', boxShadow: '0 0 10px #6366f1' }} />
                <span style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {charCount} / 800 Tokens Utilized
                </span>
              </div>
              <button
                onClick={handleGenerate}
                disabled={!description.trim() || loading}
                style={{ 
                  padding: '14px 40px', borderRadius: '16px', 
                  backgroundColor: !description.trim() || loading ? (darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9') : '#6366f1', 
                  color: !description.trim() || loading ? '#64748b' : 'white', 
                  fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', 
                  letterSpacing: '0.2em', border: 'none', 
                  cursor: !description.trim() || loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  boxShadow: !description.trim() || loading ? 'none' : '0 10px 20px rgba(99, 102, 241, 0.2)',
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? (
                  <>
                    <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <BiStar size={18} />
                    <span>Generate Kit</span>
                    <BiChevronRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Start Chips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 8px' }}>
            <p style={{ fontSize: '9px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.3em', opacity: '0.5' }}>System Presets / Rapid Prototyping</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {QUICK_STARTS.map((qs) => (
                <button
                  key={qs}
                  onClick={() => handleQuickStart(qs)}
                  style={{ 
                    padding: '14px 28px', 
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : 'white', 
                    border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0', 
                    borderRadius: '100px', 
                    fontSize: '11px', 
                    fontWeight: '800', 
                    color: textSecondary, 
                    cursor: 'pointer', 
                    transition: 'all 0.2s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0'; e.currentTarget.style.color = textSecondary; e.currentTarget.style.backgroundColor = darkMode ? 'rgba(255,255,255,0.02)' : 'white'; }}
                >
                  {qs}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* WHAT THE GENERATOR PRODUCES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <p style={{ fontSize: '11px', fontWeight: '950', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: '0.8' }}>What the generator produces</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {[
              { title: "Equipment List", desc: "Tailored items matched to your event size and type", icon: <BiPackage size={24} />, color: "#2563eb" },
              { title: "Supplier Matches", desc: "Top campus-verified suppliers for your needs", icon: <BiBuildings size={24} />, color: "#2563eb" },
              { title: "Cost Estimate", desc: "Transparent pricing before you commit to anything", icon: <BiMoney size={24} />, color: "#2563eb" },
              { title: "Rental Quote", desc: "Itemised quote with supplier details for every item", icon: <BiTask size={24} />, color: "#2563eb" },
            ].map((item, i) => (
              <div key={i} style={{ 
                backgroundColor: darkMode ? '#0f172a' : 'white', 
                borderRadius: '16px', 
                padding: '32px', 
                border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0',
                borderTop: `4px solid ${item.color}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}>
                <div style={{ color: item.color, opacity: 0.8 }}>{item.icon}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '900', color: textPrimary, margin: 0 }}>{item.title}</h4>
                  <p style={{ fontSize: '13px', color: textSecondary, margin: 0, lineHeight: '1.5', fontWeight: '500' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div style={{ ...cardStyle, padding: '48px 40px', backgroundColor: darkMode ? '#0f172a' : 'white' }}>
          <p style={{ fontSize: '11px', fontWeight: '950', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: '0.8', marginBottom: '40px' }}>How it works</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
            {[
              { step: 1, label: "Describe" },
              { step: 2, label: "Analyse" },
              { step: 3, label: "Generate" },
              { step: 4, label: "Book" },
            ].map((s, i, arr) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.08)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '14px', border: '1px solid rgba(37, 99, 235, 0.15)' }}>
                    {s.step}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '900', color: textPrimary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ flex: 1, height: '1px', backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0', position: 'relative', marginBottom: '24px' }}>
                    <div style={{ position: 'absolute', right: 0, top: '-3px', width: '6px', height: '6px', borderTop: `2px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`, borderRight: `2px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`, transform: 'rotate(45deg)' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>


      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
