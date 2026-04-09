/**
 * Reallocation Engine
 * Detects affected schedules when a room changes status or an event changes,
 * re-runs AI allocator, and returns reallocation suggestions.
 */

const Room = require('../models/Room');
const Event = require('../models/Event');
const Schedule = require('../models/Schedule');
const Notification = require('../models/Notification');
const { runAIAllocator } = require('./aiAllocator');

/**
 * When a room is disabled/put in maintenance, find all affected schedules
 * and suggest reallocation for each.
 */
const reallocateForRoom = async (roomId, io) => {
  const affectedSchedules = await Schedule.find({
    room: roomId,
    status: { $in: ['pending', 'confirmed'] },
  }).populate('event').populate('room');

  const results = [];

  for (const schedule of affectedSchedules) {
    const event = schedule.event;
    const availableRooms = await Room.find({
      _id: { $ne: roomId },
      status: 'active',
    });

    const allocation = await runAIAllocator(event, availableRooms);

    // Mark schedule as needing reallocation
    await Schedule.findByIdAndUpdate(schedule._id, { status: 'reallocated' });

    // Create notification for admins
    const adminNotification = new Notification({
      user: event.createdBy,
      title: '🔄 Reallocation Required',
      message: `Room "${schedule.room.name}" is no longer available. Event "${event.name}" needs a new room.`,
      type: 'warning',
      relatedEvent: event._id,
      relatedSchedule: schedule._id,
    });
    await adminNotification.save();

    results.push({
      originalSchedule: schedule,
      event,
      previousRoom: schedule.room,
      suggestion: allocation,
    });

    // Emit Socket.io event
    if (io) {
      io.emit('scheduleUpdated', {
        type: 'reallocation_needed',
        scheduleId: schedule._id,
        eventId: event._id,
        previousRoom: schedule.room.name,
        suggestion: allocation.bestRoom ? { name: allocation.bestRoom.name, score: allocation.bestScore } : null,
        message: `Event "${event.name}" needs reallocation`,
      });
    }
  }

  return results;
};

/**
 * Detect and warn about scheduling conflicts for a given time slot
 */
const detectConflicts = async (roomId, timeSlot, excludeScheduleId = null) => {
  const query = {
    room: roomId,
    status: { $in: ['pending', 'confirmed'] },
    'timeSlot.date': {
      $gte: new Date(new Date(timeSlot.date).setHours(0, 0, 0, 0)),
      $lt: new Date(new Date(timeSlot.date).setHours(23, 59, 59, 999)),
    },
  };

  if (excludeScheduleId) {
    query._id = { $ne: excludeScheduleId };
  }

  const existingSchedules = await Schedule.find(query).populate('event');

  const conflicts = existingSchedules.filter((s) => {
    return !(timeSlot.endTime <= s.timeSlot.startTime || timeSlot.startTime >= s.timeSlot.endTime);
  });

  return conflicts;
};

module.exports = { reallocateForRoom, detectConflicts };
