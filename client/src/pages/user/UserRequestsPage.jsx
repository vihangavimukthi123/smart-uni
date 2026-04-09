import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { MdAdd, MdDelete, MdEvent, MdAccessTime, MdInfo } from 'react-icons/md';
import { format } from 'date-fns';

export default function UserRequestsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '', priorityLabel: 'normal_lecture', studentCount: '', requiredEquipment: '',
    date: '', startTime: '', endTime: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events');
      setEvents(res?.data?.data?.events || []);
    } catch (err) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name,
        studentCount: Number(form.studentCount),
        priorityLabel: form.priorityLabel,
        requiredEquipment: form.requiredEquipment.split(',').map(s => s.trim()).filter(Boolean),
        timeSlot: { date: form.date, startTime: form.startTime, endTime: form.endTime }
      };
      await api.post('/events', payload);
      toast.success('Room request submitted successfully!');
      setIsModalOpen(false);
      setForm({ name: '', priorityLabel: 'normal_lecture', studentCount: '', requiredEquipment: '', date: '', startTime: '', endTime: '' });
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, isScheduled) => {
    if (isScheduled) {
      return toast.error("Cannot delete a request that is already scheduled. Contact admin.");
    }
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success('Request cancelled');
      fetchEvents();
    } catch (err) {
      toast.error('Failed to cancel request');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>My <span className="gradient-text">Room Requests</span></h1>
          <p>Submit and track your venue booking requests</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <MdAdd /> Request Room
        </button>
      </div>

      <div className="glass-card-static p-xl">
        {loading ? (
          <div className="flex justify-center p-xl"><span className="spinner lg indigo" /></div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon text-muted">📝</div>
            <h3>No requests found</h3>
            <p>You haven't submitted any room requests yet.</p>
          </div>
        ) : (
          <div className="grid-auto">
            {events.map((event) => (
              <div key={event._id} className="glass-card p-md flex-col justify-between" style={{ gap: '16px' }}>
                <div>
                  <div className="flex justify-between items-start mb-sm">
                    <h3 className="font-bold text-primary truncate" title={event.name}>{event.name}</h3>
                    <span className={`badge ${event.status === 'scheduled' ? 'badge-success' : event.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}`}>
                      {event.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-secondary grid-2 gap-sm mb-md">
                    <div className="flex items-center gap-xs"><MdEvent /> {format(new Date(event.timeSlot.date), 'MMM dd, yyyy')}</div>
                    <div className="flex items-center gap-xs"><MdAccessTime /> {event.timeSlot.startTime} - {event.timeSlot.endTime}</div>
                    <div className="flex items-center gap-xs"><MdInfo /> {event.studentCount} Students</div>
                    <div className="flex items-center gap-xs"><MdInfo /> {event.priorityLabel.replace('_', ' ')}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-surface p-sm rounded border">
                  <span className="text-xs text-muted">
                    Requested on {format(new Date(event.createdAt), 'MMM dd')}
                  </span>
                  {event.status !== 'scheduled' && event.status !== 'cancelled' && (
                    <button className="btn btn-ghost btn-sm text-danger" onClick={() => handleDelete(event._id, false)}>
                      <MdDelete size={16} /> Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal anim-scaleIn">
            <div className="modal-header">
              <h3>Submit Room Request</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form id="requestForm" onSubmit={handleCreate} className="flex-col gap-md">
                <div className="form-group">
                  <label className="form-label">Event Name</label>
                  <input required className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="E.g. Computer Graphics Lecture" />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Event Type</label>
                    <select className="form-select" value={form.priorityLabel} onChange={e => setForm({...form, priorityLabel: e.target.value})}>
                      <option value="exam">Exam</option>
                      <option value="special_lecture">Special Lecture</option>
                      <option value="workshop">Workshop</option>
                      <option value="seminar">Seminar</option>
                      <option value="normal_lecture">Normal Lecture</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Student Count</label>
                    <input required type="number" min="1" className="form-input" value={form.studentCount} onChange={e => setForm({...form, studentCount: e.target.value})} placeholder="E.g. 50" />
                  </div>
                </div>
                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input required type="date" className="form-input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <input required type="time" className="form-input" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time</label>
                    <input required type="time" className="form-input" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Required Equipment (Comma Separated)</label>
                  <input className="form-input" value={form.requiredEquipment} onChange={e => setForm({...form, requiredEquipment: e.target.value})} placeholder="projector, whiteboard, AC" />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="submit" form="requestForm" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
