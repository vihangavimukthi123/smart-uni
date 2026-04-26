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
        const title = (p.workplan?.summary?.scope_value || "Strategy").toLowerCase();
        const s = search.toLowerCase();
        const matchesTitle = title.includes(s);
        const matchesTasks = (p.inputs?.tasks || []).some(t => t.name.toLowerCase().includes(s));
        return matchesTitle || matchesTasks;
    });

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <div className="loader">Opening your vault...</div>
        </div>
    );

    return (
        <div className="page-container" style={{ padding: '0 0 40px', background: '#f5f7fc' }}>
            {/* Momentum Banner ... */}
            <div className="dm-banner">
                <div className="dm-banner-circle-1" />
                <div className="dm-banner-circle-2" />
                
                <div className="dm-banner-left">
                    <h1 className="dm-banner-title" style={{ color: '#fff', fontSize: '36px' }}>Academic Vault</h1>
                    <p className="dm-banner-subtitle" style={{ color: '#fff', opacity: 1, margin: 0 }}>
                        Access your AI-driven performance strategies and study roadmaps.
                    </p>
                </div>

                <div className="dm-banner-right">
                    <button
                        onClick={() => navigate('/momentum/workplan')}
                        className="dm-banner-btn"
                        style={{ padding: '14px 28px' }}
                    >
                        + NEW PLAN
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: 360 }}>
                    <input
                        className="st-search-input"
                        placeholder="Search strategies or task names..."
                        style={{ 
                            background: '#fff',
                            border: '1px solid #e2e8f0',
                            padding: '14px 18px 14px 44px',
                            borderRadius: '16px',
                            fontSize: '14.5px',
                            width: '100%',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                            outline: 'none'
                        }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: '18px', opacity: 0.4 }}>🔍</span>
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 700, letterSpacing: '0.02em' }}>
                    {filtered.length} {filtered.length === 1 ? 'STRATEGY' : 'STRATEGIES'} FOUND
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

                            {/* Row 4: Metrics */}
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
