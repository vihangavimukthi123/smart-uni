import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../sidebar/sidebar";
import api from "../../../api/axios";

import "./faqManager.css";


const PRIMARY = "#1152D4";
const CATEGORY_OPTIONS = [
  "General",
  "Getting Started",
  "Study Tracker",
  "Workplan",
  "Academic Vault",
  "Account",
  "Technical Support",
];

const EMPTY_FORM = {
  question: "",
  answer: "",
  category: "General",
  order: 0,
  isPublished: true,
};

function FaqForm({ form, onChange, onSubmit, onCancel, isEditing, isSaving }) {
  const categoryOptions = CATEGORY_OPTIONS.includes(form.category)
    ? CATEGORY_OPTIONS
    : [form.category, ...CATEGORY_OPTIONS];

  return (
    <div className="form-card">
      <div className="card-title">{isEditing ? "Update FAQ" : "Create FAQ"}</div>

      <div className="field-group">
        <label className="label">Question *</label>
        <input
          className="input"
          value={form.question}
          onChange={(e) => onChange("question", e.target.value)}
          placeholder="Enter the frequently asked question"
        />
      </div>

      <div className="field-group">
        <label className="label">Answer *</label>
        <textarea
          className="textarea"
          value={form.answer}
          onChange={(e) => onChange("answer", e.target.value)}
          placeholder="Provide a clear answer"
          rows={4}
        />
      </div>

      <div className="row-2">
        <div className="field-group">
          <label className="label">Category</label>
          <select
            className="input"
            value={form.category}
            onChange={(e) => onChange("category", e.target.value)}
          >
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label className="label">Display Order</label>
          <input
            className="input"
            type="number"
            min="0"
            value={form.order}
            onChange={(e) => onChange("order", e.target.value)}
          />
        </div>
      </div>

      <div className="toggle-row">
        <span className="label">Published</span>
        <button
          type="button"
          onClick={() => onChange("isPublished", !form.isPublished)}
          className="toggle" style={{
            background: form.isPublished ? PRIMARY : "#d1d5db",
          }}
        >
          <span
            className="toggle-dot" style={{
              transform: form.isPublished ? "translateX(18px)" : "translateX(0)",
            }}
          />
        </button>
      </div>

      <div className="form-actions">
        {isEditing && (
          <button type="button" className="secondary-btn" onClick={onCancel}>
            Cancel Edit
          </button>
        )}
        <button type="button" className="primary-btn" onClick={onSubmit} disabled={isSaving}>
          {isSaving ? "Saving..." : isEditing ? "Update FAQ" : "Add FAQ"}
        </button>
      </div>
    </div>
  );
}

function FaqCard({ faq, onEdit, onDelete, isDeleting }) {
  return (
    <div className="faq-card">
      <div className="faq-top-row">
        <div>
          <div className="faq-question">{faq.question}</div>
          <div className="meta-row">
            <span className="meta-pill">{faq.category || "General"}</span>
            <span className="meta-text">Order: {faq.order ?? 0}</span>
            <span
              className="meta-pill" style={{
                background: faq.isPublished ? "#ecfdf3" : "#fef3c7",
                color: faq.isPublished ? "#166534" : "#92400e",
              }}
            >
              {faq.isPublished ? "Published" : "Draft"}
            </span>
          </div>
        </div>

        <div className="card-actions">
          <button className="secondary-btn" onClick={() => onEdit(faq)}>
            Edit
          </button>
          <button
            className="delete-btn"
            onClick={() => onDelete(faq._id)}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
      <div className="faq-answer">{faq.answer}</div>
    </div>
  );
}

export default function FAQManager() {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  const loadFaqs = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/momentum/faqs");
      setFaqs(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const handleFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const validate = () => {
    if (!form.question.trim() || !form.answer.trim()) {
      setError("Question and answer are required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSaving(true);
    setError("");

    const payload = {
      question: form.question,
      answer: form.answer,
      category: form.category,
      order: Number(form.order) || 0,
      isPublished: Boolean(form.isPublished),
    };

    try {
      const endpoint = isEditing
        ? `/momentum/faqs/${editingId}`
        : `/momentum/faqs`;

      await (isEditing ? api.put(endpoint, payload) : api.post(endpoint, payload));

      await loadFaqs();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save FAQ");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (faq) => {
    setEditingId(faq._id);
    setForm({
      question: faq.question || "",
      answer: faq.answer || "",
      category: faq.category || "General",
      order: faq.order ?? 0,
      isPublished: faq.isPublished ?? true,
    });
    setError("");
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    setError("");

    try {
      await api.delete(`/momentum/faqs/${id}`);

      setFaqs((prev) => prev.filter((faq) => faq._id !== id));
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to delete FAQ");
    } finally {
      setDeletingId("");
    }
  };

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
        <Sidebar />

        <div className="page">
          <div className="header">
            <button type="button" className="back-btn" onClick={() => navigate("/faqs")}>
              ← Back to FAQs
            </button>
            <h1 className="title">FAQ Management</h1>
            <p className="subtitle">
              Create, edit, publish, and delete frequently asked questions.
            </p>
          </div>

          {error && <div className="error-box">{error}</div>}

          <div className="content-wrapper">
            <FaqForm
              form={form}
              onChange={handleFormChange}
              onSubmit={handleSubmit}
              onCancel={resetForm}
              isEditing={isEditing}
              isSaving={saving}
            />

            <div className="list-header">All FAQs</div>

            {loading ? (
              <div className="empty-state">Loading FAQs...</div>
            ) : faqs.length === 0 ? (
              <div className="empty-state">No FAQs yet. Add your first FAQ above.</div>
            ) : (
              <div className="list">
                {faqs.map((faq) => (
                  <FaqCard
                    key={faq._id}
                    faq={faq}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isDeleting={deletingId === faq._id}
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
