import { useState } from "react";

const PRIMARY = "#1152D4";

const initialForm = {
  taskName: "",
  plannedTime: "",
  actualTime: "",
  notes: "",
};

const initialErrors = {
  taskName: "",
  plannedTime: "",
  actualTime: "",
};

export default function AddTaskModal({ onClose, onAdd }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState(initialErrors);
  const [submitted, setSubmitted] = useState(false);

  const validate = (fields) => {
    const e = { taskName: "", plannedTime: "", actualTime: "" };

    if (!fields.taskName.trim()) {
      e.taskName = "Task name is required.";
    } else if (fields.taskName.trim().length < 4) {
      e.taskName = "Task name must be at least 4 characters.";
    }

    if (!fields.plannedTime.trim()) {
      e.plannedTime = "Planned work time is required.";
    } else if (!/^\d+$/.test(fields.plannedTime.trim())) {
      e.plannedTime = "Enter a valid number of minutes (e.g. 30).";
    } else if (parseInt(fields.plannedTime) < 1 || parseInt(fields.plannedTime) > 600) {
      e.plannedTime = "Must be between 1 and 600 minutes.";
    }

    if (fields.actualTime.trim()) {
      if (!/^\d+$/.test(fields.actualTime.trim())) {
        e.actualTime = "Enter a valid number of minutes (e.g. 40).";
      } else if (parseInt(fields.actualTime) < 1 || parseInt(fields.actualTime) > 600) {
        e.actualTime = "Must be between 1 and 600 minutes.";
      }
    }

    return e;
  };

  const hasErrors = (e) => Object.values(e).some((v) => v !== "");

  const handleChange = (field, value) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (submitted) setErrors(validate(updated));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const e = validate(form);
    setErrors(e);
    if (hasErrors(e)) return;

    onAdd({
      id: Date.now(),
      title: form.taskName.trim(),
      timeGoal: parseInt(form.plannedTime),
      timeTracked: form.actualTime ? parseInt(form.actualTime) : 0,
      notes: form.notes.trim(),
      prodScore: 0,
      status: "Pending",
      icon: "📝",
      course: "General",
      topic: "",
    });

    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div style={s.overlay} onClick={handleOverlayClick}>
      <div style={s.modal}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <h2 style={s.title}>Add Micro Progress Task</h2>
            <p style={s.subtitle}>Track a small step toward your productivity goals.</p>
          </div>
          <button style={s.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Task Name */}
        <div style={s.fieldGroup}>
          <label style={s.label}>
            Enter Task Name <span style={s.required}>*</span>
          </label>
          <input
            style={{ ...s.input, ...(errors.taskName ? s.inputError : {}) }}
            placeholder="Example: Study Database Normalization"
            value={form.taskName}
            onChange={(e) => handleChange("taskName", e.target.value)}
          />
          {errors.taskName && <div style={s.errorMsg}>{errors.taskName}</div>}
        </div>

        {/* Time Row */}
        <div style={s.timeRow}>
          {/* Planned */}
          <div style={{ flex: 1 }}>
            <label style={s.label}>
              Planned Work Time <span style={s.required}>*</span>
            </label>
            <div style={s.timeInputWrap}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke={errors.plannedTime ? "#ef4444" : "#aaa"} strokeWidth="2" style={s.timeIcon}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <input
                style={{ ...s.timeInput, ...(errors.plannedTime ? s.inputError : {}) }}
                placeholder="e.g., 30 minutes"
                value={form.plannedTime}
                onChange={(e) => handleChange("plannedTime", e.target.value)}
              />
            </div>
            {errors.plannedTime && <div style={s.errorMsg}>{errors.plannedTime}</div>}
          </div>

          {/* Actual */}
          <div style={{ flex: 1 }}>
            <label style={s.label}>Actual Work Time</label>
            <div style={s.timeInputWrap}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke={errors.actualTime ? "#ef4444" : "#aaa"} strokeWidth="2" style={s.timeIcon}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <input
                style={{ ...s.timeInput, ...(errors.actualTime ? s.inputError : {}) }}
                placeholder="e.g., 40 minutes"
                value={form.actualTime}
                onChange={(e) => handleChange("actualTime", e.target.value)}
              />
            </div>
            {errors.actualTime && <div style={s.errorMsg}>{errors.actualTime}</div>}
          </div>
        </div>

        {/* Notes */}
        <div style={s.fieldGroup}>
          <label style={s.label}>Notes (Optional)</label>
          <textarea
            style={s.textarea}
            placeholder="Add any specific details or reflections about this task..."
            value={form.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            rows={4}
          />
        </div>

        {/* Actions */}
        <div style={s.actions}>
          <button style={s.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={s.submitBtn} onClick={handleSubmit}>Add Task</button>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(10,20,60,0.45)",
    backdropFilter: "blur(3px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000,
    animation: "fadeIn 0.15s ease",
  },
  modal: {
    background: "#fff",
    borderRadius: 20,
    padding: "28px 30px 24px",
    width: 520,
    maxWidth: "calc(100vw - 40px)",
    boxShadow: "0 24px 80px rgba(17,82,212,0.18), 0 4px 20px rgba(0,0,0,0.1)",
    animation: "slideUp 0.2s ease",
  },
  header: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 22,
  },
  title: {
    margin: 0, fontSize: 18, fontWeight: 800,
    color: "#111", letterSpacing: "-0.4px",
  },
  subtitle: {
    margin: "4px 0 0", fontSize: 13,
    color: "#9ca3af", lineHeight: 1.4,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 8,
    border: "1px solid #e5e7eb", background: "#f9fafb",
    cursor: "pointer", color: "#6b7280", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    marginLeft: 16,
  },
  fieldGroup: { marginBottom: 18 },
  label: {
    display: "block", fontSize: 13, fontWeight: 600,
    color: "#374151", marginBottom: 7,
  },
  required: { color: "#ef4444" },
  input: {
    width: "100%", padding: "11px 14px",
    borderRadius: 10, border: "1.5px solid #e5e7eb",
    fontSize: 13.5, color: "#111", outline: "none",
    boxSizing: "border-box", transition: "border-color 0.15s",
    fontFamily: "inherit",
  },
  inputError: { borderColor: "#ef4444", background: "#fff8f8" },
  errorMsg: {
    marginTop: 5, fontSize: 12,
    color: "#ef4444", fontWeight: 500,
  },
  timeRow: { display: "flex", gap: 16, marginBottom: 18 },
  timeInputWrap: { position: "relative" },
  timeIcon: {
    position: "absolute", left: 12,
    top: "50%", transform: "translateY(-50%)",
    pointerEvents: "none",
  },
  timeInput: {
    width: "100%", padding: "11px 14px 11px 34px",
    borderRadius: 10, border: "1.5px solid #e5e7eb",
    fontSize: 13.5, color: "#111", outline: "none",
    boxSizing: "border-box", transition: "border-color 0.15s",
    fontFamily: "inherit",
  },
  textarea: {
    width: "100%", padding: "11px 14px",
    borderRadius: 10, border: "1.5px solid #e5e7eb",
    fontSize: 13.5, color: "#111", outline: "none",
    boxSizing: "border-box", resize: "vertical",
    fontFamily: "inherit", lineHeight: 1.5,
    minHeight: 90,
  },
  actions: {
    display: "flex", justifyContent: "flex-end",
    gap: 10, marginTop: 6,
  },
  cancelBtn: {
    padding: "10px 24px", borderRadius: 10,
    border: "1.5px solid #e5e7eb", background: "#fff",
    fontWeight: 600, fontSize: 14, cursor: "pointer",
    color: "#555", fontFamily: "inherit",
  },
  submitBtn: {
    padding: "10px 28px", borderRadius: 10,
    border: "none", background: PRIMARY,
    fontWeight: 700, fontSize: 14, cursor: "pointer",
    color: "#fff", fontFamily: "inherit",
  },
};