import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../sidebar/sidebar";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";

const PRIMARY = "#1152D4";
const ACCENT = "#3b82f6";
const BACKGROUND = "#f8fafc";

// --- Components ---

function StatCard({ label, value, icon, gradient }) {
  return (
    <div style={{
      ...styles.statCard,
      background: gradient || "#fff",
      color: gradient ? "#fff" : "#111"
    }}>
      <div style={{...styles.statLabel, color: gradient ? "rgba(255,255,255,0.8)" : "#64748b"}}>
        {icon} {label}
      </div>
      <div style={{...styles.statValue, color: gradient ? "#fff" : "#111"}}>
        {value}
      </div>
    </div>
  );
}

function PriorityBadge({ level }) {
  const isHigh = level && (level.includes("High") || level.includes("Priority"));
  const isMed = level && level.includes("Medium");
  return (
    <span style={{
      ...styles.badge,
      background: isHigh ? "#fee2e2" : isMed ? "#fef3c7" : "#f0fdf4",
      color: isHigh ? "#b91c1c" : isMed ? "#b45309" : "#15803d",
      border: `1px solid ${isHigh ? "#fecaca" : isMed ? "#fde68a" : "#bbf7d0"}`
    }}>
      {level || "Standard"}
    </span>
  );
}

/**
 * Normalizes old workplan data to the new Success Strategist format.
 */
function normalizeWorkplan(raw) {
  if (!raw) return null;
  
  const normalized = { ...raw };

  // 1. Summary normalization
  if (!normalized.summary && raw.overview) {
    normalized.summary = {
      scope_title: "Total Study Sessions",
      scope_value: raw.overview.total_scope || "N/A",
      effort_title: "Total Estimated Effort",
      effort_value: raw.overview.estimated_effort || "N/A",
      target_completion: raw.overview.completion_date || "N/A"
    };
  } else if (!normalized.summary) {
    normalized.summary = { scope_value: "N/A", effort_value: "N/A", target_completion: "N/A" };
  }

  // 2. Calendar mapping normalization
  if (!normalized.calendar_map && raw.calendar_summary) {
    normalized.calendar_map = raw.calendar_summary.map(s => ({
      date: s.date,
      intensity: s.status === 'Busy' ? 'High' : s.status === 'Light' ? 'Medium' : 'Low',
      main_focus: "Study Session"
    }));
  }

  // 3. Detailed plan normalization
  if (!normalized.detailed_plan && raw.schedule) {
    normalized.detailed_plan = raw.schedule.map(s => ({
      day_name: s.day,
      formatted_date: s.date || "N/A",
      daily_goal: "Maximize Momentum",
      time_slots: (s.tasks || []).map(t => ({
        start_time: t.time,
        end_time: "Next Slot",
        task_title: t.title,
        priority: t.priority,
        action_step: t.description || "Refer to study materials"
      }))
    }));
  }

  // 4. Tips normalization
  if (!normalized.academic_tips && raw.smart_tips) {
    normalized.academic_tips = raw.smart_tips;
  } else if (!normalized.academic_tips) {
    normalized.academic_tips = [];
  }

  return normalized;
}

// --- Main Component ---

