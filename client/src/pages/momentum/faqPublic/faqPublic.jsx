import { useEffect, useMemo, useState, useCallback } from "react";
import { MdSearch, MdHelpOutline, MdAdd, MdClose, MdHistory, MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../../context/NotificationContext";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api/axios";
import "./faqPublic.css";

import faqIllustration from "../../../assets/faq_illustration.png";

// ─── FaqItem Component ───────────────────────────────────────────────────────
function FaqItem({ item, expanded, onToggle, isPending, onEdit, onDelete }) {
  return (
    <div className={`faq-item ${expanded ? 'faq-item--active' : ''} ${isPending ? 'faq-pending-item' : ''}`}>
      <button className="faq-question-btn" onClick={onToggle}>
        <div style={{ flex: 1 }}>
          <span className="faq-question-text">{item.question}</span>
          {isPending && (
            <div className="faq-status-container" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status:</span>
                  <span className="faq-status-pill status-pending">
                    <span className="status-dot-pulse"></span>
                    Under Review
                  </span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Step:</span>
                  <div className="status-steps">
                    <span className="step-node active" title="Received">1</span>
                    <span className="step-line active"></span>
                    <span className="step-node active" title="Analysis">2</span>
                    <span className="step-line"></span>
                    <span className="step-node" title="Final Review">3</span>
                  </div>
               </div>
            </div>
          )}
        </div>
        <span className="faq-chevron">{expanded ? "−" : "+"}</span>
      </button>
      {expanded && (
        <div className="faq-answer anim-fadeIn">
          {isPending ? (
             <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
               <div className="faq-info-card">
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>📋 Academic Analysis Phase</div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Our subject matter experts are currently analyzing your inquiry to provide the most accurate and helpful response. You will be notified once published.</p>
               </div>
               <div style={{ display: 'flex', gap: 12 }}>
                 <button className="dm-hack-btn" style={{ width: 'auto', padding: '8px 20px', background: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0' }} onClick={() => onEdit(item)}>Revise Inquiry</button>
                 <button className="dm-hack-btn" style={{ width: 'auto', padding: '8px 20px', background: '#fff1f2', color: '#e11d48' }} onClick={() => onDelete(item._id)}>Rescind</button>
               </div>
             </div>
          ) : (
            item.answer
          )}
        </div>
      )}
    </div>
  );
}

// ─── FAQPublic Page ──────────────────────────────────────────────────────────
export default function FAQPublic() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotifications() || {};

  const [activeTab, setActiveTab] = useState("public"); // "public" or "personal"
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
      const res = await api.get("/momentum/faqs/public");
      setFaqs(res.data.data || []);

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
      setActiveTab("personal");
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

  const filteredPending = useMemo(() => {
    return pendingFaqs.filter(f => {
      const textMatch = !search.trim() || f.question.toLowerCase().includes(search.toLowerCase());
      return textMatch;
    });
  }, [pendingFaqs, search]);

  return (
    <div className="faq-page">
      {/* Visual Banner */}
      <div className="faq-banner">
        <div className="faq-banner-left">
          <h1 className="faq-banner-title">FAQ</h1>
          <p className="faq-banner-subtitle">
            Find answers to common questions about your academic roadmap, 
            study strategies, and platform features.
          </p>
        </div>
        
        <div className="faq-banner-right">
          <img src={faqIllustration} alt="FAQ Illustration" className="faq-banner-img" />
          <div className="faq-shape faq-shape-1">+</div>
          <div className="faq-shape faq-shape-2">●</div>
          <div className="faq-shape faq-shape-3">✦</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="faq-tabs">
        <button 
          className={`faq-tab-btn ${activeTab === 'public' ? 'active' : ''}`}
          onClick={() => setActiveTab('public')}
        >
          FAQs
        </button>
        <button 
          className={`faq-tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          My Questions {pendingFaqs.length > 0 && `(${pendingFaqs.length})`}
        </button>
      </div>

      <div className="faq-container">
        {/* Unified Tools */}
        <div className="faq-search-container">
          <div className="faq-search-bar">
            <MdSearch size={22} color="#94a3b8" />
            <input 
              className="faq-search-input" 
              placeholder={activeTab === 'public' ? "Search for answers..." : "Search your inquiries..."} 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>

          {activeTab === 'public' && (
            <div className="faq-categories">
              {categories.map(c => (
                <button 
                  key={c} 
                  className={`faq-cat-chip ${activeCategory === c ? 'active' : ''}`}
                  onClick={() => setActiveCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && <div className="error-box" style={{ marginBottom: 20 }}>{error}</div>}

        {/* Content Lists */}
        <div className="faq-list">
          {loading ? (
            <div className="empty">Syncing Knowledge Base...</div>
          ) : (
            <>
              {activeTab === 'public' ? (
                filteredFaqs.length === 0 ? (
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
                )
              ) : (
                filteredPending.length === 0 ? (
                  <div className="empty">
                    <h3>No pending inquiries.</h3>
                    <p>Asked a question? Your pending tickets will appear here.</p>
                  </div>
                ) : (
                  filteredPending.map(item => (
                    <FaqItem 
                      key={item._id} 
                      item={item} 
                      isPending={true}
                      expanded={openId === item._id} 
                      onToggle={() => setOpenId(prev => prev === item._id ? "" : item._id)}
                      onEdit={handleEditClick}
                      onDelete={handleDeletePending}
                    />
                  ))
                )
              )}
            </>
          )}
        </div>
      </div>

      {/* Ask Button FAB */}
      <button className="faq-ask-fab" onClick={() => setShowAskForm(true)}>
        <MdHelpOutline size={22} /> Ask a Question
      </button>

      {/* Modal Form */}
      {showAskForm && (
        <div className="faq-modal-overlay" onClick={closeModal}>
          <form className="faq-modal anim-slideUp" onClick={e => e.stopPropagation()} onSubmit={handleAskSubmit}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#1e293b' }}>
                  {editId ? 'Revise Inquiry' : 'New Academic Inquiry'}
                </h3>
                <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>We'll provide an answer as soon as possible.</p>
              </div>
              <button type="button" className="faq-banner-back" style={{ marginBottom: 0 }} onClick={closeModal}><MdClose size={20} /></button>
            </div>

            <div className="lj-field-group">
              <label className="lj-label">Your Question</label>
              <textarea 
                className="lj-textarea" 
                required 
                rows={4} 
                style={{ borderRadius: '16px', background: '#f8fafc' }}
                value={formData.question} 
                onChange={e => setFormData({ ...formData, question: e.target.value })} 
                placeholder="Be as specific as possible..." 
              />
            </div>

            <div className="lj-field-group">
              <label className="lj-label">Category</label>
              <select 
                className="lj-input" 
                style={{ borderRadius: '12px', background: '#f8fafc' }}
                value={formData.category} 
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                {["General", "Study Tracker", "Workplan", "Academic Vault", "Account", "Technical Support"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button type="button" className="faq-tab-btn" onClick={closeModal}>Discard</button>
              <button type="submit" className="dm-hack-btn" style={{ width: 'auto', padding: '14px 40px', background: '#6366f1', color: 'white' }} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Send Inquiry'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
