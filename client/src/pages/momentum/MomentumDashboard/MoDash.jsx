import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api/axios";
import "./MoDash.css";

const PRIMARY = "#1152D4";

const quickLinks = [
  {
    icon: "🗺️",
    title: "Work Plans",
    desc: "Dissect courses into actionable weekly milestones.",
    btn: "Create Plan",
    path: "/momentum/workplan",
    dark: false,
  },
  {
    icon: "📂",
    title: "My Plans",
    desc: "Access your saved academic vaults and track your roadmap.",
    btn: "View Vault",
    path: "/momentum/vault",
    dark: true,
  },
  {
    icon: "🧠",
    title: "Learning Journal",
    desc: "Reflect on your daily progress and jot down insights.",
    btn: "Open Journal",
    path: "/momentum/learning-journal",
    dark: false,
  },
  {
    icon: "⏱️",
    title: "Study Tracker",
    desc: "Log focus hours and manage your micro-tasks.",
    btn: "Track Tasks",
    path: "/momentum/tracker",
    dark: true,
  },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ title, value, delta, positive }) {
  const isNull = positive === null;
  return (
    <div className="dm-stat-card">
      <div className="dm-stat-top">
        <div className="dm-stat-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
        </div>
        <span className={`dm-delta ${isNull ? 'dm-delta--neu' : positive ? 'dm-delta--pos' : 'dm-delta--neg'}`}>
          {delta}
        </span>
      </div>
      <div className="dm-stat-label">{title}</div>
      <div className="dm-stat-value">{value}</div>
    </div>
  );
}

