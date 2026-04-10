import { useState, useRef, useEffect } from "react";
// import Navbar from "../../components/layout/Navbar";
// import Sidebar from "../../components/layout/Sidebar";

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
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
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
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 6px)",
        left: 0,
        zIndex: 200,
        backgroundColor: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: "12px",
        boxShadow: "0 10px 28px rgba(0,0,0,0.13)",
        padding: "16px",
        width: "272px",
      }}
    >
      {/* Month navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "14px",
        }}
      >
        <button
          onClick={prevMonth}
          style={{
            border: "none",
            background: "#F3F4F6",
            cursor: "pointer",
            width: "28px",
            height: "28px",
            borderRadius: "6px",
            fontSize: "16px",
            color: "#374151",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          &#8249;
        </button>
        <span style={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          style={{
            border: "none",
            background: "#F3F4F6",
            cursor: "pointer",
            width: "28px",
            height: "28px",
            borderRadius: "6px",
            fontSize: "16px",
            color: "#374151",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          &#8250;
        </button>
      </div>

      {/* Day headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          marginBottom: "4px",
        }}
      >
        {DAYS.map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontSize: "11px",
              fontWeight: "600",
              color: "#9CA3AF",
              paddingBottom: "6px",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Date cells */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: "2px",
        }}
      >
        {cells.map((day, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {day ? (
              <button
                onClick={() => {
                  onSelect(new Date(viewYear, viewMonth, day));
                  onClose();
                }}
                style={{
                  width: "32px",
                  height: "32px",
                  border: "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: isSel(day) ? "700" : "400",
                  backgroundColor: isSel(day)
                    ? "#1E40AF"
                    : isTod(day)
                      ? "#EFF6FF"
                      : "transparent",
                  color: isSel(day)
                    ? "#fff"
                    : isTod(day)
                      ? "#1E40AF"
                      : "#374151",
                }}
              >
                {day}
              </button>
            ) : (
              <div style={{ width: "32px", height: "32px" }} />
            )}
          </div>
        ))}
      </div>

      {/* Today shortcut */}
      <div
        style={{
          marginTop: "12px",
          borderTop: "1px solid #F3F4F6",
          paddingTop: "10px",
          textAlign: "center",
        }}
      >
        <button
          onClick={() => {
            onSelect(today);
            onClose();
          }}
          style={{
            fontSize: "12px",
            color: "#1E40AF",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Today
        </button>
      </div>
    </div>
  );
};

// ── Star Rating ──────────────────────────────────────────────────────────────
const StarRating = ({ rating, onRate }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill={star <= (hovered || rating) ? "#F59E0B" : "none"}
          stroke={star <= (hovered || rating) ? "#F59E0B" : "#CBD5E1"}
          strokeWidth="1.5"
          style={{ cursor: "pointer", transition: "all 0.15s" }}
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

// ── Sidebar ──────────────────────────────────────────────────────────────────

// ── Main ─────────────────────────────────────────────────────────────────────
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
    <div style={{ flex: 1, padding: "40px 48px" }}>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: "800",
              color: "#111827",
              margin: "0 0 6px 0",
            }}
          >
            Write a Review for AV Pro Solutions
          </h1>
          <p
            style={{ fontSize: "14px", color: "#6B7280", margin: "0 0 28px 0" }}
          >
            Share your experience to help other campus event organizers.
          </p>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              padding: "32px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
            }}
          >
            {/* Overall Rating */}
            <div style={{ marginBottom: "28px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "2px",
                }}
              >
                Overall Rating
              </label>
              <StarRating rating={rating} onRate={setRating} />
            </div>

            {/* Date + Headline row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "24px",
              }}
            >
              {/* Date of Rental with calendar */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px",
                  }}
                >
                  Date of Rental
                </label>
                <div ref={calendarRef} style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="mm/dd/yyyy"
                      readOnly
                      value={formatDate(selectedDate)}
                      onClick={() => setShowCalendar((v) => !v)}
                      style={{
                        width: "100%",
                        padding: "10px 40px 10px 14px",
                        border: `1px solid ${showCalendar ? "#1E40AF" : "#E5E7EB"}`,
                        borderRadius: "8px",
                        fontSize: "14px",
                        color: selectedDate ? "#374151" : "#9CA3AF",
                        outline: "none",
                        boxSizing: "border-box",
                        backgroundColor: "#FAFAFA",
                        cursor: "pointer",
                        transition: "border-color 0.15s",
                      }}
                    />
                    <button
                      onClick={() => setShowCalendar((v) => !v)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "2px",
                      }}
                    >
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={showCalendar ? "#1E40AF" : "#9CA3AF"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </button>
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

              {/* Review Headline */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "8px",
                  }}
                >
                  Review Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Excellent service for our annual gala"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: "#9CA3AF",
                    outline: "none",
                    boxSizing: "border-box",
                    backgroundColor: "#FAFAFA",
                  }}
                />
              </div>
            </div>

            {/* Detailed Review */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                Detailed Review
              </label>
              <textarea
                placeholder="What did you like or dislike? How was the equipment quality and delivery service?"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={5}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#9CA3AF",
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                  backgroundColor: "#FAFAFA",
                  fontFamily: "inherit",
                  lineHeight: "1.5",
                }}
              />
            </div>

            {/* Upload Photos */}
            <div style={{ marginBottom: "32px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                Upload Photos (Optional)
              </label>
              <div
                style={{
                  border: "1.5px dashed #CBD5E1",
                  borderRadius: "8px",
                  padding: "36px 20px",
                  textAlign: "center",
                  backgroundColor: "#FAFAFA",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    marginBottom: "10px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="38"
                    height="38"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <p
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: "14px",
                    color: "#374151",
                  }}
                >
                  <span
                    style={{
                      color: "#2563EB",
                      fontWeight: "500",
                      cursor: "pointer",
                    }}
                  >
                    Upload a file
                  </span>{" "}
                  or drag and drop
                </p>
                <p style={{ margin: 0, fontSize: "12px", color: "#94A3B8" }}>
                  PNG, JPG up to 10MB
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <button
                style={{
                  padding: "10px 28px",
                  border: "1px solid #D1D5DB",
                  borderRadius: "8px",
                  background: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: "10px 28px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#1E40AF",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Submit Review
              </button>
            </div>
          </div>
    </div>
  );
}

