const Event = require('../models/Event');
const { asyncHandler } = require('../middleware/errorHandler');

// @GET /api/events
const getEvents = asyncHandler(async (req, res) => {
  const { status, priority, search } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = { $gte: parseInt(priority) };
  if (search) filter.name = { $regex: search, $options: 'i' };

  // Users only see their own events; admins see all
  if (['student', 'user'].includes(req.user.role)) {
    filter.$or = [{ createdBy: req.user._id }, { assignedTo: req.user._id }];
  }

  const events = await Event.find(filter)
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email')
    .sort('-priority -createdAt');

  res.json({ success: true, data: { events, total: events.length } });
});

// @GET /api/events/:id
const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email');
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
  res.json({ success: true, data: { event } });
});

// @POST /api/events
const createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, message: 'Event created', data: { event } });
});

// @PUT /api/events/:id
const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

  // Only creator or admin can update
  if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
  }

  const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, message: 'Event updated', data: { event: updated } });
});

// @DELETE /api/events/:id
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

  if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
  }

  await Event.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
  res.json({ success: true, message: 'Event cancelled successfully' });
});

// @GET /api/events/stats
const getEventStats = asyncHandler(async (req, res) => {
  const total = await Event.countDocuments();
  const byStatus = await Event.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const byPriority = await Event.aggregate([{ $group: { _id: '$priorityLabel', count: { $sum: 1 }, avgStudents: { $avg: '$studentCount' } } }]);
  const upcoming = await Event.find({ status: 'pending', 'timeSlot.date': { $gte: new Date() } })
    .sort('priority')
    .limit(5)
    .select('name priority priorityLabel timeSlot studentCount');
  res.json({ success: true, data: { total, byStatus, byPriority, upcoming } });
});

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent, getEventStats };


