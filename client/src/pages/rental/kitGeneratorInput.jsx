import { useState, useEffect, useRef } from "react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import { useNavigate } from "react-router-dom";

// ── Sidebar icons ─────────────────────────────────────────────────────────────
const GridIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
const SparkleIcon = ({ size = 18, color = "white" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>;
const BoxIcon     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
const HistoryIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>;
const ArrowIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;

const sidebarItems = [
  { label: "Products",             icon: "grid"    },
  { label: "Event Kit\nGenerator", icon: "sparkle", active: true },
  { label: "Suppliers",            icon: "box"     },
  { label: "History",              icon: "history" },
];

// ── Example prompts that cycle ────────────────────────────────────────────────
const EXAMPLES = [
  "A 200-person outdoor graduation ceremony with live music and a stage...",
  "Tech conference for 500 students, multiple breakout rooms, projectors needed...",
  "Freshmen welcome mixer in the main hall, casual vibe, 150 attendees...",
  "Annual gala dinner for 300 guests, formal setting, full AV setup...",
  "Career fair across 3 rooms, 80 company booths, lighting and tables...",
];

// ── What the generator produces — shown as animated cards ────────────────────
const OUTPUTS = [
  { icon: "📦", title: "Equipment List",   desc: "Tailored items matched to your event size and type" },
  { icon: "🏢", title: "Supplier Matches", desc: "Top campus-verified suppliers for your needs"        },
  { icon: "💰", title: "Cost Estimate",    desc: "Transparent pricing before you commit to anything"   },
  { icon: "🧾", title: "Rental Quote",     desc: "Itemised quote with supplier details for every item"  },
];

// ── Quick-start suggestion chips ─────────────────────────────────────────────
const QUICK_STARTS = [
  "Outdoor graduation ceremony",
  "Tech conference, 500 students",
  "Formal gala dinner, 300 guests",
  "Career fair with 80 booths",
  "Welcome mixer, casual, 150 people",
  "Workshop with projectors & mics",
];

export default function EventKitGeneratorPage() {
  const [description, setDescription]   = useState("");
  const [placeholder, setPlaceholder]   = useState(EXAMPLES[0]);
  const [exIdx, setExIdx]               = useState(0);
  const [fadePlaceholder, setFade]      = useState(true);
  const [charCount, setCharCount]       = useState(0);
  const [focused, setFocused]           = useState(false);
  const [loading, setLoading]           = useState(false);
  const textareaRef                     = useRef(null);

  // Cycle placeholder examples
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

  const handleGenerate = () => {
  if (!description.trim()) return;

  setLoading(true);

  setTimeout(() => {
    setLoading(false);
    navigate("/kit-generator"); // ✅ correct navigation
  }, 2000);
};

const navigate = useNavigate();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", backgroundColor: "#F3F4F6" }}>

      <Navbar />

      <div style={{ display: "flex", flex: 1 }}>

        <Sidebar />

        {/* ── Main ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>

          {/* ── Hero band ── */}
          <div style={{
            backgroundColor: "#FFFFFF",
            padding: "40px 52px 44px",
            position: "relative",
            overflow: "hidden",
            borderBottom: "1px solid #E5E7EB",
          }}>
 
            {/* Heading */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <div style={{ width: "40px", height: "40px", backgroundColor: "#EFF6FF", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <SparkleIcon size={20} color="#1E40AF" />
              </div>
              <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#111827", margin: 0, letterSpacing: "-0.4px" }}>
                Event Kit Generator
              </h1>
            </div>
            <p style={{ fontSize: "15px", color: "#6B7280", margin: "0 0 28px 52px", maxWidth: "520px", lineHeight: "1.6" }}>
              Describe your event in plain language. Our AI will instantly build a complete equipment kit, match suppliers, and estimate costs.
            </p>

            {/* ── The textarea card ── */}
            <div style={{
              backgroundColor: "#FAFAFA",
              borderRadius: "14px",
              border: focused ? "1.5px solid #1E40AF" : "1.5px solid #E5E7EB",
              boxShadow: focused ? "0 0 0 3px rgba(191,219,254,0.5)" : "0 1px 4px rgba(0,0,0,0.05)",
              overflow: "hidden",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}>
              {/* Textarea top bar */}
              <div style={{ padding: "13px 18px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <SparkleIcon size={14} color="#1152D4" />
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#1152D4", letterSpacing: "0.7px", textTransform: "uppercase" }}>Describe your event</span>
              </div>

              <textarea
                ref={textareaRef}
                value={description}
                onChange={handleInput}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                maxLength={800}
                rows={5}
                placeholder={placeholder}
                style={{
                  width: "100%",
                  padding: "12px 18px 8px",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  fontSize: "15px",
                  color: "#111827",
                  lineHeight: "1.7",
                  fontFamily: "'Segoe UI', sans-serif",
                  backgroundColor: "transparent",
                  boxSizing: "border-box",
                  transition: "opacity 0.3s",
                  opacity: fadePlaceholder ? 1 : 0.6,
                }}
              />

              {/* Bottom bar of textarea */}
              <div style={{ padding: "10px 18px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F3F4F6" }}>
                <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
                  {charCount}/800 characters
                </span>
                <button
                  onClick={handleGenerate}
                  disabled={!description.trim() || loading}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "10px 24px",
                    backgroundColor: description.trim() ? "#1152D4" : "#BFDBFE",
                    border: "none", borderRadius: "9px",
                    color: "#FFFFFF", fontSize: "14px", fontWeight: "700",
                    cursor: description.trim() ? "pointer" : "not-allowed",
                    transition: "background-color 0.2s, transform 0.1s",
                    transform: loading ? "scale(0.97)" : "scale(1)",
                  }}
                >
                  {loading ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <SparkleIcon size={16} />
                      Generate My Kit
                      <ArrowIcon />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick-start chips */}
            <div style={{ marginTop: "18px" }}>
              <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 10px 0", fontWeight: "700", letterSpacing: "0.6px", textTransform: "uppercase" }}>Try an example</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {QUICK_STARTS.map((qs) => (
                  <button
                    key={qs}
                    onClick={() => handleQuickStart(qs)}
                    style={{
                      padding: "6px 14px",
                      backgroundColor: "#EFF6FF",
                      border: "1px solid #BFDBFE",
                      borderRadius: "20px",
                      fontSize: "12px",
                      color: "#1E40AF",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontWeight: "500",
                      transition: "background-color 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#DBEAFE"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "#EFF6FF"}
                  >
                    {qs}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── What you'll get section ── */}
          <div style={{ padding: "40px 52px 20px" }}>
            <p style={{ fontSize: "11px", fontWeight: "700", color: "#9CA3AF", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 20px 0" }}>
              What the generator produces
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "40px" }}>
              {OUTPUTS.map((o, i) => (
                <div key={i} style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "12px",
                  padding: "20px 18px",
                  border: "1px solid #E5E7EB",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  {/* Top accent line */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", backgroundColor: "#1E40AF", borderRadius: "12px 12px 0 0" }} />
                  <div style={{ fontSize: "26px", marginBottom: "10px" }}>{o.icon}</div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "5px" }}>{o.title}</div>
                  <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: "1.5" }}>{o.desc}</div>
                </div>
              ))}
            </div>

            {/* ── How it works strip ── */}
            <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", padding: "24px 28px", marginBottom: "20px" }}>
              <p style={{ fontSize: "13px", fontWeight: "700", color: "#374151", margin: "0 0 18px 0" }}>How it works</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr auto 1fr", alignItems: "center", gap: "0" }}>
                {[
                  { step: "1", label: "Describe",  sub: "Write about your event in plain English"     },
                  { step: "2", label: "Analyse",   sub: "AI reads event type, size & requirements"   },
                  { step: "3", label: "Generate",  sub: "Kit is built with matched suppliers"         },
                  { step: "4", label: "Book",       sub: "Confirm and reserve everything in one click" },
                ].map((s, i) => (
                  <>
                    <div key={s.step} style={{ textAlign: "center", padding: "0 8px" }}>
                      <div style={{ width: "32px", height: "32px", backgroundColor: "#EFF6FF", border: "2px solid #BFDBFE", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", fontSize: "13px", fontWeight: "800", color: "#1E40AF" }}>
                        {s.step}
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", marginBottom: "3px" }}>{s.label}</div>
                      <div style={{ fontSize: "11px", color: "#9CA3AF", lineHeight: "1.4" }}>{s.sub}</div>
                    </div>
                    {i < 3 && (
                      <div key={`arrow-${i}`} style={{ textAlign: "center", paddingBottom: "20px" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BFDBFE" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                      </div>
                    )}
                  </>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
