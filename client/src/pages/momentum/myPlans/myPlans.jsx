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
            console.warn("Vault: No user found in AuthContext");
            setLoading(false);
        }
    }, [user]);

    const fetchPlans = async (userId) => {
        try {
            console.log("Vault: Fetching plans for user:", userId);
            setLoading(true);
            const res = await api.get(`/momentum/workplans/user/${userId}`);
            console.log("Vault: API Response:", res.data);
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
                {filtered.map((item) => {
                    const wp = item.workplan;
                    const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, { 
                        month: 'short', day: 'numeric', year: 'numeric' 
                    });
                    
                    const title = wp.summary?.scope_value || "Academic Strategy";
                    const effort = wp.summary?.effort_value || "Pending";
                    const completion = wp.summary?.target_completion || "In Progress";
                    const mainFocus = wp.calendar_map?.[0]?.main_focus || "General Study";

                    return (
                        <div key={item._id} className="card" style={{ transition: 'transform 0.2s', cursor: 'default' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <div style={{ background: `${PRIMARY}15`, color: PRIMARY, padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>
                                        Active
                                    </div>
                                    <span style={{ fontSize: 12, color: '#94a3b8' }}>Created: {dateStr}</span>
                                </div>
                                <button onClick={() => handleDelete(item._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4 }}>✕</button>
                            </div>
                            
                            <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px', color: '#111' }}>{title}</h3>
                            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 20px' }}>Primary Focus: <span style={{ fontWeight: 700, color: '#334155' }}>{mainFocus}</span></p>
                            
                            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                                <div style={{ flex: 1, background: '#f8fafc', padding: '10px', borderRadius: 10 }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 }}>Effort</div>
                                    <div style={{ fontSize: 13, fontWeight: 800 }}>{effort}</div>
                                </div>
                                <div style={{ flex: 1.2, background: '#f8fafc', padding: '10px', borderRadius: 10 }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 }}>Completion</div>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: PRIMARY }}>{completion}</div>
                                </div>
                            </div>

                            <button 
                                className="action-btn-primary" 
                                style={{ width: '100%', background: PRIMARY, color: '#fff', padding: '12px 0' }}
                                onClick={() => navigate(`/momentum/vault/${item._id}`)}
                            >
                                VIEW DETAILED PLAN
                            </button>
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
