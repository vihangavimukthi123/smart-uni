import { useState } from "react";
import Sidebar from "../sidebar/sidebar";
import "./planGenerate.css";

const PRIMARY = "#1152D4";
const ERROR_COLOR = "#ef4444";

const weekdayPresets = [
  { label: "6:00 PM - 10:00 PM", sub: "Afternoon Session" },
  { label: "7:00 PM - 12:00 AM", sub: "Night Owl" },
  { label: "8:00 PM - 11:00 PM", sub: "Focused Sprint" },
];
const saturdayOptions = ["All Day", "10:00 AM - 5:00 PM", "Customize"];
const sundayOptions = ["12:00 PM - 8:00 PM", "10:00 AM - 5:00 PM", "Customize"];
const studyBlocks = ["25m (Pomodoro)", "45m", "60m", "90m", "Custom"];

// ---- Toggle ----
function Toggle({ value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 99,
        background: value ? PRIMARY : "#d1d5db",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.2s",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3,
          left: value ? 23 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          transition: "left 0.2s",
        }}
      />
    </div>
  );
}

// ---- Radio ----
function RadioOption({ label, checked, onChange }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        cursor: "pointer",
      }}
    >
      <div
        onClick={onChange}
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: `2px solid ${checked ? PRIMARY : "#d1d5db"}`,
          background: checked ? PRIMARY : "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        {checked && (
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#fff",
            }}
          />
        )}
      </div>
      <span style={{ fontSize: 13.5, color: "#374151" }}>{label}</span>
    </label>
  );
}

// ---- Time Input ----
function TimeInput({ label, value, onChange, error }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: "#374151" }}>
        {label}
      </label>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#fff",
          border: `1.5px solid ${error ? ERROR_COLOR : "#e5e7eb"}`,
          borderRadius: 10,
          padding: "9px 12px",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke={error ? ERROR_COLOR : PRIMARY}
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            border: "none",
            outline: "none",
            fontSize: 13.5,
            color: "#111",
            background: "transparent",
            fontFamily: "inherit",
            width: "100%",
          }}
        />
      </div>
      {error && (
        <span style={{ fontSize: 11.5, color: ERROR_COLOR }}>{error}</span>
      )}
    </div>
  );
}

// ---- Error Message ----
function ErrMsg({ msg }) {
  if (!msg) return null;
  return (
    <span style={{ fontSize: 11.5, color: ERROR_COLOR, marginTop: 2 }}>
      {msg}
    </span>
  );
}

