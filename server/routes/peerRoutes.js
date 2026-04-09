const express = require('express');
const Peer = require('../models/Peer');

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
router.get("/", async (req, res) => {
  try {
    const { year, semester, excludeEmail } = req.query;

    const filter = {};
    if (year) filter.year = Number(year);
    if (semester) filter.semester = Number(semester);
    if (excludeEmail) filter.email = { $ne: excludeEmail };

    const peers = await Peer.find(filter).sort({ rating: -1, updatedAt: -1, name: 1 });

    // Safeguard: keep one profile per real student identity.
    const deduped = [];
    const seen = new Set();
    for (const peer of peers) {
      const key = getIdentityKey(peer);
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(peer);
      }
    }

    res.json(deduped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create or update a peer profile by email (used before auth integration)
router.post("/upsert", async (req, res) => {
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

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const update = {
      name,
      email,
      studentId: studentId || "",
      year: Number(year) || 1,
      semester: Number(semester) || 1,
      modules: Array.isArray(modules) ? modules : [],
      skills: Array.isArray(skills) ? skills : [],
      degree: degree || `BSc IT - Year ${Number(year) || 1}`,
      degreeProgram: degreeProgram || "",
      bio: bio || "",
      profilePic: profilePic || "https://randomuser.me/api/portraits/lego/1.jpg",
    };

    const peer = await Peer.findOneAndUpdate(
      { email },
      update,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json(peer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
