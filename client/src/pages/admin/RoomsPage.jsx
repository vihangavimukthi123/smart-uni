import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';
import { MdMeetingRoom, MdAdd, MdEdit, MdDelete, MdWarning, MdSettingsSuggest } from 'react-icons/md';

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const { lastEvent } = useSocket();

  const [form, setForm] = useState({
    name: '', capacity: '', type: 'lecture_hall',
    equipment: '', building: 'Main Building', floor: 1, status: 'active'
  });

  const fetchRooms = useCallback(async () => {
    try {
      const { data } = await api.get('/rooms');
      setRooms(data.data.rooms);
    } catch (err) {
      toast.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  useEffect(() => {
    if (lastEvent?.type === 'roomStatusChanged') {
      fetchRooms();
      toast('Room status updated remotely', { icon: '🔄' });
    }
  }, [lastEvent, fetchRooms]);

  const openForm = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setForm({
        name: room.name, capacity: room.capacity, type: room.type,
        equipment: room.equipment.join(', '), building: room.building,
        floor: room.floor, status: room.status
      });
    } else {
      setEditingRoom(null);
      setForm({ name: '', capacity: '', type: 'lecture_hall', equipment: '', building: 'Main Building', floor: 1, status: 'active' });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity),
        floor: Number(form.floor),
        equipment: form.equipment.split(',').map((s) => s.trim()).filter(Boolean)
      };

      if (editingRoom) {
        await api.put(`/rooms/${editingRoom._id}`, payload);
        toast.success('Room updated successfully');
      } else {
        await api.post('/rooms', payload);
        toast.success('Room created successfully');
      }
      setShowModal(false);
      fetchRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving room');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to disable this room? Active schedules may need reallocation.')) {
      try {
        await api.delete(`/rooms/${id}`);
        toast.success('Room disabled');
        fetchRooms();
      } catch (err) {
        toast.error('Error disabling room');
      }
    }
  };

  if (loading) return <div className="page-wrapper"><span className="spinner lg indigo" /></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Room <span className="gradient-text">Management</span></h1>
          <p>Manage all campus locations and resources</p>
        </div>
        <button className="btn btn-primary" onClick={() => openForm()}>
          <MdAdd /> Add Room
        </button>
      </div>

      <div className="grid-auto">
        {rooms.map((r) => (
          <div key={r._id} className="room-card">
            <div className="room-card-header">
              <span className="room-type-badge">{r.type.replace('_', ' ')}</span>
              <span className={`status-dot ${r.status}`} title={r.status} />
            </div>
            <h3 style={{ marginBottom: 4 }}>{r.name}</h3>
            <div className="room-capacity">
              <MdPeople /> {r.capacity} students
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>
              {r.building}, Floor {r.floor}
            </div>

            <div className="tags" style={{ marginBottom: 16 }}>
              {r.equipment.slice(0, 4).map((eq, i) => <span key={i} className="tag">{eq}</span>)}
              {r.equipment.length > 4 && <span className="tag">+{r.equipment.length - 4}</span>}
            </div>

            <div className="divider" style={{ margin: '12px 0' }} />

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openForm(r)}>
                <MdEdit /> Edit
              </button>
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--rose)' }} onClick={() => handleDelete(r._id)} disabled={r.status === 'disabled'}>
                <MdDelete />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>{editingRoom ? 'Edit Room' : 'Add New Room'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form id="room-form" onSubmit={handleSave} className="flex-col gap-md">
                <div className="form-group">
                  <label className="form-label">Room Name</label>
                  <input required className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Hall A-101" />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Capacity</label>
                    <input required type="number" min="1" className="form-input" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                      <option value="lecture_hall">Lecture Hall</option>
                      <option value="lab">Lab</option>
                      <option value="seminar_room">Seminar Room</option>
                      <option value="auditorium">Auditorium</option>
                      <option value="conference_room">Conference Room</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Equipment (comma separated)</label>
                  <input className="form-input" value={form.equipment} onChange={(e) => setForm({ ...form, equipment: e.target.value })} placeholder="projector, whiteboard, AC" />
                </div>
                {editingRoom && (
                  <div className="form-group alert alert-warning mt-sm">
                    <MdWarning style={{ fontSize: '1.2rem', flexShrink: 0 }} />
                    <div>
                      <strong>Status Change Warning</strong>
                      <p style={{ margin: 0 }}>Changing status to 'disabled' or 'maintenance' will trigger auto-reallocation for active schedules.</p>
                    </div>
                  </div>
                )}
                {editingRoom && (
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      <option value="active">Active</option>
                      <option value="disabled">Disabled</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                )}
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" form="room-form" className="btn btn-primary">Save Room</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Ensure MdPeople icon works (quick mock text if missing, but it is available in react-icons)
const MdPeople = () => <span style={{ marginRight: 4 }}>👥</span>;
