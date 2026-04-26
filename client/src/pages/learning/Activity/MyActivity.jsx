import { useState, useEffect } from "react";
import "./MyActivity.css";
import api from "../../../api/axios";

const getProfile = () => {
  const saved = localStorage.getItem("studentProfile");
  return saved ? JSON.parse(saved) : { name: "", email: "" };
};

const toUiDeadline = (deadlineDate, fallback) => {
  if (!deadlineDate) return fallback || "No deadline";
  const d = new Date(deadlineDate);
  if (Number.isNaN(d.getTime())) return fallback || "No deadline";

  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "1 day left";
  return `${diffDays} days left`;
};

function Toast({ message, type, onDone }) {
  return (
    <div className={`aa-toast aa-toast--${type}`} onAnimationEnd={onDone}>
      {message}
    </div>
  );
}

/* ── Request Card ───────────────────────────────────────── */
function RequestCard({ req, onAccept, onDecline, onStartConversation }) {
  const senderName = req.senderName || req.name || "Student";
  const initials = senderName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="aa-req-card">
      <div className="aa-req-card__header">
        <div className="aa-req-card__user">
          <div className="aa-avatar aa-avatar--md aa-initials aa-initials--secondary">{initials}</div>
          <div>
            <h4 className="aa-req-card__name">{senderName}</h4>
            <p className="aa-req-card__role">Skill: {req.skill || "General"}</p>
          </div>
        </div>
        <span className={`aa-badge aa-badge--${(req.status || "PENDING").toLowerCase()}`}>
          {req.status || "PENDING"}
        </span>
      </div>
      <p className="aa-req-card__msg">"{req.message}"</p>
      <div className="aa-req-card__actions">
        {(req.status || "PENDING") === "PENDING" ? (
          <>
            <button className="aa-btn aa-btn--primary" onClick={() => onAccept(req)}>Accept</button>
            <button className="aa-btn aa-btn--ghost"   onClick={() => onDecline(req)}>Decline</button>
          </>
        ) : (req.status || "PENDING") === "ACCEPTED" ? (
          <button className="aa-btn aa-btn--primary" onClick={() => onStartConversation(req)}>
            Start Conversation
          </button>
        ) : (
          <button className="aa-btn aa-btn--ghost" disabled>
            No actions available
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────── */
export default function MyActivity() {
  const currentProfile = getProfile();
  const currentUserName = currentProfile.name || "Student";
  const currentUserId = currentProfile.email || "local-user";
  
  const [received,      setReceived]      = useState([]);
  const [sent, setSent] = useState([]);
  const [taskApplications, setTaskApplications] = useState([]);
  const [reviewedRequestIds, setReviewedRequestIds] = useState(new Set());
  const [myTasks,       setMyTasks]       = useState([]);

  useEffect(() => {
    fetchRequests();
    fetchMyTasks();
    fetchMyReviews();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/learning/requests");
      const data = res.data;

      const all = Array.isArray(data) ? data : [];
      const isTaskApplication = (r) => r.requestType === "TASK_APPLICATION";

      setSent(
        all.filter(
          (r) =>
            !isTaskApplication(r) &&
            (((r.senderEmail || "").toLowerCase() === (currentUserId || "").toLowerCase()) || r.senderName === currentUserName)
        )
      );
      setReceived(
        all.filter(
          (r) =>
            !isTaskApplication(r) &&
            ((r.receiverEmail && r.receiverEmail === currentUserId) || r.receiverName === currentUserName) &&
            !((r.senderEmail && r.senderEmail === currentUserId) || r.senderName === currentUserName)
        )
      );

      setTaskApplications(
        all.filter(
          (r) =>
            isTaskApplication(r) &&
            ((r.receiverEmail || "").toLowerCase() === (currentUserId || "").toLowerCase())
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyTasks = async () => {
    try {
      const res = await api.get("/learning/tasks");
      setMyTasks(res.data.filter((t) => (t.userId && t.userId === currentUserId) || t.author === currentUserName));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyReviews = async () => {
    if (!currentUserId) return;
    try {
      const res = await api.get(`/learning/peerreviews/reviewer/${encodeURIComponent(currentUserId)}`);
      const ids = new Set((Array.isArray(res.data) ? res.data : []).map((r) => String(r.requestId)));
      setReviewedRequestIds(ids);
    } catch (err) {
      console.error(err);
    }
  };

  const [search,        setSearch]        = useState("");
  const [toast,         setToast]         = useState(null);
  const [notifSeen,     setNotifSeen]     = useState(false);
  const [editingReq,    setEditingReq]    = useState(null);
  const [editingMsg,    setEditingMsg]    = useState("");
  const [viewingReq,    setViewingReq]    = useState(null);
  const [editingTask,   setEditingTask]   = useState(null);
  const [taskTitle,     setTaskTitle]     = useState("");
  const [taskDesc,      setTaskDesc]      = useState("");
  const [reviewingReq,  setReviewingReq]  = useState(null);
  const [reviewRating,  setReviewRating]  = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [conversationReq, setConversationReq] = useState(null);
  const [conversationDraft, setConversationDraft] = useState("");

  function showToast(message, type = "success") {
    setToast({ message, type, key: Date.now() });
  }

  async function handleAccept(req) {
    try {
      await api.put(`/learning/requests/${req._id}`, { status: "ACCEPTED" });
      fetchRequests();
      showToast(`✓ You accepted ${req.senderName || "the request"}.`, "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to accept request.", "error");
    }
  }

  async function handleDecline(req) {
    try {
      await api.put(`/learning/requests/${req._id}`, { status: "DECLINED" });
      fetchRequests();
      showToast("Request declined.", "error");
    } catch (err) {
      console.error(err);
      showToast("Failed to decline request.", "error");
    }
  }

  async function handleCancelSent(id) {
    try {
      await api.delete(`/learning/requests/${id}`);
      fetchRequests();
      showToast("Request cancelled.", "error");
    } catch (err) {
      console.error(err);
    }
  }

  function handleEdit(req) {
    setEditingReq(req);
    setEditingMsg(req.message);
  }

  async function handleUpdate() {
    if (!editingReq || !editingMsg) return;
    try {
      await api.put(`/learning/requests/${editingReq._id}`, { message: editingMsg });
      setEditingReq(null);
      fetchRequests();
      showToast("Request updated.", "success");
    } catch (err) {
      console.error(err);
      showToast("Error updating request.", "error");
    }
  }

  async function handleMarkCompleted(req) {
    try {
      await api.put(`/learning/requests/${req._id}`, { status: "COMPLETED" });
      fetchRequests();
      showToast("Request marked as completed.", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to mark as completed.", "error");
    }
  }

  function openReviewModal(req) {
    setReviewingReq(req);
    setReviewRating(5);
    setReviewComment("");
  }

  function openConversation(req) {
    const isSender =
      (req.senderEmail && req.senderEmail === currentUserId) ||
      req.senderName === currentUserName;
    const peerName = (isSender ? req.receiverName : req.senderName) || "Peer";
    const peerEmail = (isSender ? req.receiverEmail : req.senderEmail) || "";
    setConversationReq({ ...req, peerName, peerEmail });
    const draft = isSender
      ? `Hi ${peerName},\n\nThanks for accepting my request for "${req.skill || "General"}". Can we coordinate a time to connect and start working on this?\n\nBest,\n${currentUserName}`
      : `Hi ${peerName},\n\nI accepted your request for "${req.skill || "General"}". Let's coordinate a time to connect and work on this.\n\nBest,\n${currentUserName}`;

    setConversationDraft(draft);
  }

  async function handleSubmitReview() {
    if (!reviewingReq) return;
    try {
      await api.post("/learning/peerreviews", {
        requestId: reviewingReq._id,
        reviewerName: currentUserName,
        reviewerEmail: currentUserId,
        revieweeName: reviewingReq.receiverName,
        revieweeEmail: reviewingReq.receiverEmail,
        rating: Number(reviewRating),
        comment: reviewComment,
      });
      setReviewingReq(null);
      await fetchMyReviews();
      showToast("Review submitted successfully.", "success");
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || err.message || "Failed to submit review.", "error");
    }
  }

  async function handleDeleteTask(id) {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/learning/tasks/${id}`);
      fetchMyTasks();
      showToast("Task removed.", "error");
    } catch (err) { console.error(err); }
  }

  function handleEditTask(t) {
    setEditingTask(t);
    setTaskTitle(t.title);
    setTaskDesc(t.description);
  }

  async function handleUpdateTask() {
    try {
      await api.put(`/learning/tasks/${editingTask._id}`, { title: taskTitle, description: taskDesc });
      setEditingTask(null);
      fetchMyTasks();
      showToast("Task updated.", "success");
    } catch (err) { console.error(err); }
  }

  function copyTaskApplicantEmail(email) {
    if (!email) {
      showToast("Applicant email not available.", "error");
      return;
    }
    navigator.clipboard.writeText(email);
    showToast("Applicant email copied.", "success");
  }

  function openTaskApplicationConversation(application) {
    const peerName = application.senderName || "Peer";
    const peerEmail = application.senderEmail || "";
    setConversationReq({
      ...application,
      peerName,
      peerEmail,
      skill: application.skill || application.taskTitle || "Task support",
    });
    setConversationDraft(
      `Hi ${peerName},\n\nThanks for applying to help with my task "${application.taskTitle || "task"}". Let's coordinate a time and approach.\n\nBest,\n${currentUserName}`
    );
  }

  async function handleCopyConversationEmail() {
    if (!conversationReq?.peerEmail) {
      showToast("No peer email found for this request.", "error");
      return;
    }
    try {
      await navigator.clipboard.writeText(conversationReq.peerEmail);
      showToast("Peer email copied.", "success");
    } catch (err) {
      console.error(err);
      showToast("Could not copy email.", "error");
    }
  }

  function handleOpenEmailClient() {
    if (!conversationReq?.peerEmail) {
      showToast("No peer email found for this request.", "error");
      return;
    }
    const subject = encodeURIComponent(`SmartCampus collaboration on ${conversationReq.skill || "task"}`);
    const body = encodeURIComponent(conversationDraft);
    window.location.href = `mailto:${conversationReq.peerEmail}?subject=${subject}&body=${body}`;
  }

  const filteredReceived = received.filter(
    (r) =>
      r && (
        (r.senderName || "").toLowerCase().includes((search || "").toLowerCase()) ||
        (r.message || "").toLowerCase().includes((search || "").toLowerCase())
      )
  );

  return (
    <main className="activity-content aa-main-col">
          {toast && (
            <Toast
              key={toast.key}
              message={toast.message}
              type={toast.type}
              onDone={() => setToast(null)}
            />
          )}

          <header className="aa-topbar">
            <div className="aa-topbar__inner">
              <div className="aa-topbar__left">
                <h1 className="aa-topbar__title">My Activity</h1>
              </div>
              <div className="aa-topbar__right">
                <div className="aa-search-wrap">
                  <span className="material-symbols-outlined aa-search-icon">search</span>
                  <input
                    className="aa-search"
                    placeholder="Search requests..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button className="aa-icon-btn" onClick={() => showToast("No new notifications.", "success")}>
                  <span className="material-symbols-outlined">notifications</span>
                </button>
              </div>
            </div>
          </header>

          <main className="aa-content">
            <section className="aa-summary-banner">
              <div className="aa-summary-banner__content">
                <span className="material-symbols-outlined">info</span>
                <p>
                  You have <strong>{received.filter((r) => (r.status || "PENDING") === "PENDING").length} pending requests</strong> and <strong>{taskApplications.length} recent replies</strong> to your activity.
                </p>
              </div>
            </section>

            <section className="aa-section">
              <div>
                <div className="aa-section__header">
                  <h2 className="aa-section__title">Received Requests</h2>
                </div>
                <div className="aa-cards-grid">
                  {filteredReceived.map((req) => (
                    <RequestCard
                      key={req._id}
                      req={req}
                      onAccept={handleAccept}
                      onDecline={handleDecline}
                      onStartConversation={openConversation}
                    />
                  ))}
                  {filteredReceived.length === 0 && <p>No incoming requests yet.</p>}
                </div>
              </div>

              <div>
                <div className="aa-section__header">
                  <h2 className="aa-section__title">Sent Requests</h2>
                </div>
                <div className="aa-table-wrap">
                  <table className="aa-table">
                    <thead>
                      <tr>
                        <th>Recipient</th>
                        <th>Skill</th>
                        <th>Status</th>
                        <th className="aa-table__right aa-table__actions-col">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sent.map((s) => (
                        <tr key={s._id}>
                          <td>{s.receiverName}</td>
                          <td>{s.skill}</td>
                          <td>{s.status}</td>
                          <td className="aa-table__right aa-table__actions-cell">
                            {s.status === "PENDING" && (
                              <div className="aa-row-actions">
                                <button className="aa-action-btn aa-action-btn--edit" onClick={() => handleEdit(s)}>
                                  Edit
                                </button>
                                <button className="aa-action-btn aa-action-btn--danger" onClick={() => handleCancelSent(s._id)}>
                                  Cancel
                                </button>
                              </div>
                            )}

                            {s.status === "ACCEPTED" && (
                              <div className="aa-row-actions">
                                <button className="aa-action-btn aa-action-btn--chat" onClick={() => openConversation(s)}>
                                  Start Conversation
                                </button>
                                <button className="aa-action-btn aa-action-btn--success" onClick={() => handleMarkCompleted(s)}>
                                  Mark Completed
                                </button>
                              </div>
                            )}

                            {s.status === "COMPLETED" && (
                              <div className="aa-row-actions">
                                <span className="aa-action-note">Completed</span>
                              </div>
                            )}

                            {s.status === "DECLINED" && (
                              <div className="aa-row-actions">
                                <span className="aa-action-note">No actions</span>
                              </div>
                            )}

                            {!s.status && (
                              <div className="aa-row-actions">
                                <span className="aa-action-note">No actions</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="aa-bottom-grid">
              <div className="aa-task-section">
                <h3 className="aa-subsection-title">Recent Posted Tasks</h3>
                <div className="aa-posted-tasks-list">
                  {myTasks.length > 0 ? (
                    myTasks.map((t) => (
                      <div className="aa-task-card" key={t._id}>
                        <div className="aa-task-card__header">
                          <h4 className="aa-task-card__title">{t.title}</h4>
                          <span className="aa-badge aa-badge--open">{t.category}</span>
                        </div>
                        <p className="aa-task-card__desc">{t.description}</p>
                        <div className="aa-task-card__footer">
                          <div className="aa-task-card__meta">
                            <span>
                              <span className="material-symbols-outlined">calendar_today</span>
                              {" "}
                              {toUiDeadline(t.deadlineDate, t.deadline)}
                            </span>
                          </div>
                          <div className="aa-task-card__actions">
                            <button className="aa-action-btn aa-action-btn--edit" onClick={() => handleEditTask(t)}>Edit</button>
                            <button className="aa-action-btn aa-action-btn--danger" onClick={() => handleDeleteTask(t._id)}>Delete</button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="aa-empty-state">
                      <p>No tasks posted yet.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="aa-replies-section">
                <h3 className="aa-subsection-title">Latest Replies</h3>
                <div className="aa-replies-list">
                  {taskApplications.map((app) => (
                    <div key={`task-app-${app._id}`} className="aa-reply aa-reply--task-app">
                      <div className="aa-avatar aa-avatar--md aa-initials aa-initials--secondary">
                        {(app.senderName || "Peer")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="aa-reply__body">
                        <div className="aa-reply__top">
                          <span className="aa-reply__name">{app.senderName || "Peer"} applied to help</span>
                          <span className="aa-reply__time">{new Date(app.createdAt || app.date || Date.now()).toLocaleString()}</span>
                        </div>
                        <p className="aa-reply__preview">
                          "{app.senderName || "A peer"} applied for your task: {app.taskTitle || app.skill || "Untitled task"}."
                        </p>
                        <div className="aa-reply__actions">
                          <button className="aa-action-btn aa-action-btn--primary" onClick={() => openTaskApplicationConversation(app)}>
                            <span className="material-symbols-outlined" style={{ fontSize: "14px", marginRight: "4px" }}>forum</span>
                            Contact
                          </button>
                          <button className="aa-action-btn aa-action-btn--primary" onClick={() => copyTaskApplicantEmail(app.senderEmail)}>
                            <span className="material-symbols-outlined" style={{ fontSize: "14px", marginRight: "4px" }}>content_copy</span>
                            Copy Email
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {taskApplications.length === 0 && (
                    <div className="aa-empty-state">
                      <p>No any replies yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </main>

          {editingReq && (
            <div className="aa-modal-bg" onClick={() => setEditingReq(null)}>
              <div className="aa-modal" onClick={(e) => e.stopPropagation()}>
                <div className="aa-modal__header">
                  <h3>Edit Request</h3>
                  <button className="aa-modal__close" onClick={() => setEditingReq(null)}>×</button>
                </div>
                <div className="aa-modal__body">
                  <label className="aa-modal__label">Update your message for <strong>{editingReq.receiverName}</strong>:</label>
                  <textarea
                    className="aa-modal__textarea"
                    value={editingMsg}
                    onChange={(e) => setEditingMsg(e.target.value)}
                    placeholder="Type your message here..."
                  />
                </div>
                <div className="aa-modal__footer">
                  <button className="aa-btn aa-btn--ghost" onClick={() => setEditingReq(null)}>Cancel</button>
                  <button className="aa-btn aa-btn--primary" onClick={handleUpdate}>Update Message</button>
                </div>
              </div>
            </div>
          )}

          {conversationReq && (
            <div className="aa-modal-bg" onClick={() => setConversationReq(null)}>
              <div className="aa-modal" onClick={(e) => e.stopPropagation()}>
                <div className="aa-modal__header">
                  <h3>Start Conversation</h3>
                  <button className="aa-modal__close" onClick={() => setConversationReq(null)}>×</button>
                </div>
                <div className="aa-modal__body">
                  <div className="aa-convo-box__peer">
                    <div className="aa-avatar aa-avatar--md aa-initials aa-initials--primary">
                      {(conversationReq.peerName || "Peer")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="aa-convo-box__peer-name">{conversationReq.peerName || "Peer"}</div>
                      <div className="aa-convo-box__peer-email">{conversationReq.peerEmail || "Email unavailable"}</div>
                    </div>
                  </div>

                  <label className="aa-modal__label" style={{ marginTop: "14px" }}>Message Draft</label>
                  <textarea
                    className="aa-convo-box__draft"
                    value={conversationDraft}
                    onChange={(e) => setConversationDraft(e.target.value)}
                    placeholder="Write your first collaboration message..."
                  />
                </div>
                <div className="aa-modal__footer aa-modal__footer--between">
                  <button className="aa-btn aa-btn--ghost" onClick={handleCopyConversationEmail}>Copy Email</button>
                  <div className="aa-row-actions">
                    <button className="aa-btn aa-btn--ghost" onClick={() => setConversationReq(null)}>Close</button>
                    <button className="aa-btn aa-btn--primary" onClick={handleOpenEmailClient}>Open Email</button>
                  </div>
                </div>
              </div>
            </div>
          )}
    </main>
  );
}
