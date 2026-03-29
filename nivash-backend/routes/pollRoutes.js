const express = require('express');
const router = express.Router();
const { createPoll, getPolls, castVote } = require('../controllers/pollController');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   GET /api/polls
// @desc    Get all polls (filtered by the user's Block/Society scope)
// @access  Private (Logged in users only)
router.get('/', protect, getPolls);

// @route   POST /api/polls
// @desc    Create a new poll
// @access  Private (Only Admins or Owners can create polls)
router.post('/', protect, authorize('Admin', 'Owner'), createPoll);

// @route   POST /api/polls/:id/vote
// @desc    Cast a vote on a specific poll
// @access  Private (Logged in residents only)
router.post('/:id/vote', protect, castVote);

module.exports = router;