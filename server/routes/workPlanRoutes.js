const express = require('express');
const router = express.Router();
const { generateWorkplan } = require('../controllers/momentumController');

// POST request ekak haraha AI eka call karanawa
router.post('/generate-plan', generateWorkplan);

module.exports = router;