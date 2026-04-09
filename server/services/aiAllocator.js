/**
 * AI-Assisted Room Allocation Engine
 * Scores rooms based on multiple weighted factors.
 * NEVER auto-assigns — ONLY suggests with explanations.
 */

const Schedule = require('../models/Schedule');
const AllocationHistory = require('../models/AllocationHistory');

/**
 * Score a single room for a given event
 */
const scoreRoom = async (room, event, existingSchedules) => {
  let score = 0;
  const explanations = [];

  // ── 1. Capacity Match (+50) ─────────────────────────────────────────────────
  if (room.capacity >= event.studentCount) {
    // Perfect fit bonus: the closer the capacity to count, the better
    const utilization = event.studentCount / room.capacity;
    const capacityScore = Math.round(50 * utilization);
    score += capacityScore;
    explanations.push(
      `Capacity: Room holds ${room.capacity}, event needs ${event.studentCount} (${Math.round(utilization * 100)}% utilization → +${capacityScore})`
    );
  } else {
    // Room too small — heavy penalty
    score -= 100;
    explanations.push(`⚠️ Room capacity (${room.capacity}) is LESS than required (${event.studentCount}) → -100`);
  }

  // ── 2. Equipment Match (+20 per matched item) ────────────────────────────────
  const required = event.requiredEquipment || [];
  const available = room.equipment || [];
  let equipmentScore = 0;
  const matched = [];
  const missing = [];
  required.forEach((eq) => {
    if (available.map((e) => e.toLowerCase()).includes(eq.toLowerCase())) {
      equipmentScore += 20;
      matched.push(eq);
    } else {
      missing.push(eq);
    }
  });
  score += equipmentScore;
  if (matched.length > 0) explanations.push(`Equipment matched: ${matched.join(', ')} → +${equipmentScore}`);
  if (missing.length > 0) explanations.push(`⚠️ Missing equipment: ${missing.join(', ')}`);

  // ── 3. Availability (+30) ────────────────────────────────────────────────────
  const conflicting = existingSchedules.some((s) => {
    if (s.room.toString() !== room._id.toString()) return false;
    if (s.timeSlot.date.toDateString() !== new Date(event.timeSlot.date).toDateString()) return false;
    // Overlap check
    return !(event.timeSlot.endTime <= s.timeSlot.startTime || event.timeSlot.startTime >= s.timeSlot.endTime);
  });

  if (!conflicting) {
    score += 30;
    explanations.push(`Room is available in the requested time slot → +30`);
  } else {
    score -= 2000;
    explanations.push(`⛔ Room has an absolute scheduling CONFLICT in this time slot → -2000`);
  }

  // ── 4. Priority Weight (priority × 5) ───────────────────────────────────────
  const priorityScore = event.priority * 5;
  score += priorityScore;
  explanations.push(`Event priority ${event.priority}/10 → +${priorityScore}`);

  // ── 5. Time-Slot Compatibility (+20) ────────────────────────────────────────
  // Prefer rooms not used back-to-back (give 15-min buffer bonus)
  const backToBack = existingSchedules.some((s) => {
    if (s.room.toString() !== room._id.toString()) return false;
    const sDate = s.timeSlot.date.toDateString();
    const eDate = new Date(event.timeSlot.date).toDateString();
    if (sDate !== eDate) return false;
    const gap1 = Math.abs(
      timeToMinutes(event.timeSlot.startTime) - timeToMinutes(s.timeSlot.endTime)
    );
    const gap2 = Math.abs(
      timeToMinutes(s.timeSlot.startTime) - timeToMinutes(event.timeSlot.endTime)
    );
    return Math.min(gap1, gap2) < 15;
  });

  if (!backToBack) {
    score += 20;
    explanations.push(`No back-to-back scheduling conflict → +20`);
  } else {
    explanations.push(`⚠️ Back-to-back scheduling (less than 15-min gap)`);
  }

  // ── 6. Historical Usage (+10) ────────────────────────────────────────────────
  const historyCount = await AllocationHistory.countDocuments({
    room: room._id,
    action: 'confirmed',
  });
  if (historyCount > 0) {
    score += 10;
    explanations.push(`Room has been successfully used ${historyCount} times before → +10`);
  }

  // ── 7. Room Status Penalty ───────────────────────────────────────────────────
  if (room.status === 'maintenance') {
    score -= 200;
    explanations.push(`⛔ Room is under maintenance → -200`);
  } else if (room.status === 'disabled') {
    score -= 200;
    explanations.push(`⛔ Room is disabled → -200`);
  }

  return { score, explanations };
};

/**
 * Main AI Allocator — returns bestRoom + alternatives + explanation
 */
const runAIAllocator = async (event, rooms) => {
  if (!rooms || rooms.length === 0) {
    return {
      bestRoom: null,
      alternativeRooms: [],
      explanation: 'No rooms available in the system.',
      scores: [],
    };
  }

  // Fetch all confirmed/pending schedules for conflict detection
  const existingSchedules = await Schedule.find({
    status: { $in: ['pending', 'confirmed'] },
  }).lean();

  // Score all rooms
  const scoredRooms = await Promise.all(
    rooms.map(async (room) => {
      const { score, explanations } = await scoreRoom(room, event, existingSchedules);
      return {
        room,
        score,
        explanations,
        summaryExplanation: explanations.join(' | '),
      };
    })
  );

  // Sort by score descending
  scoredRooms.sort((a, b) => b.score - a.score);

  const [best, ...rest] = scoredRooms;
  const alternatives = rest.slice(0, 3);

  if (!best || best.score < 0) {
    return {
      bestRoom: null,
      alternativeRooms: alternatives.map((a) => ({
        room: a.room,
        score: a.score,
        explanation: a.summaryExplanation,
      })),
      explanation: 'No suitable room found. All rooms have conflicts or insufficient capacity.',
      scores: scoredRooms.map((s) => ({ roomId: s.room._id, name: s.room.name, score: s.score })),
    };
  }

  return {
    bestRoom: best.room,
    bestScore: best.score,
    explanation: best.summaryExplanation,
    explanationPoints: best.explanations,
    alternativeRooms: alternatives.map((a) => ({
      room: a.room,
      score: a.score,
      explanation: a.summaryExplanation,
    })),
    scores: scoredRooms.map((s) => ({ roomId: s.room._id, name: s.room.name, score: s.score })),
  };
};

// Helper: convert "HH:MM" to total minutes
const timeToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

module.exports = { runAIAllocator };
