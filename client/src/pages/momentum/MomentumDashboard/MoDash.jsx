import { useState, useEffect } from "react";
import Navbar from "../../../components/layout/Navbar";
import Sidebar from "../../../components/layout/Sidebar";
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

// ─── Mock API (replace these with real fetch calls to your backend) ───────────
const fetchDashboardStats = async () => ({
  weeklyProductivity: { value: "88.4%", delta: "+5.2%", positive: true },
  studyCompletion: { value: "72.1%", delta: "-2.1%", positive: false },
  deepFocusHours: { value: "42.5h", delta: "+10.4%", positive: true },
  activeAssignments: { value: "12", delta: "Steady", positive: null },
});

const fetchWeeklyProductivity = async () => [
  { day: "MON", hours: 5.2 },
  { day: "TUE", hours: 7.8 },
  { day: "WED", hours: 4.5 },
  { day: "THU", hours: 9.1 },
  { day: "FRI", hours: 6.3 },
  { day: "SAT", hours: 3.0 },
  { day: "SUN", hours: 4.1 },
];

const fetchMonthlyOverview = async () => [
  { week: "Week 1", completion: 18 },
  { week: "Week 2", completion: 42 },
  { week: "Week 3", completion: 65 },
  { week: "Week 4", completion: 72 },
];
// ─────────────────────────────────────────────────────────────────────────────

const PRIMARY = "#1152D4";

const studyHacks = [
  {
    icon: "🚀",
    title: "30-Min Deep Work",
    desc: 'Activate "Do Not Disturb" and crush one specific study task.',
    btn: "Start Sprint",
    dark: false,
  },
  {
    icon: "🧭",
    title: "Weekly Navigation",
    desc: "Map out your upcoming deadlines and project milestones.",
    btn: "Plot Path",
    dark: true,
  },
  {
    icon: "📖",
    title: "Reflection Log",
    desc: "Log what you learned today and what you'll tackle tomorrow.",
    btn: "Open Diary",
    dark: false,
  },
  {
    icon: "👥",
    title: "Study Group Sync",
    desc: "Update your collaborators on shared term project tasks.",
    btn: "View Teams",
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
  const [stats, setStats] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchDashboardStats(),
      fetchWeeklyProductivity(),
      fetchMonthlyOverview(),
    ]).then(([s, w, m]) => {
      setStats(s);
      setWeekly(w);
      setMonthly(m);
      setLoading(false);
    });
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#F3F4F6",
      }}
    >
      <Navbar />

      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar />

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

            {/* Study Hacks */}
            <div style={styles.sectionTitle}>Daily Study Hacks</div>
            <div style={styles.hacksGrid}>
              {studyHacks.map((h) => (
                <div key={h.title} style={styles.hackCard}>
                  <div style={styles.hackIcon}>{h.icon}</div>
                  <div style={styles.hackTitle}>{h.title}</div>
                  <div style={styles.hackDesc}>{h.desc}</div>
                  <button
                    style={{
                      ...styles.hackBtn,
                      background: h.dark ? "#111" : PRIMARY,
                    }}
                  >
                    {h.btn}
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
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#f5f7fc",
    overflow: "hidden",
  },
  main: {
    flex: 1,
    overflowY: "auto",
    padding: "0 28px 40px",
  },
  hero: {
    background: `linear-gradient(120deg, ${PRIMARY} 0%, #0e3ea8 100%)`,
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
