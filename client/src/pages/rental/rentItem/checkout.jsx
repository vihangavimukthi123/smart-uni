import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import Sidebar from "../../../components/layout/Sidebar";
import Navbar from "../../../components/layout/Navbar";
import api from "../../../api/axios";
import toast from "react-hot-toast";

// ── Icons ────────────────────────────────────────────────────────────────────
const CalPickupIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E40AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const CalReturnIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="9" y1="14" x2="15" y2="20" /><line x1="15" y1="14" x2="9" y2="20" /></svg>;
const LockIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
const ArrowLeft = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>;
const InfoIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E40AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
const ChevLeft = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>;
const ChevRight = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>;
const ChevDownSm = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>;
const CheckCircle = () => <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" /></svg>;
const XCircle = () => <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>;

// ── Calendar constants ────────────────────────────────────────────────────────
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_LABELS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDow(y, m) { return new Date(y, m, 1).getDay(); }
function toKey(y, m, d) { return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`; }
function keyToDate(k) { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); }
function fmtKey(k) { if (!k) return "—"; return keyToDate(k).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
function diffDays(s, e) { if (!s || !e) return 0; return Math.round((keyToDate(e) - keyToDate(s)) / 86400000) + 1; }

// ── Interactive Calendar ──────────────────────────────────────────────────────
function MiniCalendar({ startKey, endKey, hoverKey, onSelect, onHover }) {
  const today = new Date();
  const [vYear, setVYear] = useState(today.getFullYear());
  const [vMonth, setVMonth] = useState(today.getMonth());
  const [picker, setPicker] = useState(false);

  function isPastDate(key) {
    const t = new Date();
    const d = keyToDate(key);

    t.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);

    return d < t;
  }

  function prevMonth() {
    if (vMonth === 0) { setVMonth(11); setVYear(y => y - 1); }
    else setVMonth(m => m - 1);
  }

  function nextMonth() {
    if (vMonth === 11) { setVMonth(0); setVYear(y => y + 1); }
    else setVMonth(m => m + 1);
  }

  const dim = getDaysInMonth(vYear, vMonth);
  const firstDow = getFirstDow(vYear, vMonth);
  const totalCells = Math.ceil((firstDow + dim) / 7) * 7;

  function cellInfo(idx) {
    const dayNum = idx - firstDow + 1;
    const cur = dayNum >= 1 && dayNum <= dim;

    let d, m, y;

    if (cur) {
      d = dayNum; m = vMonth; y = vYear;
    } else if (dayNum < 1) {
      const pm = vMonth === 0 ? 11 : vMonth - 1;
      const py = vMonth === 0 ? vYear - 1 : vYear;
      d = getDaysInMonth(py, pm) + dayNum;
      m = pm; y = py;
    } else {
      d = dayNum - dim;
      m = vMonth === 11 ? 0 : vMonth + 1;
      y = vMonth === 11 ? vYear + 1 : vYear;
    }

    return { d, m, y, cur, key: toKey(y, m, d) };
  }

  function dayStyle(key, cur) {
    const isStart = key === startKey;
    const isEnd = key === endKey;
    const past = isPastDate(key);

    let inRange = false;

    if (startKey && endKey && key > startKey && key < endKey) inRange = true;
    if (startKey && !endKey && hoverKey && key > startKey && key <= hoverKey) inRange = true;

    if (!cur) return { bg: "transparent", color: "#D1D5DB", fw: "400", br: "50%" };

    // 🚫 Disable past dates
    if (past) return { bg: "#F3F4F6", color: "#D1D5DB", fw: "400", br: "50%" };

    if (isStart || isEnd) return { bg: "#1E40AF", color: "#fff", fw: "700", br: "50%" };
    if (inRange) return { bg: "#DBEAFE", color: "#1E40AF", fw: "600", br: "4px" };

    return { bg: "transparent", color: "#374151", fw: "400", br: "50%" };
  }

  const yearRange = [];
  for (let y = today.getFullYear() - 5; y <= today.getFullYear() + 10; y++) {
    yearRange.push(y);
  }

  return (
    <div style={{ flex: 1, userSelect: "none" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <button onClick={prevMonth} style={{ width: "26px", height: "26px", border: "1px solid #E5E7EB", borderRadius: "6px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ChevLeft />
        </button>

        <div style={{ position: "relative" }}>
          <button onClick={() => setPicker(v => !v)} style={{ border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: "700" }}>
            {MONTH_NAMES[vMonth]} {vYear} <ChevDownSm />
          </button>

          {picker && (
            <div style={{ position: "absolute", top: "34px", left: "50%", transform: "translateX(-50%)", background: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "12px", width: "228px" }}>

              <p style={{ fontSize: "10px", fontWeight: "700", marginBottom: "8px" }}>MONTH</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "4px" }}>
                {MONTH_NAMES.map((mn, mi) => (
                  <button key={mn} onClick={() => { setVMonth(mi); setPicker(false); }}
                    style={{
                      border: "none", borderRadius: "6px", padding: "6px", fontSize: "11px",
                      background: mi === vMonth ? "#1E40AF" : "#F3F4F6",
                      color: mi === vMonth ? "#fff" : "#374151"
                    }}>
                    {mn.slice(0, 3)}
                  </button>
                ))}
              </div>

              <p style={{ fontSize: "10px", fontWeight: "700", margin: "10px 0 8px" }}>YEAR</p>
              <div style={{ maxHeight: "108px", overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "4px" }}>
                {yearRange.map(y => (
                  <button key={y} onClick={() => { setVYear(y); setPicker(false); }}
                    style={{
                      border: "none", borderRadius: "6px", padding: "6px",
                      background: y === vYear ? "#1E40AF" : "#F3F4F6",
                      color: y === vYear ? "#fff" : "#374151"
                    }}>
                    {y}
                  </button>
                ))}
              </div>

            </div>
          )}
        </div>

        <button onClick={nextMonth} style={{ width: "26px", height: "26px", border: "1px solid #E5E7EB", borderRadius: "6px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ChevRight />
        </button>
      </div>

      {/* Days */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: "4px" }}>
        {DAY_LABELS.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: "10px", fontWeight: "700", color: "#9CA3AF" }}>{d}</div>
        ))}
      </div>

      {/* Dates */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "2px" }}>
        {Array.from({ length: totalCells }).map((_, idx) => {
          const { d, cur, key } = cellInfo(idx);
          const { bg, color, fw, br } = dayStyle(key, cur);
          const past = isPastDate(key);

          return (
            <div key={idx} style={{ display: "flex", justifyContent: "center" }}>
              <div
                onClick={() => cur && !past && onSelect(key)}
                onMouseEnter={() => cur && !past && onHover(key)}
                onMouseLeave={() => onHover(null)}
                style={{
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: br,
                  fontSize: "12px",
                  fontWeight: fw,
                  backgroundColor: bg,
                  color,
                  cursor: cur && !past ? "pointer" : "not-allowed"
                }}
              >
                {cur ? d : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Order Confirmation Modal ──────────────────────────────────────────────────
function OrderModal({ success, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "40px 36px", width: "340px", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "18px" }}>
          {success ? <CheckCircle /> : <XCircle />}
        </div>
        <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#111827", margin: "0 0 10px 0" }}>
          {success ? "Order Placed Successfully!" : "Order Failed"}
        </h2>
        <p style={{ fontSize: "14px", color: "#6B7280", margin: "0 0 28px 0", lineHeight: "1.6" }}>
          {success
            ? "Your rental has been confirmed. You'll receive a confirmation shortly."
            : "Something went wrong while placing your order. Please try again."}
        </p>
        <button
          onClick={onClose}
          style={{ width: "100%", padding: "12px 0", backgroundColor: success ? "#1E40AF" : "#DC2626", border: "none", borderRadius: "10px", color: "#fff", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>
          {success ? "Done" : "Try Again"}
        </button>
      </div>
    </div>
  );
}

// ── Validation error message ──────────────────────────────────────────────────
function ErrMsg({ msg }) {
  if (!msg) return null;
  return <div style={{ fontSize: "11px", color: "#DC2626", marginTop: "5px", fontWeight: "500" }}>{msg}</div>;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();

  // ── Calendar state ──
  const [startKey, setStartKey] = useState(null);
  const [endKey, setEndKey] = useState(null);
  const [hoverKey, setHoverKey] = useState(null);

  function handleSelect(key) {
    if (!startKey || (startKey && endKey)) { setStartKey(key); setEndKey(null); }
    else if (key < startKey) { setStartKey(key); setEndKey(null); }
    else if (key === startKey) { setStartKey(null); }
    else setEndKey(key);
  }

  const rentalDays = diffDays(startKey, endKey);

  // ── Form state ──
  const [campusChoice, setCampusChoice] = useState("sliit");
  const [otherPlace, setOtherPlace] = useState("");
  const [instructions, setInstructions] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [uniId, setUniId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // ── Validation errors ──
  const [errors, setErrors] = useState({});

  // ── Auto-fill email from token ──
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        // Auto-fill only if it's a student and we have an email
        if (payload.role === "student" && payload.email) {
          setEmail(payload.email);
        }
      }
    } catch (err) {
      console.error("Error decoding token for email auto-fill:", err);
    }
  }, []);

  // ── Modal ──
  const [modal, setModal] = useState(null); // null | "success" | "fail"

  // ── Pricing ──
  const safeItems = cartItems || [];
  const subtotal = safeItems.reduce((s, i) => s + (i.total || 0), 0);
  const delivery = 15.00;
  const tax = +(subtotal * 0.0547).toFixed(2);
  const total = +(subtotal + delivery + tax).toFixed(2);

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate() {
    const e = {};

    // Rental duration — both dates required
    if (!startKey) e.startKey = "Please select a pickup date.";
    if (!endKey) e.endKey = "Please select a return date.";

    // Delivery
    if (campusChoice === "other" && !otherPlace.trim())
      e.otherPlace = "Please specify the location.";

    // Contact
    if (!organizer.trim())
      e.organizer = "Event organizer name is required.";

    if (!uniId.trim()) {
      e.uniId = "University ID is required.";
    } else if (!/^\w{10}$/.test(uniId.trim())) {
      e.uniId = "University ID must be exactly 10 characters.";
    }

    if (!phone.trim()) {
      e.phone = "Phone number is required.";
    } else if (!/^0\d{9}$/.test(phone.trim())) {
      e.phone = "Phone must be 10 digits and start with 0.";
    }

    if (!email.trim()) {
      e.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.(com|lk)$/i.test(email.trim())) {
      e.email = "Enter a valid email (e.g. name@example.com or .lk).";
    }

    return e;
  }

  async function handleConfirm() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    if (cartItems.length === 0) {
      toast.error("Your cart is empty. Please add items before checking out.");
      return;
    }

    // Simulate order — replace with real API call
    try {
      const token = localStorage.getItem("token");

      const items = cartItems.map(item => ({
        productId: item.id || item._id,
        name: item.name,
        qty: item.qty,
        price: item.pricePerDay || item.price || 0,
        image: item.image,
        supplierEmail: item.supplierEmail || "unknown",
        status: "Pending"
      }));

      const orderPayload = {
        totalAmount: total, // Use Grand Total
        items,
        rentalDates: {
          pickup: keyToDate(startKey),
          return: keyToDate(endKey)
        },
        deliveryDetails: {
          campus: campusChoice,
          location: campusChoice === "other" ? otherPlace : "SLIIT Kandy Uni",
          instructions: instructions
        },
        contactInfo: {
          organizer: organizer,
          uniId: uniId,
          phone: phone,
          email: email
        }
      };

      console.log("SENDING ORDER PAYLOAD:", orderPayload);

      const response = await api.post(
        "/rental/orders",
        orderPayload
      );

      const newOrderId = response.data.order?._id;
      clearCart();
      toast.success("Order placed successfully!");
      setModal("success");
    } catch (error) {
      console.error("ORDER SUBMISSION FAILED:", error.response?.data || error);
      const serverMsg = error.response?.data?.details?.join(", ") || error.response?.data?.message;
      const errMsg = serverMsg || error.message || "Failed to place order";
      toast.error(errMsg);
      setModal("fail");
    }
  }

  function handleModalClose() {
    if (modal === "success") {
      navigate("/itemlist");
    }
    setModal(null);
  }

  // ── Style helpers ──
  const inputStyle = (errKey) => ({
    width: "100%", padding: "10px 12px",
    border: `1px solid ${errors[errKey] ? "#FCA5A5" : "#E5E7EB"}`,
    borderRadius: "8px", fontSize: "14px", color: "#374151",
    backgroundColor: errors[errKey] ? "#FFF5F5" : "#FFFFFF",
    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  });

  const stepNum = n => (
    <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#EFF6FF", border: "1.5px solid #BFDBFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "800", color: "#1E40AF", flexShrink: 0 }}>{n}</div>
  );

  const card = { backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", padding: "24px", marginBottom: "16px" };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", backgroundColor: "#F3F4F6" }}>
      <Navbar />
      {/* Modal */}
      {modal && <OrderModal success={modal === "success"} onClose={handleModalClose} />}

      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />

        <div style={{ flex: 1, padding: "32px 28px", display: "flex", gap: "24px", alignItems: "flex-start" }}>

          {/* ── LEFT ── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#111827", margin: "0 0 4px 0", letterSpacing: "-0.5px" }}>Checkout</h1>
            <p style={{ fontSize: "14px", color: "#6B7280", margin: "0 0 24px 0" }}>Please review your event details and complete the booking.</p>

            {/* Section 1 — Rental Duration */}
            <div style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {stepNum(1)}
                  <h2 style={{ fontSize: "17px", fontWeight: "800", color: "#111827", margin: 0 }}>Rental Duration</h2>
                </div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#1E40AF", backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE", padding: "4px 10px", borderRadius: "20px", letterSpacing: "0.5px" }}>
                  {rentalDays > 0 ? `TOTAL: ${rentalDays} DAY${rentalDays !== 1 ? "S" : ""}` : "SELECT DATES"}
                </span>
              </div>

              <div style={{ display: "flex", gap: "24px" }}>
                <MiniCalendar startKey={startKey} endKey={endKey} hoverKey={hoverKey} onSelect={handleSelect} onHover={setHoverKey} />

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", minWidth: "190px" }}>
                  {/* Pickup card */}
                  <div style={{ border: `1px solid ${errors.startKey ? "#FCA5A5" : startKey ? "#BFDBFE" : "#E5E7EB"}`, borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px", backgroundColor: errors.startKey ? "#FFF5F5" : startKey ? "#EFF6FF" : "#fff" }}>
                    <CalPickupIcon />
                    <div>
                      <div style={{ fontSize: "10px", fontWeight: "700", color: "#9CA3AF", letterSpacing: "0.5px", marginBottom: "2px" }}>PICKUP DATE</div>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: startKey ? "#111827" : "#9CA3AF" }}>{fmtKey(startKey) || "Not selected"}</div>
                    </div>
                  </div>
                  {errors.startKey && <ErrMsg msg={errors.startKey} />}

                  {/* Return card */}
                  <div style={{ border: `1px solid ${errors.endKey ? "#FCA5A5" : endKey ? "#FCA5A5" : "#E5E7EB"}`, borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px", backgroundColor: errors.endKey ? "#FFF5F5" : endKey ? "#FEF2F2" : "#fff" }}>
                    <CalReturnIcon />
                    <div>
                      <div style={{ fontSize: "10px", fontWeight: "700", color: "#9CA3AF", letterSpacing: "0.5px", marginBottom: "2px" }}>RETURN DATE</div>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: endKey ? "#111827" : "#9CA3AF" }}>{fmtKey(endKey) || "Not selected"}</div>
                    </div>
                  </div>
                  {errors.endKey && <ErrMsg msg={errors.endKey} />}

                  <p style={{ fontSize: "12px", color: startKey && !endKey ? "#1E40AF" : "#6B7280", margin: 0, lineHeight: "1.5", fontWeight: startKey && !endKey ? "500" : "400" }}>
                    {!startKey && "Click a start date to begin."}
                    {startKey && !endKey && "Now click a return date."}
                    {startKey && endKey && "Note: Late returns are subject to extra day charges."}
                  </p>
                  {startKey && (
                    <button onClick={() => { setStartKey(null); setEndKey(null); setErrors(e => ({ ...e, startKey: undefined, endKey: undefined })); }}
                      style={{ border: "1px solid #E5E7EB", borderRadius: "8px", background: "#fff", padding: "6px 12px", fontSize: "12px", color: "#6B7280", cursor: "pointer" }}>
                      Clear dates
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2 — Delivery Details */}
            <div style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                {stepNum(2)}
                <h2 style={{ fontSize: "17px", fontWeight: "800", color: "#111827", margin: 0 }}>Delivery Details</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "10px" }}>University Campus/Building</label>
                  {[["sliit", "SLIIT Kandy Uni", "Pick up from campus"], ["other", "Other Location", "Provide your address"]].map(([val, title, sub]) => (
                    <label key={val} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", border: `1.5px solid ${campusChoice === val ? "#1E40AF" : "#E5E7EB"}`, borderRadius: "8px", cursor: "pointer", marginBottom: "8px", backgroundColor: campusChoice === val ? "#EFF6FF" : "#fff" }}>
                      <input type="radio" name="campus" value={val} checked={campusChoice === val} onChange={() => { setCampusChoice(val); setErrors(e => ({ ...e, otherPlace: undefined })); }} style={{ accentColor: "#1E40AF", width: "15px", height: "15px", cursor: "pointer" }} />
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>{title}</div>
                        <div style={{ fontSize: "11px", color: "#6B7280" }}>{sub}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {campusChoice === "other" && (
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "7px" }}>Specify Location / Room</label>
                    <input type="text" placeholder="e.g. City Convention Centre, Hall A" value={otherPlace} onChange={e => { setOtherPlace(e.target.value); setErrors(er => ({ ...er, otherPlace: undefined })); }} style={inputStyle("otherPlace")} />
                    <ErrMsg msg={errors.otherPlace} />
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "7px" }}>Delivery Instructions <span style={{ fontWeight: "400", color: "#9CA3AF" }}>(optional)</span></label>
                <textarea placeholder="e.g. Use the service elevator on the west side, call upon arrival." value={instructions} onChange={e => setInstructions(e.target.value)} rows={4} style={{ ...inputStyle(null), resize: "vertical", lineHeight: "1.6", paddingTop: "10px", paddingBottom: "10px", border: "1px solid #E5E7EB" }} />
              </div>
            </div>

            {/* Section 3 — Contact */}
            <div style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                {stepNum(3)}
                <h2 style={{ fontSize: "17px", fontWeight: "800", color: "#111827", margin: 0 }}>Contact Information</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                {/* Organizer */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "7px" }}>Event Organizer Name</label>
                  <input type="text" placeholder="Full name" value={organizer} onChange={e => { setOrganizer(e.target.value); setErrors(er => ({ ...er, organizer: undefined })); }} style={inputStyle("organizer")} />
                  <ErrMsg msg={errors.organizer} />
                </div>
                {/* Uni ID */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "7px" }}>University ID</label>
                  <input type="text" placeholder="e.g. IT12345678" maxLength={10} value={uniId} onChange={e => { setUniId(e.target.value); setErrors(er => ({ ...er, uniId: undefined })); }} style={inputStyle("uniId")} />
                  <ErrMsg msg={errors.uniId} />
                </div>
                {/* Phone */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "7px" }}>Phone Number</label>
                  <input type="tel" placeholder="0XXXXXXXXX" maxLength={10} value={phone} onChange={e => { setPhone(e.target.value.replace(/\D/, "")); setErrors(er => ({ ...er, phone: undefined })); }} style={inputStyle("phone")} />
                  <ErrMsg msg={errors.phone} />
                </div>
              </div>
              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "7px" }}>Email Address</label>
                <input type="email" placeholder="e.g. name@university.lk" value={email} onChange={e => { setEmail(e.target.value); setErrors(er => ({ ...er, email: undefined })); }} style={inputStyle("email")} />
                <ErrMsg msg={errors.email} />
              </div>
            </div>
          </div>

          {/* ── RIGHT — Order Summary ── */}
          <div style={{ width: "300px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", padding: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#111827", margin: "0 0 20px 0" }}>Order Summary</h2>

              {/* Cart items from context */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
                {cartItems.length === 0 ? (
                  <p style={{ fontSize: "13px", color: "#9CA3AF", textAlign: "center", margin: 0 }}>No items in cart</p>
                ) : cartItems.map(item => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "6px", overflow: "hidden", flexShrink: 0, backgroundColor: "#F3F4F6" }}>
                      <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827", lineHeight: "1.3" }}>{item.name}</div>
                      <div style={{ fontSize: "12px", color: "#6B7280" }}>Qty: {item.qty} · {rentalDays > 0 ? `${rentalDays} Day${rentalDays !== 1 ? "s" : ""}` : item.dates || "—"}</div>
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#111827", flexShrink: 0 }}>Rs.{item.total.toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div style={{ height: "1px", backgroundColor: "#F3F4F6", marginBottom: "16px" }} />

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                {[["Subtotal", subtotal], ["Campus Delivery Fee", delivery], ["Estimated Tax", tax]].map(([lbl, val]) => (
                  <div key={lbl} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "14px", color: "#374151" }}>{lbl}</span>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>Rs.{val.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <span style={{ fontSize: "17px", fontWeight: "800", color: "#111827" }}>Total</span>
                <span style={{ fontSize: "24px", fontWeight: "800", color: "#1E40AF" }}>Rs.{total.toFixed(2)}</span>
              </div>

              <button
                onClick={handleConfirm}
                style={{ width: "100%", padding: "14px 0", backgroundColor: "#1E40AF", border: "none", borderRadius: "10px", color: "#FFFFFF", fontSize: "16px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "12px" }}>
                Confirm <LockIcon />
              </button>

              <div style={{ textAlign: "center" }}>
                <button onClick={() => navigate("/cart")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "#374151", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                  <ArrowLeft /> Back to Cart
                </button>
              </div>
            </div>

            <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", padding: "16px 18px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <div style={{ flexShrink: 0, marginTop: "1px" }}><InfoIcon /></div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: "800", color: "#1E40AF", letterSpacing: "0.6px", marginBottom: "5px" }}>RENTAL POLICY</div>
                <p style={{ fontSize: "12px", color: "#6B7280", margin: 0, lineHeight: "1.6" }}>Cancellations must be made 48 hours prior to delivery for a full refund of the deposit.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