// ─── Custom Bar Tooltip ───────────────────────────────────────────────────────
const BarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="dm-tooltip">
        <div className="dm-tooltip-label">{label}</div>
        <div className="dm-tooltip-val">{payload[0].value}h Tracked</div>
      </div>
    );
  }
  return null;
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function MomentumDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    weeklyProductivity: { value: "0%", delta: "-", positive: null },
    studyCompletion: { value: "0%", delta: "-", positive: null },
    deepFocusHours: { value: "0h", delta: "-", positive: null },
    activeAssignments: { value: "0", delta: "-", positive: null },
  });
  const [weekly, setWeekly] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [completionRate, setCompletionRate] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const res = await api.get("/momentum/study-tasks");
      const tasks = res.data.data || [];

      // Calculate Aggregate Stats
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === "Completed").length;
      const pending = tasks.filter(t => t.status === "Pending").length;
      const rate = total ? (completed / total) * 100 : 0;
      const totalFocus = tasks.reduce((sum, t) => sum + (t.timeTracked || 0), 0) / 60;
      const avgProd = total ? tasks.reduce((sum, t) => sum + (t.prodScore || 0), 0) / total : 0;

      setCompletionRate(rate);
      setStats({
        weeklyProductivity: { value: `${avgProd.toFixed(0)}%`, delta: avgProd >= 80 ? "Optimal" : "Average", positive: avgProd >= 80 },
        studyCompletion: { value: `${rate.toFixed(0)}%`, delta: "Completion", positive: rate >= 70 },
        deepFocusHours: { value: `${totalFocus.toFixed(1)}h`, delta: "Total", positive: true },
        activeAssignments: { value: pending.toString(), delta: "Pending", positive: pending === 0 },
      });

      // Weekly Distribution
      const days = { 0: "SUN", 1: "MON", 2: "TUE", 3: "WED", 4: "THU", 5: "FRI", 6: "SAT" };
      const weekMap = { MON: 0, TUE: 0, WED: 0, THU: 0, FRI: 0, SAT: 0, SUN: 0 };
      tasks.forEach(t => {
        const d = new Date(t.taskDate || t.createdAt).getDay();
        weekMap[days[d]] += (t.timeTracked || 0) / 60;
      });
      setWeekly(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(d => ({
        day: d, hours: Number(weekMap[d].toFixed(1)),
      })));

      // Monthly Trend (Simulated)
      setMonthly([
        { week: "Wk 1", completion: Number((rate * 0.4).toFixed(0)) },
        { week: "Wk 2", completion: Number((rate * 0.7).toFixed(0)) },
        { week: "Wk 3", completion: Number((rate * 0.9).toFixed(0)) },
        { week: "Wk 4", completion: Number(rate.toFixed(0)) },
      ]);

      setLoading(false);
    } catch (err) {
      console.error("Dashboard Error:", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const onFocus = () => loadData();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadData]);

  return (
    <div className="dm-main">
      {/* Hero Banner */}
      <div className="dm-hero">
        <div className="dm-hero-top">
          <div>
            <h1 className="dm-hero-title">
              Keep the momentum going, <span className="gradient-text" style={{ filter: 'brightness(1.5)' }}>{user?.name?.split(' ')[0] || 'Scholar'}</span>! 🚀
            </h1>
            <div className="dm-hero-cards">
              <div className="dm-hero-card">
                <div className="dm-hero-card-title">Study Efficiency</div>
                <div className="dm-hero-card-desc">Your average productivity is currently {stats.weeklyProductivity.value}.</div>
              </div>
              <div className="dm-hero-card">
                <div className="dm-hero-card-title">Current Goal</div>
                <div className="dm-hero-card-desc">You have {stats.activeAssignments.value} pending tasks in your tracker.</div>
              </div>
            </div>
          </div>
          <div className="dm-hero-actions">
            <button className="dm-hero-icon-btn" title="Settings">⚙️</button>
          </div>
        </div>
        <div className="dm-hero-lamp"></div>
      </div>

      <div className="dm-content">
        {/* Stats Row */}
        <div className="dm-stats">
          <StatCard title="Productivity" {...stats.weeklyProductivity} />
          <StatCard title="Completion" {...stats.studyCompletion} />
          <StatCard title="Focus Hours" {...stats.deepFocusHours} />
          <StatCard title="Active Tasks" {...stats.activeAssignments} />
        </div>

        {/* Charts Row */}
        <div className="dm-charts">
          <div className="dm-chart-card">
            <div className="dm-chart-header">
              <div>
                <div className="dm-chart-title">Weekly Distribution</div>
                <div className="dm-chart-sub">Tracked hours per day</div>
              </div>
              <button className="dm-chip-btn" onClick={() => navigate('/momentum/tracker')}>Analyzer</button>
            </div>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={weekly} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11, fontWeight: 600 }} />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: "var(--bg-glass)" }} content={<BarTooltip />} />
                  <Bar dataKey="hours" fill="var(--indigo)" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="dm-chart-card">
            <div className="dm-chart-header">
              <div>
                <div className="dm-chart-title">Academic Resilience</div>
                <div className="dm-chart-sub">Cumulative completion rate</div>
              </div>
              <div className="dm-badge-blue"><span className="dm-badge-dot"></span> {completionRate.toFixed(0)}% Done</div>
            </div>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <AreaChart data={monthly} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--indigo)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--indigo)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11, fontWeight: 600 }} />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip />
                  <Area type="monotone" dataKey="completion" stroke="var(--indigo)" strokeWidth={3} fill="url(#colorGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Productivity Suite */}
        <div>
          <h2 className="dm-section-title">Productivity Suite</h2>
          <div className="dm-hacks" style={{ marginTop: 20 }}>
            {quickLinks.map((link, idx) => (
              <div key={idx} className="dm-hack-card">
                <div className="dm-hack-icon-wrap">{link.icon}</div>
                <div className="dm-hack-title">{link.title}</div>
                <div className="dm-hack-desc">{link.desc}</div>
                <button
                  className="dm-hack-btn"
                  style={{ background: link.dark ? "var(--bg-elevated)" : "var(--indigo)", color: link.dark ? "var(--text-primary)" : "#fff", border: link.dark ? "1px solid var(--border)" : "none" }}
                  onClick={() => navigate(link.path)}
                >
                  {link.btn}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