export default function PlanView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [editableWp, setEditableWp] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) fetchPlan();
  }, [id]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/momentum/workplans/single/${id}`);
      const data = await res.json();
      if (data.success) {
        const norm = normalizeWorkplan(data.data.workplan);
        setPlan({ ...data.data, workplan: norm });
        setEditableWp(norm);
      } else {
        toast.error("Plan not found");
        navigate("/momentum/vault");
      }
    } catch (err) {
      toast.error("Failed to fetch plan details");
      navigate("/momentum/vault");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`http://localhost:5000/api/momentum/workplans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workplan: editableWp })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Workplan updated successfully!");
        setPlan(data.data);
        setIsEditing(false);
      }
    } catch (err) {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const updateDetailedPlan = (dayIdx, slotIdx, field, value) => {
    const newDp = JSON.parse(JSON.stringify(editableWp.detailed_plan));
    if (slotIdx === null) {
        newDp[dayIdx].daily_goal = value;
    } else {
        newDp[dayIdx].time_slots[slotIdx][field] = value;
    }
    setEditableWp({ ...editableWp, detailed_plan: newDp });
  };

  if (loading) return <div style={styles.loading}>Strategizing your success...</div>;
  if (!plan || !editableWp) return (
     <div style={styles.loading}>
        <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40 }}>⚠️</div>
            <div>Plan data is unavailable or corrupted.</div>
            <button onClick={() => navigate("/momentum/vault")} style={{ ...styles.backBtn, marginTop: 20 }}>Return to Vault</button>
        </div>
     </div>
  );

  const wp = isEditing ? editableWp : plan.workplan;

  return (
    <div style={styles.container}>
      
      <div style={styles.main}>
        {/* Header Hero */}
        <div style={styles.hero}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                <button onClick={() => navigate("/momentum/vault")} style={styles.backBtn}>←</button>
                <h1 style={styles.heroTitle}>Academic Strategy</h1>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} style={styles.editBtn}>✏️ Modify Plan</button>
                ) : (
                    <>
                        <button onClick={() => { setIsEditing(false); setEditableWp(plan.workplan); }} style={styles.cancelBtn}>Cancel</button>
                        <button onClick={handleSave} disabled={saving} style={styles.saveBtn}>
                            {saving ? 'Saving...' : '✅ Save Strategy'}
                        </button>
                    </>
                )}
            </div>
          </div>
          
          <div style={styles.statGrid}>
            <StatCard 
                label={wp.summary?.scope_title || "Sessions"} 
                value={wp.summary?.scope_value || "N/A"} 
                icon="🎯" 
                gradient="linear-gradient(135deg, #1152D4, #3b82f6)"
            />
            <StatCard label={wp.summary?.effort_title || "Effort"} value={wp.summary?.effort_value || "N/A"} icon="⏳" />
            <StatCard label="Target Completion" value={wp.summary?.target_completion || "N/A"} icon="🏁" />
          </div>
        </div>

        <div style={styles.content}>
          <div style={styles.splitGrid}>
            {/* Detailed Workplan Section */}
            <div style={styles.timetableCol}>
                {/* Calendar Mapping Strip */}
                {wp.calendar_map && wp.calendar_map.length > 0 && (
                    <div style={styles.summaryStrip}>
                        {wp.calendar_map.map((day, i) => (
                            <div key={i} style={styles.summaryDay}>
                                <div style={styles.summaryDate}>{day.date ? new Date(day.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'N/A'}</div>
                                <div style={{
                                    ...styles.summaryStatus,
                                    background: day.intensity === 'High' ? '#ef4444' : day.intensity === 'Medium' ? '#3b82f6' : '#10b981'
                                }}>
                                    {day.intensity || 'Active'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <h2 style={styles.sectionTitle}>📅 Detailed Study Workplan</h2>
                
                {(!wp.detailed_plan || wp.detailed_plan.length === 0) && (
                    <div style={{ padding: 40, textAlign: 'center', background: '#fff', borderRadius: 20 }}>
                        No daily breakdown available for this plan.
                    </div>
                )}

                {wp.detailed_plan?.map((day, di) => (
                    <div key={di} style={styles.dayGroup}>
                        <div style={styles.dayHeader}>
                            <span style={styles.dayName}>{day.day_name}</span>
                            <span style={styles.dayDate}>{day.formatted_date}</span>
                        </div>
                        
                        <div style={styles.goalLine}>
                            <span style={{ fontWeight: 800, fontSize: 13, color: PRIMARY }}>GOAL:</span> 
                            {isEditing ? (
                                <input 
                                    style={styles.inlineInput} 
                                    value={day.daily_goal || ""} 
                                    onChange={(e) => updateDetailedPlan(di, null, 'daily_goal', e.target.value)}
                                />
                            ) : (
                                <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 600, color: '#475569' }}>{day.daily_goal || "Focus on tasks"}</span>
                            )}
                        </div>

                        <div style={styles.taskChain}>
                            {day.time_slots?.map((slot, si) => (
                                <div key={si} style={styles.taskBlock}>
                                    <div style={styles.taskTime}>
                                        <div style={styles.timeDot} />
                                        {slot.start_time}
                                    </div>
                                    <div style={styles.taskCard}>
                                        <div style={styles.taskHeaderRow}>
                                            {isEditing ? (
                                                <input 
                                                    style={{...styles.inlineInput, fontWeight: 800, fontSize: 14}} 
                                                    value={slot.task_title || ""} 
                                                    onChange={(e) => updateDetailedPlan(di, si, 'task_title', e.target.value)}
                                                />
                                            ) : (
                                                <div style={styles.taskMainTitle}>{slot.task_title}</div>
                                            )}
                                            <PriorityBadge level={slot.priority} />
                                        </div>
                                        
                                        <div style={{ marginBottom: 12 }}>
                                            <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Action Step</div>
                                            {isEditing ? (
                                                <textarea 
                                                    style={{...styles.inlineTextarea}} 
                                                    value={slot.action_step || ""} 
                                                    onChange={(e) => updateDetailedPlan(di, si, 'action_step', e.target.value)}
                                                />
                                            ) : (
                                                <div style={styles.taskDesc}>{slot.action_step}</div>
                                            )}
                                        </div>

                                        <div style={styles.taskFooter}>
                                            <span style={styles.durationTag}>⏱️ {slot.start_time} {slot.end_time ? ` - ${slot.end_time}` : ''}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Strategist Tips Section */}
            <div style={styles.tipsCol}>
                <div style={styles.card}>
                    <h2 style={styles.sectionTitle}>🎓 Success Strategy Tips</h2>
                    {(!wp.academic_tips || wp.academic_tips.length === 0) && <div style={{ fontSize: 12, color: '#94a3b8' }}>No tips for this plan.</div>}
                    {wp.academic_tips?.map((tip, i) => (
                        <div key={i} style={styles.tipBlock}>
                            <div style={styles.tipIcon}>🛡️</div>
                            <div style={styles.tipText}>{tip}</div>
                        </div>
                    ))}
                </div>

                <div style={{...styles.card, marginTop: 20, background: '#fef2f2', borderColor: '#fecaca'}}>
                    <h2 style={{...styles.sectionTitle, color: '#991b1b'}}>⚠️ Risk Management</h2>
                    <p style={{fontSize: 12, color: '#7f1d1d', marginBottom: 15, lineHeight: 1.5}}>Delete this strategy if it no longer aligns with your goals. This action is irreversible.</p>
                    <button style={styles.deleteBtn} onClick={() => {
                        if(window.confirm("Delete strategy?")) {
                            fetch(`http://localhost:5000/api/momentum/workplans/${id}`, { method: 'DELETE' })
                            .then(() => navigate('/momentum/vault'));
                        }
                    }}>Exterminate Plan</button>
                </div>
                
                <button onClick={() => window.print()} style={styles.printBtn}>
                    🖨️ Export PDF Timetable
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", minHeight: "100vh", backgroundColor: BACKGROUND },
  main: { flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" },
  loading: { height: '100vh', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: PRIMARY, background: BACKGROUND },
  hero: { 
    background: '#fff', 
    padding: '40px 50px', 
    borderBottom: '1px solid #e2e8f0' 
  },
  heroTitle: { fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0 },
  backBtn: { background: '#f1f5f9', border: 'none', padding: '8px 12px', borderRadius: 10, cursor: 'pointer', fontWeight: 'bold' },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 },
  statCard: { padding: 24, borderRadius: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' },
  statLabel: { fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  statValue: { fontSize: 18, fontWeight: 900 },
  content: { padding: '40px 50px' },
  summaryStrip: { display: 'flex', gap: 12, marginBottom: 40, overflowX: 'auto', paddingBottom: 15 },
  summaryDay: { background: '#fff', padding: '15px 20px', borderRadius: 16, minWidth: 90, textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' },
  summaryDate: { fontSize: 11, fontWeight: 800, color: '#64748b', marginBottom: 8 },
  summaryStatus: { fontSize: 10, color: '#fff', padding: '3px 8px', borderRadius: 8, fontWeight: 'bold' },
  splitGrid: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 40 },
  timetableCol: { display: 'flex', flexDirection: 'column', gap: 40 },
  sectionTitle: { fontSize: 18, fontWeight: 900, color: '#0f172a', marginBottom: 25, display: 'flex', alignItems: 'center', gap: 12 },
  dayGroup: { position: 'relative', marginBottom: 10 },
  dayHeader: { display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 15 },
  dayName: { fontSize: 20, fontWeight: 900, color: '#1e293b' },
  dayDate: { fontSize: 13, color: '#94a3b8', fontWeight: 600 },
  goalLine: { background: '#fff', border: '1px solid #e2e8f0', padding: '10px 15px', borderRadius: 12, marginBottom: 20, display: 'flex', alignItems: 'center' },
  taskChain: { display: 'flex', flexDirection: 'column', gap: 0, paddingLeft: 12, borderLeft: `2px dashed #cbd5e1` },
  taskBlock: { paddingLeft: 35, position: 'relative', marginBottom: 25 },
  taskTime: { position: 'absolute', left: -90, top: 22, fontSize: 11, fontWeight: 900, color: '#64748b', textAlign: 'right', width: 75 },
  timeDot: { position: 'absolute', left: 86, top: 4, width: 12, height: 12, borderRadius: '50%', backgroundColor: '#fff', border: `3px solid ${PRIMARY}` },
  taskCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '22px 26px', boxShadow: '0 4px 6px rgba(0,0,0,0.01)', transition: 'all 0.2s' },
  taskHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15, gap: 10 },
  taskMainTitle: { fontSize: 15, fontWeight: 800, color: '#1e293b', flex: 1 },
  taskDesc: { fontSize: 13, color: '#475569', marginBottom: 15, lineHeight: 1.6, fontWeight: 500 },
  taskFooter: { display: 'flex', gap: 15 },
  durationTag: { fontSize: 11, fontWeight: 800, color: PRIMARY, background: '#eff6ff', padding: '5px 10px', borderRadius: 8 },
  badge: { padding: '5px 12px', borderRadius: 20, fontSize: 10, fontWeight: 900, textTransform: 'uppercase' },
  tipsCol: { display: 'flex', flexDirection: 'column', gap: 24 },
  card: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 25, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' },
  tipBlock: { display: 'flex', gap: 15, marginBottom: 20 },
  tipIcon: { fontSize: 18, padding: '8px', background: '#f8fafc', borderRadius: 12 },
  tipText: { fontSize: 13, color: '#334155', lineHeight: 1.6, fontWeight: 600 },
  editBtn: { padding: '10px 20px', borderRadius: 12, border: `1.5px solid ${PRIMARY}`, background: '#fff', color: PRIMARY, fontWeight: 800, fontSize: 13, cursor: 'pointer' },
  saveBtn: { padding: '10px 22px', borderRadius: 12, border: 'none', background: PRIMARY, color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 10px rgba(17, 82, 212, 0.2)' },
  cancelBtn: { padding: '10px 20px', borderRadius: 12, border: 'none', background: '#f1f5f9', color: '#64748b', fontWeight: 800, fontSize: 13, cursor: 'pointer' },
  deleteBtn: { width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: '#dc2626', color: '#fff', fontWeight: 'bold', fontSize: 13, cursor: 'pointer' },
  printBtn: { width: '100%', padding: '16px', borderRadius: 16, border: 'none', background: '#0f172a', color: '#fff', fontWeight: 'bold', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 },
  inlineInput: { width: '100%', border: `1.5px solid ${PRIMARY}`, borderRadius: 8, padding: '6px 10px', fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#f8fafc' },
  inlineTextarea: { width: '100%', border: `1.5px solid ${PRIMARY}`, borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none', fontFamily: 'inherit', minHeight: 60, resize: 'vertical', background: '#f8fafc' },
};
