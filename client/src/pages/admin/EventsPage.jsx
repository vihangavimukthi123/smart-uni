import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { MdEvent, MdAdd, MdDelete, MdAutorenew, MdSearch } from 'react-icons/md';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  
  const [form, setForm] = useState({
    name: '', studentCount: '', priorityLabel: 'normal_lecture',
    requiredEquipment: '', date: '', startTime: '', endTime: ''
  });

  const fetchEvents = useCallback(async () => {
    try {
      const { data } = await api.get(`/events?search=${search}`);
      setEvents(data.data.events);
    } catch (err) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        studentCount: Number(form.studentCount),
        priorityLabel: form.priorityLabel,
        requiredEquipment: form.requiredEquipment.split(',').map((s) => s.trim()).filter(Boolean),
        timeSlot: {
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime
        }
      };

      await api.post('/events', payload);
      toast.success('Event created! Go to Schedule Manager to allocate a room.', { duration: 4000 });
      setShowModal(false);
      setForm({ name: '', studentCount: '', priorityLabel: 'normal_lecture', requiredEquipment: '', date: '', startTime: '', endTime: '' });
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating event');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Cancel this event? Schedule will be dropped.')) {
      try {
        await api.delete(`/events/${id}`);
        toast.success('Event cancelled');
        fetchEvents();
      } catch (err) {
        toast.error('Error cancelling event');
      }
    }
  };

  const getPriorityColor = (p) => {
    if (p >= 8) return 'badge-danger';
    if (p >= 5) return 'badge-warning';
    return 'badge-success';
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Event <span className="gradient-text">Manager</span></h1>
          <p>Create and manage events requests</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="search-box">
            <MdSearch />
            <input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <MdAdd /> Create Event
          </button>
        </div>
      </div>

      <div className="table-wrapper glass-card-static">
        <table className="data-table">
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Date & Time</th>
              <th>Students</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Creator</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40 }} className="text-muted">No events found</td></tr>
            ) : events.map((ev) => (
              <tr key={ev._id}>
                <td style={{ fontWeight: 600 }}>{ev.name}</td>
                <td>
                  <div style={{ fontSize: '0.8rem' }}>{format(new Date(ev.timeSlot.date), 'MMM dd, yyyy')}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>{ev.timeSlot.startTime} - {ev.timeSlot.endTime}</div>
                </td>
                <td>{ev.studentCount}</td>
                <td><span className={`badge ${getPriorityColor(ev.priority)}`}>{ev.priorityLabel.replace('_', ' ')}</span></td>
                <td>
                  <span className={`badge ${ev.status === 'scheduled' ? 'badge-success' : ev.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}`}>
                    {ev.status}
                  </span>
                </td>
                <td>{ev.createdBy?.name || 'System'}</td>
                <td>
                  <button className="btn btn-ghost btn-icon text-muted" onClick={() => handleDelete(ev._id)} disabled={ev.status === 'cancelled'}>
                    <MdDelete />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Create Event</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form id="event-form" onSubmit={handleSave} className="flex-col gap-md">
                <div className="form-group">
                  <label className="form-label">Event Name</label>
                  <input required className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. CS101 Final Exam" />
                </div>
                
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Student Count</label>
                    <input required type="number" min="1" className="form-input" value={form.studentCount} onChange={(e) => setForm({ ...form, studentCount: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type / Priority</label>
                    <select className="form-select" value={form.priorityLabel} onChange={(e) => setForm({ ...form, priorityLabel: e.target.value })}>
                      <option value="exam">Exam (Highest)</option>
                      <option value="special_lecture">Special Lecture</option>
                      <option value="workshop">Workshop</option>
                      <option value="seminar">Seminar</option>
                      <option value="normal_lecture">Normal Lecture</option>
                    </select>
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input required type="date" className="form-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <input required type="time" className="form-input" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time</label>
                    <input required type="time" className="form-input" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Required Equipment (comma separated)</label>
                  <input className="form-input" value={form.requiredEquipment} onChange={(e) => setForm({ ...form, requiredEquipment: e.target.value })} placeholder="projector, whiteboard" />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" form="event-form" className="btn btn-primary">Save Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
