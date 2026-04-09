const Schedule = require('../models/Schedule');
const Event = require('../models/Event');
const Room = require('../models/Room');
const Notification = require('../models/Notification');
const AllocationHistory = require('../models/AllocationHistory');
const { asyncHandler } = require('../middleware/errorHandler');
const { runAIAllocator } = require('../services/aiAllocator');
const { detectConflicts } = require('../services/reallocationEngine');

// @POST /api/schedule/suggest
// Run AI allocator and return suggestions (NO auto-assignment)
const suggestAllocation = asyncHandler(async (req, res) => {
  const { eventId } = req.body;
  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

  const rooms = await Room.find({ status: 'active' });
  if (rooms.length === 0) {
    return res.status(404).json({ success: false, message: 'No active rooms found' });
  }

  const allocation = await runAIAllocator(event, rooms);

  // Log suggestion in history
  if (allocation.bestRoom) {
    await AllocationHistory.create({
      event: event._id,
      room: allocation.bestRoom._id,
      action: 'suggested',
      aiScore: allocation.bestScore,
      timeSlot: event.timeSlot,
    });
  }

  res.json({
    success: true,
    message: 'AI suggestion generated. Admin must confirm before scheduling.',
    data: allocation,
  });
});

// @POST /api/schedule/confirm
// Admin confirms an AI suggestion
const confirmAllocation = asyncHandler(async (req, res) => {
  const { eventId, roomId, aiScore, aiExplanation, alternativeRooms } = req.body;

  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

  const room = await Room.findById(roomId);
  if (!room || room.status !== 'active') {
    return res.status(400).json({ success: false, message: 'Selected room is not available' });
  }

  // Check for conflicts
  const conflicts = await detectConflicts(roomId, event.timeSlot);
  if (conflicts.length > 0) {
    return res.status(409).json({
      success: false,
      message: `Room has a conflict with: ${conflicts.map((c) => c.event?.name).join(', ')}`,
      data: { conflicts },
    });
  }

  // Create schedule
  const schedule = await Schedule.create({
    event: eventId,
    room: roomId,
    status: 'confirmed',
    aiScore,
    aiExplanation,
    alternativeRooms: alternativeRooms || [],
    confirmedBy: req.user._id,
    confirmedAt: new Date(),
    timeSlot: event.timeSlot,
  });

  // Update event status
  await Event.findByIdAndUpdate(eventId, { status: 'scheduled' });

  // Update room usage stats
  await Room.findByIdAndUpdate(roomId, { $inc: { usageCount: 1 }, lastUsed: new Date() });

  // Log in history
  await AllocationHistory.create({
    event: eventId,
    room: roomId,
    allocatedBy: req.user._id,
    aiScore,
    action: 'confirmed',
    timeSlot: event.timeSlot,
  });

  // Notify all users assigned to the event
  if (event.assignedTo && event.assignedTo.length > 0) {
    const notifications = event.assignedTo.map((userId) => ({
      user: userId,
      title: '✅ Room Assigned',
      message: `Room "${room.name}" has been confirmed for "${event.name}" on ${new Date(event.timeSlot.date).toLocaleDateString()} at ${event.timeSlot.startTime}`,
      type: 'success',
      relatedEvent: eventId,
      relatedSchedule: schedule._id,
    }));
    await Notification.insertMany(notifications);
  }

  const populated = await Schedule.findById(schedule._id)
    .populate('event')
    .populate('room')
    .populate('confirmedBy', 'name email');

  // Socket.io emit
  const io = req.app.get('io');
  if (io) {
    io.emit('scheduleUpdated', {
      type: 'confirmed',
      schedule: populated,
      message: `Room "${room.name}" confirmed for "${event.name}"`,
    });
    // Notify assigned users
    if (event.assignedTo) {
      event.assignedTo.forEach((uid) => {
        io.to(`user_${uid}`).emit('newNotification', {
          title: '✅ Room Assigned',
          message: `Room "${room.name}" confirmed for "${event.name}"`,
        });
      });
    }
  }

  res.status(201).json({ success: true, message: 'Schedule confirmed successfully', data: { schedule: populated } });
});

