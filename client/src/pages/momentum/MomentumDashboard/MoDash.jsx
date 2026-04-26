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
import { format, subDays, isSameDay, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api/axios";
import "./MoDash.css";
import studyImg from "../../../assets/collaborative_study.png";

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

      // 2. Weekly Bar Chart (Rolling last 7 days)
      const wData = [...Array(7)].map((_, i) => {
        const d = subDays(new Date(), 6 - i);
        return {
          day: format(d, "EEE").toUpperCase(),
          fullDate: d,
          hours: 0
        };
      });

      tasks.forEach(t => {
        const tDate = new Date(t.taskDate || t.createdAt);
        const dayMatch = wData.find(w => isSameDay(w.fullDate, tDate));
        if (dayMatch) {
          dayMatch.hours += (t.timeTracked || 0) / 60;
        }
      });

      setWeekly(wData.map(d => ({ day: d.day, hours: Number(d.hours.toFixed(1)) })));

      // 3. Monthly Progression (Last 4 weeks)
      const mData = [3, 2, 1, 0].map(wOffset => {
        const end = endOfDay(subDays(new Date(), wOffset * 7));
        const start = startOfDay(subDays(end, 6));
        
        const weekTasks = tasks.filter(t => 
          isWithinInterval(new Date(t.taskDate || t.createdAt), { start, end })
        );
        
        const wTotal = weekTasks.length;
        const wCompleted = weekTasks.filter(t => t.status === "Completed").length;
        const wRate = wTotal ? (wCompleted / wTotal) * 100 : 0;

        return {
          week: `Week ${4 - wOffset}`,
          completion: Number(wRate.toFixed(1))
        };
      });
      
      setMonthly(mData);
      setLoading(false);
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
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
      {/* Smart Learning Hub Banner */}
      <div className="dm-banner">
        <div className="dm-banner-circle-1" />
        <div className="dm-banner-circle-2" />
        
        <div className="dm-banner-left">
          <h1 className="dm-banner-title">Momentum</h1>
          <p className="dm-banner-subtitle" style={{ color: '#fff', opacity: 1 }}>
            Keep the momentum going, <span style={{ fontWeight: 800, textDecoration: 'underline' }}>{user?.name?.split(' ')[0] || 'Scholar'}</span>! 
            Collaborate with peers, share knowledge, and access academic resources in one integrated platform.
          </p>
        </div>

        <div className="dm-banner-right">
          <div className="dm-banner-img-frame">
            <img src={studyImg} alt="Students studying" className="dm-banner-img" />
          </div>
        </div>
      </div>

      <div className="dm-content">
        {/* Stats Row */}
        <div className="dm-stats" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
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
                <BarChart data={weekly} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    interval={0} 
                    padding={{ left: 10, right: 10 }}
                    tick={{ fill: "var(--text-muted)", fontSize: 11, fontWeight: 600 }} 
                  />
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
                <AreaChart data={monthly} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--indigo)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--indigo)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis 
                    dataKey="week" 
                    axisLine={false} 
                    tickLine={false} 
                    padding={{ left: 15, right: 15 }}
                    tick={{ fill: "var(--text-muted)", fontSize: 11, fontWeight: 600 }} 
                  />
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
          <div className="dm-hacks" style={{ marginTop: 20, gridTemplateColumns: "repeat(4, 1fr)" }}>
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
