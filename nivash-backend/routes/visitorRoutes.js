const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { logVisitor, updateVisitorStatus, getMyVisitors, getAllVisitors } = require('../controllers/visitorController');

// Only Security Guards can log a visitor
router.post('/', protect, authorize('Security', 'Admin'), logVisitor);

router.get('/my-visitors', protect, authorize('Owner'), getMyVisitors);

router.get('/', protect, authorize('Admin'), getAllVisitors);

// Only Owners (Residents) can approve or deny
router.put('/:id/status', protect, authorize('Owner', 'Admin'), updateVisitorStatus);

module.exports = router;