// checkout.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useCart } from "../../../context/CartContext";
import api from "../../../api/axios";
import toast from "react-hot-toast";
import {
  BiCalendar, BiTime, BiLockAlt, BiArrowBack, BiInfoCircle,
  BiChevronLeft, BiChevronRight, BiChevronDown, BiCheckCircle,
  BiXCircle, BiMailSend, BiMap, BiUser, BiIdCard, BiPhone,
  BiShoppingBag, BiCreditCard
} from "react-icons/bi";
import { useTheme } from "../../../context/ThemeContext";

// ── Calendar constants ────────────────────────────────────────────────────────
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_LABELS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDow(y, m) { return new Date(y, m, 1).getDay(); }
function toKey(y, m, d) { return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`; }
function keyToDate(k) { if (!k) return null; const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); }
function diffDays(s, e) { if (!s || !e) return 0; return Math.round((keyToDate(e) - keyToDate(s)) / 86400000) + 1; }

// ── Interactive Calendar ──────────────────────────────────────────────────────
function MiniCalendar({ startKey, endKey, hoverKey, onSelect, onHover, darkMode }) {
  const today = new Date();
  const [vYear, setVYear] = useState(today.getFullYear());
  const [vMonth, setVMonth] = useState(today.getMonth());
  const [picker, setPicker] = useState(false);

  const textPrimary = darkMode ? 'white' : '#0f172a';
  const textSecondary = '#64748b';
  const borderColor = darkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0';

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
    if (!cur) return { bg: 'transparent', color: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', fw: '400', br: '50%' };
    if (past) return { bg: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', fw: '400', br: '50%' };
    if (isStart || isEnd) return { bg: '#6366f1', color: '#fff', fw: '900', br: '50%' };
    if (inRange) return { bg: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', fw: '900', br: '12px' };
    return { bg: 'transparent', color: textPrimary, fw: '600', br: '50%' };
  }

  const yearRange = [];
  for (let y = today.getFullYear(); y <= today.getFullYear() + 2; y++) yearRange.push(y);

  return (
    <div style={{ flex: 1, minWidth: '320px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <button onClick={prevMonth} style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc', border: `1px solid ${borderColor}`, color: textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BiChevronLeft size={24} />
        </button>

        <div style={{ position: 'relative' }}>
          <button onClick={() => setPicker(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '900', background: 'transparent', border: 'none', color: textPrimary, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {MONTH_NAMES[vMonth]} {vYear} <BiChevronDown size={18} />
          </button>

          {picker && (
            <div style={{ position: 'absolute', top: '48px', left: '50%', transform: 'translateX(-50%)', backgroundColor: darkMode ? '#1e293b' : 'white', borderRadius: '20px', padding: '24px', width: '280px', zIndex: 100, border: `1px solid ${borderColor}`, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              <p style={{ fontSize: '9px', fontWeight: '900', marginBottom: '12px', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Select Month</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '24px' }}>
                {MONTH_NAMES.map((mn, mi) => (
                  <button key={mn} onClick={() => { setVMonth(mi); setPicker(false); }}
                    style={{ py: '8px', borderRadius: '8px', border: 'none', fontSize: '9px', fontWeight: '900', cursor: 'pointer', backgroundColor: mi === vMonth ? '#6366f1' : (darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9'), color: mi === vMonth ? 'white' : textSecondary }}>
                    {mn.slice(0, 3).toUpperCase()}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '9px', fontWeight: '900', marginBottom: '12px', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Select Year</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {yearRange.map(y => (
                  <button key={y} onClick={() => { setVYear(y); setPicker(false); }}
                    style={{ py: '8px', borderRadius: '8px', border: 'none', fontSize: '9px', fontWeight: '900', cursor: 'pointer', backgroundColor: y === vYear ? '#6366f1' : (darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9'), color: y === vYear ? 'white' : textSecondary }}>
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button onClick={nextMonth} style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc', border: `1px solid ${borderColor}`, color: textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BiChevronRight size={24} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '16px' }}>
        {DAY_LABELS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '9px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
        {Array.from({ length: totalCells }).map((_, idx) => {
          const { d, cur, key } = cellInfo(idx);
          const { bg, color, fw, br } = dayStyle(key, cur);
          const past = isPastDate(key);

          return (
            <div key={idx} style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                onClick={() => cur && !past && onSelect(key)}
                onMouseEnter={() => cur && !past && onHover(key)}
                onMouseLeave={() => onHover(null)}
                style={{
                  width: '36px', height: '36px', borderRadius: br, fontWeight: fw, backgroundColor: bg, color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', transition: 'all 0.3s ease',
                  cursor: cur && !past ? 'pointer' : 'default', opacity: cur ? 1 : 0
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
function OrderModal({ success, onClose, darkMode }) {
  const textPrimary = darkMode ? 'white' : '#0f172a';
  const textSecondary = '#64748b';
  const bgColor = darkMode ? '#1e293b' : 'white';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)', backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div style={{ backgroundColor: bgColor, borderRadius: '32px', padding: '48px', width: '100%', maxWidth: '440px', textAlign: 'center', boxShadow: '0 30px 60px rgba(0,0,0,0.4)', border: darkMode ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          {success ? (
            <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <BiCheckCircle size={48} />
            </div>
          ) : (
            <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(244, 63, 94, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f43f5e' }}>
              <BiXCircle size={48} />
            </div>
          )}
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: '900', color: textPrimary, marginBottom: '16px', letterSpacing: '-0.02em' }}>
          {success ? "Mission Successful" : "Action Interrupted"}
        </h2>
        <p style={{ color: textSecondary, fontSize: '14px', fontWeight: '500', marginBottom: '40px', lineHeight: '1.6' }}>
          {success
            ? "Your hardware reservation has been recorded. Logistics have been synchronized with the selected suppliers."
            : "The encryption protocol or server handshake failed. Please verify your data and attempt the synchronization again."}
        </p>
        <button
          onClick={onClose}
          style={{ width: '100%', padding: '16px', borderRadius: '18px', border: 'none', backgroundColor: success ? '#6366f1' : '#f43f5e', color: 'white', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', boxShadow: success ? '0 10px 20px rgba(99, 102, 241, 0.3)' : '0 10px 20px rgba(244, 63, 94, 0.3)' }}
        >
          {success ? "Continue to History" : "Retry Handshake"}
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { cartItems, clearCart, editingOrderId, orderMetadata } = useCart();
  const { user } = useAuth();
  const { state } = useLocation();

  const [startKey, setStartKey] = useState(state?.pickupDate || null);
  const [endKey, setEndKey] = useState(state?.returnDate || null);
  const [hoverKey, setHoverKey] = useState(null);
  const [pickupTime, setPickupTime] = useState("09:00");

  function handleSelect(key) {
    if (!startKey || (startKey && endKey)) { setStartKey(key); setEndKey(null); }
    else if (key < startKey) { setStartKey(key); setEndKey(null); }
    else if (key === startKey) { setStartKey(null); }
    else setEndKey(key);
  }

  const rentalDays = diffDays(startKey, endKey);

  const [campusChoice, setCampusChoice] = useState("sliit");
  const [otherPlace, setOtherPlace] = useState("");
  const [instructions, setInstructions] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [uniId, setUniId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState(null);
  const [showVerify, setShowVerify] = useState(false);
  const [otpOrderId, setOtpOrderId] = useState(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [availabilityMap, setAvailabilityMap] = useState({});
  const [pricing, setPricing] = useState({ originalPrice: 0, discountAmount: 0, finalPrice: 0, priceBreakdown: [] });
  const [calculating, setCalculating] = useState(false);
  const [appliedPackageId] = useState(state?.appliedPackageId || null);

  const textPrimary = darkMode ? 'white' : '#0f172a';
  const textSecondary = '#64748b';
  const bgColor = darkMode ? '#0f172a' : 'white';
  const borderColor = darkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0';

  useEffect(() => { if (user?.email && user?.role === "student") setEmail(user.email); }, [user]);

  useEffect(() => {
    if (editingOrderId && orderMetadata) {
      if (orderMetadata.rentalDates?.pickup) {
        const d = new Date(orderMetadata.rentalDates.pickup);
        setStartKey(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
      }
      if (orderMetadata.rentalDates?.return) {
        const d = new Date(orderMetadata.rentalDates.return);
        setEndKey(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
      }
      setPickupTime(orderMetadata.rentalDates?.pickupTime || "09:00");
      setCampusChoice(orderMetadata.deliveryDetails?.campus || "sliit");
      setOtherPlace(orderMetadata.deliveryDetails?.location !== "SLIIT Kandy Uni" ? orderMetadata.deliveryDetails?.location : "");
      setInstructions(orderMetadata.deliveryDetails?.instructions || "");
      setOrganizer(orderMetadata.contactInfo?.organizer || "");
      setUniId(orderMetadata.contactInfo?.uniId || "");
      setPhone(orderMetadata.contactInfo?.phone || "");
      if (orderMetadata.contactInfo?.email) setEmail(orderMetadata.contactInfo.email);
    }
  }, [editingOrderId, orderMetadata]);

  useEffect(() => {
    async function fetchAvailability() {
      if (!startKey || cartItems.length === 0) { setAvailabilityMap({}); return; }
      try {
        const promises = cartItems.map(item =>
          api.get(`/rental/products/${item.id || item._id}/availability`, {
            params: { pickup: startKey, return: endKey || startKey }
          })
        );
        const results = await Promise.all(promises);
        const newMap = {};
        cartItems.forEach((item, idx) => { newMap[item.id || item._id] = results[idx].data.availableStock; });
        setAvailabilityMap(newMap);
      } catch (err) { console.error(err); }
    }
    fetchAvailability();
  }, [startKey, endKey, cartItems]);

  useEffect(() => {
    async function fetchPricing() {
      if (cartItems.length === 0) return;
      setCalculating(true);
      try {
        const payload = {
          items: cartItems.map(i => ({ productId: i.id || i._id, qty: i.qty })),
          appliedPackageId,
          rentalDates: { pickup: keyToDate(startKey), return: keyToDate(endKey) }
        };
        const res = await api.post("/rental/orders/preview", payload);
        if (res.data.success) setPricing(res.data.pricing);
      } catch (err) { console.error(err); } finally { setCalculating(false); }
    }
    if (startKey && endKey) fetchPricing();
  }, [cartItems, startKey, endKey, appliedPackageId]);

  const delivery = 500.00;
  const subtotal = pricing.finalPrice || cartItems.reduce((s, i) => s + (i.total || 0), 0);
  const total = +(subtotal + delivery).toFixed(2);

  const hasStockError = cartItems.some(item => {
    const avail = availabilityMap[item.id || item._id];
    return avail !== undefined && item.qty > avail;
  });

  function validate() {
    const e = {};
    if (!startKey) e.startKey = "Select pickup date";
    if (!endKey) e.endKey = "Select return date";
    if (campusChoice === "other" && !otherPlace.trim()) e.otherPlace = "Specify location";
    if (!organizer.trim()) e.organizer = "Name required";
    if (!uniId.trim()) e.uniId = "ID required";
    else if (!/^\w{10}$/.test(uniId.trim())) e.uniId = "Must be 10 chars";
    if (!phone.trim()) e.phone = "Phone required";
    else if (!/^0\d{9}$/.test(phone.trim())) e.phone = "Invalid format";
    if (!email.trim()) e.email = "Email required";
    else if (!/^[^\s@]+@[^\s@]+\.(com|lk)$/i.test(email.trim())) e.email = "Invalid domain";
    return e;
  }

  async function handleConfirm() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    if (hasStockError) { toast.error("Some items are out of stock for selected dates."); return; }
    if (cartItems.length === 0) { toast.error("Cart is empty."); return; }

    try {
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
        totalAmount: total,
        items,
        rentalDates: { pickup: keyToDate(startKey), pickupTime, return: keyToDate(endKey) },
        deliveryDetails: { campus: campusChoice, location: campusChoice === "other" ? otherPlace : "SLIIT Kandy Uni", instructions },
        contactInfo: { organizer, uniId, phone, email }
      };

      let response;
      if (editingOrderId) response = await api.put(`/rental/orders/${editingOrderId}`, orderPayload);
      else response = await api.post("/rental/orders", orderPayload);

      if (response.data.verificationRequired) {
        setOtpOrderId(response.data.orderId);
        setShowVerify(true);
        setResendCooldown(60);
        return;
      }
      clearCart();
      setModal("success");
    } catch (error) {
      toast.error(error.response?.data?.message || "Order submission failed");
      setModal("fail");
    }
  }

  async function handleVerifySubmit() {
    const code = otp.join("");
    if (code.length !== 6) { toast.error("Enter 6-digit code"); return; }
    setVerifying(true);
    try {
      const res = await api.post("/rental/orders/verify-email", { orderId: otpOrderId, otp: code });
      if (res.data.success) { toast.success("Verified!"); setShowVerify(false); clearCart(); setModal("success"); }
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
      if (error.response?.status === 400) setOtp(["", "", "", "", "", ""]);
    } finally { setVerifying(false); }
  }

  async function handleResendOtp() {
    if (resendCooldown > 0) return;
    setResending(true);
    try {
      const res = await api.post("/rental/orders/resend-otp", { orderId: otpOrderId });
      if (res.data.success) { toast.success("Code resent!"); setResendCooldown(60); setOtp(["", "", "", "", "", ""]); }
    } catch (error) { 
      toast.error(error.response?.data?.message || "Resend failed"); 
    } finally { setResending(false); }
  }

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) timer = setInterval(() => setResendCooldown(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  function handleModalClose() {
    if (modal === "success") navigate("/rental/history");
    setModal(null);
  }

  const stepNum = n => (
    <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: 'rgba(99, 102, 241, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontSize: '16px', fontWeight: '900', shrink: 0 }}>{n}</div>
  );

  return (
    <div className="page-wrapper pb-20 anim-fadeIn">
      {/* Verification Modal */}
      {showVerify && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div style={{ backgroundColor: darkMode ? '#1e293b' : 'white', borderRadius: '32px', padding: '48px', width: '100%', maxWidth: '440px', textAlign: 'center', position: 'relative', border: darkMode ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
            <button onClick={() => setShowVerify(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: textSecondary, cursor: 'pointer' }}>
              <BiXCircle size={28} />
            </button>
            <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', margin: '0 auto 32px' }}>
              <BiMailSend size={40} />
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: textPrimary, marginBottom: '12px' }}>Identity Verification</h2>
            <p style={{ color: textSecondary, fontSize: '14px', fontWeight: '500', marginBottom: '40px', lineHeight: '1.6' }}>
              Enter the 6-digit synchronization code sent to <span style={{ color: '#6366f1', fontWeight: '900' }}>{email}</span> to authorize the reservation.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '40px' }}>
              {otp.map((digit, idx) => (
                <input key={idx} id={`otp-${idx}`} type="text" maxLength={1} value={digit}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    const newOtp = [...otp]; newOtp[idx] = val; setOtp(newOtp);
                    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`).focus();
                  }}
                  onKeyDown={(e) => { if (e.key === "Backspace" && !otp[idx] && idx > 0) document.getElementById(`otp-${idx - 1}`).focus(); }}
                  style={{ width: '48px', height: '64px', textAlign: 'center', fontSize: '24px', fontWeight: '900', backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '12px', outline: 'none', color: textPrimary }}
                />
              ))}
            </div>

            <button onClick={handleVerifySubmit} disabled={verifying || otp.join("").length < 6} style={{ width: '100%', padding: '16px', borderRadius: '18px', border: 'none', backgroundColor: '#6366f1', color: 'white', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', marginBottom: '24px' }}>
              {verifying ? "VERIFYING ENCRYPTION..." : "CONFIRM RESERVATION"}
            </button>

            <p style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Code not received?{" "}
              <button onClick={handleResendOtp} disabled={resending || resendCooldown > 0} style={{ background: 'transparent', border: 'none', padding: 0, color: '#6366f1', fontWeight: '900', cursor: 'pointer', textDecoration: 'underline' }}>
                {resending ? "TRANSMITTING..." : resendCooldown > 0 ? `RESEND IN ${resendCooldown}S` : "REQUEST NEW CODE"}
              </button>
            </p>
          </div>
        </div>
      )}

      {modal && <OrderModal success={modal === "success"} onClose={handleModalClose} darkMode={darkMode} />}

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ marginBottom: '60px' }}>
          <Link to="/rental/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: textSecondary, textDecoration: 'none', marginBottom: '24px', transition: 'all 0.2s ease' }} className="group">
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BiArrowBack size={18} className="group-hover:-translate-x-1 transition-transform" />
            </div>
            <span style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Back to Registry</span>
          </Link>
          <h1 style={{ fontSize: '48px', fontWeight: '950', color: textPrimary, letterSpacing: '-0.04em', marginBottom: '12px', lineHeight: '1' }}>{editingOrderId ? "Reconfigure Order" : "Finalize Reservation"}</h1>
          <p style={{ color: textSecondary, fontSize: '14px', fontWeight: '600', maxWidth: '600px', lineHeight: '1.6' }}>
            {editingOrderId 
              ? "Updating your logistics parameters will re-synchronize availability with supplier registries in real-time." 
              : "Review your event duration and delivery parameters to synchronize encryption keys for a secure hardware handover."}
          </p>
        </div>

        <div className="checkout-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr',
          gap: '32px',
          alignItems: 'flex-start'
        }}>
          {/* LEFT - Main Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Duration Section */}
            <div style={{ backgroundColor: bgColor, borderRadius: '24px', border: `1px solid ${borderColor}`, padding: '32px', boxShadow: darkMode ? '0 20px 40px -12px rgba(0,0,0,0.5)' : '0 15px 30px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#6366f1' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontSize: '14px', fontWeight: '900' }}>1</div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: '900', color: textPrimary, letterSpacing: '-0.02em' }}>Rental Timeline</h2>
                    <p style={{ fontSize: '11px', color: textSecondary, fontWeight: '600' }}>Deployment and return dates</p>
                  </div>
                </div>
                <div style={{ padding: '6px 14px', borderRadius: '100px', backgroundColor: rentalDays > 0 ? 'rgba(99, 102, 241, 0.1)' : (darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9'), color: rentalDays > 0 ? '#6366f1' : textSecondary, fontSize: '10px', fontWeight: '900', letterSpacing: '0.05em', border: rentalDays > 0 ? '1px solid rgba(99, 102, 241, 0.2)' : 'none' }}>
                  {rentalDays > 0 ? `${rentalDays} DAYS` : "SELECT DATES"}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
                <div style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.01)' : '#fcfdfe', padding: '16px', borderRadius: '20px', border: `1px solid ${borderColor}` }}>
                  <MiniCalendar startKey={startKey} endKey={endKey} hoverKey={hoverKey} onSelect={handleSelect} onHover={setHoverKey} darkMode={darkMode} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ padding: '16px 20px', borderRadius: '16px', border: `1px solid ${errors.startKey ? '#f43f5e' : (startKey ? '#6366f1' : borderColor)}`, backgroundColor: startKey ? 'rgba(99, 102, 241, 0.03)' : (darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc'), display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.3s ease' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: startKey ? 'rgba(99, 102, 241, 0.1)' : (darkMode ? 'rgba(255,255,255,0.05)' : '#fff'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: startKey ? '#6366f1' : textSecondary, border: `1px solid ${startKey ? 'rgba(99, 102, 241, 0.2)' : borderColor}` }}>
                        <BiCalendar size={18} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '9px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px', opacity: 0.6 }}>Deployment</div>
                        <div style={{ fontSize: '14px', fontWeight: '900', color: startKey ? textPrimary : textSecondary, letterSpacing: '-0.01em' }}>{startKey ? new Date(startKey).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Set Initiation"}</div>
                      </div>
                    </div>
                    {errors.startKey && <div style={{ fontSize: '9px', fontWeight: '900', color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '8px' }}>{errors.startKey}</div>}

                    <div style={{ padding: '16px 20px', borderRadius: '16px', border: `1px solid ${errors.endKey ? '#f43f5e' : (endKey ? '#6366f1' : borderColor)}`, backgroundColor: endKey ? 'rgba(99, 102, 241, 0.03)' : (darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc'), display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.3s ease' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: endKey ? 'rgba(99, 102, 241, 0.1)' : (darkMode ? 'rgba(255,255,255,0.05)' : '#fff'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: endKey ? '#6366f1' : textSecondary, border: `1px solid ${endKey ? 'rgba(99, 102, 241, 0.2)' : borderColor}` }}>
                        <BiCalendar size={18} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '9px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px', opacity: 0.6 }}>Return</div>
                        <div style={{ fontSize: '14px', fontWeight: '900', color: endKey ? textPrimary : textSecondary, letterSpacing: '-0.01em' }}>{endKey ? new Date(endKey).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Set Completion"}</div>
                      </div>
                    </div>
                    {errors.endKey && <div style={{ fontSize: '9px', fontWeight: '900', color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '8px' }}>{errors.endKey}</div>}

                    <div style={{ padding: '16px 20px', borderRadius: '16px', border: `1px solid ${borderColor}`, backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', border: `1px solid ${borderColor}` }}>
                        <BiTime size={18} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '9px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px', opacity: 0.6 }}>Handover</div>
                        <input type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)} style={{ width: '100%', backgroundColor: 'transparent', border: 'none', color: textPrimary, fontWeight: '900', fontSize: '14px', outline: 'none', cursor: 'pointer' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }} className="form-subgrid">
              {/* Delivery Details */}
              <div style={{ backgroundColor: bgColor, borderRadius: '24px', border: `1px solid ${borderColor}`, padding: '32px', boxShadow: darkMode ? '0 20px 40px -12px rgba(0,0,0,0.5)' : '0 15px 30px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden', opacity: hasStockError ? 0.3 : 1 }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#6366f1' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontSize: '14px', fontWeight: '900' }}>2</div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: '900', color: textPrimary, letterSpacing: '-0.02em' }}>Logistics Target</h2>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {[["sliit", "SLIIT HUB"], ["other", "EXTERNAL"]].map(([val, title]) => (
                        <label key={val} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '16px', border: `1px solid ${campusChoice === val ? '#6366f1' : borderColor}`, backgroundColor: campusChoice === val ? 'rgba(99, 102, 241, 0.03)' : (darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc'), cursor: 'pointer', transition: 'all 0.3s ease' }}>
                          <input type="radio" name="campus" value={val} checked={campusChoice === val} onChange={() => setCampusChoice(val)} style={{ accentColor: '#6366f1' }} />
                          <span style={{ fontSize: '12px', fontWeight: '900', color: textPrimary }}>{title}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                      <BiMap style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }} size={16} />
                      <input
                        type="text" placeholder="Specify location..."
                        value={otherPlace} onChange={e => setOtherPlace(e.target.value)}
                        style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${errors.otherPlace ? '#f43f5e' : borderColor}`, borderRadius: '16px', padding: '14px 16px 14px 44px', fontSize: '13px', fontWeight: '700', color: textPrimary, outline: 'none' }}
                      />
                    </div>
                    <textarea
                      placeholder="Handover instructions..."
                      value={instructions} onChange={e => setInstructions(e.target.value)} rows={3}
                      style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '16px', fontSize: '13px', fontWeight: '500', color: textPrimary, outline: 'none', resize: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* Personnel Authorization */}
              <div style={{ backgroundColor: bgColor, borderRadius: '24px', border: `1px solid ${borderColor}`, padding: '32px', boxShadow: darkMode ? '0 20px 40px -12px rgba(0,0,0,0.5)' : '0 15px 30px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden', opacity: hasStockError ? 0.3 : 1 }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#6366f1' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontSize: '14px', fontWeight: '900' }}>3</div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: '900', color: textPrimary, letterSpacing: '-0.02em' }}>Personnel Auth</h2>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <input type="text" placeholder="Organizer" value={organizer} onChange={e => setOrganizer(e.target.value)} style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${errors.organizer ? '#f43f5e' : borderColor}`, borderRadius: '14px', padding: '14px 16px', fontSize: '13px', fontWeight: '800', color: textPrimary, outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <input type="text" placeholder="ITXXXXXXXX" value={uniId} onChange={e => setUniId(e.target.value)} style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${errors.uniId ? '#f43f5e' : borderColor}`, borderRadius: '14px', padding: '14px 16px', fontSize: '13px', fontWeight: '800', color: textPrimary, outline: 'none' }} />
                    </div>
                  </div>
                  <input type="text" placeholder="07XXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${errors.phone ? '#f43f5e' : borderColor}`, borderRadius: '14px', padding: '14px 16px', fontSize: '13px', fontWeight: '800', color: textPrimary, outline: 'none' }} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '14px', padding: '14px 16px', fontSize: '13px', fontWeight: '800', color: textPrimary, outline: 'none' }} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT - Order Architecture Summary */}
          <div className="checkout-sidebar" style={{ position: 'sticky', top: '24px' }}>
            <div style={{ backgroundColor: darkMode ? '#1e293b' : '#ffffff', borderRadius: '24px', border: `1px solid ${darkMode ? 'rgba(99, 102, 241, 0.3)' : '#6366f1'}`, padding: '32px', boxShadow: '0 30px 60px -20px rgba(0,0,0,0.15)', overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                    <BiShoppingBag size={18} />
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: '950', color: textPrimary, letterSpacing: '-0.02em' }}>Order Manifest</h2>
                </div>
                <div style={{ fontSize: '9px', fontWeight: '900', color: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '4px 10px', borderRadius: '100px', letterSpacing: '0.05em' }}>{cartItems.length} ASSETS</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px', marginBottom: '24px' }} className="custom-scrollbar">
                {cartItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', borderRadius: '16px', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${borderColor}` }}>
                    <div style={{ position: 'relative' }}>
                      <img src={item.image} style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} alt="" />
                      <div style={{ position: 'absolute', top: '-6px', right: '-6px', backgroundColor: '#6366f1', color: 'white', fontSize: '8px', fontWeight: '900', padding: '2px 6px', borderRadius: '6px' }}>x{item.qty}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                      <div style={{ fontSize: '10px', fontWeight: '700', color: textSecondary, opacity: 0.6 }}>Synchronized</div>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '900', color: textPrimary }}>LKR {item.total?.toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '24px', borderTop: `1px dashed ${borderColor}` }}>
                {appliedPackageId && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', fontWeight: '900', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Bundle Value</span>
                    <span style={{ fontSize: '14px', fontWeight: '900', color: textPrimary }}>LKR {pricing.finalPrice.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Delivery Fee</span>
                  <span style={{ fontSize: '14px', fontWeight: '900', color: textPrimary }}>LKR {delivery.toLocaleString()}</span>
                </div>
                {pricing.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                    <span style={{ fontSize: '10px', fontWeight: '900', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Promotional Yield</span>
                    <span style={{ fontSize: '14px', fontWeight: '900', color: '#10b981' }}>-LKR {pricing.discountAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div style={{ paddingTop: '24px', marginTop: '24px', borderTop: `2px solid ${borderColor}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '9px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.6 }}>Grand Total</span>
                    <span style={{ fontSize: '28px', fontWeight: '950', color: '#6366f1', letterSpacing: '-0.03em', lineHeight: '1' }}>LKR {total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleConfirm} disabled={calculating || hasStockError}
                  style={{ width: '100%', padding: '18px', borderRadius: '18px', border: 'none', backgroundColor: '#6366f1', color: 'white', fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 15px 30px rgba(99, 102, 241, 0.2)', transition: 'all 0.3s ease' }}
                  className="hover-scale"
                >
                  <BiLockAlt size={20} />
                  <span>{calculating ? "Processing..." : (editingOrderId ? "Re-Sync" : "Secure Reservation")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .checkout-grid { 
          grid-template-columns: 1.6fr 1fr; 
        }
        @media (max-width: 1100px) {
          .checkout-grid { grid-template-columns: 1fr; }
          .checkout-sidebar { position: static !important; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.2); borderRadius: 10px; }
        .hover-scale:hover { transform: translateY(-2px); boxShadow: 0 25px 50px rgba(99, 102, 241, 0.35); }
        .hover-scale:active { transform: translateY(0); }
      `}</style>
    </div>
  );
}
