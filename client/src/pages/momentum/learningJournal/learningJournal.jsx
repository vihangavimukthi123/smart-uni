import { useEffect, useMemo, useState } from "react";
import Sidebar from "../sidebar/sidebar";
import "./learningJournal.css";
import api from "../../../api/axios";


const PRIMARY = "#1152D4";

const CATEGORY_OPTIONS = ["General", "Study", "Project", "Achievement", "Challenge", "Reflection"];
const MOOD_OPTIONS = ["Great", "Good", "Okay", "Tough"];

const EMPTY_ENTRY = {
  studentName: "",
  studentId: "",
  entryDate: new Date().toISOString().split("T")[0],
  content: "",
  category: "General",
  mood: "Good",
  timeSpent: 0,
  tags: "",
};

const MOOD_EMOJI = {
  Great: "🚀",
  Good: "😊",
  Okay: "🤔",
  Tough: "😤",
};

const MOTIVATIONAL_MESSAGES = {
  Great: "Amazing work! Keep this momentum going! 🌟",
  Good: "Good progress! You're on the right track! 💪",
  Okay: "You're doing okay. Every step counts! 📈",
  Tough: "Tough day? Tomorrow is a new opportunity! 💫",
};

function JournalEntryForm({ form, onChange, onSubmit, onCancel, isEditing, isSaving }) {
  return (
    <div className="form-card">
      <div className="card-title">{isEditing ? "Update Journal Entry" : "Add New Journal Entry"}</div>

      <div className="row-2">
        <div className="field-group">
          <label className="label">Your Name *</label>
          <input
            className="input"
            value={form.studentName}
            onChange={(e) => onChange("studentName", e.target.value)}
            placeholder="e.g. Alex Johnson"
          />
        </div>

        <div className="field-group">
          <label className="label">Student ID *</label>
          <input
            className="input"
            value={form.studentId}
            onChange={(e) => onChange("studentId", e.target.value)}
            placeholder="e.g. 45021"
          />
        </div>
      </div>

      <div className="row-2">
        <div className="field-group">
          <label className="label">Date</label>
          <input
            className="input"
            type="date"
            value={form.entryDate}
            onChange={(e) => onChange("entryDate", e.target.value)}
          />
        </div>

        <div className="field-group">
          <label className="label">How are you feeling? *</label>
          <select
            className="input"
            value={form.mood}
            onChange={(e) => onChange("mood", e.target.value)}
          >
            {MOOD_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {MOOD_EMOJI[option]} {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row-2">
        <div className="field-group">
          <label className="label">Category</label>
          <select
            className="input"
            value={form.category}
            onChange={(e) => onChange("category", e.target.value)}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label className="label">Time Spent (minutes)</label>
          <input
            className="input"
            type="number"
            value={form.timeSpent}
            onChange={(e) => onChange("timeSpent", Math.max(0, parseInt(e.target.value) || 0))}
            placeholder="0"
            min="0"
          />
        </div>
      </div>

      <div className="field-group">
        <label className="label">What did you accomplish today? *</label>
        <textarea
          className="input"
          style={{
            minHeight: "120px",
            fontFamily: "inherit",
            resize: "vertical",
          }}
          value={form.content}
          onChange={(e) => onChange("content", e.target.value)}
          placeholder="Write about what you did, challenges you faced, and lessons learned..."
        />
      </div>

      <div className="field-group">
        <label className="label">Tags (comma-separated)</label>
        <input
          className="input"
          value={form.tags}
          onChange={(e) => onChange("tags", e.target.value)}
          placeholder="e.g. math, coding, presentation"
        />
      </div>

      <div className="form-actions">
        {isEditing && (
          <button type="button" className="secondary-btn" onClick={onCancel}>
            Cancel Edit
          </button>
        )}

        <button type="button" className="primary-btn" onClick={onSubmit} disabled={isSaving}>
          {isSaving ? "Saving..." : isEditing ? "Update Entry" : "Add Entry"}
        </button>
      </div>
    </div>
  );
}

function JournalEntryCard({ entry, onEdit, onDelete, isDeleting }) {
  const formattedDate = new Date(entry.entryDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const tagsArray = Array.isArray(entry.tags) ? entry.tags : [];

  return (
    <div className="entry-card">
      <div className="entry-header">
        <div>
          <div className="entry-date">{formattedDate}</div>
          <div className="entry-meta">
            <span className="mood-badge">
              {MOOD_EMOJI[entry.mood]} {entry.mood}
            </span>
            <span className="category-badge">{entry.category}</span>
            {entry.timeSpent > 0 && (
              <span className="time-badge">⏱️ {entry.timeSpent} min</span>
            )}
          </div>
        </div>

        <div className="card-actions">
          <button className="secondary-btn" onClick={() => onEdit(entry)}>
            Edit
          </button>
          <button
            className="delete-btn"
            onClick={() => onDelete(entry._id)}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <div className="entry-content">{entry.content}</div>

      {tagsArray.length > 0 && (
        <div className="tags-row">
          {tagsArray.map((tag, idx) => (
            <span key={idx} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="entry-motivation">{MOTIVATIONAL_MESSAGES[entry.mood]}</div>
    </div>
  );
}

function StatisticsPanel({ entries }) {
  const stats = useMemo(() => {
    const moodCounts = { Great: 0, Good: 0, Okay: 0, Tough: 0 };
    let totalTime = 0;

    entries.forEach((entry) => {
      if (moodCounts.hasOwnProperty(entry.mood)) {
        moodCounts[entry.mood]++;
      }
      totalTime += entry.timeSpent || 0;
    });

    const bestMood = Object.entries(moodCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "Good";

    const thisWeekEntries = entries.filter((e) => {
      const entryDate = new Date(e.entryDate);
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return entryDate >= weekAgo && entryDate <= today;
    });

    const streak = calculateStreak(entries);

    return { totalEntries: entries.length, totalTime, bestMood, thisWeekEntries: thisWeekEntries.length, streak };
  }, [entries]);

  return (
    <div className="stats-panel">
      <div className="stat-card">
        <div className="stat-value">{stats.totalEntries}</div>
        <div className="stat-label">Total Entries</div>
      </div>

      <div className="stat-card">
        <div className="stat-value">{stats.thisWeekEntries}</div>
        <div className="stat-label">This Week</div>
      </div>

      <div className="stat-card">
        <div className="stat-value">{Math.floor(stats.totalTime / 60)}h {stats.totalTime % 60}min</div>
        <div className="stat-label">Total Time</div>
      </div>

      <div className="stat-card">
        <div className="stat-value">{MOOD_EMOJI[stats.bestMood]} {stats.bestMood}</div>
        <div className="stat-label">Average Mood</div>
      </div>

      <div className="stat-card">
        <div className="stat-value">{stats.streak}</div>
        <div className="stat-label">Day Streak 🔥</div>
      </div>
    </div>
  );
}

function calculateStreak(entries) {
  if (entries.length === 0) return 0;

  const sortedEntries = entries
    .map((e) => new Date(e.entryDate).toISOString().split("T")[0])
    .sort()
    .reverse();

  let streak = 1;
  const today = new Date().toISOString().split("T")[0];

  if (sortedEntries[0] !== today) {
    const todayDate = new Date();
    const lastEntryDate = new Date(sortedEntries[0]);
    const diffTime = todayDate - lastEntryDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 1) return 0;
  }

  for (let i = 1; i < sortedEntries.length; i++) {
    const currentDate = new Date(sortedEntries[i - 1]);
    const prevDate = new Date(sortedEntries[i]);
    const diffTime = currentDate - prevDate;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export default function LearningJournal() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(EMPTY_ENTRY);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [filterMood, setFilterMood] = useState("");

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  const loadEntries = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/momentum/journals");
      setEntries(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load journal entries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm(EMPTY_ENTRY);
    setEditingId(null);
  };

  const validate = () => {
    if (!form.studentName.trim() || !form.studentId.trim() || !form.content.trim()) {
      setError("Name, Student ID, and content are required.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSaving(true);
    setError("");

    const tagsArray = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    const payload = {
      studentName: form.studentName,
      studentId: form.studentId,
      entryDate: form.entryDate,
      content: form.content,
      category: form.category,
      mood: form.mood,
      timeSpent: form.timeSpent,
      tags: tagsArray,
    };

    try {
      const endpoint = isEditing
        ? `/momentum/journals/${editingId}`
        : `/momentum/journals`;

      await (isEditing ? api.put(endpoint, payload) : api.post(endpoint, payload));

      await loadEntries();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save journal entry");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry._id);
    setForm({
      studentName: entry.studentName || "",
      studentId: entry.studentId || "",
      entryDate: new Date(entry.entryDate).toISOString().split("T")[0],
      content: entry.content || "",
      category: entry.category || "General",
      mood: entry.mood || "Good",
      timeSpent: entry.timeSpent || 0,
      tags: Array.isArray(entry.tags) ? entry.tags.join(", ") : "",
    });
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry? This cannot be undone.")) {
      return;
    }

    setDeletingId(id);
    setError("");

    try {
      await api.delete(`/momentum/journals/${id}`);

      setEntries((prev) => prev.filter((entry) => entry._id !== id));
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to delete journal entry");
    } finally {
      setDeletingId("");
    }
  };

  const filteredEntries = useMemo(() => {
    let result = [...entries];

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (entry) =>
          entry.studentName.toLowerCase().includes(q) ||
          entry.studentId.toLowerCase().includes(q) ||
          entry.content.toLowerCase().includes(q) ||
          (entry.category || "").toLowerCase().includes(q),
      );
    }

    if (filterMood) {
      result = result.filter((entry) => entry.mood === filterMood);
    }

    return result.sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate));
  }, [entries, search, filterMood]);

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
        

        <div className="page" style={styles.page}>
          <div className="header" style={styles.header}>
            <h1 className="title" style={styles.title}>📚 Learning Journal</h1>
            <p className="subtitle" style={styles.subtitle}>
              Keep track of your progress and accomplishments. Document your learning journey day by day.
            </p>
          </div>
          
          <div style={styles.contentWrapper}>

          {error && <div className="error-box">{error}</div>}

          <JournalEntryForm
            form={form}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            isEditing={isEditing}
            isSaving={saving}
          />

          {entries.length > 0 && <StatisticsPanel entries={entries} />}

          <div className="filters-row">
            <input
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search entries..."
            />

            <select
              className="input"
              style={{
                padding: "10px 12px",
                fontSize: "14px",
                minWidth: "120px",
              }}
              value={filterMood}
              onChange={(e) => setFilterMood(e.target.value)}
            >
              <option value="">All Moods</option>
              {MOOD_OPTIONS.map((mood) => (
                <option key={mood} value={mood}>
                  {MOOD_EMOJI[mood]} {mood}
                </option>
              ))}
            </select>
          </div>

          <div className="list-header">
            {filteredEntries.length === 1
              ? "1 Entry"
              : `${filteredEntries.length} Entries`}
          </div>

          {loading ? (
            <div className="empty-state">Loading your journal entries...</div>
          ) : filteredEntries.length === 0 ? (
            <div className="empty-state">
              {entries.length === 0
                ? "Start your journey! Add your first entry above. 📝"
                : "No entries match your filters."}
            </div>
          ) : (
            <div className="list">
              {filteredEntries.map((entry) => (
                <JournalEntryCard
                  key={entry._id}
                  entry={entry}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isDeleting={deletingId === entry._id}
                />
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    flex: 1,
    minWidth: 0,
    width: "100%",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  contentWrapper: {
    padding: "0 24px 34px",
    width: "100%",
    boxSizing: "border-box",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    background: `linear-gradient(120deg, rgba(17,82,212,0.85) 0%, rgba(14,62,168,0.95) 100%), url('/journal_banner.png')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: "0 0 20px 20px",
    padding: "28px 32px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    color: "#fff",
    width: "100%",
    boxSizing: "border-box",
    marginBottom: 24,
  },
  title: {
    margin: "0 0 8px",
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: "-0.4px",
    color: "#fff",
  },
  subtitle: {
    margin: 0,
    fontSize: 13.5,
    opacity: 0.82,
    color: "#fff",
  },
  errorBox: {
    marginBottom: 16,
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    borderRadius: 10,
    padding: "12px 16px",
    fontSize: 13,
  },
  formCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 20,
    marginBottom: 24,
    boxShadow: "0 6px 16px rgba(16, 24, 40, 0.05)",
  },
  cardTitle: {
    fontWeight: 700,
    color: "#0f172a",
    fontSize: 19,
    marginBottom: 16,
  },
  row2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: "#334155",
    fontWeight: 700,
  },
  input: {
    border: "1px solid #d1d5db",
    borderRadius: 9,
    padding: "10px 12px",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
    background: "#fff",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 6,
  },
  primaryBtn: {
    border: "none",
    borderRadius: 8,
    background: PRIMARY,
    color: "#fff",
    padding: "11px 18px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14,
  },
  secondaryBtn: {
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    background: "#fff",
    color: "#334155",
    padding: "11px 18px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
  },
  deleteBtn: {
    border: "1px solid #fecaca",
    borderRadius: 8,
    background: "#fff1f2",
    color: "#b91c1c",
    padding: "9px 12px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 13,
  },
  statsPanel: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  statValue: {
    fontSize: 24,
    fontWeight: 800,
    color: PRIMARY,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: 600,
  },
  filtersRow: {
    display: "flex",
    gap: 10,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  searchInput: {
    flex: 1,
    minWidth: "200px",
    border: "1px solid #d1d5db",
    borderRadius: 9,
    padding: "10px 12px",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
    background: "#fff",
    boxSizing: "border-box",
  },
  listHeader: {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 12,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  entryCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 18,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  entryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  entryDate: {
    fontSize: 16,
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: 6,
  },
  entryMeta: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  moodBadge: {
    padding: "4px 10px",
    background: "#fef3c7",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    color: "#92400e",
  },
  categoryBadge: {
    padding: "4px 10px",
    background: "#e0ecff",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    color: "#1e3a8a",
  },
  timeBadge: {
    padding: "4px 10px",
    background: "#dbeafe",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    color: "#0c4a6e",
  },
  cardActions: {
    display: "flex",
    gap: 8,
    flexShrink: 0,
  },
  entryContent: {
    lineHeight: 1.6,
    color: "#475569",
    marginBottom: 12,
    fontSize: 14,
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
  },
  tagsRow: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  tag: {
    padding: "3px 8px",
    background: "#f0f9ff",
    borderRadius: 16,
    fontSize: 11,
    color: "#0369a1",
    fontWeight: 600,
  },
  entryMotivation: {
    fontSize: 12,
    fontStyle: "italic",
    color: PRIMARY,
    paddingTop: 10,
    borderTop: "1px solid #f0f0f0",
    fontWeight: 600,
  },
  emptyState: {
    background: "#fff",
    border: "1px dashed #cbd5e1",
    borderRadius: 10,
    padding: "32px 18px",
    textAlign: "center",
    color: "#64748b",
    fontSize: 15,
  },
};
