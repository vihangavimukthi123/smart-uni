import React, { useState, useEffect } from "react";
import Sidebar from "../sidebar/sidebar";
import { useNotifications } from "../../../context/NotificationContext";


const PRIMARY = "#1a4fd6";

export default function NotificationManager() {
  const { addNotification } = useNotifications() || {};
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [isPublished, setIsPublished] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState({ type: "", message: "" });
  
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications`);
      if (!res.ok) throw new Error("Failed to load notifications");
      const payload = await res.json();
      setNotifications(payload.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setFormStatus({ type: "error", message: "Title and Message are required." });
      return;
    }
    
    setIsSubmitting(true);
    setFormStatus({ type: "", message: "" });
    
    try {
      const isEditing = !!editingId;
      const url = isEditing 
        ? `${API_BASE_URL}/api/notifications/${editingId}`
        : `${API_BASE_URL}/api/notifications`;
        
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, type, isPublished }),
      });
      
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || "Failed to save notification");
      
      setFormStatus({ type: "success", message: `Notification nicely ${isEditing ? "updated" : "created"}!` });
      if (addNotification) {
         addNotification(`Success`, `Notification successfully ${isEditing ? "updated" : "created"}.`, "success");
      }
      
      resetForm();
      fetchNotifications();
      
      setTimeout(() => setFormStatus({ type: "", message: "" }), 3000);
    } catch (err) {
      setFormStatus({ type: "error", message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (notif) => {
    setEditingId(notif._id);
    setTitle(notif.title);
    setMessage(notif.message);
    setType(notif.type || "info");
    setIsPublished(notif.isPublished);
    setFormStatus({ type: "", message: "" });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete notification");
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (addNotification) addNotification("Deleted", "Notification permanently deleted.", "warning");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };
  
  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setMessage("");
    setType("info");
    setIsPublished(true);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F3F4F6", fontFamily: "'Segoe UI', sans-serif" }}>
      
      <div style={{ flex: 1, padding: "26px 24px", maxWidth: 1000, margin: "0 auto" }}>
        
        <div style={{ background: "linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)", padding: "24px", borderRadius: 16, marginBottom: 24, border: "1px solid #c7d2fe" }}>
          <h1 style={{ margin: 0, color: "#1e3a8a", fontSize: 26, display: "flex", alignItems: "center", gap: 10 }}>
            <span>🔔</span> Notification Manager
          </h1>
          <p style={{ margin: "8px 0 0", color: "#4338ca", fontSize: 14 }}>
            Create and broadcast system-wide notifications instantly.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Form Side */}
          <div style={{ background: "#fff", padding: 24, borderRadius: 16, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: 18, margin: "0 0 20px", color: "#1f2937" }}>
              {editingId ? "Edit Notification" : "Draft New Notification"}
            </h2>
            
            {formStatus.message && (
              <div style={{ padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14, 
                backgroundColor: formStatus.type === "success" ? "#dcfce7" : "#fee2e2", 
                color: formStatus.type === "success" ? "#166534" : "#991b1b" 
              }}>
                {formStatus.message}
              </div>
            )}
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151" }}>Title</label>
                <input 
                  value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Server Maintenance, Welcome"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, outline: "none", boxSizing: "border-box" }}
                  required
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151" }}>Message</label>
                <textarea 
                  value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a detailed message here..."
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, outline: "none", height: 100, resize: "vertical", boxSizing: "border-box" }}
                  required
                />
              </div>
              
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151" }}>Notification Type</label>
                  <select 
                    value={type} onChange={(e) => setType(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", outline: "none" }}
                  >
                    <option value="info">Info (Blue)</option>
                    <option value="success">Success (Green)</option>
                    <option value="warning">Warning (Yellow)</option>
                    <option value="error">Alert (Red)</option>
                    <option value="motivation">Motivation (Purple)</option>
                  </select>
                </div>
                
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                   <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", height: 40, userSelect: "none" }}>
                      <input 
                        type="checkbox" 
                        checked={isPublished} 
                        onChange={(e) => setIsPublished(e.target.checked)} 
                        style={{ width: 16, height: 16 }}
                      />
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>Is Published (Live)</span>
                   </label>
                </div>
              </div>
              
              <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                {editingId && (
                  <button type="button" onClick={resetForm} style={{ flex: 1, padding: "12px", background: "#f3f4f6", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", color: "#4b5563" }}>
                    Cancel
                  </button>
                )}
                <button type="submit" disabled={isSubmitting} style={{ flex: 2, padding: "12px", background: PRIMARY, border: "none", borderRadius: 8, fontWeight: 600, cursor: isSubmitting ? "not-allowed" : "pointer", color: "#fff", opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? "Processing..." : editingId ? "Update Notification" : "Broadcast Notification"}
                </button>
              </div>
            </form>
          </div>

          {/* List Side */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ fontSize: 18, margin: 0, color: "#1f2937" }}>Notification Dashboard</h2>
            
            {error && <div style={{ color: "#dc2626", background: "#fee2e2", padding: 10, borderRadius: 8, fontSize: 14 }}>{error}</div>}
            
            {loading ? (
              <div style={{ padding: 30, textAlign: "center", color: "#6b7280" }}>Loading system notifications...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", background: "#fff", borderRadius: 16, border: "1px dashed #d1d5db", color: "#6b7280" }}>No notifications created yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: "calc(100vh - 200px)", overflowY: "auto", paddingRight: 5 }}>
                {notifications.map(notif => (
                  <div key={notif._id} style={{ background: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderLeft: `4px solid ${getTypeColor(notif.type)}`, opacity: notif.isPublished ? 1 : 0.6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <h3 style={{ margin: 0, fontSize: 15, color: "#111827" }}>{notif.title}</h3>
                      <div style={{ display: "flex", gap: 8 }}>
                        {!notif.isPublished && <span style={{ fontSize: 11, background: "#f3f4f6", color: "#6b7280", padding: "2px 8px", borderRadius: 12, fontWeight: 600 }}>Draft</span>}
                        <button onClick={() => handleEdit(notif)} style={{ background: "none", border: "none", cursor: "pointer", color: "#3b82f6", fontSize: 14 }} title="Edit">✎</button>
                        <button onClick={() => handleDelete(notif._id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 14 }} title="Delete">🗑</button>
                      </div>
                    </div>
                    <p style={{ margin: "0 0 10px", fontSize: 13, color: "#4b5563", lineHeight: 1.5 }}>{notif.message}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af" }}>
                      <span style={{ textTransform: "capitalize" }}>Type: {notif.type}</span>
                      <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function getTypeColor(type) {
  switch (type) {
    case "success": return "#22c55e"; // Green
    case "warning": return "#eab308"; // Yellow
    case "error": return "#ef4444"; // Red
    case "motivation": return "#a855f7"; // Purple
    case "info": 
    default: return "#3b82f6"; // Blue
  }
}
