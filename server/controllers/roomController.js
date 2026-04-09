const Room = require('../models/Room');
const { asyncHandler } = require('../middleware/errorHandler');
const { reallocateForRoom } = require('../services/reallocationEngine');

// @GET /api/rooms
const getRooms = asyncHandler(async (req, res) => {
  const { status, type, search } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (search) filter.name = { $regex: search, $options: 'i' };

  const rooms = await Room.find(filter).populate('createdBy', 'name email').sort('-createdAt');
  res.json({ success: true, data: { rooms, total: rooms.length } });
});

// @GET /api/rooms/:id
const getRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id).populate('createdBy', 'name email');
  if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
  res.json({ success: true, data: { room } });
});

// @POST /api/rooms
const createRoom = asyncHandler(async (req, res) => {
  const room = await Room.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, message: 'Room created', data: { room } });
});

// @PUT /api/rooms/:id
const updateRoom = asyncHandler(async (req, res) => {
  const { status, ...rest } = req.body;
  const existingRoom = await Room.findById(req.params.id);
  if (!existingRoom) return res.status(404).json({ success: false, message: 'Room not found' });

  const room = await Room.findByIdAndUpdate(
    req.params.id,
    { ...rest, status, lastUpdated: new Date() },
    { new: true, runValidators: true }
  );

  // If room is being disabled/put in maintenance, trigger reallocation
  const io = req.app.get('io');
  if (status && status !== 'active' && existingRoom.status === 'active') {
    await reallocateForRoom(req.params.id, io);
    if (io) {
      io.emit('roomStatusChanged', { roomId: req.params.id, newStatus: status, roomName: room.name });
    }
  }

  res.json({ success: true, message: 'Room updated', data: { room } });
});

// @DELETE /api/rooms/:id (soft delete)
const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findByIdAndUpdate(
    req.params.id,
    { status: 'disabled' },
    { new: true }
  );
  if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

  const io = req.app.get('io');
  await reallocateForRoom(req.params.id, io);

  res.json({ success: true, message: 'Room disabled successfully', data: { room } });
});

// @GET /api/rooms/stats
const getRoomStats = asyncHandler(async (req, res) => {
  const total = await Room.countDocuments();
  const active = await Room.countDocuments({ status: 'active' });
  const disabled = await Room.countDocuments({ status: 'disabled' });
  const maintenance = await Room.countDocuments({ status: 'maintenance' });
  const byType = await Room.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } },
  ]);
  const mostUsed = await Room.find({ status: 'active' }).sort('-usageCount').limit(5).select('name usageCount capacity type');
  res.json({ success: true, data: { total, active, disabled, maintenance, byType, mostUsed } });
});

module.exports = { getRooms, getRoom, createRoom, updateRoom, deleteRoom, getRoomStats };

