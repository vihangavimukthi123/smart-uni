import { useState } from "react";
import Sidebar from "../sidebar/sidebar";

const PRIMARY = "#1152D4";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const workplan = {
  sessions: 22,
  hours: 18.5,
  interval: "45m",
  days: [
    {
      date: "Monday, Nov 18",
      items: [
        {
          time: "6:00 PM",
          type: "task",
          priority: "High Priority",
          title: "Work on Database Assignment",
          desc: "Focus on SQL normalization and ER diagrams for Section 4",
          duration: "45 mins",
        },
        {
          time: "6:45 PM",
          type: "break",
          title: "Short Break – Stretch & Hydrate",
          duration: "11 mins",
        },
        {
          time: "6:55 PM",
          type: "task",
          priority: "Medium Priority",
          title: "Study Networking Concepts",
          desc: "Review OSI Model layers and TCP/IP handshake protocols",
          duration: "45 mins",
        },
      ],
    },
    {
      date: "Tuesday, Nov 19",
      items: [
        {
          time: "7:00 PM",
          type: "task",
          priority: "High Priority",
          title: "AI Research Paper",
          desc: "Draft the methodology section for the Ethics in AI module",
          duration: "45 mins",
        },
        {
          time: "7:45 PM",
          type: "break",
          title: "Reflection Break – Quiet Time",
          duration: "10 mins",
        },
      ],
    },
    {
      date: "Wednesday, Nov 20",
      items: [
        {
          time: "6:00 PM",
          type: "task",
          priority: "High Priority",
          title: "Calculus Problem Set",
          desc: "Solve integration by parts and differential equation homework",
          duration: "45 mins",
        },
        {
          time: "6:45 PM",
          type: "break",
          title: "Recovery Break – Fresh Air",
          duration: "10 mins",
        },
        {
          time: "6:55 PM",
          type: "task",
          priority: "Medium Priority",
          title: "History Essay Outline",
          desc: "Structuring the argument for the Industrial Revolution's impact on urban development",
          duration: "45 mins",
        },
        {
          time: "7:40 PM",
          type: "break",
          title: "Meal Break – Nutrition Reset",
          duration: "20 mins",
        },
      ],
    },
  ],
  steps: [
    {
      n: 1,
      title: "Pre-session Setup",
      desc: "Gather all your database lecture notes and open the pgAdmin environment. Ensure your phone is in another room.",
    },
    {
      n: 2,
      title: "Database Sprint",
      desc: "Execute the complete joins exercise first. This is where most students lose marks. Double-check your syntax against the rubric.",
    },
    {
      n: 3,
      title: "Networking Deep Dive",
      desc: "Use the Feynman technique: try to explain the '3-way handshake' to an imaginary person. If you get stuck, re-read chapter 5.",
    },
  ],
  tips: [
    {
      icon: "⏱",
      title: "Use a Timer",
      desc: "Studying in 45–50 min blocks prevents burnout and keeps cognitive load optimal.",
      color: "#fffbeb",
      accent: "#f59e0b",
    },
    {
      icon: "🧠",
      title: "Active Recall",
      desc: "After each session, close the book and write down everything you remember about the topic.",
      color: "#f0fdf4",
      accent: "#16a34a",
    },
    {
      icon: "🌅",
      title: "Morning Review",
      desc: "Spend 5 mins each morning reviewing today's key wins to solidify memory.",
      color: "#eef3ff",
      accent: PRIMARY,
    },
  ],
};

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "tracker", label: "Study Tracker", icon: "📊" },
  { id: "generate", label: "Generate Workplan", icon: "✦" },
  { id: "vault", label: "Academic Vault", icon: "🗂" },
];

// ─── Priority Badge ───────────────────────────────────────────────────────────
function PriorityBadge({ level }) {
  const isHigh = level === "High Priority";
  return (
    <span
      style={{
        ...styles.badge,
        background: isHigh ? "#fef2f2" : "#fffbeb",
        color: isHigh ? "#dc2626" : "#d97706",
        border: `1px solid ${isHigh ? "#fecaca" : "#fde68a"}`,
      }}
    >
      {level}
    </span>
  );
}

