const express = require('express');
const Request = require('../models/Request');

const router = express.Router();

// CREATE request
router.post("/", async (req, res) => {
  try {
    const request = new Request(req.body);
    const saved = await request.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET all requests
router.get("/", async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE request
router.put("/:id", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
