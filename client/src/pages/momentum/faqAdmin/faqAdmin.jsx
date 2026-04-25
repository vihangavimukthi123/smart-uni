import { useState, useEffect, useCallback } from "react";
import { MdHistory, MdPendingActions, MdCheckCircle, MdEdit, MdDelete } from "react-icons/md";
import api from "../../../api/axios";
import "./faqAdmin.css";

// ─── Pending Question Card ─────────────────────────────────────────────────
function PendingCard({ faq, onAnswered }) {
  const [answerText, setAnswerText] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handlePublish = async () => {
    if (!answerText.trim()) {
      setFeedback("Please type an answer before publishing.");
      return;
    }
    setSaving(true);
    setFeedback("");
    try {
      const res = await api.put(`/momentum/faqs/${faq._id}`, {
        answer: answerText.trim(),
        isPublished: true,
      });
      setFeedback("✓ Answer published!");
      setTimeout(() => onAnswered(res.data.data), 1200);
    } catch (e) {
      setFeedback("Error: " + (e.response?.data?.message || e.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fa-pending-card">
      <div className="fa-card-top">
        <div style={{ flex: 1 }}>
          <div className="fa-question-text">{faq.question}</div>
          <div className="fa-meta">
            <span className="fa-badge fa-badge-pending">⏳ Awaiting Answer</span>
            <span className="fa-badge fa-badge-category">{faq.category || "General"}</span>
          </div>
          <div className="fa-submitter">
            Submitted: {new Date(faq.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        </div>
      </div>

      <div className="fa-answer-area">
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Construct Answer</div>
        <textarea
          className="fa-textarea"
          rows={4}
          placeholder="Type your answer here..."
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
        />
        <div className="fa-answer-footer" style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {feedback && <span className={feedback.startsWith("✓") ? "fa-inline-success" : "fa-inline-error"}>{feedback}</span>}
          <button className="btn btn-primary" onClick={handlePublish} disabled={saving || !answerText.trim()}>
            {saving ? "Publishing..." : "Publish Answer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Answered FAQ Card ─────────────────────────────────────────────────────
function AnsweredCard({ faq, onUpdated, onAnswerDeleted }) {
  const [isEditingAnswer, setIsEditingAnswer] = useState(false);
  const [editAnswer, setEditAnswer] = useState(faq.answer || "");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleUpdateAnswer = async () => {
    if (!editAnswer.trim()) return;
    setSaving(true);
    try {
      const res = await api.put(`/momentum/faqs/${faq._id}`, { answer: editAnswer.trim(), isPublished: true });
      onUpdated(res.data.data);
      setIsEditingAnswer(false);
      setFeedback("✓ Updated");
      setTimeout(() => setFeedback(""), 2000);
    } catch (e) { setFeedback("Error"); } finally { setSaving(false); }
  };

  const handleDeleteAnswer = async () => {
    if (!window.confirm("Retract answer and move back to pending?")) return;
    setSaving(true);
    try {
      const res = await api.put(`/momentum/faqs/${faq._id}`, { answer: "", isPublished: false });
      onAnswerDeleted(res.data.data);
    } catch (e) { alert("Retract failed"); } finally { setSaving(false); }
  };

  return (
    <div className="fa-published-card">
      <div className="fa-card-top">
        <div style={{ flex: 1 }}>
          <div className="fa-question-text">{faq.question}</div>
          <div className="fa-meta">
            <span className="fa-badge fa-badge-answered">✓ Answered</span>
            <span className="fa-badge fa-badge-category">{faq.category || "General"}</span>
          </div>
        </div>
      </div>

      {!isEditingAnswer ? (
        <div className="anim-fadeIn">
          <div className="fa-pub-answer">{faq.answer}</div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            {feedback && <span className="fa-inline-success" style={{ alignSelf: 'center', marginRight: 'auto' }}>{feedback}</span>}
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--rose)' }} onClick={handleDeleteAnswer} disabled={saving}>Retract</button>
            <button className="btn btn-secondary btn-sm" onClick={() => { setEditAnswer(faq.answer); setIsEditingAnswer(true); }}>Edit Answer</button>
          </div>
        </div>
      ) : (
        <div className="fa-edit-form anim-slideDown">
          <textarea className="fa-textarea" rows={3} value={editAnswer} onChange={(e) => setEditAnswer(e.target.value)} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setIsEditingAnswer(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleUpdateAnswer} disabled={saving}>Save Changes</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Admin FAQ Page ───────────────────────────────────────────────────
export default function FAQAdmin() {
  const [tab, setTab] = useState("pending");
  const [pending, setPending] = useState([]);
  const [answered, setAnswered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/momentum/faqs/admin");
      const all = res.data.data || [];
      setPending(all.filter((f) => !f.answer || f.answer.trim() === ""));
      setAnswered(all.filter((f) => f.answer && f.answer.trim() !== ""));
    } catch (e) { setError("Knowledge Base sync failed."); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAnswered = (updated) => {
    setPending(prev => prev.filter(f => f._id !== updated._id));
    setAnswered(prev => [updated, ...prev]);
  };

  const handleUpdated = (updated) => {
    setAnswered(prev => prev.map(f => f._id === updated._id ? updated : f));
  };

  const handleAnswerDeleted = (updated) => {
    setAnswered(prev => prev.filter(f => f._id !== updated._id));
    setPending(prev => [updated, ...prev]);
  };

  return (
    <div className="fa-page">
      {/* Hero */}
      <div className="fa-hero">
        <div>
          <h1 className="fa-hero-title">FAQ Moderation Center 🎓</h1>
          <p className="fa-hero-sub">Review, refine, and publish knowledge for the campus community.</p>
        </div>
        <div className="fa-hero-icon">⚖️</div>
      </div>

      <div className="fa-content">
        {/* Tabs */}
        <div className="fa-tabs">
          <button className={`fa-tab ${tab === "pending" ? "active" : ""}`} onClick={() => setTab("pending")}>
            <MdPendingActions /> Pending Questions ({pending.length})
          </button>
          <button className={`fa-tab ${tab === "answered" ? "active" : ""}`} onClick={() => setTab("answered")}>
            <MdCheckCircle /> My Answers ({answered.length})
          </button>
        </div>

        {loading ? (
          <div className="fa-empty">Syncing moderated entries...</div>
        ) : tab === "pending" ? (
          <div className="anim-fadeIn">
            <div className="fa-section-title">Questions Awaiting Response</div>
            {pending.length === 0 ? (
              <div className="fa-empty">Queue is clear! All students are well-informed. 🎉</div>
            ) : (
              <div className="fa-list">
                {pending.map(faq => <PendingCard key={faq._id} faq={faq} onAnswered={handleAnswered} />)}
              </div>
            )}
          </div>
        ) : (
          <div className="anim-fadeIn">
            <div className="fa-section-title">Published Contributions</div>
            {answered.length === 0 ? (
              <div className="fa-empty">You haven't published any answers yet. 📭</div>
            ) : (
              <div className="fa-list">
                {answered.map(faq => <AnsweredCard key={faq._id} faq={faq} onUpdated={handleUpdated} onAnswerDeleted={handleAnswerDeleted} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
