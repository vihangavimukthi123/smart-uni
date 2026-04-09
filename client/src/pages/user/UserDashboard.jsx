import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { MdCalendarMonth, MdMeetingRoom, MdEvent, MdAccessTime, MdChat } from 'react-icons/md';

export default function UserDashboard() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get('/schedules?status=confirmed'),
      api.get('/events')
    ])
    .then(([schRes, evRes]) => {
      const schData = schRes?.data?.data?.schedules || [];
      const evData = evRes?.data?.data?.events || [];
      
      setSchedules(schData.slice(0, 3)); 
      setConfirmedCount(schData.length);
      setPendingCount(evData.filter(e => e.status === 'pending').length);
    })
    .catch(() => {});
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Welcome, <span className="gradient-text">{user?.name}</span></h1>
          <p>Here is your student portal snapshot</p>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid-3 mb-xl">
        <div className="stat-card">
          <div className="stat-label">Confirmed Schedule</div>
          <div className="stat-value">{confirmedCount}</div>
          <p className="text-xs text-muted mt-sm">Upcoming classes</p>
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--emerald)' }}>
            <MdCalendarMonth />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Requests</div>
          <div className="stat-value">{pendingCount}</div>
          <p className="text-xs text-muted mt-sm">Awaiting AI Allocation</p>
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--amber)' }}>
            <MdEvent />
          </div>
        </div>
        <Link to="/messages" style={{ textDecoration: 'none' }} className="stat-card">
          <div className="stat-label">Helpdesk</div>
          <div className="stat-value">Support</div>
          <p className="text-xs text-muted mt-sm">Chat with System Admin</p>
          <div className="stat-icon" style={{ background: 'rgba(17, 82, 212, 0.1)', color: 'var(--indigo)' }}>
            <MdChat />
          </div>
        </Link>
      </div>

      <div className="glass-card-static p-xl">
        <div className="flex justify-between items-center mb-md">
          <h3 className="flex items-center gap-sm"><MdCalendarMonth className="text-indigo" /> Coming Up Next</h3>
          <Link to="/dashboard/schedule" className="btn btn-ghost btn-sm">View Full Schedule</Link>
        </div>
        
        {schedules.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon text-muted">☕</div>
            <p>You have no scheduled events right now.</p>
          </div>
        ) : (
          <div className="grid-auto">
            {schedules.map(s => (
              <div key={s._id} className="glass-card p-md">
                <div className="flex justify-between items-start mb-sm">
                  <div className="font-bold">{s.event?.name}</div>
                </div>
                <div className="text-sm text-secondary flex items-center gap-sm mb-xs">
                  <MdMeetingRoom /> {s.room?.name} ({s.room?.building})
                </div>
                <div className="text-xs text-muted flex items-center gap-sm">
                  <MdAccessTime />
                  {s.timeSlot?.date ? format(new Date(s.timeSlot.date), 'MMM dd') : ''} • {s.timeSlot?.startTime} - {s.timeSlot?.endTime}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
