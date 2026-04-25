const express = require('express');
const Request = require('../models/Request');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// CREATE request
router.post("/", protect, async (req, res) => {
  try {
    const requestData = {
      ...req.body,
      senderEmail: req.user.email.toLowerCase().trim(),
      senderName: req.user.name
    };
    const request = new Request(requestData);
    const saved = await request.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET all requests for the authenticated user
router.get("/", protect, async (req, res) => {
  try {
    const email = req.user.email.toLowerCase().trim();
    // Fetch requests where the user is either the sender or the receiver
    const requests = await Request.find({
      $or: [
        { senderEmail: email },
        { receiverEmail: email }
      ]
    }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE request
router.put("/:id", protect, async (req, res) => {
  try {
    const updated = await Request.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE request
router.delete("/:id", protect, async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
