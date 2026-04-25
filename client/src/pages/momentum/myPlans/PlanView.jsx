import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import "./myPlans.css";

const PRIMARY = "#1152D4";

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

const SLOT_STYLES = {
    work: {
        card:      { background: '#eff6ff', border: '1px solid #bfdbfe', borderLeft: '4px solid #1152D4' },
        timeColor:  '#1152D4',
        titleColor: '#1e293b',
        icon:       '📘',
        badge:     { background: '#dbeafe', color: '#1d4ed8', label: 'Work' },
    },
    break: {
        card:      { background: '#f0fdf4', border: '1px solid #bbf7d0', borderLeft: '4px solid #22c55e' },
        timeColor:  '#15803d',
        titleColor: '#166534',
        icon:       '☕',
        badge:     { background: '#dcfce7', color: '#15803d', label: 'Break' },
    },
    event: {
        card:      { background: '#fffbeb', border: '1px solid #fde68a', borderLeft: '4px solid #f59e0b' },
        timeColor:  '#b45309',
        titleColor: '#92400e',
        icon:       '📌',
        badge:     { background: '#fef3c7', color: '#b45309', label: 'Fixed' },
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

    return (
        <div className="page-container" style={{ padding: '0 0 40px', background: '#f5f7fc' }}>

            {/* ── Header ── */}
            <div style={{ padding: '24px 32px 0', background: '#fff', borderBottom: '1px solid #e1e7f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                        <button onClick={() => navigate('/momentum/vault')} style={{ background: 'none', border: 'none', color: PRIMARY, fontWeight: 700, fontSize: 13, cursor: 'pointer', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            ← Academic Vault
                        </button>
                        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Performance Board</h1>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button className="action-btn-outline" onClick={handleModifyRedirect}>⚙️ Modify Strategy</button>
                        <button className="action-btn-primary" style={{ background: PRIMARY, color: '#fff' }} onClick={() => window.print()}>Print Board</button>
                    </div>
                </div>

                {/* ── Slot type legend ── */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', paddingBottom: 14 }}>
                    {Object.entries(SLOT_STYLES).map(([type, s]) => (
                        <div key={type} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: s.badge.background, color: s.badge.color,
                            padding: '4px 12px', borderRadius: 20,
                            fontSize: 12, fontWeight: 700,
                        }}>
                            <span>{s.icon}</span> {s.badge.label}
                        </div>
                    ))}
                    <div style={{ fontSize: 11, color: '#94a3b8', marginLeft: 4 }}>— slot types</div>
                </div>

                {/* ── Deadline roadmap ── */}
                {fullData?.inputs?.tasks && (
                    <div style={{ borderTop: '1px solid #f1f5f9', padding: '14px 0', overflowX: 'auto', display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', whiteSpace: 'nowrap' }}>⏰ DEADLINES:</div>
                        {[...fullData.inputs.tasks]
                            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                            .map((t, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', padding: '4px 12px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                                    <span style={{ fontSize: 12, fontWeight: 800, color: '#dc2626' }}>🚩 {t.name}</span>
                                    <span style={{ fontSize: 11, color: '#ef4444' }}>
                                        ({new Date(t.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})
                                    </span>
                                </div>
                            ))}
                    </div>
                )}
            </div>

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
                        <div style={{ padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {day.time_slots.map((slot, sIdx) => {
                                const type = getSlotType(slot.task_title);
                                const s = SLOT_STYLES[type];
                                return (
                                    <div key={sIdx} style={{ padding: '10px 12px', borderRadius: 10, ...s.card }}>

                                        {/* Time row + type badge */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                                            <div style={{ fontSize: 10, fontWeight: 800, color: s.timeColor, letterSpacing: '0.03em' }}>
                                                {slot.start_time} – {slot.end_time}
                                            </div>
                                            <div style={{
                                                fontSize: 9, fontWeight: 800, letterSpacing: '0.05em',
                                                padding: '2px 8px', borderRadius: 4,
                                                background: s.badge.background, color: s.badge.color,
                                            }}>
                                                {s.icon} {s.badge.label.toUpperCase()}
                                            </div>
                                        </div>

                                        {/* Task title */}
                                        <div style={{ fontSize: 13, fontWeight: 800, color: s.titleColor, lineHeight: 1.3 }}>
                                            {slot.task_title}
                                        </div>

                                        {/* Action step — work slots only */}
                                        {type === 'work' && slot.action_step && (
                                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, lineHeight: 1.45 }}>
                                                {slot.action_step}
                                            </div>
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
