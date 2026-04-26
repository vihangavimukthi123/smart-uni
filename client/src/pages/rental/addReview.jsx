// addReview.jsx
import { useState, useRef, useEffect } from "react";

// ── Mini Calendar Dropdown ───────────────────────────────────────────────────
const MiniCalendar = ({ selectedDate, onSelect, onClose }) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(
    selectedDate ? selectedDate.getFullYear() : today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    selectedDate ? selectedDate.getMonth() : today.getMonth(),
  );

  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isSel = (d) =>
    selectedDate &&
    selectedDate.getFullYear() === viewYear &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getDate() === d;

  const isTod = (d) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === d;

  return (
    <div className="absolute top-[calc(100%+8px)] left-0 z-[200] glass-card p-6 w-[280px] shadow-2xl animate-in fade-in zoom-in duration-200">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="btn-icon btn-sm btn-secondary">&#8249;</button>
        <span className="text-sm font-black uppercase tracking-widest">{MONTHS[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} className="btn-icon btn-sm btn-secondary">&#8250;</button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-black text-muted uppercase">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => (
          <div key={i} className="flex-center">
            {day ? (
              <button
                onClick={() => {
                  onSelect(new Date(viewYear, viewMonth, day));
                  onClose();
                }}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                  isSel(day) ? "bg-indigo text-white shadow-lg shadow-indigo/30" : 
                  isTod(day) ? "bg-indigo/10 text-indigo border border-indigo/20" : 
                  "text-secondary hover:bg-white/5 hover:text-primary"
                }`}
              >
                {day}
              </button>
            ) : <div className="w-8 h-8" />}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 text-center">
        <button onClick={() => { onSelect(today); onClose(); }} className="text-[11px] font-black text-indigo uppercase tracking-widest hover:underline">Today</button>
      </div>
    </div>
  );
};

// ── Star Rating ──────────────────────────────────────────────────────────────
const StarRating = ({ rating, onRate }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-2 mt-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill={star <= (hovered || rating) ? "var(--amber)" : "none"}
          stroke={star <= (hovered || rating) ? "var(--amber)" : "var(--text-muted)"}
          strokeWidth="1.5"
          className="cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onRate(star)}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
export default function WriteReview() {
  const [rating, setRating] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [headline, setHeadline] = useState("");
  const [review, setReview] = useState("");
  const calendarRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const formatDate = (d) => {
    if (!d) return "";
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${mm}/${dd}/${d.getFullYear()}`;
  };

  return (
    <div className="page-wrapper max-w-4xl mx-auto">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-black m-0 mb-2">Write a Review for AV Pro Solutions</h1>
        <p className="text-secondary text-sm">Share your experience to help other campus event organizers.</p>
      </div>

      <div className="glass-card p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Overall Rating */}
        <div className="mb-10">
          <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-3">Overall Rating</label>
          <StarRating rating={rating} onRate={setRating} />
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Date Picker */}
          <div className="relative" ref={calendarRef}>
            <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-3">Date of Rental</label>
            <div className="relative group">
              <input
                type="text"
                placeholder="mm/dd/yyyy"
                readOnly
                value={formatDate(selectedDate)}
                onClick={() => setShowCalendar((v) => !v)}
                className={`w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm outline-none transition-all cursor-pointer ${
                  showCalendar ? "ring-2 ring-indigo border-indigo" : "hover:border-white/20"
                }`}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              {showCalendar && (
                <MiniCalendar
                  selectedDate={selectedDate}
                  onSelect={(d) => setSelectedDate(d)}
                  onClose={() => setShowCalendar(false)}
                />
              )}
            </div>
          </div>

          {/* Headline */}
          <div>
            <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-3">Review Headline</label>
            <input
              type="text"
              placeholder="e.g. Excellent service for our annual gala"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm outline-none transition-all hover:border-white/20 focus:ring-2 focus:ring-indigo focus:border-indigo"
            />
          </div>
        </div>

        {/* Detailed Review */}
        <div className="mb-8">
          <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-3">Detailed Review</label>
          <textarea
            placeholder="What did you like or dislike? How was the equipment quality and delivery service?"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={6}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm outline-none transition-all hover:border-white/20 focus:ring-2 focus:ring-indigo focus:border-indigo resize-none leading-relaxed"
          />
        </div>

        {/* Image Upload */}
        <div className="mb-10">
          <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-3">Upload Photos (Optional)</label>
          <div className="border-2 border-dashed border-white/10 bg-white/5 rounded-2xl p-12 text-center group cursor-pointer hover:border-indigo hover:bg-indigo/5 transition-all">
            <div className="w-16 h-16 bg-white/5 rounded-full flex-center mx-auto mb-4 group-hover:bg-indigo/10 group-hover:text-indigo transition-all">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <p className="text-sm font-bold m-0"><span className="text-indigo">Click to upload</span> or drag and drop</p>
            <p className="text-[11px] text-muted mt-2 uppercase font-black tracking-widest">PNG, JPG up to 10MB</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row justify-end gap-4 pt-4 border-t border-white/10">
          <button className="btn btn-secondary px-10 py-4 order-2 md:order-1">Cancel</button>
          <button className="btn btn-primary px-10 py-4 order-1 md:order-2">Submit Review</button>
        </div>
      </div>
    </div>
  );
}

