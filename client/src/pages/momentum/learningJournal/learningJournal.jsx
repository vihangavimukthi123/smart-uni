import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  MdEdit, MdDelete, MdAdd, MdSearch, MdHistory, 
  MdOutlineEmojiEmotions, MdClose, MdArrowBack 
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api/axios";
import "./learningJournal.css";
import journalImg from "../../../assets/learning_journal_hero.png";

const MOODS = [
  { label: "Focused", icon: "🧠" },
  { label: "Struggling", icon: "😫" },
  { label: "Proud", icon: "🌟" },
  { label: "Curious", icon: "🧐" },
  { label: "Exhausted", icon: "😴" },
  { label: "Other", icon: "✨" },
];

export default function LearningJournal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedMood, setSelectedMood] = useState("All");
  const [viewingEntry, setViewingEntry] = useState(null);

  const [formData, setFormData] = useState({
    entryDate: new Date().toISOString().split("T")[0],
    category: "", // Topic
    mood: "Focused",
    content: "",
    tags: "",
    studentName: user?.name,
    studentId: user?.studentId || user?.email,
    userId: user?._id
  });

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/momentum/journals");
      setEntries(res.data.data || []);
    } catch (err) {
      console.error("Journal load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const matchesSearch = e.content.toLowerCase().includes(search.toLowerCase()) || 
                           (e.tags && e.tags.some(t => t.toLowerCase().includes(search.toLowerCase().replace("#", ""))));
      const matchesMood = selectedMood === "All" || e.mood === selectedMood;
      return matchesSearch && matchesMood;
    });
  }, [entries, search, selectedMood]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      const payload = { 
          ...formData, 
          tags: typeof formData.tags === 'string' ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : formData.tags,
          studentName: user?.name,
          studentId: user?.studentId || user?.email || "Unknown",
          userId: user?._id
      };
      if (editingId) {
        const res = await api.put(`/momentum/journals/${editingId}`, payload);
        setEntries(prev => prev.map(ent => ent._id === editingId ? res.data.data : ent));
      } else {
        const res = await api.post("/momentum/journals", payload);
        setEntries(prev => [res.data.data, ...prev]);
      }
      closeDiary();
    } catch (err) {
      alert("Save failed: " + (err.response?.data?.message || err.message));
    }
  };

  const closeDiary = () => {
    setIsFormOpen(false);
    setViewingEntry(null);
    setEditingId(null);
    setFormData({ entryDate: new Date().toISOString().split("T")[0], category: "", mood: "Focused", content: "", tags: "", studentName: user?.name, studentId: user?.studentId || user?.email, userId: user?._id });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await api.delete(`/momentum/journals/${id}`);
      setEntries(prev => prev.filter(e => e._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry._id);
    setFormData({
      entryDate: entry.entryDate ? entry.entryDate.split("T")[0] : "",
      category: entry.category,
      mood: entry.mood,
      content: entry.content,
      tags: entry.tags ? entry.tags.join(", ") : "",
      studentName: entry.studentName,
      studentId: entry.studentId,
      userId: entry.userId
    });
    setViewingEntry(entry);
    setIsFormOpen(true);
  };

  return (
    <div className="lj-page">
      {/* Smart Banner Style */}
      <div className="dm-banner">
        <div className="dm-banner-circle-1" />
        <div className="dm-banner-circle-2" />
        
        <div className="dm-banner-left">
          <h1 className="dm-banner-title">Learning Journal</h1>
          <p className="dm-banner-subtitle" style={{ color: '#fff', opacity: 1 }}>
            Reflect & Grow, <span style={{ fontWeight: 800, textDecoration: 'underline' }}>{user?.name?.split(' ')[0]}</span>! 
            The secret to mastery is reflection. Document your academic evolution and track your journey.
          </p>
        </div>

        <div className="dm-banner-right">
          <div className="dm-banner-img-frame">
            <img src={journalImg} alt="Student with journal" className="dm-banner-img" />
          </div>
        </div>
      </div>

      <div className="lj-content">

        {/* Action Bar */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div className="st-search-wrap" style={{ flex: 1, maxWidth: 400 }}>
            <MdSearch s={18} color="var(--text-muted)" />
            <input className="st-search-input" placeholder="Search your reflections..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <button className="lj-btn-primary" onClick={() => setIsFormOpen(true)}>
              <MdAdd /> Start New Entry
            </button>
          </div>
        </div>

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
              <div key={entry._id} className="lj-entry" onClick={() => setViewingEntry(entry)} style={{ cursor: 'pointer', padding: '20px 30px' }}>
                <div className="lj-entry-header" style={{ marginBottom: 0, alignItems: 'center' }}>
                  <div>
                    <div className="lj-entry-date" style={{ fontSize: '0.9rem', color: '#64748b' }}>
                      {entry.entryDate ? new Date(entry.entryDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "No Date"}
                    </div>
                    <div className="lj-entry-topic" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginTop: 4 }}>
                      Topic: {entry.category}
                    </div>
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="lj-entry-tags-row" style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                        {entry.tags.map(t => (
                          <span key={t} style={{ fontSize: '0.8rem', color: '#1152d4', fontWeight: 600 }}>
                            #{t.replace(/^#/, '')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="card-actions" style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                    <button className="st-icon-btn" style={{ padding: 6 }} onClick={() => handleEdit(entry)}><MdEdit size={16} /></button>
                    <button className="st-icon-btn" style={{ padding: 6 }} onClick={() => handleDelete(entry._id)}><MdDelete size={16} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Unified Diary Modal */}
      {(viewingEntry || isFormOpen) && (
        <div className="lj-modal-overlay" onClick={closeDiary}>
          <div className="lj-diary-modal" onClick={e => e.stopPropagation()}>
            <div className="lj-diary-header">
               <div style={{ flex: 1 }}>
                  {isFormOpen ? (
                      <div style={{ display: 'flex', gap: 16 }}>
                          <div style={{ flex: 1 }}>
                            <label className="lj-diary-label">Topic</label>
                            <input 
                              className="lj-diary-input-minimal" 
                              value={formData.category} 
                              onChange={e => setFormData({...formData, category: e.target.value})} 
                              placeholder="What's this entry about?"
                            />
                          </div>
                          <div>
                            <label className="lj-diary-label">Date</label>
                            <input 
                              type="date" 
                              className="lj-diary-input-minimal" 
                              value={formData.entryDate} 
                              onChange={e => setFormData({...formData, entryDate: e.target.value})} 
                            />
                          </div>
                      </div>
                  ) : (
                      <>
                        <h3 className="lj-diary-title">{viewingEntry.category || "Untitled Topic"}</h3>
                        <div className="lj-diary-date">{new Date(viewingEntry.entryDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      </>
                  )}
               </div>
               <button className="lj-close-btn" onClick={closeDiary}><MdClose /></button>
            </div>
            
            <div className="lj-diary-paper">
                <div className="lj-diary-margin"></div>
                {isFormOpen ? (
                    <textarea 
                        className="lj-diary-textarea"
                        value={formData.content}
                        onChange={e => setFormData({...formData, content: e.target.value})}
                        placeholder="Start writing your thoughts here..."
                    />
                ) : (
                    <div className="lj-diary-content">{viewingEntry.content}</div>
                )}
            </div>

            <div className="lj-diary-footer">
                {isFormOpen ? (
                    <div style={{ width: '100%' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 16 }}>
                            <div>
                                <label className="lj-diary-labelSmall">Mood</label>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                                    {MOODS.map(m => (
                                        <button 
                                            key={m.label} 
                                            className={`lj-mood-chip ${formData.mood === m.label ? "active" : ""}`}
                                            onClick={() => setFormData({...formData, mood: m.label})}
                                        >
                                            {m.icon} {m.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="lj-diary-labelSmall">Tags (#)</label>
                                <input 
                                    className="lj-diary-input-minimal" 
                                    value={formData.tags} 
                                    onChange={e => setFormData({...formData, tags: e.target.value})} 
                                    placeholder="e.g. #exam, #study"
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <button className="lj-btn-secondary" onClick={closeDiary}>Cancel</button>
                            <button className="lj-btn-primary" onClick={() => handleSave()}>
                                {editingId ? "Save Changes" : "Save Entry"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                           <div className="lj-diary-mood">Mood: {MOODS.find(m => m.label === viewingEntry.mood)?.icon} {viewingEntry.mood}</div>
                           <div className="lj-diary-tags">
                               {viewingEntry.tags?.map(t => <span key={t} className="lj-diary-tag">#{t}</span>)}
                           </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button className="lj-diary-action-btn edit" onClick={() => handleEdit(viewingEntry)}>
                              <MdEdit size={16} /> Edit
                            </button>
                            <button className="lj-diary-action-btn delete" onClick={() => { handleDelete(viewingEntry._id); setViewingEntry(null); }}>
                              <MdDelete size={16} /> Delete
                            </button>
                        </div>
                    </>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
