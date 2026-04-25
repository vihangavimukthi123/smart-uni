import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";
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
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [customizeWeekday, setCustomizeWeekday] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customStart, setCustomStart] = useState("18:00");
  const [customEnd, setCustomEnd] = useState("22:00");
  const [saturday, setSaturday] = useState("All Day");
  const [satCustomStart, setSatCustomStart] = useState("10:00");
  const [satCustomEnd, setSatCustomEnd] = useState("17:00");
  const [sunday, setSunday] = useState("12:00 PM - 8:00 PM");
  const [sunCustomStart, setSunCustomStart] = useState("12:00");
  const [sunCustomEnd, setSunCustomEnd] = useState("20:00");
  const [customStudyBlock, setCustomStudyBlock] = useState("");
  const [tasks, setTasks] = useState([
    { id: 1, name: "", deadline: "", priority: "High" },
  ]);
  const [lifeEvents, setLifeEvents] = useState([]);
  const [energyLevel, setEnergyLevel] = useState("Balanced");
  const [bedtime, setBedtime] = useState("23:00");
  const [wakeup, setWakeup] = useState("07:00");
  const [studyBlock, setStudyBlock] = useState("25m (Pomodoro)");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (!location.state?.editData) return;
    const d = location.state.editData;
    setIsEditMode(true);

    // Tasks, life events, sleep, energy
    if (d.tasks?.length)     setTasks(d.tasks);
    if (d.lifeEvents?.length) setLifeEvents(d.lifeEvents);
    if (d.bedtime)            setBedtime(d.bedtime);
    if (d.wakeup)             setWakeup(d.wakeup);
    if (d.energyLevel)        setEnergyLevel(d.energyLevel);

    // Weekday availability — try to match a preset first
    if (d.availability) {
      const presetIdx = weekdayPresets.findIndex(p => p.label === d.availability);
      if (presetIdx !== -1) {
        setSelectedPreset(presetIdx);
        setCustomizeWeekday(false);
      } else {
        setCustomizeWeekday(true);
        const parts = d.availability.split(" - ");
        if (parts[0]) setCustomStart(parts[0].trim());
        if (parts[1]) setCustomEnd(parts[1].trim());
      }
    }

    // Saturday
    if (d.saturday) {
      const knownSat = saturdayOptions.filter(o => o !== "Customize");
      if (knownSat.includes(d.saturday)) {
        setSaturday(d.saturday);
      } else {
        setSaturday("Customize");
        const parts = d.saturday.split(" - ");
        if (parts[0]) setSatCustomStart(parts[0].trim());
        if (parts[1]) setSatCustomEnd(parts[1].trim());
      }
    }

    // Sunday
    if (d.sunday) {
      const knownSun = sundayOptions.filter(o => o !== "Customize");
      if (knownSun.includes(d.sunday)) {
        setSunday(d.sunday);
      } else {
        setSunday("Customize");
        const parts = d.sunday.split(" - ");
        if (parts[0]) setSunCustomStart(parts[0].trim());
        if (parts[1]) setSunCustomEnd(parts[1].trim());
      }
    }

    // Study block interval
    if (d.studyInterval) {
      const knownBlocks = studyBlocks.filter(b => b !== "Custom");
      if (knownBlocks.includes(d.studyInterval)) {
        setStudyBlock(d.studyInterval);
      } else {
        setStudyBlock("Custom");
        setCustomStudyBlock(d.studyInterval);
      }
    }
  }, [location.state]);


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

  const addLifeEvent = () => setLifeEvents((p) => [...p, { id: Date.now(), name: "", days: [], startTime: "19:00", endTime: "21:00" }]);
  const removeLifeEvent = (id) => setLifeEvents((p) => p.filter((e) => e.id !== id));
  const updateLifeEvent = (id, field, val) => setLifeEvents((p) => p.map((e) => (e.id === id ? { ...e, [field]: val } : e)));
  const toggleDay = (eventId, day) => {
    setLifeEvents(prev => prev.map(e => {
        if (e.id !== eventId) return e;
        const days = e.days.includes(day) ? e.days.filter(d => d !== day) : [...e.days, day];
        return { ...e, days };
    }));
  };

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
          e["task_" + t.id + "_deadline"] = "Deadline is required for each named task";
        } else {
          if (t.deadline < todayStr) {
            e["task_" + t.id + "_deadline"] = "Deadline must be today or a future date";
          }
        }
      } else if (t.deadline) {
        // Has a deadline but no name
        e["task_" + t.id + "_name"] = "Task name is required when a deadline is set";
      }
    });

    // Sleep schedule
    if (!bedtime) e.bedtime = "Bedtime is required";
    if (!wakeup) e.wakeup = "Wake-up time is required";
    if (bedtime && wakeup && bedtime === wakeup)
      e.wakeup = "Wake-up time must differ from bedtime";

    return e;
  };

  const handleGenerate = async () => {
    setSuccess(false);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length === 0) {
      setLoading(true);
      try {
        const payload = {
            userId: user?._id,
            availability: customizeWeekday ? `${customStart} - ${customEnd}` : weekdayPresets[selectedPreset].label,
            saturday: saturday === "Customize" ? `${satCustomStart} - ${satCustomEnd}` : saturday,
            sunday: sunday === "Customize" ? `${sunCustomStart} - ${sunCustomEnd}` : sunday,
            tasks: tasks.filter(t => t.name.trim()),
            studyInterval: studyBlock === "Custom" ? (customStudyBlock || "Custom") : studyBlock,
            bedtime, wakeup, lifeEvents, energyLevel
        };
        const res = await api.post('/momentum/generate-plan', payload);
        if (res.data.success) {
            setSuccess(true);
            setTimeout(() => navigate('/momentum/vault'), 1500);
        }
      } catch (err) {
        alert("Generation failed: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
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
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {saturdayOptions.map((o) => (
                      <RadioOption
                        key={o}
                        label={o}
                        checked={saturday === o}
                        onChange={() => setSaturday(o)}
                      />
                    ))}
                  </div>
                  {saturday === "Customize" && (
                    <div className="custom-box" style={{ marginTop: 12 }}>
                      <div className="custom-box-label">CUSTOM SATURDAY HOURS</div>
                      <div className="time-row">
                        <TimeInput label="Start Time" value={satCustomStart} onChange={setSatCustomStart} />
                        <TimeInput label="End Time" value={satCustomEnd} onChange={setSatCustomEnd} />
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <div className="section-title">
                    <span>📅</span> Sunday
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {sundayOptions.map((o) => (
                      <RadioOption
                        key={o}
                        label={o}
                        checked={sunday === o}
                        onChange={() => setSunday(o)}
                      />
                    ))}
                  </div>
                  {sunday === "Customize" && (
                    <div className="custom-box" style={{ marginTop: 12 }}>
                      <div className="custom-box-label">CUSTOM SUNDAY HOURS</div>
                      <div className="time-row">
                        <TimeInput label="Start Time" value={sunCustomStart} onChange={setSunCustomStart} />
                        <TimeInput label="End Time" value={sunCustomEnd} onChange={setSunCustomEnd} />
                      </div>
                    </div>
                  )}
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

            {/* ===== Fixed Tasks (Life Events) ===== */}
            <section className="section">
              <div className="section-title">
                <span>🏙️</span> Fixed Tasks & Commitments
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {lifeEvents.map(e => (
                  <div key={e.id} className="custom-box" style={{ marginTop: 0, padding: 16 }}>
                     <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                        <input className="task-input" style={{ flex: 1 }} placeholder="Commitment (e.g. Gym, Part-time Job)" value={e.name} onChange={v => updateLifeEvent(e.id, 'name', v.target.value)} />
                        <button className="delete-task-btn" onClick={() => removeLifeEvent(e.id)}>✕</button>
                     </div>
                     <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                            <button key={d} type="button" onClick={() => toggleDay(e.id, d)} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, border: '1px solid var(--border)', background: e.days.includes(d) ? PRIMARY : 'transparent', color: e.days.includes(d) ? '#fff' : 'inherit' }}>{d}</button>
                        ))}
                     </div>
                     <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1 }}><TimeInput label="Starts At" value={e.startTime} onChange={v => updateLifeEvent(e.id, 'startTime', v)} /></div>
                        <div style={{ flex: 1 }}><TimeInput label="Ends At" value={e.endTime} onChange={v => updateLifeEvent(e.id, 'endTime', v)} /></div>
                     </div>
                  </div>
                ))}
                <button className="add-task-btn" onClick={addLifeEvent} style={{ alignSelf: 'flex-start' }}>+ Add Recurring Commitment</button>
              </div>
            </section>

            <div className="divider" />

            {/* ===== Energy Level ===== */}
            <section className="section">
              <div className="section-title">
                <span>⚡</span> Preferred Energy Profile
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {["Morning Person", "Balanced", "Night Owl"].map((l) => (
                  <button
                    key={l}
                    onClick={() => setEnergyLevel(l)}
                    style={{
                      padding: "8px 18px",
                      borderRadius: 20,
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      background: energyLevel === l ? PRIMARY : "#f3f4f6",
                      color: energyLevel === l ? "#fff" : "#374151",
                      border: "1.5px solid " + (energyLevel === l ? PRIMARY : "transparent"),
                    }}
                  >
                    {l}
                  </button>
                ))}
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
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
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
                      border: "1.5px solid " + (studyBlock === b ? PRIMARY : "transparent"),
                    }}
                  >
                    {b}
                  </button>
                ))}
              </div>
              {studyBlock === "Custom" && (
                <div className="custom-box">
                  <div className="custom-box-label">CUSTOM BLOCK DURATION</div>
                  <input
                    className="task-input"
                    placeholder="e.g. 50m, 2 hours, 1h 30m"
                    value={customStudyBlock}
                    onChange={e => setCustomStudyBlock(e.target.value)}
                    style={{ maxWidth: 280 }}
                  />
                </div>
              )}
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
                ✅ Workplan generated with AI! Redirecting to your Vault...
              </div>
            )}

            {/* Edit mode banner */}
            {isEditMode && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: '#fffbeb', border: '1px solid #fde68a',
                borderRadius: 12, padding: '12px 18px', marginBottom: 8,
              }}>
                <span style={{ fontSize: 20 }}>✏️</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#92400e' }}>Editing existing plan</div>
                  <div style={{ fontSize: 12, color: '#b45309', marginTop: 2 }}>
                    Adjust your inputs below and click <strong>Regenerate Workplan</strong> to create a new version.
                  </div>
                </div>
              </div>
            )}

            {/* Loading banner */}
            {loading && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 12,
                  padding: '14px 20px',
                  animation: 'pulse 1.8s ease-in-out infinite',
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  border: `3px solid ${PRIMARY}`,
                  borderTopColor: 'transparent',
                  animation: 'spin 0.8s linear infinite',
                  flexShrink: 0,
                }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1e40af' }}>
                    Your workplan is being generated...
                  </div>
                  <div style={{ fontSize: 12, color: '#3b82f6', marginTop: 2 }}>
                    Please wait, this may take a few moments.
                  </div>
                </div>
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
            <button 
              className="generate-btn" 
              onClick={handleGenerate}
              disabled={loading || success}
              style={{ opacity: loading || success ? 0.7 : 1, cursor: loading || success ? 'not-allowed' : 'pointer' }}
            >
              {loading ? "⏳ Generating your plan..." : isEditMode ? "♻️ Regenerate Workplan" : "Generate My Workplan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
