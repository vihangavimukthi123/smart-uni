import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  MdEdit, MdDelete, MdAdd, MdSearch, MdHistory, 
  MdOutlineEmojiEmotions, MdClose, MdArrowBack 
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api/axios";
import "./learningJournal.css";

const CATEGORIES = ["Lecture", "Self-Study", "Assignment", "Research", "Review", "Lab"];
const MOODS = [
  { label: "Focused", icon: "🧠" },
  { label: "Struggling", icon: "😫" },
  { label: "Proud", icon: "🌟" },
  { label: "Curious", icon: "🧐" },
  { label: "Exhausted", icon: "😴" },
];

export default function LearningJournal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "Self-Study",
    mood: "Focused",
    content: "",
    tags: ""
  });

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/momentum/learning-journal");
      setEntries(res.data.data || []);
    } catch (err) {
      console.error("Journal load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const filteredEntries = useMemo(() => {
    return entries.filter(e => 
      e.content.toLowerCase().includes(search.toLowerCase()) || 
      e.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [entries, search]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await api.put(`/momentum/learning-journal/${editingId}`, formData);
        setEntries(prev => prev.map(ent => ent._id === editingId ? res.data.data : ent));
      } else {
        const res = await api.post("/momentum/learning-journal", formData);
        setEntries(prev => [res.data.data, ...prev]);
      }
      setIsFormOpen(false);
      setEditingId(null);
      setFormData({ date: new Date().toISOString().split("T")[0], category: "Self-Study", mood: "Focused", content: "", tags: "" });
    } catch (err) {
      alert("Save failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await api.delete(`/momentum/learning-journal/${id}`);
      setEntries(prev => prev.filter(e => e._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry._id);
    setFormData({
      date: entry.date.split("T")[0],
      category: entry.category,
      mood: entry.mood,
      content: entry.content,
      tags: entry.tags ? entry.tags.join(", ") : ""
    });
    setIsFormOpen(true);
  };

  return (
    <div className="lj-page">
      {/* Hero */}
      <div className="lj-hero">
        <div>
          <button onClick={() => navigate('/momentum')} className="st-icon-btn" style={{ marginBottom: 12, border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
            <MdArrowBack />
          </button>
          <h1 className="lj-hero-title">Reflect & Grow, {user?.name?.split(' ')[0]} ✍️</h1>
          <p className="lj-hero-sub">The secret to mastery is reflection. Document your academic evolution.</p>
        </div>
        <div className="lj-hero-icon" style={{ fontSize: '4rem', opacity: 0.2 }}>📓</div>
      </div>

      <div className="lj-content">
        {/* Stats Row */}
        <div className="lj-stats">
          <div className="lj-stat-card">
            <div className="lj-stat-val">{entries.length}</div>
            <div className="lj-stat-lab">Total Entries</div>
          </div>
          <div className="lj-stat-card">
            <div className="lj-stat-val">{new Set(entries.map(e => e.category)).size}</div>
            <div className="lj-stat-lab">Topics Tracked</div>
          </div>
          <div className="lj-stat-card">
            <div className="lj-stat-val">{entries.filter(e => e.mood === 'Proud').length}</div>
            <div className="lj-stat-lab">Peak Moments</div>
          </div>
        </div>

        {/* Action Bar */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div className="st-search-wrap" style={{ flex: 1, maxWidth: 400 }}>
            <MdSearch s={18} color="var(--text-muted)" />
            <input className="st-search-input" placeholder="Search your reflections..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
             <MdAdd /> Create New Entry
          </button>
        </div>

        {/* Entry Form (Conditional) */}
        {isFormOpen && (
          <div className="lj-card anim-slideUp">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 className="lj-label" style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{editingId ? 'Refine Reflection' : 'New Journal Entry'}</h3>
              <button className="st-icon-btn" onClick={() => { setIsFormOpen(false); setEditingId(null); }}><MdClose /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="row-2">
                <div className="lj-field-group">
                  <label className="lj-label">Date of Entry</label>
                  <input type="date" className="lj-input" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                </div>
                <div className="lj-field-group">
                  <label className="lj-label">Category</label>
                  <select className="lj-input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="lj-field-group">
                <label className="lj-label">How did this session feel?</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {MOODS.map(m => (
                    <button
                      key={m.label} type="button"
                      className={`btn ${formData.mood === m.label ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setFormData({ ...formData, mood: m.label })}
                    >
                      {m.icon} {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lj-field-group">
                <label className="lj-label">Reflection Content</label>
                <textarea className="lj-textarea" rows={5} required placeholder="What did you learn? What was hard? How will you tackle it next time?" value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} />
              </div>

              <div className="lj-field-group">
                <label className="lj-label">Tags (Optional)</label>
                <input className="lj-input" placeholder="e.g. Mathematics, Calculus, Week 3" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setIsFormOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Apply Update' : 'Seal Entry'}</button>
              </div>
            </form>
          </div>
        )}

        {/* Entries List */}
        <div className="lj-list">
          {loading ? (
            <div className="lj-empty">Syncing journal with database...</div>
          ) : filteredEntries.length === 0 ? (
            <div className="lj-empty">
              <h3>No journal entries yet.</h3>
              <p>Your future self will thank you for documenting your journey today.</p>
            </div>
          ) : (
            filteredEntries.map(entry => (
              <div key={entry._id} className="lj-entry">
                <div className="lj-entry-header">
                  <div>
                    <div className="lj-entry-date">{new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <div className="lj-entry-meta">
                      <span className="lj-badge lj-badge-mood">{MOODS.find(m => m.label === entry.mood)?.icon} {entry.mood}</span>
                      <span className="lj-badge lj-badge-cat">{entry.category}</span>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button className="st-icon-btn" onClick={() => handleEdit(entry)}><MdEdit /></button>
                    <button className="st-icon-btn" onClick={() => handleDelete(entry._id)}><MdDelete /></button>
                  </div>
                </div>
                <div className="lj-entry-body">{entry.content}</div>
                {entry.tags && entry.tags.length > 0 && (
                  <div className="tags-row" style={{ marginTop: 12 }}>
                    {entry.tags.map(t => <span key={t} className="tag">#{t}</span>)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
