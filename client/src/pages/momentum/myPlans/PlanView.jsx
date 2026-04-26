import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import "./myPlans.css";

const PRIMARY = "#1152D4";

// ── Unique accent palette — one per task ──
const TASK_PALETTE = [
    { accent: '#6366f1', light: '#eef2ff', border: '#c7d2fe', text: '#4338ca' }, // indigo
    { accent: '#ec4899', light: '#fdf2f8', border: '#fbcfe8', text: '#be185d' }, // pink
    { accent: '#8b5cf6', light: '#f5f3ff', border: '#ddd6fe', text: '#6d28d9' }, // violet
    { accent: '#0ea5e9', light: '#f0f9ff', border: '#bae6fd', text: '#0369a1' }, // sky
    { accent: '#06b6d4', light: '#ecfeff', border: '#a5f3fc', text: '#0891b2' }, // cyan
    { accent: '#f43f5e', light: '#fff1f2', border: '#fecdd3', text: '#e11d48' }, // rose
    { accent: '#d946ef', light: '#fdf4ff', border: '#f5d0fe', text: '#a21caf' }, // fuchsia
    { accent: '#3b82f6', light: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' }, // blue
];

// ── Slot type classifier ──
function getSlotType(title = "") {
    const t = title.toLowerCase();
    if (
        t.startsWith("break") || t === "rest" || t === "meal" ||
        t.includes("lunch") || t.includes("dinner") || t.includes("snack")
    ) return "break";
    if (t.startsWith("life event") || t.startsWith("fixed")) return "event";
    return "work";
}

const SLOT_BASE = {
    break: {
        card:      { background: '#f0fdf4', border: '1px solid #bbf7d0', borderLeft: '4px solid #22c55e' },
        timeColor:  '#15803d',
        titleColor: '#166534',
        icon: '☕',
        badge: { background: '#dcfce7', color: '#15803d', label: 'Break' },
    },
    event: {
        card:      { background: '#fffbeb', border: '1px solid #fde68a', borderLeft: '4px solid #f59e0b' },
        timeColor:  '#b45309',
        titleColor: '#92400e',
        icon: '📌',
        badge: { background: '#fef3c7', color: '#b45309', label: 'Fixed' },
    },
};

export default function PlanView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [fullData, setFullData] = useState(null);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchPlan(); }, [id]);

    const fetchPlan = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/momentum/workplans/single/${id}`);
            const data = res.data.data;
            setFullData(data);
            setPlan(data.workplan);
        } catch (err) {
            console.error("Error fetching plan:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleModifyRedirect = () => {
        if (!fullData?.inputs) { navigate('/momentum/workplan'); return; }
        navigate('/momentum/workplan', { state: { editData: fullData.inputs } });
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Optimizing Board...</div>;
    if (!plan) return <div style={{ padding: 40, textAlign: 'center' }}>Plan not found.</div>;

    const days = plan.detailed_plan || [];
    const inputTasks = fullData?.inputs?.tasks || [];

    // Build a task → palette color map
    const taskColorMap = {};
    inputTasks.forEach((t, i) => {
        taskColorMap[t.name] = TASK_PALETTE[i % TASK_PALETTE.length];
    });

    // Match a slot title to a task by substring
    function getTaskColor(slotTitle = "") {
        const lower = slotTitle.toLowerCase();
        for (const t of inputTasks) {
            if (lower.includes(t.name.toLowerCase()) || t.name.toLowerCase().includes(lower.split(' ')[0])) {
                return taskColorMap[t.name];
            }
        }
        // Default work color (blue)
        return { accent: PRIMARY, light: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' };
    }

    return (
        <div className="page-container" style={{ padding: '0 0 60px', background: '#f5f7fc' }}>

            {/* Momentum Banner */}
            <div className="dm-banner">
                <div className="dm-banner-circle-1" />
                <div className="dm-banner-circle-2" />
                
                <div className="dm-banner-left">
                    <button onClick={() => navigate('/momentum/vault')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', marginBottom: 16, padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        ← Academic Vault
                    </button>
                    <h1 className="dm-banner-title" style={{ color: '#fff', fontSize: '36px' }}>Performance Board</h1>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            📘 Work
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            ☕ Break
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            📌 Fixed
                        </div>
                    </div>
                </div>

                <div className="dm-banner-right" style={{ display: 'flex', gap: 12 }}>
                    <button className="dm-banner-btn" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }} onClick={handleModifyRedirect}>⚙️ Modify Strategy</button>
                    <button className="dm-banner-btn" onClick={() => window.print()}>Print Board</button>
                </div>
            </div>

            {/* ── Tasks & Deadlines panel ── */}
            {inputTasks.length > 0 && (
                <div style={{ margin: '24px 32px 0' }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                        🎯 Tasks in this Plan
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                        {[...inputTasks]
                            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                            .map((t, i) => {
                                const col = taskColorMap[t.name];
                                const daysLeft = t.deadline
                                    ? Math.ceil((new Date(t.deadline) - new Date()) / (1000 * 60 * 60 * 24))
                                    : null;
                                return (
                                    <div key={i} style={{
                                        background: col.light,
                                        border: `1px solid ${col.border}`,
                                        borderLeft: `5px solid ${col.accent}`,
                                        borderRadius: 12, padding: '14px 16px',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: col.accent, flexShrink: 0 }} />
                                                <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{t.name}</span>
                                            </div>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: col.text, background: col.border, padding: '2px 8px', borderRadius: 4 }}>
                                                {t.priority} Priority
                                            </span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>
                                                {t.deadline ? new Date(t.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}
                                            </div>
                                            {daysLeft !== null && (
                                                <div style={{ fontSize: 11, fontWeight: 700, marginTop: 2,
                                                    color: daysLeft <= 3 ? '#dc2626' : daysLeft <= 7 ? '#b45309' : '#64748b' }}>
                                                    {daysLeft > 0 ? `${daysLeft}d left` : daysLeft === 0 ? 'Due today' : 'Overdue'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}

            {/* ── Kanban Board ── */}
            <div style={{ display: 'flex', gap: 20, padding: '24px 32px', overflowX: 'auto', minHeight: '60vh' }}>
                {days.map((day, idx) => (
                    <div key={idx} style={{ minWidth: 300, background: '#f8fafc', borderRadius: 16, display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0' }}>

                        {/* Day header */}
                        <div style={{ background: 'linear-gradient(135deg, #1152D4 0%, #0e378b 100%)', padding: '14px 16px', borderRadius: '16px 16px 0 0', color: '#fff' }}>
                            <div style={{ fontWeight: 800, fontSize: 15 }}>{day.day_name}</div>
                            <div style={{ fontSize: 11, opacity: 0.75 }}>{day.formatted_date}</div>
                            {day.daily_goal && (
                                <div style={{ fontSize: 11, opacity: 0.8, marginTop: 6, fontStyle: 'italic', lineHeight: 1.4 }}>
                                    🎯 {day.daily_goal}
                                </div>
                            )}
                        </div>

                        {/* Slots */}
                        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {day.time_slots.map((slot, sIdx) => {
                                const type = getSlotType(slot.task_title);

                                // Non-work slots use fixed styles
                                if (type !== 'work') {
                                    const s = SLOT_BASE[type];
                                    return (
                                        <div key={sIdx} style={{ padding: '10px 12px', borderRadius: 10, ...s.card }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                                <div style={{ fontSize: 10, fontWeight: 800, color: s.timeColor }}>{slot.start_time} – {slot.end_time}</div>
                                                <div style={{ fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 4, background: s.badge.background, color: s.badge.color }}>
                                                    {s.icon} {s.badge.label.toUpperCase()}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: s.titleColor }}>{slot.task_title}</div>
                                        </div>
                                    );
                                }

                                // Work slots — match to a task color
                                const col = getTaskColor(slot.task_title);
                                return (
                                    <div key={sIdx} style={{
                                        padding: '10px 12px', borderRadius: 10,
                                        background: col.light,
                                        border: `1px solid ${col.border}`,
                                        borderLeft: `4px solid ${col.accent}`,
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                            <div style={{ fontSize: 10, fontWeight: 800, color: col.text }}>{slot.start_time} – {slot.end_time}</div>
                                            <div style={{ fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 4, background: col.border, color: col.text }}>
                                                📘 WORK
                                            </div>
                                        </div>
                                        <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>{slot.task_title}</div>
                                        {slot.action_step && (
                                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, lineHeight: 1.45 }}>{slot.action_step}</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
