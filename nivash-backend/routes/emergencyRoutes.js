const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { triggerPanic } = require('../controllers/emergencyController');

// @route   POST /api/emergency/trigger
// @access  Private (Resident & Owner)
router.post('/trigger', protect, authorize('Resident', 'Owner'), triggerPanic);

module.exports = router;