// ======= Main Component =======
export default function GenerateWorkplan() {
  const [customizeWeekday, setCustomizeWeekday] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customStart, setCustomStart] = useState("18:00");
  const [customEnd, setCustomEnd] = useState("22:00");
  const [saturday, setSaturday] = useState("All Day");
  const [sunday, setSunday] = useState("12:00 PM - 8:00 PM");
  const [tasks, setTasks] = useState([
    { id: 1, name: "", deadline: "", priority: "High" },
  ]);
  const [bedtime, setBedtime] = useState("23:00");
  const [wakeup, setWakeup] = useState("07:00");
  const [studyBlock, setStudyBlock] = useState("25m (Pomodoro)");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // ---- CHANGE 1: todayStr in YYYY-MM-DD local time (no timezone bug) ----
  const todayStr = new Date().toLocaleDateString("en-CA");

  // ---- Helpers ----
  const clearErr = (key) =>
    setErrors((prev) => {
      const e = { ...prev };
      delete e[key];
      return e;
    });

  const addTask = () =>
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), name: "", deadline: "", priority: "High" },
    ]);

  const updateTask = (id, field, val) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: val } : t)),
    );
    clearErr("task_" + id + "_" + field);
    clearErr("tasksGlobal");
  };

  const removeTask = (id) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  // ---- Validation ----
  const validate = () => {
    const e = {};

    // Custom weekday hours (only when toggle is on)
    if (customizeWeekday) {
      if (!customStart) e.customStart = "Start time is required";
      if (!customEnd) e.customEnd = "End time is required";
      if (customStart && customEnd && customStart >= customEnd)
        e.customEnd = "End time must be after start time";
    }

    // Tasks: at least one must have a name
    const named = tasks.filter((t) => t.name.trim());
    if (named.length === 0) {
      e.tasksGlobal = "Please add at least one task name";
    }
    tasks.forEach((t) => {
      if (t.name.trim()) {
        if (!t.deadline) {
          e["task_" + t.id + "_deadline"] = "Required";
        } else {
          // ---- CHANGE 3: direct string comparison — no Date parsing, no timezone bugs ----
          if (t.deadline < todayStr) {
            e["task_" + t.id + "_deadline"] = "Must be today or a future date";
          }
        }
      }
    });

    // Sleep schedule
    if (!bedtime) e.bedtime = "Bedtime is required";
    if (!wakeup) e.wakeup = "Wake-up time is required";
    if (bedtime && wakeup && bedtime === wakeup)
      e.wakeup = "Wake-up time must differ from bedtime";

    return e;
  };

  const handleGenerate = () => {
    setSuccess(false);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length === 0) {
      setSuccess(true);
      // TODO: call your backend API here
    }
  };

  // ---- Render ----
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
      {/*<Navbar />*/}

      <div style={{ display: "flex", flex: 1 }}>
        
        <div className="page">
          {/* Hero */}
          <div className="hero">
            <h1 className="hero-title">AI Workplan Generator</h1>
            <p className="hero-sub">
              Let's build a work plan that fits your time and helps you stay
              consistent.
            </p>
          </div>

          {/* Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Let's Build Your Work Plan</div>
              <div className="card-sub">
                Customize your study hours and tasks to optimize your academic
                momentum.
              </div>
            </div>

            {/* ===== Weekday Availability ===== */}
            <section className="section">
              <div className="section-header">
                <div className="section-title">
                  <span>📅</span> Weekdays Availability
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}
                  >
                    Customize
                  </span>
                  <Toggle
                    value={customizeWeekday}
                    onChange={(v) => {
                      setCustomizeWeekday(v);
                      if (!v) {
                        clearErr("customStart");
                        clearErr("customEnd");
                      }
                    }}
                  />
                </div>
              </div>

              <div className="preset-grid">
                {weekdayPresets.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedPreset(i)}
                    className="preset-btn"
                    style={{
                      background:
                        selectedPreset === i ? PRIMARY + "12" : "#f9fafb",
                      border:
                        "1.5px solid " +
                        (selectedPreset === i ? PRIMARY : "#e5e7eb"),
                      color: selectedPreset === i ? PRIMARY : "#374151",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>
                      {p.label}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                      {p.sub}
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Hours - only shown when toggle ON */}
              {customizeWeekday && (
                <div className="custom-box">
                  <div className="custom-box-label">CUSTOM WEEKDAY HOURS</div>
                  <div className="time-row">
                    <TimeInput
                      label="Start Time"
                      value={customStart}
                      onChange={(v) => {
                        setCustomStart(v);
                        clearErr("customStart");
                        clearErr("customEnd");
                      }}
                      error={errors.customStart}
                    />
                    <TimeInput
                      label="End Time"
                      value={customEnd}
                      onChange={(v) => {
                        setCustomEnd(v);
                        clearErr("customEnd");
                      }}
                      error={errors.customEnd}
                    />
                  </div>
                </div>
              )}
            </section>

            <div className="divider" />

            {/* ===== Weekend ===== */}
            <section className="section">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 32,
                }}
              >
                <div>
                  <div className="section-title">
                    <span>📅</span> Saturday
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {saturdayOptions.map((o) => (
                      <RadioOption
                        key={o}
                        label={o}
                        checked={saturday === o}
                        onChange={() => setSaturday(o)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="section-title">
                    <span>📅</span> Sunday
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {sundayOptions.map((o) => (
                      <RadioOption
                        key={o}
                        label={o}
                        checked={sunday === o}
                        onChange={() => setSunday(o)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <div className="divider" />

            {/* ===== Tasks ===== */}
            <section className="section">
              <div className="section-title">
                <span>📋</span> Current Tasks &amp; Projects
              </div>
              <div className="task-box">
                <div className="task-header">
                  <span style={{ flex: 2 }}>TASK NAME</span>
                  <span style={{ flex: 1 }}>DEADLINE</span>
                  <span style={{ flex: 1 }}>PRIORITY</span>
                  <span style={{ width: 30 }} />
                </div>
                {tasks.map((t) => (
                  <div key={t.id}>
                    <div
                      style={{ display: "flex", gap: 12, alignItems: "center" }}
                    >
                      <div
                        style={{
                          flex: 2,
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        <input
                          className="task-input"
                          style={{
                            borderColor: errors["task_" + t.id + "_name"]
                              ? ERROR_COLOR
                              : "#e5e7eb",
                          }}
                          placeholder="e.g. Data Structures Project"
                          value={t.name}
                          onChange={(e) =>
                            updateTask(t.id, "name", e.target.value)
                          }
                        />
                        <ErrMsg msg={errors["task_" + t.id + "_name"]} />
                      </div>
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        {/* ---- CHANGE 2: min={todayStr} prevents past date selection in picker ---- */}
                        <input
                          type="date"
                          min={todayStr}
                          className="task-input"
                          style={{
                            borderColor: errors["task_" + t.id + "_deadline"]
                              ? ERROR_COLOR
                              : "#e5e7eb",
                          }}
                          value={t.deadline}
                          onChange={(e) =>
                            updateTask(t.id, "deadline", e.target.value)
                          }
                        />
                        <ErrMsg msg={errors["task_" + t.id + "_deadline"]} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <select
                          className="task-input"
                          value={t.priority}
                          onChange={(e) =>
                            updateTask(t.id, "priority", e.target.value)
                          }
                        >
                          {["High", "Medium", "Low"].map((p) => (
                            <option key={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        className="delete-task-btn"
                        onClick={() => removeTask(t.id)}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={ERROR_COLOR}
                          strokeWidth="2"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                {errors.tasksGlobal && (
                  <span
                    style={{ fontSize: 12, color: ERROR_COLOR, marginTop: 2 }}
                  >
                    {errors.tasksGlobal}
                  </span>
                )}
                <button className="add-task-btn" onClick={addTask}>
                  + Add Another Task
                </button>
              </div>
            </section>

            <div className="divider" />

            {/* ===== Sleep Schedule ===== */}
            <section className="section">
              <div className="section-title">
                <span>🌙</span> Sleep Schedule
              </div>
              <div className="custom-box">
                <div className="time-row">
                  <TimeInput
                    label="Bedtime"
                    value={bedtime}
                    onChange={(v) => {
                      setBedtime(v);
                      clearErr("bedtime");
                      clearErr("wakeup");
                    }}
                    error={errors.bedtime}
                  />
                  <TimeInput
                    label="Wake-up Time"
                    value={wakeup}
                    onChange={(v) => {
                      setWakeup(v);
                      clearErr("wakeup");
                    }}
                    error={errors.wakeup}
                  />
                </div>
              </div>
            </section>

            <div className="divider" />

            {/* ===== Study Blocks ===== */}
            <section className="section">
              <div className="section-title">
                <span>⏱️</span> Preferred Study Blocks
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {studyBlocks.map((b) => (
                  <button
                    key={b}
                    onClick={() => setStudyBlock(b)}
                    style={{
                      padding: "8px 18px",
                      borderRadius: 20,
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      background: studyBlock === b ? PRIMARY : "#f3f4f6",
                      color: studyBlock === b ? "#fff" : "#374151",
                      border:
                        "1.5px solid " +
                        (studyBlock === b ? PRIMARY : "transparent"),
                    }}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </section>

            {/* Success banner */}
            {success && (
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: 12,
                  padding: "12px 16px",
                  color: "#16a34a",
                  fontWeight: 600,
                  fontSize: 13.5,
                  textAlign: "center",
                }}
              >
                Workplan generated successfully! Connect your backend to
                process.
              </div>
            )}

            {/* Error summary */}
            {Object.keys(errors).length > 0 && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 12,
                  padding: "12px 16px",
                  color: ERROR_COLOR,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Please fix the errors above before generating your workplan.
              </div>
            )}

            {/* Generate Button */}
            <button className="generate-btn" onClick={handleGenerate}>
              Generate My Workplan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
