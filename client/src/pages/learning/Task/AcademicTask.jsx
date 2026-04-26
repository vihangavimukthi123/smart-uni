import { useState, useEffect } from "react";
import "./AcademicTask.css";
import api from "../../../api/axios";

const getProfile = () => {
  const saved = localStorage.getItem("studentProfile");
  return saved
    ? JSON.parse(saved)
    : {
        name: "",
        email: "",
        selectedYear: "",
        selectedSemester: "",
        moduleLabels: [],
        selectedModules: [],
      };
};

const getInitials = (name) => {
  const value = (name || "Student").trim();
  const parts = value.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
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

const isUrgentByDate = (deadlineDate, fallbackUrgent) => {
  if (!deadlineDate) return Boolean(fallbackUrgent);
  const d = new Date(deadlineDate);
  if (Number.isNaN(d.getTime())) return Boolean(fallbackUrgent);
  const now = new Date();
  const diffHours = (d.getTime() - now.getTime()) / (1000 * 60 * 60);
  return diffHours <= 48;
};

// --- CLOCK ---
function ClockIcon({ urgent }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={urgent ? "#ef4444" : "#6b7280"}
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

// --- CARD ---
function TaskCard({ task, currentUserId, isApplied, onApply, onViewDetails }) {
  // Normalize both sides to lowercase so email casing doesn't cause mismatch
  const ownTask =
    currentUserId &&
    (task.userId || "").toLowerCase() === currentUserId.toLowerCase();

  return (
    <div className={`task-card ${ownTask ? "task-card--own" : ""}`}>
      <div className="task-card-header">
        <span className={`task-category task-category--${task.categoryColor}`}>
          {task.category}
        </span>

        <span
          className={`task-deadline ${
            task.deadlineUrgent ? "task-deadline--urgent" : ""
          }`}
        >
          <ClockIcon urgent={task.deadlineUrgent} />
          {task.deadline}
        </span>
      </div>

      {ownTask && (
        <span className="task-own-badge">
          <span className="material-symbols-outlined" style={{ fontSize: "13px", verticalAlign: "middle" }}>person</span>
          {" "}Your Post
        </span>
      )}

      <h3 className="task-title">{task.title}</h3>
      <p className="task-description">{task.description}</p>

      <div className="task-author">
        <div className="task-avatar">{task.avatar}</div>
        <div className="task-author-info">
          <span className="task-author-name">{task.author}</span>
          {ownTask && <span className="task-author-you">(you)</span>}
        </div>
      </div>

      <div className="task-actions">
        <button className="btn btn--outline" onClick={() => onViewDetails(task)}>View Details</button>

        {!ownTask && (
          <button
            className={`btn btn--primary ${isApplied ? "btn--applied" : ""}`}
            onClick={() => onApply(task)}
            disabled={isApplied}
          >
            {isApplied ? "✓ Applied" : "Apply to Help"}
          </button>
        )}
      </div>
    </div>
  );
}

// --- MAIN ---
export default function AcademicTask() {
  const currentProfile = getProfile();
  const currentUserId = currentProfile.email || "local-user";
  const moduleOptions = currentProfile.moduleLabels || [];

  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState([]);
  const [appliedTaskIds, setAppliedTaskIds] = useState(new Set());
  const [detailsTask, setDetailsTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // New task form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(moduleOptions[0] || "");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const todayISO = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!category && moduleOptions.length > 0) {
      setCategory(moduleOptions[0]);
    }
  }, [category, moduleOptions]);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/learning/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const fetchAppliedTasks = async () => {
    try {
      const res = await api.get("/learning/requests");
      const data = res.data;
      const appliedIds = new Set(
        (Array.isArray(data) ? data : [])
          .filter(
            (r) =>
              r.requestType === "TASK_APPLICATION" &&
              (r.senderEmail || "").toLowerCase() === currentUserId.toLowerCase() &&
              r.taskId
          )
          .map((r) => String(r.taskId))
      );
      setAppliedTaskIds(appliedIds);
    } catch (err) {
      console.error("Error fetching applied tasks:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchAppliedTasks();
  }, []);

  const handleApplyToTask = async (task) => {
    if (!task?._id || appliedTaskIds.has(String(task._id))) return;

    try {
      const payload = {
        requestType: "TASK_APPLICATION",
        taskId: String(task._id),
        taskTitle: task.title,
        senderName: currentProfile.name || "Student",
        senderEmail: currentUserId,
        receiverName: task.author,
        receiverEmail: task.userId,
        skill: task.category || task.module || "General",
        message: `${currentProfile.name || "A peer"} applied to help on "${task.title}"`,
        date: new Date().toISOString(),
        status: "PENDING",
      };

      const res = await api.post("/learning/requests", payload);

      if (res.status !== 201 && res.status !== 200) {
        throw new Error("Failed to apply");
      }

      setAppliedTaskIds((prev) => {
        const next = new Set(prev);
        next.add(String(task._id));
        return next;
      });
      alert("Applied successfully. Task owner has been notified.");
    } catch (err) {
      console.error("Error applying for task:", err);
      alert("Failed to apply for this task.");
    }
  };

  const recommendedTasks = tasks.map(t => {
     if (!t) return null;
     if ((t.userId || "") === currentUserId) return null;
     const searchModules = currentProfile.moduleLabels || currentProfile.selectedModules || [];
     const matchedModule = searchModules.find(m => 
       m && (
         (t.module || t.category || "").toLowerCase().includes(m.toLowerCase()) || 
         (t.title || "").toLowerCase().includes(m.toLowerCase())
       )
     );
     return matchedModule ? { ...t, matchedModule } : null;
  }).filter(Boolean).slice(0, 2);

  const handlePostTask = async (e) => {
    e.preventDefault();
    if (!title || !description || !deadline) {
      alert("Please fill all fields");
      return;
    }
    if (deadline < todayISO) {
      alert("Deadline cannot be a past date");
      return;
    }
    if (!category) {
      alert("Please select a module");
      return;
    }

    setLoading(true);
    try {
      const authorName = currentProfile.name || "Student";
      const userId = currentUserId;
      const res = await api.post("/learning/tasks", {
        title,
        category,
        module: category,
        categoryColor: getCategoryColor(category),
        description,
        deadlineDate: deadline,
        deadline: formatDeadline(deadline),
        deadlineUrgent: isUrgent(deadline),
        author: authorName,
        avatar: getInitials(authorName),
        userId,
        year: Number(currentProfile.selectedYear) || undefined,
        semester: Number(currentProfile.selectedSemester) || undefined,
      });

      if (res.status === 201 || res.status === 200) {
        setShowModal(false);
        resetForm();
        fetchTasks();
        alert("Task posted successfully!");
      } else {
        alert(`Failed to post task: ${res.data?.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error posting task:", err);
      alert("Failed to post task.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setCategory(moduleOptions[0] || "");
    setDescription("");
    setDeadline("");
  };

  const getCategoryColor = (cat) => {
    const colors = {
      "Human Computer Interaction": "blue",
      "Data Science & Analytics": "teal",
      "Programming Applications and Frameworks": "purple",
      "Database Systems": "green",
    };
    return colors[cat] || "blue";
  };

  const formatDeadline = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((d - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? `${diff} days left` : "Ending soon";
  };

  const isUrgent = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = (d - now) / (1000 * 60 * 60);
    return diff < 48;
  };

  const filteredTasks = tasks.filter((t) => {
    if (!t) return false;
    const ownTask =
      currentUserId &&
      (t.userId || "").toLowerCase() === currentUserId.toLowerCase();
    if (ownTask) return false;

    const searchLower = (search || "").toLowerCase();
    return (
      (t.title || "").toLowerCase().includes(searchLower) ||
      (t.module || t.category || "").toLowerCase().includes(searchLower) ||
      (t.author || "").toLowerCase().includes(searchLower)
    );
  });

  const detailsTaskIsOwn =
    detailsTask &&
    currentUserId &&
    (detailsTask.userId || "").toLowerCase() === currentUserId.toLowerCase();

  const isDetailsTaskApplied = detailsTask ? appliedTaskIds.has(String(detailsTask._id)) : false;

  const openTaskDetails = (task) => {
    setDetailsTask(task);
  };

  const handleContactPoster = (task) => {
    if (!task?.userId) {
      alert("Poster email is not available for this task.");
      return;
    }
    const subject = encodeURIComponent(`MATRIX CORP help request: ${task.title || "Task"}`);
    const body = encodeURIComponent(
      `Hi ${task.author || "there"},\n\nI saw your task "${task.title || "task"}" and I would like to discuss how I can help.\n\nBest,\n${currentProfile.name || "Student"}`
    );
    window.location.href = `mailto:${task.userId}?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <main className="academic-content academic-page">
          <div className="main-header">
            <div>
              <h1 className="main-title">Academic Tasks</h1>
              <p className="main-subtitle">
                Help your peers and earn micro-credits for your module.
              </p>
            </div>

            <button 
              className="btn btn--primary btn--post"
              onClick={() => setShowModal(true)}
            >
              ✏ Post Task
            </button>
          </div>

          <div className="search-bar">
            <input
              className="search-input"
              type="text"
              placeholder="Search tasks by title or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {!search && recommendedTasks.length > 0 && (
            <div className="tasks-recommendations">
               <div className="recommendation-header">
                  <span className="material-symbols-outlined ai-icon">auto_awesome</span>
                  <h2>Recommended Tasks for You</h2>
               </div>
               <div className="task-grid recommendation-grid">
                  {recommendedTasks.map(t => (
                     <div key={`rec-${t.id || t._id}`} className="recommended-task-wrapper">
                        <div className="match-badge">MATCHED TO {t.matchedModule.toUpperCase()}</div>
                         <TaskCard
                           task={{ ...t, deadline: toUiDeadline(t.deadlineDate, t.deadline), deadlineUrgent: isUrgentByDate(t.deadlineDate, t.deadlineUrgent) }}
                           currentUserId={currentUserId}
                           isApplied={appliedTaskIds.has(String(t._id))}
                           onApply={handleApplyToTask}
                           onViewDetails={openTaskDetails}
                         />
                     </div>
                  ))}
               </div>
            </div>
          )}

          <div className="task-grid">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id || task._id}
                task={{ ...task, deadline: toUiDeadline(task.deadlineDate, task.deadline), deadlineUrgent: isUrgentByDate(task.deadlineDate, task.deadlineUrgent) }}
                currentUserId={currentUserId}
                isApplied={appliedTaskIds.has(String(task._id))}
                onApply={handleApplyToTask}
                onViewDetails={openTaskDetails}
              />
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <div className="task-empty-state">No tasks found.</div>
          )}
      </main>

      {/* TASK DETAILS MODAL */}
      {detailsTask && (
        <div className="aa-modal-bg" onClick={() => setDetailsTask(null)}>
          <div className="aa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="aa-modal__header">
              <h3>Task Details</h3>
              <button className="aa-modal__close" onClick={() => setDetailsTask(null)}>×</button>
            </div>
            <div className="aa-modal__body">
              <h4 className="task-details__title">{detailsTask.title}</h4>
              <p className="task-details__description">{detailsTask.description}</p>

              <div className="task-details__meta-grid">
                <div className="task-details__meta-item">
                  <span className="task-details__label">Module</span>
                  <span>{detailsTask.module || detailsTask.category || "General"}</span>
                </div>
                <div className="task-details__meta-item">
                  <span className="task-details__label">Posted by</span>
                  <span>{detailsTask.author || "Student"}</span>
                </div>
                <div className="task-details__meta-item">
                  <span className="task-details__label">Deadline</span>
                  <span>{detailsTask.deadline || "No deadline"}</span>
                </div>
                <div className="task-details__meta-item">
                  <span className="task-details__label">Urgency</span>
                  <span>{detailsTask.deadlineUrgent ? "Urgent" : "Normal"}</span>
                </div>
                <div className="task-details__meta-item">
                  <span className="task-details__label">Year</span>
                  <span>{detailsTask.year || "N/A"}</span>
                </div>
                <div className="task-details__meta-item">
                  <span className="task-details__label">Semester</span>
                  <span>{detailsTask.semester || "N/A"}</span>
                </div>
              </div>
            </div>
            <div className="aa-modal__footer">
              <button className="aa-btn aa-btn--ghost" onClick={() => setDetailsTask(null)}>Close</button>
              {!detailsTaskIsOwn && (
                <button
                  className="aa-btn aa-btn--ghost"
                  onClick={() => handleContactPoster(detailsTask)}
                >
                  Contact Poster
                </button>
              )}
              {!detailsTaskIsOwn && (
                <button
                  className={`aa-btn aa-btn--primary ${isDetailsTaskApplied ? "btn--applied" : ""}`}
                  onClick={() => handleApplyToTask(detailsTask)}
                  disabled={isDetailsTaskApplied}
                >
                  {isDetailsTaskApplied ? "✓ Applied" : "Apply to Help"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* POST TASK MODAL */}
      {showModal && (
        <div className="aa-modal-bg" onClick={() => setShowModal(false)}>
          <div className="aa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="aa-modal__header">
              <h3>Post a New Task</h3>
              <button className="aa-modal__close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handlePostTask}>
              <div className="aa-modal__body">
                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label className="aa-modal__label">Task Title</label>
                  <input
                    className="aa-modal__textarea"
                    style={{ minHeight: "unset" }}
                    placeholder="e.g. Help with Java Multithreading"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label className="aa-modal__label">Module</label>
                  <select
                    className="aa-modal__textarea"
                    style={{ minHeight: "unset" }}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      {moduleOptions.length > 0 ? "Select Module" : "No modules in your dashboard profile"}
                    </option>
                    {moduleOptions.map((moduleName) => (
                      <option key={moduleName} value={moduleName}>
                        {moduleName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: "15px" }}>
                  <label className="aa-modal__label">Description</label>
                  <textarea
                    className="aa-modal__textarea"
                    placeholder="Briefly describe what help you need..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="aa-modal__label">Deadline</label>
                  <input
                    type="date"
                    className="aa-modal__textarea"
                    style={{ minHeight: "unset" }}
                    value={deadline}
                    min={todayISO}
                    onChange={(e) => setDeadline(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="aa-modal__footer">
                <button
                  type="button"
                  className="aa-btn aa-btn--ghost"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="aa-btn aa-btn--primary"
                  disabled={loading}
                >
                  {loading ? "Posting..." : "Post Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
