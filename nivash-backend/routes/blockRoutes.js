const express = require('express');
const router = express.Router();
const { createBlock, getBlocks } = require('../controllers/blockController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Both routes require the user to be logged in (protect) and be an Admin (authorize)
router.route('/')
  .post(protect, authorize('Admin'), createBlock)
  .get(protect, authorize('Admin'), getBlocks);

module.exports = router;