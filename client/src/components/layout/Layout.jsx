import { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useSocket } from '../../context/SocketContext';
import { MdClose, MdNotifications, MdCheck, MdDoneAll } from 'react-icons/md';

const pageTitles = {
  '/admin': 'Admin Dashboard',
  '/admin/rooms': 'Room Management',
  '/admin/events': 'Event Management',
  '/admin/schedules': 'Schedule Manager',
  '/admin/analytics': 'Analytics & Insights',
  '/admin/users': 'User Management',
  '/dashboard': 'My Dashboard',
  '/dashboard/schedule': 'My Schedule',
  '/dashboard/notifications': 'Notifications',
};

const pageVariants = {
  initial:  { opacity: 0, y: 16 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit:     { opacity: 0, y: -16, transition: { duration: 0.2 } },
};

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { lastEvent } = useSocket();
  const location = useLocation();

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data.notifications);
      setUnreadCount(data.data.unreadCount);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // Refresh on socket events
  useEffect(() => {
    if (lastEvent?.type === 'newNotification' || lastEvent?.type === 'scheduleUpdated') {
      fetchNotifications();
    }
  }, [lastEvent, fetchNotifications]);

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications((n) => n.map((x) => ({ ...x, isRead: true })));
    setUnreadCount(0);
  };

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications((n) => n.map((x) => x._id === id ? { ...x, isRead: true } : x));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const title = pageTitles[location.pathname] || 'MATRIX CORP';

  return (
    <div className="app-shell">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <div className={`main-content${collapsed ? ' sidebar-collapsed' : ''}`}>
        <Navbar title={title} collapsed={collapsed} unreadCount={unreadCount} onNotifClick={() => setNotifOpen(true)} />

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="page-wrapper"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Notification Drawer */}
      <AnimatePresence>
        {notifOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199 }}
              onClick={() => setNotifOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, width: 380,
                background: 'var(--bg-elevated)', borderLeft: '1px solid var(--border)',
                zIndex: 200, display: 'flex', flexDirection: 'column',
              }}
            >
              <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: 0 }}>Notifications</h3>
                  {unreadCount > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{unreadCount} unread</span>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {unreadCount > 0 && (
                    <button className="btn btn-ghost btn-sm" onClick={markAllRead} title="Mark all read">
                      <MdDoneAll /> All read
                    </button>
                  )}
                  <button className="btn btn-ghost btn-icon" onClick={() => setNotifOpen(false)}>
                    <MdClose />
                  </button>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                {notifications.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon"><MdNotifications /></div>
                    <h3>All caught up!</h3>
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n._id}
                      onClick={() => !n.isRead && markRead(n._id)}
                      style={{
                        padding: '12px 14px', borderRadius: 'var(--radius-md)', marginBottom: 6,
                        background: n.isRead ? 'transparent' : 'rgba(17, 82, 212, 0.08)',
                        border: `1px solid ${n.isRead ? 'transparent' : 'rgba(17, 82, 212, 0.2)'}`,
                        cursor: n.isRead ? 'default' : 'pointer',
                        transition: 'var(--transition-fast)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 2 }}>{n.title}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{n.message}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                            {new Date(n.createdAt).toLocaleString()}
                          </div>
                        </div>
                        {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--indigo)', marginTop: 4, flexShrink: 0 }} />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
