import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import "./myPlans.css";

const PRIMARY = "#1152D4";

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
            {/* Header */}
            <div style={{ padding: '24px 32px 0', background: '#fff', borderBottom: '1px solid #e1e7f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
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

                {/* Milestone Ruler */}
                {fullData?.inputs?.tasks && (
                    <div style={{ borderTop: '1px solid #f1f5f9', padding: '16px 0', overflowX: 'auto', display: 'flex', gap: 20, alignItems: 'center' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', whiteSpace: 'nowrap' }}>⏰ DEADLINE ROADMAP:</div>
                        {fullData.inputs.tasks.sort((a,b) => new Date(a.deadline) - new Date(b.deadline)).map((t, i) => (
                             <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', padding: '4px 12px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                                 <span style={{ fontSize: 12, fontWeight: 800, color: '#dc2626' }}>🚩 {t.name}</span>
                                 <span style={{ fontSize: 11, color: '#ef4444' }}>({new Date(t.deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})})</span>
                             </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Kanban Board */}
            <div style={{ display: 'flex', gap: 20, padding: '24px 32px', overflowX: 'auto', minHeight: '60vh' }}>
                {days.map((day, idx) => (
                    <div key={idx} style={{ minWidth: 300, background: '#eff6ff', borderRadius: 16, display: 'flex', flexDirection: 'column', border: '1px solid #dbeafe' }}>
                        <div style={{ background: 'linear-gradient(135deg, #1152D4 0%, #0e378b 100%)', padding: '16px', borderRadius: '16px 16px 0 0', color: '#fff' }}>
                            <div style={{ fontWeight: 800, fontSize: 14 }}>{day.day_name}</div>
                            <div style={{ fontSize: 11, opacity: 0.8 }}>{day.formatted_date}</div>
                        </div>
                        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {day.time_slots.map((slot, sIdx) => (
                                <div key={sIdx} className="card" style={{ margin: 0, padding: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                    <div style={{ fontSize: 10, fontWeight: 800, color: PRIMARY, marginBottom: 4 }}>{slot.start_time} - {slot.end_time}</div>
                                    <h4 style={{ fontSize: 13, fontWeight: 800, margin: '0 0 4px' }}>{slot.task_title}</h4>
                                    <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{slot.action_step}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
