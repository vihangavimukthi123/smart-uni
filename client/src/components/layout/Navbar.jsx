import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import {
  MdNotifications, MdSearch, MdLightMode, MdDarkMode,
  MdPerson, MdSettings, MdLogout, MdWifi, MdWifiOff
} from 'react-icons/md';
import api from '../../api/axios';

export default function Navbar({ title, collapsed, unreadCount = 0, onNotifClick }) {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { connected } = useSocket();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <header className={`navbar${collapsed ? ' sidebar-collapsed' : ''}`}>
      <div className="navbar-title">{title}</div>

      <div className="navbar-actions">
        {/* Connection status */}
        <div data-tooltip={connected ? 'Live updates active' : 'Reconnecting...'}>
          {connected
            ? <span className="live-indicator"><span className="live-dot" />LIVE</span>
            : <MdWifiOff style={{ color: 'var(--rose)', fontSize: '1.2rem' }} />}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-icon"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <MdLightMode style={{ fontSize: '1.2rem' }} /> : <MdDarkMode style={{ fontSize: '1.2rem' }} />}
        </button>

        {/* Notifications */}
        <button className="btn btn-ghost btn-icon notif-btn" onClick={onNotifClick} title="Notifications">
          <MdNotifications style={{ fontSize: '1.2rem' }} />
          {unreadCount > 0 && <span className="notif-dot" />}
        </button>

        {/* Avatar + dropdown */}
        <div className="dropdown" ref={dropRef}>
          <div className="avatar" onClick={() => setDropOpen((o) => !o)} title={user?.name}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          {dropOpen && (
            <div className="dropdown-menu">
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                <span className="badge badge-indigo" style={{ marginTop: 4 }}>{user?.role}</span>
              </div>
              <div className="dropdown-item" onClick={() => { setDropOpen(false); navigate('/profile'); }}>
                <MdPerson /> My Account
              </div>
              <div className="dropdown-divider" />
              <div className="dropdown-item danger" onClick={handleLogout}>
                <MdLogout /> Sign out
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
