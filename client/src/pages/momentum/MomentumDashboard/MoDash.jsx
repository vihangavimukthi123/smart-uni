import { useState, useEffect } from "react";
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
import Sidebar from "../sidebar/sidebar";



const PRIMARY = "#1152D4";

const quickLinks = [
  {
    icon: "🗺️",
    title: "Generate Work Plans",
    desc: "Dissect courses into actionable weekly milestones and plans.",
    btn: "Create Plan",
    path: "/workplan",
    dark: false,
  },
  {
    icon: "📂",
    title: "My Plans",
    desc: "Access your saved academic vaults and keep track of your roadmap.",
    btn: "View Vault",
    path: "/vault",
    dark: true,
  },
  {
    icon: "🧠",
    title: "Learning Journal",
    desc: "Reflect on your daily progress and jot down key academic insights.",
    btn: "Open Journal",
    path: "/learning-journal",
    dark: false,
  },
  {
    icon: "⏱️",
    title: "Study Tracker",
    desc: "Log deep focus hours, manage your micro-tasks, and analyze productivity.",
    btn: "Track Tasks",
    path: "/tracker",
    dark: true,
  },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ title, value, delta, positive }) {
  const isNull = positive === null;
  return (
    <div style={styles.statCard}>
      <div style={styles.statTop}>
        <div style={styles.statIconWrap}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={PRIMARY}
            strokeWidth="2"
          >
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
        </div>
        <span
          style={{
            ...styles.delta,
            color: isNull ? "#888" : positive ? "#22c55e" : "#ef4444",
            background: isNull ? "#f3f4f6" : positive ? "#f0fdf4" : "#fef2f2",
          }}
        >
          {delta}
        </span>
      </div>
      <div style={styles.statLabel}>{title}</div>
      <div style={styles.statValue}>{value}</div>
    </div>
  );
}

// ─── Custom Bar Tooltip ───────────────────────────────────────────────────────
const BarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={styles.tooltip}>
        <div style={{ fontWeight: 700, color: PRIMARY }}>{label}</div>
        <div style={{ color: "#444", fontSize: 13 }}>{payload[0].value}h</div>
      </div>
    );
  }
  return null;
};

const AreaTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={styles.tooltip}>
        <div style={{ fontWeight: 700, color: PRIMARY }}>{label}</div>
        <div style={{ color: "#444", fontSize: 13 }}>{payload[0].value}%</div>
      </div>
    );
  }
  return null;
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function MomentumDashboard() {
  const [active, setActive] = useState("dashboard");
  const [stats, setStats] = useState({
    weeklyProductivity: { value: "0%", delta: "-", positive: null },
    studyCompletion: { value: "0%", delta: "-", positive: null },
    deepFocusHours: { value: "0h", delta: "-", positive: null },
    activeAssignments: { value: "0", delta: "-", positive: null },
  });
  const [weekly, setWeekly] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const { default: api } = await import("../../../api/axios.js");
        const res = await api.get("/momentum/study-tasks");
        const tasks = res.data.data || [];

        // 1. Calculate Aggregate Stats
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === "Completed").length;
        const pending = tasks.filter(t => t.status === "Pending").length;
        
        const completionRate = total ? (completed / total) * 100 : 0;
        const totalFocus = tasks.reduce((sum, t) => sum + (t.timeTracked || 0), 0) / 60;
        const avgProd = total ? tasks.reduce((sum, t) => sum + (t.prodScore || 0), 0) / total : 0;

        setStats({
          weeklyProductivity: { 
            value: `${avgProd.toFixed(1)}%`, 
            delta: avgProd >= 80 ? "High" : "Average", 
            positive: avgProd >= 80 
          },
          studyCompletion: { 
            value: `${completionRate.toFixed(1)}%`, 
            delta: "Lifetime", 
            positive: completionRate >= 70 
          },
          deepFocusHours: { 
            value: `${totalFocus.toFixed(1)}h`, 
            delta: "Total", 
            positive: true 
          },
          activeAssignments: { 
            value: pending.toString(), 
            delta: "Pending", 
            positive: pending > 0 ? null : true 
          },
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

        setWeekly(wData.map(d => ({ ...d, hours: Number(d.hours.toFixed(1)) })));

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
    };

    loadData();
  }, []);

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
      {/*<Navbar />*/}

      <div style={{ display: "flex", flex: 1 }}>
        

        <div style={styles.shell}>
          {/* ── Main ── */}
          <main style={styles.main}>
            {/* Hero */}
            <div style={styles.hero}>
              <div>
                <h1 style={styles.heroTitle}>
                  Keep the momentum going, Alex! 🚀
                </h1>
                <div style={styles.heroCards}>
                  <div style={styles.heroCard}>
                    <div style={styles.heroCardTitle}>
                      What is Productivity?
                    </div>
                    <div style={styles.heroCardDesc}>
                      Achieving your academic goals with focus and efficiency.
                      It's about working smarter, not harder.
                    </div>
                  </div>
                  <div style={styles.heroCard}>
                    <div style={styles.heroCardTitle}>Why keep it up?</div>
                    <div style={styles.heroCardDesc}>
                      Consistent momentum turns small wins into graduation
                      success and a balanced, rewarding life.
                    </div>
                  </div>
                </div>
              </div>
              <div style={styles.heroIcon}>💡</div>
            </div>

            {/* Stat Cards */}
            {loading ? (
              <div style={styles.loading}>Loading stats…</div>
            ) : (
              <div style={styles.statsRow}>
                <StatCard
                  title="Weekly Productivity"
                  {...stats.weeklyProductivity}
                />
                <StatCard title="Study Completion" {...stats.studyCompletion} />
                <StatCard title="Deep Focus Hours" {...stats.deepFocusHours} />
                <StatCard
                  title="Active Assignments"
                  {...stats.activeAssignments}
                />
              </div>
            )}

            {/* Charts Row */}
            <div style={styles.chartsRow}>
              {/* Bar Chart */}
              <div style={styles.chartCard}>
                <div style={styles.chartHeader}>
                  <div>
                    <div style={styles.chartTitle}>
                      Weekly Productivity Momentum
                    </div>
                    <div style={styles.chartSub}>
                      Activity across the last 7 days
                    </div>
                  </div>
                  <button style={styles.chipBtn}>Exam Prep Week ▾</button>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weekly} barSize={28}>
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip
                      content={<BarTooltip />}
                      cursor={{ fill: "rgba(17,82,212,0.05)" }}
                    />
                    <Bar
                      dataKey="hours"
                      fill={`${PRIMARY}55`}
                      radius={[6, 6, 0, 0]}
                      activeBar={{ fill: PRIMARY }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Area Chart */}
              <div style={styles.chartCard}>
                <div style={styles.chartHeader}>
                  <div>
                    <div style={styles.chartTitle}>
                      Monthly Academic Overview
                    </div>
                    <div style={styles.chartSub}>
                      Cumulative goal completion rate
                    </div>
                  </div>
                  <div style={styles.badgeBlue}>⊙ 72%</div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={monthly}>
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={PRIMARY}
                          stopOpacity={0.18}
                        />
                        <stop
                          offset="95%"
                          stopColor={PRIMARY}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f0f0f0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="week"
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<AreaTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="completion"
                      stroke={PRIMARY}
                      strokeWidth={2.5}
                      fill="url(#grad)"
                      dot={{
                        fill: PRIMARY,
                        r: 5,
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                      activeDot={{ r: 7 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Navigation Links */}
            <div style={styles.sectionTitle}>Dashboard Quick Links</div>
            <div style={styles.hacksGrid}>
              {quickLinks.map((link) => (
                <div key={link.title} style={styles.hackCard}>
                  <div style={styles.hackIcon}>{link.icon}</div>
                  <div style={styles.hackTitle}>{link.title}</div>
                  <div style={styles.hackDesc}>{link.desc}</div>
                  <button
                    onClick={() => navigate(link.path)}
                    style={{
                      ...styles.hackBtn,
                      background: link.dark ? "#111" : PRIMARY,
                    }}
                  >
                    {link.btn}
                  </button>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  shell: {
    display: "flex",
    flex: 1,
    height: "100vh",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#f5f7fc",
    overflow: "hidden",
  },
  sidebar: {
    width: 210,
    minWidth: 210,
    background: "#fff",
    borderRight: "1px solid #eef0f5",
    display: "flex",
    flexDirection: "column",
    padding: "24px 16px",
    gap: 8,
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 28,
    paddingLeft: 8,
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: PRIMARY,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
  },
  logoText: {
    fontWeight: 700,
    fontSize: 17,
    color: "#111",
    letterSpacing: "-0.3px",
  },
  nav: { display: "flex", flexDirection: "column", gap: 4 },
  navBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 10,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 13.5,
    fontWeight: 500,
    color: "#555",
    textAlign: "left",
    transition: "background 0.15s",
  },
  navBtnActive: {
    background: PRIMARY,
    color: "#fff",
    fontWeight: 600,
  },
  main: {
    flex: 1,
    overflowY: "auto",
    padding: "0 28px 40px",
  },
  hero: {
    background: `linear-gradient(120deg, rgba(17,82,212,0.85) 0%, rgba(14,62,168,0.95) 100%), url('/momentum_banner.png')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: "0 0 20px 20px",
    padding: "28px 32px",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
    overflow: "hidden",
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 700,
    margin: "0 0 16px",
    letterSpacing: "-0.4px",
  },
  heroCards: { display: "flex", gap: 14 },
  heroCard: {
    background: "rgba(255,255,255,0.13)",
    borderRadius: 12,
    padding: "12px 16px",
    maxWidth: 210,
    backdropFilter: "blur(6px)",
    border: "1px solid rgba(255,255,255,0.18)",
  },
  heroCardTitle: { fontWeight: 700, fontSize: 13, marginBottom: 4 },
  heroCardDesc: { fontSize: 12, opacity: 0.85, lineHeight: 1.5 },
  heroIcon: { fontSize: 64, opacity: 0.25, userSelect: "none" },
  loading: { textAlign: "center", color: "#aaa", padding: 32 },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    background: "#fff",
    borderRadius: 16,
    padding: "18px 20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  statTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: `${PRIMARY}12`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  delta: {
    fontSize: 11,
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: 20,
  },
  statLabel: { fontSize: 12, color: "#9ca3af", marginBottom: 4 },
  statValue: {
    fontSize: 26,
    fontWeight: 800,
    color: "#111",
    letterSpacing: "-0.5px",
  },
  chartsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    marginBottom: 28,
  },
  chartCard: {
    background: "#fff",
    borderRadius: 16,
    padding: "20px 20px 12px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  chartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  chartTitle: { fontWeight: 700, fontSize: 15, color: "#111" },
  chartSub: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  chipBtn: {
    border: `1px solid ${PRIMARY}`,
    color: PRIMARY,
    background: "#fff",
    borderRadius: 20,
    padding: "4px 12px",
    fontSize: 12,
    cursor: "pointer",
    fontWeight: 600,
  },
  badgeBlue: {
    background: `${PRIMARY}14`,
    color: PRIMARY,
    borderRadius: 20,
    padding: "4px 12px",
    fontSize: 12,
    fontWeight: 700,
  },
  tooltip: {
    background: "#fff",
    border: `1px solid ${PRIMARY}30`,
    borderRadius: 10,
    padding: "8px 14px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#111",
    marginBottom: 16,
  },
  hacksGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
  },
  hackCard: {
    background: "#fff",
    borderRadius: 16,
    padding: "20px 18px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  hackIcon: { fontSize: 28 },
  hackTitle: { fontWeight: 700, fontSize: 14, color: "#111" },
  hackDesc: { fontSize: 12.5, color: "#6b7280", lineHeight: 1.5, flexGrow: 1 },
  hackBtn: {
    marginTop: 8,
    width: "100%",
    padding: "10px 0",
    borderRadius: 10,
    border: "none",
    color: "#fff",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    transition: "opacity 0.15s",
  },
};
