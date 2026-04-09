import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { format } from 'date-fns';
import { MdMeetingRoom, MdAccessTime, MdEvent, MdLocationOn } from 'react-icons/md';

export default function UserSchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/schedules?status=confirmed')
      .then((res) => {
        setSchedules(res?.data?.data?.schedules || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>My <span className="gradient-text">Confirmed Schedule</span></h1>
          <p>Your officially allocated classes and events</p>
        </div>
      </div>

      <div className="glass-card-static p-xl">
        {loading ? (
          <div className="flex justify-center p-xl"><span className="spinner lg indigo" /></div>
        ) : schedules.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon text-muted">🎓</div>
            <h3>Your schedule is clear</h3>
            <p>You have no officially confirmed events or classes.</p>
          </div>
        ) : (
          <div className="grid-2">
            {schedules.map(s => (
              <div key={s._id} className="suggestion-best" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                <div className="flex justify-between items-start mb-md">
                  <h3 className="font-bold text-lg text-primary truncate">{s.event?.name}</h3>
                  <span className="badge badge-success">Confirmed</span>
                </div>
                
                <div className="grid-2 gap-md text-sm text-secondary">
                  <div className="flex items-center gap-sm">
                    <MdMeetingRoom className="text-indigo" size={18} />
                    <span><strong>{s.room?.name}</strong></span>
                  </div>
                  <div className="flex items-center gap-sm">
                    <MdLocationOn className="text-muted" size={18} />
                    <span>{s.room?.building} • Floor {s.room?.floor}</span>
                  </div>
                  <div className="flex items-center gap-sm">
                    <MdEvent className="text-muted" size={18} />
                    <span>{s.timeSlot?.date ? format(new Date(s.timeSlot.date), 'EEEE, MMM dd') : ''}</span>
                  </div>
                  <div className="flex items-center gap-sm">
                    <MdAccessTime className="text-muted" size={18} />
                    <span>{s.timeSlot?.startTime} - {s.timeSlot?.endTime}</span>
                  </div>
                </div>

                <div className="mt-md pt-sm border-t border-muted/20">
                   <div className="flex flex-wrap gap-xs">
                     {s.room?.equipment?.map((eq, i) => (
                       <span key={i} className="tag">{eq.replace('_', ' ')}</span>
                     ))}
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
