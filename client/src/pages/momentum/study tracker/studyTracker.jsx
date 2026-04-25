import { useState, useEffect, useMemo, useCallback } from \"react\";
import { useNavigate } from \"react-router-dom\";
import {
  MdSearch,
  MdAdd,
  MdCheckCircle,
  MdHistory,
  MdOutlineTimer,
  MdEdit,
  MdDelete,
  MdClose,
  MdArrowBack
} from \"react-icons/md\";
import { useAuth } from \"../../../context/AuthContext\";
import api from \"../../../api/axios\";
import \"./studyTracker.css\";

const ICONS = [\"📚\", \"💻\", \"🎨\", \"🔬\", \"📖\", \"🧠\", \"💪\", \"🎧\", \"✍️\", \"🧪\"];

export default function StudyTracker() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState(\"\");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [formData, setFormData] = useState({
    title: \"\",
    course: \"\",
    taskDate: new Date().toISOString().split('T')[0],
    icon: \"📚\",
    status: \"Pending\",
    timeTracked: 0,
    prodScore: 80
  });

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(\"/momentum/study-tasks\");
      setTasks(res.data.data || []);
    } catch (err) {
      console.error(\"Load tasks error:\", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => 
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.course.toLowerCase().includes(search.toLowerCase())
    );
  }, [tasks, search]);

  const handleOpenModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        course: task.course,
        taskDate: task.taskDate ? task.taskDate.split('T')[0] : \"\",
        icon: task.icon,
        status: task.status,
        timeTracked: task.timeTracked,
        prodScore: task.prodScore
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: \"\", course: \"\", taskDate: new Date().toISOString().split('T')[0],
        icon: \"📚\", status: \"Pending\", timeTracked: 0, prodScore: 80
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        const res = await api.put(`/momentum/study-tasks/${editingTask._id}`, formData);
        setTasks(prev => prev.map(t => t._id === editingTask._id ? res.data.data : t));
      } else {
        const res = await api.post(\"/momentum/study-tasks\", formData);
        setTasks(prev => [res.data.data, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(\"Error saving task: \" + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(\"Delete this task?\")) return;
    try {
      await api.delete(`/momentum/study-tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      alert(\"Delete failed\");
    }
  };

  const toggleStatus = async (task) => {
    const newStatus = task.status === \"Completed\" ? \"Pending\" : \"Completed\";
    try {
      const res = await api.put(`/momentum/study-tasks/${task._id}`, { ...task, status: newStatus });
      setTasks(prev => prev.map(t => t._id === task._id ? res.data.data : t));
    } catch (err) {
      alert(\"Update failed\");
    }
  };

  return (
    <div className=\"st-page\">
      {/* Hero Banner */}
      <div className=\"st-hero\">
        <div>
          <button onClick={() => navigate('/momentum')} className=\"st-icon-btn\" style={{ marginBottom: 12, border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
            <MdArrowBack />
          </button>
          <h1 className=\"st-hero-title\">Track Your Wins, {user?.name?.split(' ')[0] || 'Scholar'}! 🎯</h1>
          <p className=\"st-hero-sub\">Every small task completed brings you closer to your academic goals.</p>
        </div>
        <div className=\"st-hero-icon\">⏱️</div>
      </div>

      {/* Toolbar */}
      <div className=\"st-toolbar\">
        <div className=\"st-search-wrap\">
          <MdSearch size={18} color=\"var(--text-muted)\" />
          <input
            type=\"text\"
            className=\"st-search-input\"
            placeholder=\"Search tasks or courses...\"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className=\"st-add-btn\" onClick={() => handleOpenModal()}>
          <MdAdd size={18} /> Add New Task
        </button>
      </div>

      {/* Task List */}
      <div className=\"st-task-list\">
        {loading ? (
          <div className=\"st-empty-state\">Syncing with Academic Ledger...</div>
        ) : filteredTasks.length === 0 ? (
          <div className=\"st-empty-state\">
            <h3>No tasks found.</h3>
            <p>Ready to log your next study session?</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task._id} className=\"st-task-row\">
              <div className=\"st-task-icon-wrap\">{task.icon}</div>
              
              <div className=\"st-task-info\">
                <div className=\"st-task-title\">{task.title}</div>
                <div className=\"st-task-sub\">{task.course} • {task.taskDate ? new Date(task.taskDate).toLocaleDateString() : \"No Date\"}</div>
              </div>

              <div className=\"st-task-meta\">
                <div className=\"st-meta-label\">Focused Time</div>
                <div className=\"st-meta-value\">
                  <MdOutlineTimer size={14} color=\"var(--indigo)\" />
                  {task.timeTracked} min
                </div>
              </div>

              <div className=\"st-task-meta\">
                <div className=\"st-meta-label\">Efficiency</div>
                <div className=\"st-meta-value\">
                  {task.prodScore}%
                  <div className=\"st-pb-track\"><div className=\"st-pb-fill\" style={{ width: `${task.prodScore}%` }}></div></div>
                </div>
              </div>

              <div className=\"st-task-actions\">
                <button 
                  className={`st-badge ${task.status === \"Completed\" ? \"badge-success\" : \"badge-warning\"}`}
                  onClick={() => toggleStatus(task)}
                  style={{ border: 'none', cursor: 'pointer' }}
                >
                  {task.status}
                </button>
                <button className=\"st-icon-btn\" onClick={() => handleOpenModal(task)}><MdEdit /></button>
                <button className=\"st-icon-btn\" onClick={() => handleDelete(task._id)}><MdDelete /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className=\"st-modal-overlay\">
          <form className=\"st-modal\" onSubmit={handleSave}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 className=\"st-modal-title\">{editingTask ? \"Refine Task\" : \"Log New Task\"}</h3>
                <p className=\"st-hero-sub\" style={{ color: 'var(--text-muted)' }}>Capture your academic efforts.</p>
              </div>
              <button type=\"button\" className=\"st-icon-btn\" onClick={() => setIsModalOpen(false)}><MdClose /></button>
            </div>

            <div className=\"st-field-group\">
              <label className=\"st-label\">Task Goal</label>
              <input
                className=\"st-input\"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder=\"e.g. Finish Calculus Homework\"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className=\"st-field-group\">
                <label className=\"st-label\">Course / Subject</label>
                <input
                  className=\"st-input\"
                  required
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  placeholder=\"e.g. MATH 101\"
                />
              </div>
              <div className=\"st-field-group\">
                <label className=\"st-label\">Date</label>
                <input
                  type=\"date\"
                  className=\"st-input\"
                  required
                  value={formData.taskDate}
                  onChange={(e) => setFormData({ ...formData, taskDate: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className=\"st-field-group\">
                <label className=\"st-label\">Time Spent (Min)</label>
                <input
                  type=\"number\"
                  className=\"st-input\"
                  required
                  value={formData.timeTracked}
                  onChange={(e) => setFormData({ ...formData, timeTracked: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className=\"st-field-group\">
                <label className=\"st-label\">Efficiency (%)</label>
                <input
                  type=\"number\"
                  className=\"st-input\"
                  required
                  min=\"0\" max=\"100\"
                  value={formData.prodScore}
                  onChange={(e) => setFormData({ ...formData, prodScore: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className=\"st-field-group\">
              <label className=\"st-label\">Activity Icon</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ICONS.map(i => (
                  <button
                    key={i}
                    type=\"button\"
                    className=\"st-icon-btn\"
                    style={{ fontSize: 20, background: formData.icon === i ? 'var(--primary-alpha)' : 'transparent', borderColor: formData.icon === i ? 'var(--primary)' : 'var(--border-color)' }}
                    onClick={() => setFormData({ ...formData, icon: i })}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div className=\"st-modal-footer\">
              <button type=\"button\" className=\"btn btn-secondary\" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type=\"submit\" className=\"btn btn-primary\">{editingTask ? \"Save Changes\" : \"Add Task\"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
