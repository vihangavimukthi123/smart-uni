import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";
import "./myPlans.css";

const PRIMARY = "#1152D4";

export default function Planner() {
    const [plans, setPlans] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (user && user._id) {
            fetchPlans(user._id);
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchPlans = async (userId) => {
        try {
            setLoading(true);
            const res = await api.get(`/momentum/workplans/user/${userId}`);
            setPlans(res.data.data || []);
        } catch (err) {
            console.error("Vault: Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Move this strategy to archives?")) return;
        try {
            await api.delete(`/momentum/workplans/${id}`);
            setPlans(plans.filter(p => p._id !== id));
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    const filtered = plans.filter(p => {
        const title = p.workplan?.summary?.scope_value || "Strategy";
        return title.toLowerCase().includes(search.toLowerCase());
    });

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <div className="loader">Opening your vault...</div>
        </div>
    );

    return (
        <div className="page-container" style={{ padding: '0 0 40px', background: '#f5f7fc' }}>
            {/* Hero */}
            <div className="hero" style={{ padding: '40px 32px' }}>
                <div>
                    <h1 className="hero-title" style={{ fontSize: 28 }}>Academic Vault</h1>
                    <p className="hero-sub">Access your AI-driven performance strategies and study roadmaps.</p>
                </div>
                <button
                    onClick={() => navigate('/momentum/workplan')}
                    className="action-btn-primary"
                    style={{ background: '#fff', color: PRIMARY, border: 'none', padding: '12px 24px' }}
                >
                    + NEW PLAN
                </button>
            </div>

            {/* Toolbar */}
            <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: 320 }}>
                    <input
                        className="task-input"
                        placeholder="Search your strategies..."
                        style={{ paddingLeft: 40 }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <span style={{ position: 'absolute', left: 14, top: 12, opacity: 0.5 }}>🔍</span>
                </div>
                <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                    {filtered.length} STRATEGIES FOUND
                </div>
            </div>

            {/* Plan Grid */}
            <div style={{ padding: '0 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
                {filtered.map((item, idx) => {
                    const wp = item.workplan;
                    // Oldest plan = Plan 1, so reverse the index
                    const planNumber = filtered.length - idx;
                    const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', year: 'numeric'
                    });

                    // Count actual study slots (exclude Break / Life Event slots)
                    const allSlots = (wp?.detailed_plan || []).flatMap(d => d.time_slots || []);
                    const studySlots = allSlots.filter(s => {
                        const t = (s.task_title || '').toLowerCase();
                        return !t.startsWith('break') && !t.startsWith('life event');
                    });
                    const studyMethod = item.inputs?.studyInterval
                        ? (item.inputs.studyInterval.includes('Pomodoro') ? 'Pomodoro Sessions'
                            : item.inputs.studyInterval.includes('Deep') ? 'Deep Work Blocks'
                            : 'Study Sessions')
                        : 'Study Sessions';
                    const title = studySlots.length > 0
                        ? `${studySlots.length} ${studyMethod}`
                        : (wp?.summary?.scope_value || 'Academic Strategy');

                    const completion = wp?.summary?.target_completion;
                    const effort = wp?.summary?.effort_value || "—";

                    // Subtitle: first day's goal
                    const firstDay = wp?.detailed_plan?.[0];
                    const subtitle = firstDay?.daily_goal || firstDay?.time_slots?.[0]?.task_title || "General study session";

                    // Category badge: top task name only if it exists
                    const topTask = item.inputs?.tasks?.[0];
                    const categoryLabel = topTask?.name || null;

                    // Days left countdown
                    let daysLeft = null;
                    if (completion) {
                        const diff = Math.ceil((new Date(completion) - new Date()) / (1000 * 60 * 60 * 24));
                        daysLeft = diff;
                    }

                    // User initials (unused now but kept for future)
                    const _unused = item.inputs?.studentName;

                    return (
                        <div
                            key={item._id}
                            style={{
                                background: '#fff',
                                borderRadius: 16,
                                padding: '22px 24px',
                                boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                                border: '1px solid #e8eef7',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)'; }}
                        >
                            {/* Row 1: Plan number + Days left + Delete */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                <div style={{
                                    background: '#f1f5f9', color: '#475569',
                                    padding: '4px 10px', borderRadius: 6,
                                    fontSize: 11, fontWeight: 800, letterSpacing: '0.07em',
                                }}>
                                    PLAN {planNumber}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {daysLeft !== null && (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: 5,
                                            background: daysLeft <= 3 ? '#fff1f2' : '#fff7ed',
                                            color: daysLeft <= 3 ? '#dc2626' : '#c2410c',
                                            border: `1px solid ${daysLeft <= 3 ? '#fecaca' : '#fed7aa'}`,
                                            padding: '4px 10px', borderRadius: 6,
                                            fontSize: 12, fontWeight: 700,
                                        }}>
                                            <span>⏰</span>
                                            {daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`
                                                : daysLeft === 0 ? 'Due today' : 'Overdue'}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', fontSize: 17, padding: 0, lineHeight: 1 }}
                                    >✕</button>
                                </div>
                            </div>

                            {/* Row 2: Title */}
                            <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 6px', color: '#0f172a', lineHeight: 1.35 }}>
                                {title}
                            </h3>

                            {/* Row 3: Task chips — visually prominent */}
                            {item.inputs?.tasks?.length > 0 && (
                                <div style={{ margin: '12px 0 16px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                                    {item.inputs.tasks.map((t, i) => {
                                        const priorityColors = {
                                            High:   { bg: '#fff1f2', border: '#fecaca', dot: '#ef4444', label: '#dc2626' },
                                            Medium: { bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b', label: '#b45309' },
                                            Low:    { bg: '#f0fdf4', border: '#bbf7d0', dot: '#22c55e', label: '#15803d' },
                                        };
                                        const c = priorityColors[t.priority] || priorityColors.Low;
                                        return (
                                            <div key={i} style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                padding: '9px 12px',
                                                background: c.bg,
                                                border: `1px solid ${c.border}`,
                                                borderRadius: 10,
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{t.name}</span>
                                                    <span style={{ fontSize: 10, fontWeight: 800, color: c.label, background: c.border, padding: '2px 7px', borderRadius: 4 }}>
                                                        {t.priority}
                                                    </span>
                                                </div>
                                                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                    {t.deadline ? new Date(t.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Row 4: Metrics — clearly separated from tasks above */}
                            <div style={{ display: 'flex', gap: 8, marginBottom: 16, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                                <div style={{ flex: 1, background: '#f8fafc', border: '1px solid #f1f5f9', padding: '8px 10px', borderRadius: 8 }}>
                                    <div style={{ fontSize: 9, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Study Hours</div>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: '#1e293b', marginTop: 2 }}>{effort}</div>
                                </div>
                                <div style={{ flex: 1.2, background: '#f8fafc', border: '1px solid #f1f5f9', padding: '8px 10px', borderRadius: 8 }}>
                                    <div style={{ fontSize: 9, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Target</div>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: PRIMARY, marginTop: 2 }}>{completion || '—'}</div>
                                </div>
                                <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', padding: '8px 10px', borderRadius: 8, minWidth: 52, textAlign: 'center' }}>
                                    <div style={{ fontSize: 9, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Days</div>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: '#1e293b', marginTop: 2 }}>{wp?.detailed_plan?.length || '—'}</div>
                                </div>
                            </div>

                            {/* Row 5: Date line */}
                            <div style={{ fontSize: 11.5, color: '#94a3b8', marginBottom: 16 }}>📅 Created {dateStr}</div>

                            {/* Row 6: Action buttons */}
                            <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                                <button
                                    style={{
                                        flex: 1, padding: '11px 0', borderRadius: 10,
                                        fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                                        border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569',
                                        transition: 'all 0.15s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.color = '#b45309'; e.currentTarget.style.background = '#fffbeb'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = '#fff'; }}
                                    onClick={() => navigate('/momentum/workplan', { state: { editData: item.inputs } })}
                                >
                                    ✏️ Modify
                                </button>
                                <button
                                    style={{
                                        flex: 1.4, padding: '11px 0', borderRadius: 10,
                                        fontSize: 12.5, fontWeight: 800, cursor: 'pointer',
                                        border: 'none', background: PRIMARY, color: '#fff',
                                        transition: 'opacity 0.15s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
                                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                                    onClick={() => navigate(`/momentum/vault/${item._id}`)}
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    );
                })}

                {filtered.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
                        <h3>Vault Empty</h3>
                        <p>Generate your first success strategy to see it here.</p>
                        <button
                            className="action-btn-outline"
                            style={{ marginTop: 16 }}
                            onClick={() => navigate('/momentum/workplan')}
                        >
                            Create Strategy
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
