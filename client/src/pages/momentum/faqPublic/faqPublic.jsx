import { useEffect, useMemo, useState, useCallback } from "react";
import { MdSearch, MdHelpOutline, MdAdd, MdClose, MdHistory, MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../../context/NotificationContext";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api/axios";
import "./faqPublic.css";

// ─── FaqItem Component ───────────────────────────────────────────────────────
function FaqItem({ item, expanded, onToggle }) {
  return (
    <div className={`faq-item ${expanded ? 'faq-item--active' : ''}`}>
      <button className="faq-question-btn" onClick={onToggle}>
        <span className="faq-question-text">{item.question}</span>
        <span className="faq-chevron">{expanded ? "−" : "+"}</span>
      </button>
      {expanded && <div className="faq-answer anim-fadeIn">{item.answer}</div>}
    </div>
  );
}

// ─── FAQPublic Page ──────────────────────────────────────────────────────────
export default function FAQPublic() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotifications() || {};

  const [faqs, setFaqs] = useState([]);
  const [pendingFaqs, setPendingFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [openId, setOpenId] = useState("");
  
  const [showAskForm, setShowAskForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ question: "", category: "General" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Answered FAQs
      const res = await api.get("/momentum/faqs/public");
      setFaqs(res.data.data || []);

      // 2. Personal Pending Questions
      const pendingIds = JSON.parse(localStorage.getItem("my_pending_faqs") || "[]");
      if (pendingIds.length > 0) {
        const pRes = await api.post("/momentum/faqs/my-pending", { ids: pendingIds });
        const pData = pRes.data.data || [];
        setPendingFaqs(pData.filter(f => !f.isPublished));
        
        const aliveIds = pData.filter(f => !f.isPublished).map(f => f._id);
        localStorage.setItem("my_pending_faqs", JSON.stringify(aliveIds));
      }
    } catch (err) {
      setError("Unable to sync with Academic FAQ Knowledge Base.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAskSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question.trim()) return;
    setIsSubmitting(true);
    try {
      if (editId) {
        await api.put(`/momentum/faqs/${editId}`, formData);
        setPendingFaqs(prev => prev.map(f => f._id === editId ? { ...f, ...formData } : f));
      } else {
        const res = await api.post("/momentum/faqs", { 
            ...formData, 
            isPublished: false, 
            submittedByUser: true,
            userId: user?._id
        });
        const created = res.data.data;
        if (created?._id) {
          const ids = JSON.parse(localStorage.getItem("my_pending_faqs") || "[]");
          ids.push(created._id);
          localStorage.setItem("my_pending_faqs", JSON.stringify(ids));
          setPendingFaqs(prev => [created, ...prev]);
        }
      }
      addNotification?.(editId ? "Question Revised" : "Question Received", "An admin will review your inquiry shortly.", "success");
      closeModal();
    } catch (err) {
      alert("Submission error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePending = async (id) => {
    if (!window.confirm("Rescind this question?")) return;
    try {
      await api.delete(`/momentum/faqs/${id}`);
      setPendingFaqs(prev => prev.filter(f => f._id !== id));
      const ids = JSON.parse(localStorage.getItem("my_pending_faqs") || "[]");
      localStorage.setItem("my_pending_faqs", JSON.stringify(ids.filter(pid => pid !== id)));
    } catch (err) { alert("Delete failed"); }
  };

  const handleEditClick = (item) => {
    setEditId(item._id);
    setFormData({ question: item.question, category: item.category || "General" });
    setShowAskForm(true);
  };

  const closeModal = () => {
    setShowAskForm(false);
    setEditId(null);
    setFormData({ question: "", category: "General" });
  };

  const categories = useMemo(() => ["All", ...new Set(faqs.map(f => f.category || "General"))], [faqs]);
  const filteredFaqs = useMemo(() => {
    return faqs.filter(f => {
      const catMatch = activeCategory === "All" || (f.category || "General") === activeCategory;
      const textMatch = !search.trim() || f.question.toLowerCase().includes(search.toLowerCase()) || f.answer?.toLowerCase().includes(search.toLowerCase());
      return catMatch && textMatch;
    });
  }, [faqs, activeCategory, search]);

  return (
    <div className="faq-page">
      {/* Hero */}
      <div className="faq-hero">
        <button onClick={() => navigate('/momentum')} className="st-icon-btn" style={{ marginBottom: 12, border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
          <MdArrowBack />
        </button>
        <h1 className="faq-hero-title">Academic Knowledge Base 📚</h1>
        <p className="faq-hero-sub">Resolve your doubts instantly. If not here, ask us directly.</p>
      </div>

      <div className="faq-content">
        {/* Tools */}
        <div className="faq-tools">
          <div className="st-search-wrap" style={{ flex: 1 }}>
            <MdSearch size={18} color="var(--text-muted)" />
            <input className="st-search-input" placeholder="Search for answers..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="faq-category" value={activeCategory} onChange={e => setActiveCategory(e.target.value)}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {error && <div className="error-box">{error}</div>}

        {/* Pending Section */}
        {pendingFaqs.length > 0 && activeCategory === "All" && !search && (
          <div className="faq-pending-section anim-slideDown">
            <h2 className="faq-pending-title"><MdHistory /> My Pending Inquiries</h2>
            <div className="faq-list">
              {pendingFaqs.map(item => (
                <div key={item._id} className="faq-item" style={{ borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="faq-question-text">{item.question}</div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>Waiting for response</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>{item.category}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleEditClick(item)}>Edit</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--rose)' }} onClick={() => handleDeletePending(item._id)}>Cancel</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main FAQ List */}
        <div className="faq-list">
          {loading ? (
            <div className="empty">Updating Knowledge Base...</div>
          ) : filteredFaqs.length === 0 ? (
            <div className="empty">No entries found matching your criteria.</div>
          ) : (
            filteredFaqs.map(item => (
              <FaqItem 
                key={item._id} 
                item={item} 
                expanded={openId === item._id} 
                onToggle={() => setOpenId(prev => prev === item._id ? "" : item._id)} 
              />
            ))
          )}
        </div>
      </div>

      {/* Floating Ask Button */}
      <button className="faq-ask-btn" onClick={() => setShowAskForm(true)}>
        <MdHelpOutline size={20} /> Ask a Question
      </button>

      {/* Modal */}
      {showAskForm && (
        <div className="faq-modal-overlay">
          <form className="faq-modal anim-slideUp" onSubmit={handleAskSubmit}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h3 className="lj-label" style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{editId ? 'Revise Inquiry' : 'New Academic Inquiry'}</h3>
                <p className="faq-hero-sub" style={{ color: 'var(--text-muted)' }}>We'll provide an answer as soon as possible.</p>
              </div>
              <button type="button" className="st-icon-btn" onClick={closeModal}><MdClose /></button>
            </div>

            <div className="lj-field-group">
              <label className="lj-label">Your Question</label>
              <textarea className="lj-textarea" required rows={4} value={formData.question} onChange={e => setFormData({ ...formData, question: e.target.value })} placeholder="Be as specific as possible..." />
            </div>

            <div className="lj-field-group">
              <label className="lj-label">Category</label>
              <select className="lj-input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                {["General", "Study Tracker", "Workplan", "Academic Vault", "Account", "Technical Support"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
              <button type="button" className="btn btn-secondary" onClick={closeModal}>Discard</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Syncing...' : 'Submit Inquiry'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
