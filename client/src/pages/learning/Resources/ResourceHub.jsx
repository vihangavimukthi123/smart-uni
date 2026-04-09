import React, { useState, useEffect, useMemo } from "react";
import "./ResourceHub.css";
import api from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";

const CATEGORIES = ["Notes", "Past Papers", "Tutorials", "Assignments", "YouTube Links"];

const ResourceHub = () => {
  const { user, loading: authLoading } = useAuth();
  const currentUserId = user?._id ? String(user._id) : "";

  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [showUpload, setShowUpload] = useState(false);
  const [viewingResource, setViewingResource] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("all"); // "all" or "my"
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Get user profile from localStorage
  const getProfile = () => {
    const saved = localStorage.getItem("studentProfile");
    return saved ? JSON.parse(saved) : { skills: [], selectedModules: [], moduleLabels: [] };
  };

  // Keep upload modules aligned with Learning Dashboard selections.
  const profile = useMemo(() => getProfile(), [showUpload]);
  const moduleOptions = useMemo(() => {
    const rawModules = (profile.moduleLabels && profile.moduleLabels.length > 0)
      ? profile.moduleLabels
      : (profile.selectedModules || []);
    return [...new Set(rawModules.map((m) => String(m).trim()).filter(Boolean))];
  }, [profile]);
  const defaultModule = moduleOptions[0] || "General";

  const profileName = (profile?.name || "").trim();
  const preferredAuthorName = profileName || user?.name || "";

  // Upload Form State
  const [newRes, setNewRes] = useState({
    title: "",
    subject: "",
    module: defaultModule,
    category: "Notes",
    description: "",
    fileUrl: "",
    fileType: "PDF",
  });
  const [error, setError] = useState("");

  const fetchResources = async () => {
    try {
      const res = await api.get("/learning/resources");
      const fetchedData = Array.isArray(res.data) ? res.data : [];
      setResources(fetchedData);
      if (currentUserId) fetchRecommendations();
    } catch (err) {
      console.error("Error fetching resources:", err);
      setResources([]);
    }
  };

  const fetchRecommendations = async () => {
    if (!currentUserId) return;
    try {
      const profile = getProfile();
      const modulesQuery = (profile.moduleLabels || profile.selectedModules || []).join(",");
      const res = await api.get(`/learning/resources/recommend/${currentUserId}?modules=${modulesQuery}`);
      setRecommendations(res.data.recommendations || []);
      if (res.data.recommendations?.length > 0) setShowRecommendations(true);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
    }
  };

  const trackSearch = async (query) => {
    if (!query || !currentUserId) return;
    try {
      await api.post("/learning/resources/history", { userId: currentUserId, query });
    } catch (err) {
      console.error("Error tracking search:", err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    try {
      await api.delete(`/learning/resources/${id}`);
      fetchResources();
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (!authLoading) fetchResources();
  }, [authLoading, currentUserId]);

  useEffect(() => {
    setNewRes((prev) => {
      if (prev.module && moduleOptions.includes(prev.module)) return prev;
      return { ...prev, module: defaultModule };
    });
  }, [defaultModule, moduleOptions]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");

    if (!currentUserId) {
      setError("Please login first to upload a resource.");
      return;
    }

    // Validation
    if (!newRes.fileUrl) {
      setError("Please add a resource!");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/learning/resources", {
        ...newRes,
        author: preferredAuthorName,
        userId: currentUserId,
      });
      if (res.status === 200 || res.status === 201) {
        setShowUpload(false);
        fetchResources();
        setNewRes({ title: "", subject: "", module: defaultModule, category: "Notes", description: "", fileUrl: "", fileType: "PDF" });
        setError("");
      } else {
        setError("Failed to upload resource. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during upload.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = resources.filter((r) => {
    if (!r) return false;
    const searchLower = (search || "").toLowerCase();
    const titleMatch = (r.title || "").toLowerCase().includes(searchLower);
    const subjectMatch = (r.subject || "").toLowerCase().includes(searchLower);
    
    const matchesSearch = titleMatch || subjectMatch;
    const matchesCat = filterCat === "All" || r.category === filterCat;
    const matchesView = viewMode === "all" || (currentUserId && String(r.userId || "") === currentUserId);
    return matchesSearch && matchesCat && matchesView;
  });

  const getFileIcon = (type) => {
    switch ((type || "").toUpperCase()) {
      case "PDF": return "picture_as_pdf";
      case "IMAGE": return "image";
      case "PPT": return "slideshow";
      case "LINK": return "smart_display";
      default: return "description";
    }
  };

  const getFileTypeClass = (type) => {
    switch ((type || "").toUpperCase()) {
      case "PDF": return "rs-card__icon--pdf";
      case "DOCX": return "rs-card__icon--docx";
      case "PPT": return "rs-card__icon--ppt";
      case "IMAGE": return "rs-card__icon--image";
      case "LINK": return "rs-card__icon--link";
      default: return "rs-card__icon--default";
    }
  };


  return (
    <main className="resource-content rs-page">
        {/* Header */}
        <div className="rs-header">
          <div>
            <h1 className="rs-title">Resource Hub</h1>
            <p className="rs-subtitle">Access and share academic materials with your community.</p>
          </div>
          <button className="rs-btn rs-btn--primary" onClick={() => setShowUpload(true)}>
            <span className="material-symbols-outlined">upload</span>
            Upload Resource
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="rs-toolbar">
          <div className="rs-view-toggle">
            <button 
              className={`rs-toggle-btn ${viewMode === "all" ? "active" : ""}`}
              onClick={() => setViewMode("all")}
            >
              All Resources
            </button>
            <button 
              className={`rs-toggle-btn ${viewMode === "my" ? "active" : ""}`}
              onClick={() => setViewMode("my")}
            >
              My Uploads
            </button>
          </div>

          <div className="rs-search-box">
            <span className="material-symbols-outlined">search</span>
            <input 
              type="text" 
              placeholder="Search by title, subject or module..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={() => trackSearch(search)}
              onKeyDown={(e) => e.key === "Enter" && trackSearch(search)}
            />
          </div>
          <div className="rs-filters">
            <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>



        {/* AI Recommendations Section */}
        {showRecommendations && recommendations.length > 0 && viewMode === "all" && !search && (
          <div className="rs-recommendations">
            <div className="rs-recommendations__header">
              <span className="material-symbols-outlined rs-recommendations__ai-icon">auto_awesome</span>
              <h3>Recommended for You (AI Suggestions)</h3>
              <button 
                className="rs-recommendations__dismiss" 
                onClick={() => setShowRecommendations(false)}
              >
                Dismiss
              </button>
            </div>
            <div className="rs-recommendations__grid">
              {recommendations.map((r) => (
                <div key={`rec-${r._id}`} className="rs-card rs-card--recommended" onClick={() => setViewingResource(r)}>
                  <div className={`rs-card__icon ${getFileTypeClass(r.fileType)}`}>
                    <span className="material-symbols-outlined">{getFileIcon(r.fileType)}</span>
                  </div>
                  <div className="rs-card__content">
                    <div className="rs-card__header">
                      <span className="rs-badge rs-badge--recommended">MATCHED TO {r.module?.toUpperCase()}</span>
                      <span className="rs-file-ext">{r.fileType}</span>
                    </div>
                    <h3 className="rs-card__title">{r.title}</h3>
                    <p className="rs-card__subject">{r.module} • {r.subject}</p>
                    <div className="rs-card__ai-reason">
                      <span className="material-symbols-outlined">info</span>
                      {r.recommendationReason}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resources Grid */}
        <div className="rs-grid">
          {filtered.map((r) => (
            (() => {
              const isOwnResource = currentUserId && String(r.userId || "") === currentUserId;
              const displayAuthor = isOwnResource ? (preferredAuthorName || r.author || "Unknown author") : (r.author || "Unknown author");
              return (
            <div key={r._id} className="rs-card" onClick={() => setViewingResource(r)}>
              <div className={`rs-card__icon ${getFileTypeClass(r.fileType)}`}>
                <span className="material-symbols-outlined">{getFileIcon(r.fileType)}</span>
              </div>
              <div className="rs-card__content">
                <div className="rs-card__header">
                  <span className={`rs-badge rs-badge--${r.category.toLowerCase().replace(" ", "-")}`}>
                    {r.category}
                  </span>
                  <div className="rs-card__actions">
                    {currentUserId && String(r.userId || "") === currentUserId && (
                      <button className="rs-icon-btn rs-icon-btn--danger" onClick={(e) => handleDelete(r._id, e)}>
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    )}
                    <span className="rs-file-ext">{r.fileType}</span>
                  </div>
                </div>

                <h3 className="rs-card__title">{r.title}</h3>
                <p className="rs-card__subject">{r.subject}</p>
                <div className="rs-card__footer">
                  <span className="rs-uploader">
                    <span className="material-symbols-outlined">person</span>
                    {displayAuthor}
                  </span>
                  <span className="rs-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
              );
            })()
          ))}
        </div>

        {/* EMPTY STATE */}
        {filtered.length === 0 && (
          <div className="rs-empty">
            <span className="material-symbols-outlined">folder_open</span>
            <p>No resources found matching your criteria.</p>
          </div>
        )}

        {/* UPLOAD MODAL */}
        {showUpload && (
          <div className="rs-modal-bg" onClick={() => { setShowUpload(false); setError(""); }}>
            <div className="rs-modal" onClick={(e) => e.stopPropagation()}>
              <div className="rs-modal__header">
                <h3>Upload New Resource</h3>
                <button className="rs-modal__close" onClick={() => { setShowUpload(false); setError(""); }}>×</button>
              </div>
              <form onSubmit={handleUpload}>
                <div className="rs-modal__body">
                  {error && (
                    <div className="rs-error-msg">
                      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>error</span>
                      {error}
                    </div>
                  )}
                  
                  <div className="rs-form-row">
                    <div className="rs-form-group">
                      <label>Title</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Intro to Algorithms"
                        value={newRes.title} 
                        onChange={(e) => setNewRes({...newRes, title: e.target.value})}
                      />
                    </div>
                    <div className="rs-form-group">
                      <label>Subject</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Computer Science"
                        value={newRes.subject} 
                        onChange={(e) => setNewRes({...newRes, subject: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="rs-form-row">
                    <div className="rs-form-group">
                      <label>Module</label>
                      <select 
                        value={newRes.module} 
                        onChange={(e) => setNewRes({...newRes, module: e.target.value})}
                      >
                        {moduleOptions.length > 0 ? (
                          moduleOptions.map((moduleName) => (
                            <option key={moduleName} value={moduleName}>{moduleName}</option>
                          ))
                        ) : (
                          <option value="General">General</option>
                        )}
                      </select>
                    </div>
                    <div className="rs-form-group">
                      <label>Category</label>
                      <select value={newRes.category} onChange={(e) => setNewRes({...newRes, category: e.target.value})}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="rs-form-row">
                    <div className="rs-form-group">
                      <label>File Type</label>
                      <select 
                        disabled={newRes.category === "YouTube Links"}
                        value={newRes.category === "YouTube Links" ? "LINK" : newRes.fileType} 
                        onChange={(e) => setNewRes({...newRes, fileType: e.target.value})}
                      >
                         <option value="PDF">PDF</option>
                         <option value="DOCX">DOCX</option>
                         <option value="PPT">PPT</option>
                         <option value="IMAGE">Image</option>
                         {newRes.category === "YouTube Links" && <option value="LINK">YouTube Link</option>}
                      </select>
                    </div>
                  </div>

                  {newRes.category === "YouTube Links" ? (
                    <div className="rs-form-group">
                      <label>YouTube Link / URL</label>
                      <input 
                        className="rs-input-text"
                        type="url" 
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={newRes.category === "YouTube Links" ? newRes.fileUrl : ""} 
                        onChange={(e) => {
                          setNewRes({...newRes, fileUrl: e.target.value, fileType: "LINK"});
                          setError("");
                        }}
                      />
                    </div>
                  ) : (
                    <div className="rs-form-group">
                      <label>Resource File</label>
                      <div className={`rs-file-upload-box ${newRes.fileUrl ? "has-file" : ""}`}>
                        <span className="material-symbols-outlined">upload_file</span>
                        <input 
                          type="file" 
                          id="resourceFile"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              let type = "PDF";
                              if (file.type.includes("image")) type = "IMAGE";
                              else if (file.type.includes("presentation")) type = "PPT";
                              else if (file.type.includes("word")) type = "DOCX";
                              setNewRes({
                                ...newRes,
                                title: newRes.title || file.name.split(".")[0],
                                fileType: type,
                                fileUrl: URL.createObjectURL(file)
                              });
                              setError("");
                            }
                          }}
                        />
                        <p>{newRes.fileUrl && !newRes.fileUrl.startsWith("http") ? "File attached ✓" : "Click to select a file"}</p>
                      </div>
                    </div>
                  )}
                  <div className="rs-form-group">
                    <label>Description</label>
                    <textarea 
                      placeholder="Briefly describe this resource..."
                      value={newRes.description} 
                      onChange={(e) => setNewRes({...newRes, description: e.target.value})}
                    />
                  </div>
                </div>
                <div className="rs-modal__footer">
                  <button type="button" className="rs-btn rs-btn--ghost" onClick={() => { setShowUpload(false); setError(""); }}>Cancel</button>
                  <button type="submit" className="rs-btn rs-btn--primary" disabled={loading}>
                    {loading ? "Uploading..." : "Publish Resource"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PREVIEW MODAL */}
        {viewingResource && (
          <div className="rs-modal-bg" onClick={() => setViewingResource(null)}>
            <div className="rs-modal rs-modal--large" onClick={(e) => e.stopPropagation()}>
              <div className="rs-modal__header">
                <h3>{viewingResource.title}</h3>
                <button className="rs-modal__close" onClick={() => setViewingResource(null)}>×</button>
              </div>
              <div className="rs-modal__body">
                <div className="rs-preview-layout">
                  <div className="rs-preview-pane">
                    {/* Mock PDF/Image Preview */}
                    <div className="rs-mock-preview">
                      <span className="material-symbols-outlined">{getFileIcon(viewingResource.fileType)}</span>
                      <p>Resource Preview for {viewingResource.fileType}</p>
                    </div>
                  </div>
                  <div className="rs-details-pane">
                    <div className="rs-detail-item">
                      <label>Description</label>
                      <p>{viewingResource.description || "No description provided."}</p>
                    </div>
                    <div className="rs-detail-item">
                      <label>Uploaded By</label>
                      <p><strong>{currentUserId && String(viewingResource.userId || "") === currentUserId ? (preferredAuthorName || viewingResource.author || "Unknown author") : (viewingResource.author || "Unknown author")}</strong></p>
                    </div>
                    <div className="rs-detail-item">
                      <label>Module</label>
                      <p>{viewingResource.module || "N/A"}</p>
                    </div>
                    <div className="rs-detail-item">
                      <label>Subject</label>
                      <p>{viewingResource.subject}</p>
                    </div>
                    <a href={viewingResource.fileUrl} target="_blank" rel="noreferrer" className="rs-btn rs-btn--primary rs-btn--full">
                      <span className="material-symbols-outlined">download</span>
                      Download Resource
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </main>
  );
};

export default ResourceHub;