function breakIcon(title) {
  if (title.toLowerCase().includes("meal")) return "🍽";
  if (title.toLowerCase().includes("stretch")) return "🤸";
  if (title.toLowerCase().includes("air")) return "🌿";
  return "☁️";
}

// ─── Schedule Item ────────────────────────────────────────────────────────────
function ScheduleItem({ item }) {
  const isBreak = item.type === "break";
  return (
    <div
      style={{
        ...styles.scheduleRow,
        background: isBreak ? "#fafbfd" : "#fff",
        border: `1px solid ${isBreak ? "#f1f4fa" : "#e5e7eb"}`,
      }}
    >
      <span style={styles.timeLabel}>{item.time}</span>
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: item.desc ? 3 : 0,
          }}
        >
          {isBreak && (
            <span style={{ fontSize: 15 }}>{breakIcon(item.title)}</span>
          )}
          {item.priority && <PriorityBadge level={item.priority} />}
          <span
            style={{
              fontWeight: isBreak ? 500 : 700,
              fontSize: 13.5,
              color: isBreak ? "#64748b" : "#111",
            }}
          >
            {item.title}
          </span>
        </div>
        {item.desc && <div style={styles.itemDesc}>{item.desc}</div>}
      </div>
      <span style={styles.duration}>{item.duration}</span>
    </div>
  );
}

// ─── Edit Plan Modal ──────────────────────────────────────────────────────────
const EMPTY_SESSION = {
  date: "",
  time: "",
  type: "task",
  priority: "High Priority",
  title: "",
  desc: "",
  duration: "",
};

