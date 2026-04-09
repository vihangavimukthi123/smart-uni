import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { MdAutoAwesome, MdCheck, MdClose, MdWarning, MdInfo } from 'react-icons/md';

export default function SchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiResult, setAiResult] = useState(null);
  const [activeEvent, setActiveEvent] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { lastEvent } = useSocket();

  const fetchData = useCallback(async () => {
    try {
      const [schedRes, evRes, roomRes] = await Promise.all([
        api.get('/schedules'),
        api.get('/events?status=pending'),
        api.get('/rooms?status=active')
      ]);
      setSchedules(schedRes.data.data.schedules);
      setPendingEvents(evRes.data.data.events);
      setRooms(roomRes.data.data.rooms);
    } catch (err) {
      toast.error('Failed to fetch schedule data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (['scheduleUpdated', 'roomStatusChanged'].includes(lastEvent?.type)) {
      fetchData();
      if (lastEvent.type === 'scheduleUpdated' && lastEvent.data?.type === 'reallocation_needed') {
        toast.error(lastEvent.data.message || 'A schedule needs reallocation due to conflict', { duration: 6000 });
      }
    }
  }, [lastEvent, fetchData]);

  const runAI = async (event) => {
    setIsProcessing(true);
    setActiveEvent(event);
    setAiResult(null);
    try {
      const { data } = await api.post('/schedules/suggest', { eventId: event._id });
      setAiResult(data.data);
    } catch (err) {
      toast.error('AI Allocator failed');
      setActiveEvent(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmRoom = async (roomId, isAiSuggested = false) => {
    if (!activeEvent) return;
    setIsProcessing(true);
    try {
      const endpoint = isAiSuggested ? '/schedules/confirm' : '/schedules/override';
      const payload = isAiSuggested 
        ? { eventId: activeEvent._id, roomId, aiScore: aiResult.bestScore, aiExplanation: aiResult.explanation, alternativeRooms: aiResult.alternativeRooms }
        : { eventId: activeEvent._id, roomId, reason: 'Admin manual override' };

      await api.post(endpoint, payload);
      toast.success(isAiSuggested ? 'AI Suggestion Confirmed!' : 'Manual Override Applied!');
      setAiResult(null);
      setActiveEvent(null);
      fetchData();
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error('Conflict detected! Room is already booked for this time.');
      } else {
        toast.error(err.response?.data?.message || 'Error confirming schedule');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelSchedule = async (id) => {
    if (window.confirm('Cancel this schedule? The event will revert to pending status.')) {
      try {
        await api.delete(`/schedules/${id}`);
        toast.success('Schedule cancelled');
        fetchData();
      } catch (err) {
        toast.error('Error cancelling schedule');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Smart <span className="gradient-text">Allocator</span></h1>
          <p>AI-powered room assignment and conflict resolution</p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        {/* Left Col: Pending Events */}
        <div className="glass-card-static" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Pending Requests ({pendingEvents.length})</h3>
          
          <div className="flex-col gap-sm">
            {pendingEvents.length === 0 ? (
              <div className="empty-state text-muted" style={{ padding: '20px 0' }}>All clear! No pending events.</div>
            ) : pendingEvents.map((ev) => (
              <div key={ev._id} className={`glass-card ${activeEvent?._id === ev._id ? 'active' : ''}`} style={{ padding: 16, cursor: 'default', border: activeEvent?._id === ev._id ? '1px solid var(--indigo)' : '' }}>
                <div className="flex items-start justify-between mb-sm">
                  <div>
                    <div style={{ fontWeight: 600 }}>{ev.name}</div>
                    <div className="text-xs text-muted mb-sm">
                      {format(new Date(ev.timeSlot.date), 'MMM dd')} • {ev.timeSlot.startTime}-{ev.timeSlot.endTime}
                    </div>
                  </div>
                  <span className={`badge ${ev.priority >= 8 ? 'badge-danger' : 'badge-warning'}`}>P{ev.priority}</span>
                </div>
                <div className="flex items-center justify-between mt-sm">
                  <div className="text-sm text-secondary">👥 {ev.studentCount} students</div>
                  <button className="btn btn-primary btn-sm" onClick={() => runAI(ev)} disabled={isProcessing && activeEvent?._id !== ev._id}>
                    {(isProcessing && activeEvent?._id === ev._id) ? <span className="spinner" /> : <MdAutoAwesome />} Suggest Room
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: AI Suggestions */}
        <div>
          <AnimatePresence mode="wait">
            {!activeEvent ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="empty-state glass-card-static" style={{ height: '100%' }}>
                <div className="empty-state-icon"><MdAutoAwesome style={{ color: 'var(--indigo)' }} /></div>
                <h3>Select an event</h3>
                <p>Click "Suggest Room" on a pending request to run the AI Allocator.</p>
              </motion.div>
            ) : !aiResult && isProcessing ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card-static flex-col items-center justify-center p-xl gap-md" style={{ minHeight: 400 }}>
                <span className="spinner lg indigo" />
                <h4 className="gradient-text">AI is thinking...</h4>
                <p className="text-sm text-muted">Calculating scores for {rooms.length} rooms based on capacity, priority, and availability</p>
              </motion.div>
            ) : aiResult ? (
              <motion.div key="results" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-col gap-md">
                <div className="glass-card-static" style={{ padding: '16px 20px', borderBottom: '2px solid var(--border)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="m-0">Allocating for: {activeEvent.name}</h4>
                      <div className="text-sm text-muted mt-xs">Needs {activeEvent.studentCount} capacity, {activeEvent.requiredEquipment.length} equipment items</div>
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={() => { setActiveEvent(null); setAiResult(null); }}><MdClose /></button>
                  </div>
                </div>

                {aiResult.bestRoom ? (
                  <div className="suggestion-best">
                    <div className="flex items-center justify-between mb-sm">
                      <h2 className="m-0 gradient-text">{aiResult.bestRoom.name}</h2>
                      <div className="text-xl font-bold" style={{ color: 'var(--indigo-light)' }}>{aiResult.bestScore} pts</div>
                    </div>
                    <div className="flex gap-sm mb-md text-sm text-secondary">
                      <span>👥 {aiResult.bestRoom.capacity}</span>
                      <span>🏢 {aiResult.bestRoom.building}</span>
                    </div>
                    
                    <div className="mb-md p-sm rounded" style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <div className="text-xs font-bold text-muted uppercase mb-xs flex items-center gap-xs"><MdInfo /> AI Explanation</div>
                      <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {aiResult.explanationPoints?.map((p, i) => <li key={i} style={{ marginBottom: 4 }}>{p}</li>)}
                      </ul>
                    </div>

                    <button className="btn btn-success w-full" disabled={isProcessing} onClick={() => confirmRoom(aiResult.bestRoom._id, true)}>
                      <MdCheck /> Confirm Best Match
                    </button>
                  </div>
                ) : (
                  <div className="alert alert-danger"><MdWarning /> No suitable rooms found. All rooms have conflicts or are severely undersized.</div>
                )}

                {aiResult.alternativeRooms?.length > 0 && (
                  <div className="glass-card-static p-md">
                    <h4 className="mb-sm text-sm uppercase text-muted">Alternatives</h4>
                    <div className="flex-col gap-sm">
                      {aiResult.alternativeRooms.map((alt) => (
                        <div key={alt.room._id} className="suggestion-alt flex items-center justify-between">
                          <div>
                            <div className="font-bold">{alt.room.name}</div>
                            <div className="text-xs text-muted">Score: {alt.score} pts</div>
                          </div>
                          <button className="btn btn-ghost btn-sm text-indigo" disabled={isProcessing} onClick={() => confirmRoom(alt.room._id, false)}>
                            Select Override
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <div className="divider" />

      {/* Confirmed Schedules */}
      <h3 className="mb-md">Confirmed Schedules</h3>
      <div className="table-wrapper glass-card-static">
        <table className="data-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Room</th>
              <th>Date & Time</th>
              <th>AI Score</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schedules.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }} className="text-muted">No schedules found</td></tr>
            ) : schedules.map((s) => (
              <tr key={s._id}>
                <td style={{ fontWeight: 600 }}>{s.event?.name}</td>
                <td>{s.room?.name || 'Unknown'}</td>
                <td>
                  <div style={{ fontSize: '0.8rem' }}>{s.timeSlot?.date ? format(new Date(s.timeSlot.date), 'MMM dd, yyyy') : 'N/A'}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>{s.timeSlot?.startTime} - {s.timeSlot?.endTime}</div>
                </td>
                <td>{s.overridden ? <span className="badge badge-muted">Overridden</span> : <span className="text-indigo font-bold">{s.aiScore}</span>}</td>
                <td>
                  <span className={`badge ${s.status === 'confirmed' ? 'badge-success' : s.status === 'reallocated' ? 'badge-warning' : 'badge-danger'}`}>
                    {s.status}
                  </span>
                </td>
                <td>
                  <button className="btn btn-ghost btn-icon text-rose" title="Cancel Schedule" onClick={() => cancelSchedule(s._id)} disabled={s.status === 'cancelled'}>
                    <MdClose />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
