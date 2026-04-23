import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../sidebar/sidebar";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";

const PRIMARY = "#1152D4";

export default function Planner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      fetchPlans();
    }
  }, [user]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/momentum/workplans/${user._id}`);
      const data = await res.json();
      if (data.success) {
        setPlans(data.data);
      }
    } catch (err) {
      toast.error("Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/momentum/workplans/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Plan deleted");
        setPlans(plans.filter(p => p._id !== id));
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: PRIMARY, marginBottom: 10 }}>Academic Vault</div>
        <div style={{ color: '#666' }}>Loading your study plans...</div>
      </div>
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', sans-serif",
        backgroundColor: "#F3F4F6",
      }}
    >
      <div style={{ display: "flex", flex: 1 }}>
        
        <div style={styles.main}>
          <div style={styles.hero}>
            <div>
              <h1 style={styles.heroTitle}>Academic Vault</h1>
              <p style={styles.heroSub}>
                Access and manage your high-momentum study plans.
              </p>
            </div>
            <button 
                onClick={() => navigate('/momentum/workplan')}
                style={styles.submitBtn}
            >
                + New Plan
            </button>
          </div>

          <div style={{ padding: "40px 50px" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>🗂 Your Saved Plans</h2>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Total Plans: {plans.length}</div>
            </div>
            
            {plans.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px 0', background: '#fff', borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <div style={{ fontSize: 48, marginBottom: 20 }}>📂</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>No plans generated yet.</div>
                    <div style={{ fontSize: 14, color: '#64748b', marginTop: 8, maxWidth: 300, margin: '8px auto 0' }}>
                        Generate your first AI-powered study plan to start building your academic momentum.
                    </div>
                </div>
            ) : (
                <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", 
                    gap: 24 
                }}>
                    {plans.map(p => (
                        <div 
                            key={p._id} 
                            onClick={() => navigate(`/momentum/vault/${p._id}`)}
                            style={{
                                background: '#fff',
                                borderRadius: 24,
                                padding: 28,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                border: '1px solid #f1f5f9',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-6px)';
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.06)';
                                e.currentTarget.style.borderColor = PRIMARY;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)';
                                e.currentTarget.style.borderColor = '#f1f5f9';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ 
                                        display: 'inline-block',
                                        background: '#eff6ff',
                                        color: PRIMARY, 
                                        fontSize: 10, 
                                        fontWeight: 800, 
                                        textTransform: 'uppercase',
                                        letterSpacing: 1,
                                        padding: '4px 10px',
                                        borderRadius: 8,
                                        marginBottom: 12
                                    }}>
                                        {p.workplan?.summary?.scope_value || "Study Plan"}
                                    </div>
                                    <div style={{ fontWeight: 900, fontSize: 18, color: '#0f172a', marginBottom: 6 }}>
                                        {new Date(p.createdAt).toLocaleDateString('en-US', { 
                                            month: 'long', 
                                            day: 'numeric', 
                                            year: 'numeric' 
                                        })}
                                    </div>
                                    <div style={{ fontSize: 13, color: '#64748b', display: 'flex', gap: 16, marginTop: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span>⏱️</span> {p.workplan?.summary?.effort_value || "TBD"}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span>📅</span> Ends {p.workplan?.summary?.target_completion || "N/A"}
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDelete(p._id); }}
                                    style={{ 
                                        background: '#fff1f2', 
                                        border: 'none', 
                                        padding: 10, 
                                        borderRadius: 12,
                                        color: '#ef4444', 
                                        cursor: 'pointer',
                                        fontSize: 16,
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#fff1f2'}
                                >
                                    🗑
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  main: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column"
  },
  hero: {
    background: '#fff',
    padding: "40px 50px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: '1px solid #e2e8f0'
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 900,
    color: '#0f172a',
    margin: "0 0 6px",
    letterSpacing: "-0.5px"
  },
  heroSub: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: 500,
    margin: 0
  },
  submitBtn: {
    padding: "14px 28px",
    borderRadius: 14,
    border: "none",
    background: PRIMARY,
    color: "#fff",
    fontWeight: 800,
    fontSize: 14,
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(17, 82, 212, 0.2)",
    transition: 'all 0.2s'
  }
};