function EditPlanModal({ onClose }) {
  const [form, setForm] = useState(EMPTY_SESSION);
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.date.trim()) e.date = "Date is required";
    if (!form.time.trim()) e.time = "Time is required";
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.duration.trim()) e.duration = "Duration is required";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div>
            <div style={styles.modalTitle}>Edit Work Plan</div>
            <div style={styles.modalSub}>
              Add or modify a session in your plan
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Session Type</label>
          <div style={{ display: "flex", gap: 10 }}>
            {["task", "break"].map((t) => (
              <button
                key={t}
                style={{
                  ...styles.statusBtn,
                  background: form.type === t ? PRIMARY : "#f3f4f6",
                  color: form.type === t ? "#fff" : "#555",
                }}
                onClick={() => set("type", t)}
              >
                {t === "task" ? "📘 Task" : "☁️ Break"}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.row2}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Date *</label>
            <input
              style={{
                ...styles.input,
                ...(errors.date ? styles.inputError : {}),
              }}
              placeholder="e.g. Monday, Nov 18"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
            />
            {errors.date && <span style={styles.errorMsg}>{errors.date}</span>}
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Time *</label>
            <input
              style={{
                ...styles.input,
                ...(errors.time ? styles.inputError : {}),
              }}
              placeholder="e.g. 6:00 PM"
              value={form.time}
              onChange={(e) => set("time", e.target.value)}
            />
            {errors.time && <span style={styles.errorMsg}>{errors.time}</span>}
          </div>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Session Title *</label>
          <input
            style={{
              ...styles.input,
              ...(errors.title ? styles.inputError : {}),
            }}
            placeholder="e.g. Work on Database Assignment"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
          {errors.title && <span style={styles.errorMsg}>{errors.title}</span>}
        </div>

        <div style={styles.row2}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Description</label>
            <input
              style={styles.input}
              placeholder="Brief description..."
              value={form.desc}
              onChange={(e) => set("desc", e.target.value)}
            />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Duration *</label>
            <input
              style={{
                ...styles.input,
                ...(errors.duration ? styles.inputError : {}),
              }}
              placeholder="e.g. 45 mins"
              value={form.duration}
              onChange={(e) => set("duration", e.target.value)}
            />
            {errors.duration && (
              <span style={styles.errorMsg}>{errors.duration}</span>
            )}
          </div>
        </div>

        {form.type === "task" && (
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Priority</label>
            <div style={{ display: "flex", gap: 10 }}>
              {["High Priority", "Medium Priority"].map((p) => (
                <button
                  key={p}
                  style={{
                    ...styles.statusBtn,
                    background: form.priority === p ? PRIMARY : "#f3f4f6",
                    color: form.priority === p ? "#fff" : "#555",
                  }}
                  onClick={() => set("priority", p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={styles.modalFooter}>
          <button style={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button style={styles.submitBtn} onClick={handleSubmit}>
            Save Session
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Planner() {
  const [activeNav, setActiveNav] = useState("generate");
  const [showEdit, setShowEdit] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', sans-serif",
        backgroundColor: "#F3F4F6",
      }}
    >
      <div style={{ display: "flex", flex: 1 }}>
        

        <div style={styles.main}>
          {/* Hero */}
          <div style={styles.hero}>
            <div>
              <h1 style={styles.heroTitle}>Your AI Generated Work Plan</h1>
              <p style={styles.heroSub}>
                Personalized schedule optimized for your finals across all
                subjects.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["↗", "⋯"].map((ic, i) => (
                <button key={i} style={styles.heroIconBtn}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Stat cards */}
          <div style={styles.statRow}>
            {[
              {
                label: "Plan Scope",
                value: `${workplan.sessions} Work Sessions`,
                icon: "📅",
              },
              {
                label: "Estimated Effort",
                value: `${workplan.hours} Total Hours`,
                icon: "⏰",
              },
              {
                label: "Focus Interval",
                value: `${workplan.interval} Session Length`,
                icon: "⚡",
              },
            ].map((s) => (
              <div key={s.label} style={styles.statCard}>
                <div style={styles.statLabel}>
                  {s.icon} {s.label}
                </div>
                <div style={styles.statValue}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div style={styles.grid}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Schedule */}
              <div style={styles.card}>
                <div style={styles.cardTitle}>📅 Weekly Detailed Schedule</div>
                {workplan.days.map((day) => (
                  <div key={day.date} style={{ marginBottom: 24 }}>
                    <div style={styles.dayLabel}>
                      <span style={styles.dayDot} />
                      {day.date}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {day.items.map((item, i) => (
                        <ScheduleItem key={i} item={item} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Steps */}
              <div style={styles.card}>
                <div style={styles.cardTitle}>
                  📋 Daily Step-by-Step Breakdown
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 18 }}
                >
                  {workplan.steps.map((step) => (
                    <div
                      key={step.n}
                      style={{
                        display: "flex",
                        gap: 14,
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={styles.stepNum}>{step.n}</div>
                      <div>
                        <div style={styles.stepTitle}>{step.title}</div>
                        <div style={styles.stepDesc}>{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  style={styles.actionBtnOutline}
                  onClick={() => setShowEdit(true)}
                >
                  ✏️ Edit Plan
                </button>
                <button style={styles.actionBtnOutline}>⬇️ Download PDF</button>
                <button style={styles.actionBtnPrimary}>💾 Save Workplan</button>
              </div>
            </div>

            {/* Tips */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={styles.cardTitle}>💡 Smart Study Tips</div>
              {workplan.tips.map((tip) => (
                <div
                  key={tip.title}
                  style={{
                    ...styles.tipCard,
                    background: tip.color,
                    borderLeft: `4px solid ${tip.accent}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{tip.icon}</span>
                    <span style={styles.tipTitle}>{tip.title}</span>
                  </div>
                  <p style={styles.tipDesc}>{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showEdit && <EditPlanModal onClose={() => setShowEdit(false)} />}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  app: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#f5f7fc",
    color: "#111"
  },
  main: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column"
  },
  hero: {
    background: `linear-gradient(120deg, ${PRIMARY} 0%, #0e3ea8 100%)`,
    padding: "30px 36px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    color: "#fff"
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 800,
    margin: "0 0 8px",
    letterSpacing: "-0.4px"
  },
  heroSub: {
    fontSize: 13.5,
    opacity: 0.82,
    margin: 0
  },
  heroIconBtn: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.15)",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: 16
  },
  statRow: {
    display: "flex",
    gap: 16,
    padding: "20px 28px 0",
    flexWrap: "wrap"
  },
  statCard: {
    background: "#fff",
    borderRadius: 14,
    padding: "14px 20px",
    flex: 1,
    minWidth: 160,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
  },
  statLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#9ca3af",
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: "uppercase"
  },
  statValue: {
    fontSize: 15,
    fontWeight: 800,
    color: "#111"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 280px",
    gap: 20,
    padding: "20px 28px 36px"
  },
  card: {
    background: "#fff",
    borderRadius: 14,
    padding: "22px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
  },
  cardTitle: {
    fontSize: 15.5,
    fontWeight: 700,
    color: "#111",
    marginBottom: 18
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: PRIMARY,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    gap: 8
  },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: PRIMARY,
    display: "inline-block",
    flexShrink: 0
  },
  scheduleRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
    padding: "11px 14px",
    borderRadius: 10
  },
  timeLabel: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: 500,
    minWidth: 54,
    paddingTop: 2
  },
  itemDesc: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2
  },
  duration: {
    fontSize: 12,
    color: "#9ca3af",
    whiteSpace: "nowrap",
    paddingTop: 2
  },
  badge: {
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: "nowrap"
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "rgba(17,82,212,0.12)",
    color: PRIMARY,
    fontWeight: 700,
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  stepTitle: {
    fontWeight: 700,
    fontSize: 13.5,
    color: "#111",
    marginBottom: 3
  },
  stepDesc: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 1.6
  },
  tipCard: {
    borderRadius: 12,
    padding: "14px 16px"
  },
  tipTitle: {
    fontWeight: 700,
    fontSize: 13.5,
    color: "#111"
  },
  tipDesc: {
    fontSize: 12.5,
    color: "#475569",
    margin: 0,
    lineHeight: 1.6
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    backdropFilter: "blur(3px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  },
  modal: {
    background: "#fff",
    borderRadius: 20,
    padding: "28px 32px",
    width: "100%",
    maxWidth: 560,
    boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
    display: "flex",
    flexDirection: "column",
    gap: 18,
    maxHeight: "90vh",
    overflowY: "auto"
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: "#111"
  },
  modalSub: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 3
  },
  closeBtn: {
    border: "none",
    background: "#f3f4f6",
    borderRadius: 8,
    width: 30,
    height: 30,
    cursor: "pointer",
    fontSize: 14,
    color: "#555",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6
  },
  label: {
    fontSize: 12.5,
    fontWeight: 700,
    color: "#374151"
  },
  input: {
    border: "1.5px solid #e5e7eb",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13.5,
    color: "#111",
    outline: "none",
    transition: "border 0.15s",
    fontFamily: "inherit"
  },
  inputError: {
    borderColor: "#ef4444"
  },
  errorMsg: {
    fontSize: 11.5,
    color: "#ef4444"
  },
  row2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16
  },
  statusBtn: {
    padding: "8px 20px",
    borderRadius: 10,
    border: "none",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.15s"
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 4
  },
  cancelBtn: {
    padding: "10px 22px",
    borderRadius: 10,
    border: "1.5px solid #e5e7eb",
    background: "#fff",
    color: "#555",
    fontWeight: 600,
    fontSize: 13.5,
    cursor: "pointer"
  },
  submitBtn: {
    padding: "10px 24px",
    borderRadius: 10,
    border: "none",
    background: PRIMARY,
    color: "#fff",
    fontWeight: 700,
    fontSize: 13.5,
    cursor: "pointer"
  },
  actionBtnOutline: {
    flex: 1,
    padding: "11px 16px",
    borderRadius: 12,
    border: "1.5px solid #d1d5db",
    background: "#fff",
    color: "#4b5563",
    fontWeight: 700,
    fontSize: 13.5,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.2s ease"
  },
  actionBtnPrimary: {
    flex: 2,
    padding: "11px 20px",
    borderRadius: 12,
    border: "none",
    background: "#e5e7eb",
    color: "#4b5563",
    fontWeight: 700,
    fontSize: 13.5,
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    transition: "all 0.2s ease"
  }
};
