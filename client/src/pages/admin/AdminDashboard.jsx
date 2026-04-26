import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  MdMeetingRoom, MdEvent, MdCalendarMonth, MdWarning,
  MdTrendingUp, MdPeople, MdAutoAwesome, MdRefresh, MdBarChart
} from 'react-icons/md';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: [0.4, 0, 0.2, 1] } }),
};

export default function AdminDashboard() {
  const { lastEvent } = useSocket();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentSchedules, setRecentSchedules] = useState([]);
  const [conflicts, setConflicts] = useState([]);

  const fetchStats = useCallback(async () => {
    try {
      const [roomStats, eventStats, scheduleAnalytics, schedules] = await Promise.all([
        api.get('/rooms/stats'),
        api.get('/events/stats'),
        api.get('/schedules/analytics'),
        api.get('/schedules?status=pending'),
      ]);
      setStats({
        rooms: roomStats.data.data,
        events: eventStats.data.data,
        schedules: scheduleAnalytics.data.data,
      });
      setRecentSchedules(schedules.data.data.schedules.slice(0, 5));
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => {
    if (lastEvent?.type === 'scheduleUpdated' || lastEvent?.type === 'roomStatusChanged') {
      fetchStats();
      toast.success('Dashboard updated via real-time event', { icon: '⚡' });
    }
  }, [lastEvent, fetchStats]);

  const statCards = stats ? [
    { label: 'Active Rooms', value: stats.rooms.active, icon: <MdMeetingRoom />, color: '#6366f1', change: `${stats.rooms.total} total` },
    { label: 'Total Events', value: stats.events.total, icon: <MdEvent />, color: '#8b5cf6', change: `${stats.events.upcoming?.length || 0} upcoming` },
    { label: 'Confirmed', value: stats.schedules.confirmed, icon: <MdCalendarMonth />, color: '#10b981', change: `${stats.schedules.aiAcceptanceRate}% AI accepted` },
    { label: 'AI Avg Score', value: stats.schedules.avgAIScore, icon: <MdAutoAwesome />, color: '#f59e0b', change: 'Points out of 200' },
  ] : [];

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="page-header-left"><h1>Admin Dashboard</h1><p>Loading your workspace...</p></div>
        </div>
        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Admin <span className="gradient-text">Dashboard</span></h1>
          <p>AI-assisted resource management at a glance</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchStats}>
          <MdRefresh /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        {statCards.map((card, i) => (
          <motion.div key={i} className="stat-card" custom={i} initial="hidden" animate="visible" variants={cardVariants}>
            <div className="stat-label">{card.label}</div>
            <div className="stat-value gradient-text">{card.value ?? '—'}</div>
            <div className="stat-change up">{card.change}</div>
            <div className="stat-icon" style={{ background: `${card.color}20`, color: card.color }}>
              {card.icon}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 32 }}>
        {/* Room Usage Chart */}
        <motion.div className="glass-card-static" style={{ padding: 24 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3>Top Rooms by Usage</h3>
            <MdBarChart style={{ color: 'var(--indigo-light)', fontSize: '1.4rem' }} />
          </div>
          {stats?.schedules?.roomUsage?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.schedules.roomUsage} barSize={28}>
                <XAxis dataKey="roomName" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false}
                  tickFormatter={(v) => v.length > 10 ? v.slice(0, 10) + '…' : v} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
                <Bar dataKey="count" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-state-icon">📊</div>
              <p>No schedule data yet</p>
            </div>
          )}
        </motion.div>

        {/* Events by priority */}
        <motion.div className="glass-card-static" style={{ padding: 24 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3>Events by Priority</h3>
            <MdTrendingUp style={{ color: 'var(--indigo-light)', fontSize: '1.4rem' }} />
          </div>
          {stats?.events?.byPriority?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stats.events.byPriority.map((item, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.85rem', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                      {item._id?.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.count}</span>
                  </div>
                  <div className="score-bar-track">
                    <div className="score-bar-fill" style={{ width: `${Math.min(100, (item.count / (stats.events.total || 1)) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-state-icon">🎯</div>
              <p>No events yet</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Pending Schedules + Upcoming Events */}
      <div className="grid-2">
        {/* Pending schedules requiring action */}
        <motion.div className="glass-card-static" style={{ padding: 24 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3>Pending Confirmations</h3>
            <span className="badge badge-warning">{recentSchedules.length} pending</span>
          </div>
          {recentSchedules.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-state-icon">✅</div>
              <h3>All clear!</h3>
              <p>No pending schedules</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentSchedules.map((s) => (
                <div key={s._id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                  background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)'
                }}>
                  <div className="priority-ring medium">{s.event?.priority || '—'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="truncate" style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.event?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.room?.name}</div>
                  </div>
                  <span className="badge badge-warning">pending</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Upcoming events */}
        <motion.div className="glass-card-static" style={{ padding: 24 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
          <h3 style={{ marginBottom: 16 }}>Upcoming Events</h3>
          {stats?.events?.upcoming?.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-state-icon">📅</div>
              <p>No upcoming events</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats?.events?.upcoming?.map((ev, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                  background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)'
                }}>
                  <div className={`priority-ring ${ev.priority >= 8 ? 'high' : ev.priority >= 5 ? 'medium' : 'low'}`}>{ev.priority}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="truncate" style={{ fontWeight: 600, fontSize: '0.875rem' }}>{ev.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {ev.studentCount} students • {new Date(ev.timeSlot?.date).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`badge ${ev.priority >= 8 ? 'badge-danger' : ev.priority >= 5 ? 'badge-warning' : 'badge-success'}`}>
                    {ev.priorityLabel?.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
