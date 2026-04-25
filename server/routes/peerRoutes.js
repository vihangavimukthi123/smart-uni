const express = require('express');
const Peer = require('../models/Peer');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const normalize = (value = "") => String(value).trim().toLowerCase();

const getIdentityKey = (peer = {}) => {
  const studentId = normalize(peer.studentId);
  if (studentId) return `sid:${studentId}`;

  const email = normalize(peer.email);
  if (email) return `email:${email}`;

  const name = normalize(peer.name);
  return `name:${name}|year:${peer.year || ""}|sem:${peer.semester || ""}`;
};

// Get all peers
router.get("/", protect, async (req, res) => {
  try {
    const { year, semester, excludeEmail } = req.query;

    // 1. Check if the logged-in user has a completed peer profile
    const currentUserProfile = await Peer.findOne({ email: normalize(req.user.email) });
    
    // If no profile exists, the user hasn't saved their academic details yet
    if (!currentUserProfile) {
      return res.json({
        profileComplete: false,
        message: "Please complete your profile to find relevant peers.",
        peers: []
      });
    }

    const studentUsers = await User.find({ role: 'student', isActive: true }).select('email lastActiveAt');
    const studentEmails = studentUsers
      .map((u) => normalize(u.email))
      .filter(Boolean);

    const studentMap = {};
    studentUsers.forEach(u => {
      if (u.email) studentMap[normalize(u.email)] = u.lastActiveAt;
    });

    const filter = { $and: [] };
    // Only show peer profiles linked to real student accounts (no seed-only peers).
    filter.$and.push({ email: { $in: studentEmails } });
    
    // Always exclude the currently logged in user
    if (req.user && req.user.email) {
      filter.$and.push({ email: { $ne: normalize(req.user.email) } });
    } else if (excludeEmail) {
      filter.$and.push({ email: { $ne: normalize(excludeEmail) } });
    }

    // 2. Default filtering logic: 
    // If year/semester NOT provided in query, use current user's profile values
    // Otherwise use the provided filters (allowing override)
    const filterYear = year ? Number(year) : currentUserProfile.year;
    const filterSemester = semester ? Number(semester) : currentUserProfile.semester;

    if (filterYear) filter.$and.push({ year: filterYear });
    if (filterSemester) filter.$and.push({ semester: filterSemester });

    const peers = await Peer.find(filter).sort({ rating: -1, updatedAt: -1, name: 1 });

    // Safeguard: keep one profile per real student identity.
    const deduped = [];
    const seen = new Set();
    for (const peer of peers) {
      const key = getIdentityKey(peer);
      if (!seen.has(key)) {
        seen.add(key);
        const peerObj = peer.toObject ? peer.toObject() : peer;
        const lastActiveAt = studentMap[normalize(peer.email)];
        if (lastActiveAt) {
          peerObj.lastActiveAt = lastActiveAt;
        } else {
          peerObj.lastActiveAt = peer.updatedAt;
        }
        deduped.push(peerObj);
      }
    }

    res.json({
      profileComplete: true,
      userProfile: {
        year: currentUserProfile.year,
        semester: currentUserProfile.semester
      },
      peers: deduped
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create or update a peer profile by email (used before auth integration)
router.post("/upsert", protect, async (req, res) => {
  try {
    const {
      name,
      email,
      studentId,
      year,
      semester,
      modules,
      skills,
      degree,
      degreeProgram,
      bio,
      profilePic,
    } = req.body;

    const canonicalName = String(req.user?.name || name || "").trim();
    const canonicalEmail = String(req.user?.email || email || "").trim().toLowerCase();

    if (!canonicalName || !canonicalEmail) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const yearValue = Number(year) || 1;
    const semesterValue = Number(semester) || 1;

    const identityFilters = [{ email: canonicalEmail }];
    if (studentId) identityFilters.push({ studentId: String(studentId).trim() });
    identityFilters.push({ name: canonicalName, year: yearValue, semester: semesterValue });

    const existingByEmail = await Peer.findOne({ email: canonicalEmail });
    const existingByLegacy = await Peer.findOne({ $or: identityFilters }).sort({ rating: -1, updatedAt: -1 });
    const target = existingByEmail || existingByLegacy;

    const update = {
      name: canonicalName,
      email: canonicalEmail,
      studentId: studentId || "",
      year: yearValue,
      semester: semesterValue,
      modules: Array.isArray(modules) ? modules : [],
      skills: Array.isArray(skills) ? skills : [],
      degree: degree || `BSc IT - Year ${yearValue}`,
      degreeProgram: degreeProgram || "",
      bio: bio || "",
      profilePic: profilePic || "https://randomuser.me/api/portraits/lego/1.jpg",
    };

    let peer;
    if (target) {
      Object.assign(target, update);
      peer = await target.save();
    } else {
      peer = await Peer.create(update);
    }

    // Remove a stale duplicate if both a legacy and canonical record existed.
    if (existingByEmail && existingByLegacy && String(existingByEmail._id) !== String(existingByLegacy._id)) {
      await Peer.findByIdAndDelete(existingByLegacy._id);
    }

    res.status(200).json(peer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
