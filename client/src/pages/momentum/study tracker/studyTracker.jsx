import { useState, useEffect } from "react";
import Navbar from "../../../components/layout/Navbar";
import Sidebar from "../../../components/layout/Sidebar";
import api from "../../../api/axios";

const PRIMARY = "#1152D4";

// ─── Mock initial tasks (replace with API fetch) ──────────────────────────────
const initialTasks = [
  {
    id: 1,
    title: "Review Lecture 04: Data Structures",
    course: "CS302",
    subject: "Algorithms & Complexity",
    timeTracked: 45,
    timeGoal: 60,
    prodScore: 92,
    status: "Pending",
    icon: "📘",
  },
  {
    id: 2,
    title: "Debug Lab 3 Memory Leak",
    course: "CS302",
    subject: "Systems Programming",
    timeTracked: 120,
    timeGoal: 90,
    prodScore: 85,
    status: "Completed",
    icon: "🖥️",
  },
  {
    id: 3,
    title: "Outline Project Proposal",
    course: "WRIT101",
    subject: "Academic Writing",
    timeTracked: 30,
    timeGoal: 45,
    prodScore: 95,
    status: "Pending",
    icon: "✏️",
  },
  {
    id: 4,
    title: "Write-up Physics Lab Part A",
    course: "PHYS201",
    subject: "Classical Mechanics",
    timeTracked: 60,
    timeGoal: 60,
    prodScore: 88,
    status: "Completed",
    icon: "🔬",
  },
];

const EMPTY_FORM = {
  title: "",
  course: "",
  subject: "",
  timeTracked: "",
  timeGoal: "",
  prodScore: "",
  status: "Pending",
  icon: "📘",
  taskDate: new Date().toISOString().split('T')[0],
};

const iconOptions = ["📘", "🖥️", "✏️", "🔬", "📐", "📊", "🧪", "📝"];

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ value, max }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={styles.pbTrack}>
      <div style={{ ...styles.pbFill, width: `${pct}%` }} />
    </div>
  );
}

// ─── Task Row ─────────────────────────────────────────────────────────────────
function TaskRow({ task, onDelete, onEdit }) {
  return (
    <div style={styles.taskRow}>
      <div style={styles.taskIconWrap}>{task.icon}</div>
      <div style={styles.taskInfo}>
        <div style={styles.taskTitle}>{task.title}</div>
        <div style={styles.taskSub}>
          {task.course} • {task.subject}
        </div>
      </div>

      <div style={styles.taskMeta}>
        <div style={styles.metaLabel}>TIME TRACKED</div>
        <div style={styles.metaValue}>
          {task.timeTracked}m
          <span style={{ color: "#9ca3af", fontWeight: 400 }}>
            / {task.timeGoal}m
          </span>
        </div>
      </div>

      <div style={styles.taskMeta}>
        <div style={styles.metaLabel}>PROD. SCORE</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ ...styles.metaValue, color: PRIMARY }}>
            {task.prodScore}%
          </span>
          <ProgressBar value={task.prodScore} max={100} />
        </div>
      </div>

      <span
        style={{
          ...styles.badge,
          background: task.status === "Completed" ? "#f0fdf4" : "#fffbeb",
          color: task.status === "Completed" ? "#16a34a" : "#d97706",
          border: `1px solid ${task.status === "Completed" ? "#bbf7d0" : "#fde68a"}`,
        }}
      >
        {task.status}
      </span>

      <div style={styles.taskActions}>
        <button
          style={styles.iconBtn}
          title="Edit"
          onClick={() => onEdit(task)}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="2"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          style={styles.iconBtn}
          title="Delete"
          onClick={() => onDelete(task._id || task.id)}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Task Modal (Add/Edit) ───────────────────────────────────────────────────