// @POST /api/schedule/override
// Admin picks a different room than AI suggested
const overrideAllocation = asyncHandler(async (req, res) => {
  const { eventId, roomId, reason } = req.body;

  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

  const room = await Room.findById(roomId);
  if (!room || room.status !== 'active') {
    return res.status(400).json({ success: false, message: 'Selected room not available' });
  }

  const conflicts = await detectConflicts(roomId, event.timeSlot);
  if (conflicts.length > 0) {
    return res.status(409).json({ success: false, message: 'Room has a conflict', data: { conflicts } });
  }

  const schedule = await Schedule.create({
    event: eventId,
    room: roomId,
    status: 'confirmed',
    confirmedBy: req.user._id,
    confirmedAt: new Date(),
    overridden: true,
    overrideReason: reason || 'Admin override',
    timeSlot: event.timeSlot,
  });

  await Event.findByIdAndUpdate(eventId, { status: 'scheduled' });
  await Room.findByIdAndUpdate(roomId, { $inc: { usageCount: 1 }, lastUsed: new Date() });
  await AllocationHistory.create({
    event: eventId,
    room: roomId,
    allocatedBy: req.user._id,
    action: 'overridden',
    notes: reason,
    timeSlot: event.timeSlot,
  });

  const populated = await Schedule.findById(schedule._id).populate('event').populate('room').populate('confirmedBy', 'name');
  const io = req.app.get('io');
  if (io) {
    io.emit('scheduleUpdated', { type: 'overridden', schedule: populated });
  }

  res.status(201).json({ success: true, message: 'Schedule overridden and confirmed', data: { schedule: populated } });
});

// @GET /api/schedules
const getSchedules = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  if (['student', 'user'].includes(req.user.role)) {
    const userEvents = await Event.find({ $or: [{ createdBy: req.user._id }, { assignedTo: req.user._id }] }).select('_id');
    filter.event = { $in: userEvents.map((e) => e._id) };
  }

  const schedules = await Schedule.find(filter)
    .populate({ path: 'event', populate: { path: 'createdBy', select: 'name email' } })
    .populate('room')
    .populate('confirmedBy', 'name email')
    .sort('-createdAt');

  res.json({ success: true, data: { schedules, total: schedules.length } });
});

// @DELETE /api/schedules/:id
const cancelSchedule = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id);
  if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });

  await Schedule.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
  await Event.findByIdAndUpdate(schedule.event, { status: 'pending' });
  await AllocationHistory.create({
    event: schedule.event,
    room: schedule.room,
    allocatedBy: req.user._id,
    action: 'cancelled',
    timeSlot: schedule.timeSlot,
  });

  const io = req.app.get('io');
  if (io) io.emit('scheduleUpdated', { type: 'cancelled', scheduleId: schedule._id });

  res.json({ success: true, message: 'Schedule cancelled' });
});

// @GET /api/schedules/analytics
const getScheduleAnalytics = asyncHandler(async (req, res) => {
  const totalSchedules = await Schedule.countDocuments();
  const confirmed = await Schedule.countDocuments({ status: 'confirmed' });
  const cancelled = await Schedule.countDocuments({ status: 'cancelled' });
  const overridden = await Schedule.countDocuments({ overridden: true });

  const roomUsage = await Schedule.aggregate([
    { $match: { status: 'confirmed' } },
    { $group: { _id: '$room', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    { $lookup: { from: 'rooms', localField: '_id', foreignField: '_id', as: 'room' } },
    { $unwind: '$room' },
    { $project: { roomName: '$room.name', count: 1 } },
  ]);

  const avgScore = await AllocationHistory.aggregate([
    { $match: { action: 'confirmed' } },
    { $group: { _id: null, avgScore: { $avg: '$aiScore' } } },
  ]);

  res.json({
    success: true,
    data: {
      totalSchedules, confirmed, cancelled, overridden,
      roomUsage,
      avgAIScore: avgScore[0]?.avgScore?.toFixed(1) || 0,
      aiAcceptanceRate: totalSchedules > 0 ? (((confirmed - overridden) / totalSchedules) * 100).toFixed(1) : 0,
    },
  });
});

module.exports = { suggestAllocation, confirmAllocation, overrideAllocation, getSchedules, cancelSchedule, getScheduleAnalytics };


