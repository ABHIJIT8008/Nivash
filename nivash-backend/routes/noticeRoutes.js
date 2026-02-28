const express = require('express');
const router = express.Router();
const { createNotice, getNotices, updateNotice, deleteNotice } = require('../controllers/noticeController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Anyone logged in can view the notices
router.get('/', protect, getNotices);

// ONLY Admins can create new notices
router.post('/', protect, authorize('Admin'), createNotice);
router.put('/:id', protect, authorize('Admin'), updateNotice);
router.delete('/:id', protect, authorize('Admin'), deleteNotice);

module.exports = router;