function TaskModal({ onClose, onSave, task }) {
  const [form, setForm] = useState(task || EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.title?.trim()) e.title = "Task title is required";
    if (!form.course?.trim()) e.course = "Course code is required";
    if (!form.subject?.trim()) e.subject = "Subject is required";
    if (form.timeTracked === "" || isNaN(form.timeTracked) || +form.timeTracked < 0)
      e.timeTracked = "Enter valid worked time";
    if (!form.timeGoal || isNaN(form.timeGoal) || +form.timeGoal <= 0)
      e.timeGoal = "Enter valid estimated goal";
    if (!form.taskDate) e.taskDate = "Session date is required";
    if (
      form.prodScore === undefined ||
      isNaN(form.prodScore) ||
      +form.prodScore < 0 ||
      +form.prodScore > 100
    )
      e.prodScore = "Score must be 0–100";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    onSave({
      ...form,
      timeTracked: +form.timeTracked,
      timeGoal: +form.timeGoal,
      prodScore: +form.prodScore,
    });
    onClose();
  };

  const isEdit = Boolean(task);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <div>
            <div style={styles.modalTitle}>{isEdit ? "Edit Task" : "Add New Task"}</div>
            <div style={styles.modalSub}>
              {isEdit ? "Modify your study task details" : "Fill in the details for your micro-task"}
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Icon picker */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Task Icon</label>
          <div style={styles.iconPicker}>
            {iconOptions.map((ic) => (
              <button
                key={ic}
                style={{
                  ...styles.iconOption,
                  background: form.icon === ic ? `${PRIMARY}15` : "#f9fafb",
                  border: `2px solid ${form.icon === ic ? PRIMARY : "transparent"}`,
                }}
                onClick={() => set("icon", ic)}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Task Title *</label>
          <input
            style={{
              ...styles.input,
              ...(errors.title ? styles.inputError : {}),
            }}
            placeholder="e.g. Review Lecture 04: Data Structures"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
          {errors.title && <span style={styles.errorMsg}>{errors.title}</span>}
        </div>

        {/* Date Row */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Session Date *</label>
          <input
            type="date"
            style={{
              ...styles.input,
              ...(errors.taskDate ? styles.inputError : {}),
            }}
            value={form.taskDate ? new Date(form.taskDate).toISOString().split('T')[0] : ""}
            onChange={(e) => set("taskDate", e.target.value)}
          />
          {errors.taskDate && <span style={styles.errorMsg}>{errors.taskDate}</span>}
        </div>

        {/* Course + Subject */}
        <div style={styles.row2}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Course Code *</label>
            <input
              style={{
                ...styles.input,
                ...(errors.course ? styles.inputError : {}),
              }}
              placeholder="e.g. CS302"
              value={form.course}
              onChange={(e) => set("course", e.target.value)}
            />
            {errors.course && (
              <span style={styles.errorMsg}>{errors.course}</span>
            )}
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Subject *</label>
            <input
              style={{
                ...styles.input,
                ...(errors.subject ? styles.inputError : {}),
              }}
              placeholder="e.g. Algorithms & Complexity"
              value={form.subject}
              onChange={(e) => set("subject", e.target.value)}
            />
            {errors.subject && (
              <span style={styles.errorMsg}>{errors.subject}</span>
            )}
          </div>
        </div>

        {/* Time Tracking Row */}
        <div style={styles.row2}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Worked Time (mins) *</label>
            <input
              style={{
                ...styles.input,
                ...(errors.timeTracked ? styles.inputError : {}),
              }}
              placeholder="e.g. 45"
              type="number"
              value={form.timeTracked}
              onChange={(e) => set("timeTracked", e.target.value)}
            />
            {errors.timeTracked && (
              <span style={styles.errorMsg}>{errors.timeTracked}</span>
            )}
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Estimated Goal (mins) *</label>
            <input
              style={{
                ...styles.input,
                ...(errors.timeGoal ? styles.inputError : {}),
              }}
              placeholder="e.g. 60"
              type="number"
              value={form.timeGoal}
              onChange={(e) => set("timeGoal", e.target.value)}
            />
            {errors.timeGoal && (
              <span style={styles.errorMsg}>{errors.timeGoal}</span>
            )}
          </div>
        </div>

        {/* Productivity Score Row */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Productivity Score (0–100) *</label>
          <input
            style={{
              ...styles.input,
              ...(errors.prodScore ? styles.inputError : {}),
            }}
            placeholder="e.g. 92"
            type="number"
            value={form.prodScore}
            onChange={(e) => set("prodScore", e.target.value)}
          />
          {errors.prodScore && (
            <span style={styles.errorMsg}>{errors.prodScore}</span>
          )}
        </div>

        {/* Status */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Status</label>
          <div style={styles.statusToggle}>
            {["Pending", "Completed"].map((s) => (
              <button
                key={s}
                style={{
                  ...styles.statusBtn,
                  background: form.status === s ? PRIMARY : "#f3f4f6",
                  color: form.status === s ? "#fff" : "#555",
                }}
                onClick={() => set("status", s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={styles.modalFooter}>
          <button style={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button style={styles.submitBtn} onClick={handleSubmit}>
            {isEdit ? "Save Changes" : "+ Add Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Study Tracker ───────────────────────────────────────────────────────
export default function StudyTracker() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/momentum/study-tasks');
      setTasks(res.data.data || []);
    } catch (err) {
      console.error("Fetch Tasks Error:", err);
    }
  };

  const filtered = tasks.filter(
    (t) =>
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.course?.toLowerCase().includes(search.toLowerCase()) ||
      t.subject?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = async (taskData) => {
    try {
      const res = await api.post('/momentum/study-tasks', taskData);
      setTasks(prev => [res.data.data, ...prev]);
    } catch(e) { 
      console.error("Add Task Error:", e);
    }
  };

  const handleUpdate = async (taskData) => {
    try {
      const res = await api.put(`/momentum/study-tasks/${taskData._id}`, taskData);
      setTasks(prev => prev.map(t => t._id === taskData._id ? res.data.data : t));
    } catch(e) { 
      console.error("Update Task Error:", e);
    }
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
       await api.delete(`/momentum/study-tasks/${id}`);
       setTasks((prev) => prev.filter((t) => (t._id || t.id) !== id));
    } catch(e) {
      console.error("Delete Task Error:", e);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#F3F4F6",
      }}
    >
      

      <div style={{ display: "flex", flex: 1 }}>
        
        
        <div style={styles.page}>
          {/* Hero */}
          <div style={styles.hero}>
            <div>
              <h1 style={styles.heroTitle}>Track Your Micro-Wins, Alex! 🎯</h1>
              <p style={styles.heroSub}>
                Ready for your next study session? Success is the sum of small
                efforts repeated daily.
              </p>
            </div>
            <div style={styles.heroIcon}>💡</div>
          </div>

          {/* Toolbar */}
          <div style={styles.toolbar}>
            <div style={styles.searchWrap}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9ca3af"
                strokeWidth="2"
                style={{ flexShrink: 0 }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                style={styles.searchInput}
                placeholder="Search your micro-tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button style={styles.addBtn} onClick={() => setShowModal(true)}>
              + Add Task
            </button>
          </div>

          {/* Task List */}
          <div style={styles.taskList}>
            {filtered.length > 0 ? (
              filtered.map((t) => (
                <TaskRow key={t._id || t.id} task={t} onDelete={handleDelete} onEdit={handleEditClick} />
              ))
            ) : (
              <div style={styles.emptyState}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
                <div style={{ color: "#9ca3af", fontSize: 14 }}>
                  {search
                    ? "No tasks match your search."
                    : "Ready for your next study session? Add a new micro task to start tracking."}
                </div>
              </div>
            )}
          </div>

          {/* Modal */}
          {showModal && (
            <TaskModal
              onClose={() => {
                setShowModal(false);
                setEditingTask(null);
              }}
              onSave={editingTask ? handleUpdate : handleAdd}
              task={editingTask}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  page: {
    flex: 1,
    minWidth: 0,
    width: "100%",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#f5f7fc",
    overflowY: "auto",
    overflowX: "hidden",
  },
  hero: {
    background: `linear-gradient(120deg, rgba(17,82,212,0.85) 0%, rgba(14,62,168,0.95) 100%), url('/tracker_banner.png')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: "0 0 20px 20px",
    padding: "28px 32px",
    width: "100%",
    boxSizing: "border-box",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 700,
    margin: "0 0 8px",
    letterSpacing: "-0.4px",
  },
  heroSub: { fontSize: 13.5, opacity: 0.85, margin: 0 },
  heroIcon: { fontSize: 64, opacity: 0.2, userSelect: "none" },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 28px",
    marginBottom: 20,
    gap: 16,
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "10px 16px",
    flex: 1,
    maxWidth: 400,
  },
  searchInput: {
    border: "none",
    outline: "none",
    fontSize: 13.5,
    color: "#374151",
    width: "100%",
    background: "transparent",
  },
  addBtn: {
    background: PRIMARY,
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "11px 22px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  taskList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: "0 28px 28px",
  },
  taskRow: {
    background: "#fff",
    borderRadius: 14,
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  taskIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: `${PRIMARY}12`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    flexShrink: 0,
  },
  taskInfo: { flex: 1, minWidth: 0 },
  taskTitle: { fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 3 },
  taskSub: { fontSize: 12, color: "#9ca3af" },
  taskMeta: { display: "flex", flexDirection: "column", gap: 4, minWidth: 100 },
  metaLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: "#9ca3af",
    letterSpacing: "0.5px",
  },
  metaValue: {
    fontSize: 13.5,
    fontWeight: 700,
    color: "#111",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  pbTrack: {
    width: 60,
    height: 5,
    background: "#e5e7eb",
    borderRadius: 99,
    overflow: "hidden",
  },
  pbFill: { height: "100%", background: PRIMARY, borderRadius: 99 },
  badge: {
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  taskActions: { display: "flex", gap: 6 },
  iconBtn: {
    border: "none",
    background: "#f9fafb",
    borderRadius: 8,
    width: 30,
    height: 30,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    background: "#fff",
    borderRadius: 14,
    padding: "48px 24px",
    textAlign: "center",
    border: "1.5px dashed #e5e7eb",
  },
  // Modal
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    backdropFilter: "blur(3px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
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
    overflowY: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  modalTitle: { fontSize: 18, fontWeight: 800, color: "#111" },
  modalSub: { fontSize: 13, color: "#9ca3af", marginTop: 3 },
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
    justifyContent: "center",
  },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12.5, fontWeight: 700, color: "#374151" },
  input: {
    border: "1.5px solid #e5e7eb",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13.5,
    color: "#111",
    outline: "none",
    transition: "border 0.15s",
    fontFamily: "inherit",
  },
  inputError: { borderColor: "#ef4444" },
  errorMsg: { fontSize: 11.5, color: "#ef4444" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  iconPicker: { display: "flex", gap: 8, flexWrap: "wrap" },
  iconOption: {
    width: 38,
    height: 38,
    borderRadius: 10,
    fontSize: 18,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statusToggle: { display: "flex", gap: 10 },
  statusBtn: {
    padding: "8px 20px",
    borderRadius: 10,
    border: "none",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 4,
  },
  cancelBtn: {
    padding: "10px 22px",
    borderRadius: 10,
    border: "1.5px solid #e5e7eb",
    background: "#fff",
    color: "#555",
    fontWeight: 600,
    fontSize: 13.5,
    cursor: "pointer",
  },
  submitBtn: {
    padding: "10px 24px",
    borderRadius: 10,
    border: "none",
    background: PRIMARY,
    color: "#fff",
    fontWeight: 700,
    fontSize: 13.5,
    cursor: "pointer",
  },
};

