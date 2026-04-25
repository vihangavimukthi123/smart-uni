import { useEffect, useMemo, useState } from "react";

import Sidebar from "../sidebar/sidebar";
import { useNotifications } from "../../../context/NotificationContext";
import api from "../../../api/axios";

import "./faqPublic.css";



function FaqItem({ item, expanded, onToggle }) {
  return (
    <div className="faq-item">
      <button className="question-btn" onClick={onToggle}>
        <span className="question-text">{item.question}</span>
        <span className="chevron">{expanded ? "−" : "+"}</span>
      </button>

      {expanded && <div className="answer">{item.answer}</div>}
    </div>
  );
}

export default function FAQPublic() {
  const { addNotification } = useNotifications() || {};

  const [faqs, setFaqs] = useState([]);
  const [pendingFaqs, setPendingFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [openId, setOpenId] = useState("");
  const [showAskForm, setShowAskForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [askCategory, setAskCategory] = useState("General");
  const [askStatus, setAskStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const loadFaqs = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/momentum/faqs/public");
        const publishedData = Array.isArray(response.data.data) ? response.data.data : [];
        setFaqs(publishedData);

        const pendingIds = JSON.parse(localStorage.getItem("my_pending_faqs") || "[]");
        if (pendingIds.length > 0) {
          const pendingRes = await api.post("/momentum/faqs/my-pending", { ids: pendingIds });
          const temp = pendingRes.data;
          const pendingData = Array.isArray(temp.data) ? temp.data : [];
          setPendingFaqs(pendingData);
          
          const activePendingIds = pendingData.map(f => f._id);
          localStorage.setItem("my_pending_faqs", JSON.stringify(activePendingIds));
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load FAQs");
      } finally {
        setLoading(false);
      }
    };

    loadFaqs();
  }, []);

  const handleAskSubmit = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) {
      setAskStatus("Please enter a question.");
      return;
    }
    
    setIsSubmitting(true);
    setAskStatus("");
    try {
      if (editId) {
        await api.put(`/momentum/faqs/${editId}`, {
          question: newQuestion,
          category: askCategory,
          isPublished: false,
        });

        setPendingFaqs(prev => prev.map(f => f._id === editId ? ({ ...f, question: newQuestion, category: askCategory }) : f));
        setAskStatus("Question updated successfully!");
        if (addNotification) addNotification("Question Updated", "Your pending question was updated.", "success");
      } else {
        const response = await api.post(`/momentum/faqs`, {
          question: newQuestion,
          answer: "",
          category: askCategory,
          isPublished: false,
        });

        const payload = response.data;
        if (payload.data && payload.data._id) {
          const existingIds = JSON.parse(localStorage.getItem("my_pending_faqs") || "[]");
          existingIds.push(payload.data._id);
          localStorage.setItem("my_pending_faqs", JSON.stringify(existingIds));
          setPendingFaqs(prev => [payload.data, ...prev]);
        }

        setAskStatus("Your question has been submitted successfully!");
        if (addNotification) {
          addNotification("Question Submitted", "An admin will review and answer your question shortly.", "success");
        }
      }

      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (err) {
      setAskStatus(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowAskForm(false);
    setAskStatus("");
    setEditId(null);
    setNewQuestion("");
    setAskCategory("General");
  };

  const handleEditClick = (item) => {
    setEditId(item._id);
    setNewQuestion(item.question);
    setAskCategory(item.category || "General");
    setShowAskForm(true);
    setAskStatus("");
  };

  const handleDeletePending = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pending question?")) return;
    try {
      await api.delete(`/momentum/faqs/${id}`);
      
      setPendingFaqs(prev => prev.filter(f => f._id !== id));
      
      const pendingIds = JSON.parse(localStorage.getItem("my_pending_faqs") || "[]");
      const updatedIds = pendingIds.filter(pid => pid !== id);
      localStorage.setItem("my_pending_faqs", JSON.stringify(updatedIds));
      
      if (addNotification) addNotification("Question Deleted", "Your pending question was removed.", "success");
    } catch(err) {
      alert("Error deleting question: " + err.message);
    }
  };

  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      faqs.map((faq) => faq.category || "General"),
    );
    return ["All", ...Array.from(uniqueCategories)];
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const categoryMatch =
        activeCategory === "All" || (faq.category || "General") === activeCategory;
      const searchText = search.trim().toLowerCase();
      const searchMatch =
        !searchText ||
        faq.question.toLowerCase().includes(searchText) ||
        faq.answer.toLowerCase().includes(searchText);

      return categoryMatch && searchMatch;
    });
  }, [faqs, activeCategory, search]);

  return (
    <div className="app-container">
      <div className="app-layout">
        

        <div className="public-page">
          <div className="hero">
            <h1 className="hero-title">Frequently Asked Questions</h1>
            <p className="hero-sub">
              Find quick answers about planning, tracking, and using Momentum effectively.
            </p>
          </div>

          <div className="content-wrapper">

          <div className="tools-row">
            <input
              className="search-input"
              placeholder="Search FAQs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="category-select"
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="error-box">{error}</div>}

          {loading ? (
            <div className="empty">Loading FAQs...</div>
          ) : (
            <>
              {pendingFaqs.length > 0 && activeCategory === "All" && !search && (
                <div className="pending-section">
                  <h2 className="pending-title">My Pending Questions</h2>
                  <div className="faq-list">
                    {pendingFaqs.map((item) => (
                      <div key={item._id} className="faq-item pending-faq-item">
                        <div className="pending-faq-content">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div className="question-text pending-question-text">{item.question}</div>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span className="pending-status-badge">Status: Pending Answer</span>
                                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>•</span>
                                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{item.category || "General"}</span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', paddingLeft: '16px' }}>
                              <button 
                                style={{ border: 'none', background: '#eef2ff', color: '#4f46e5', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                                onClick={() => handleEditClick(item)}
                              >Edit</button>
                              <button 
                                style={{ border: 'none', background: '#fef2f2', color: '#dc2626', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                                onClick={() => handleDeletePending(item._id)}
                              >Delete</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredFaqs.length === 0 ? (
                <div className="empty">No FAQs found for this filter.</div>
              ) : (
                <div className="faq-list">
                  {filteredFaqs.map((item) => (
                    <FaqItem
                      key={item._id}
                      item={item}
                      expanded={openId === item._id}
                      onToggle={() =>
                        setOpenId((prev) => (prev === item._id ? "" : item._id))
                      }
                    />
                  ))}
                </div>
              )}
            </>
          )}

          </div>

        </div>

        {showAskForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="modal-title">{editId ? "Edit Pending Question" : "Ask a Question"}</h2>
              <p className="modal-desc">{editId ? "Update your question details below." : "If you can't find the answer, ask us! Answers will be provided by an admin soon."}</p>
              
              <form onSubmit={handleAskSubmit}>
                <div className="form-group">
                  <label className="modal-label">Question:</label>
                  <input
                    className="modal-input"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Type your question here..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="modal-label">Category:</label>
                  <select
                    className="modal-input"
                    value={askCategory}
                    onChange={(e) => setAskCategory(e.target.value)}
                  >
                    <option value="General">General</option>
                    <option value="Getting Started">Getting Started</option>
                    <option value="Study Tracker">Study Tracker</option>
                    <option value="Workplan">Workplan</option>
                    <option value="Academic Vault">Academic Vault</option>
                    <option value="Account">Account</option>
                    <option value="Technical Support">Technical Support</option>
                  </select>
                </div>
                
                {askStatus && (
                  <div className={`ask-status ${askStatus.includes('success') ? 'ask-status-success' : 'ask-status-error'}`}>
                    {askStatus}
                  </div>
                )}
                
                <div className="modal-actions">
                  <button type="button" onClick={closeModal} className="modal-close-btn">Cancel</button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting || askStatus.includes('success')} 
                    className={`modal-submit-btn ${(isSubmitting || askStatus.includes('success')) ? 'btn-disabled' : ''}`}
                  >
                    {isSubmitting ? "Saving..." : askStatus.includes('success') ? "Saved!" : (editId ? "Update Question" : "Submit Question")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setEditId(null);
            setAskStatus("");
            setNewQuestion("");
            setShowAskForm(true);
          }}
          className="manage-btn"
          title="Ask a Question"
          aria-label="Ask a Question"
        >
          <span className="manage-icon">？</span>
          <span className="manage-text">Ask a Question</span>
        </button>
      </div>
    </div>
  );
}
