const express = require('express');
const router = express.Router();
const { createFlat, getFlats, updateFlat, deleteFlat } = require('../controllers/flatController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, authorize('Admin'), createFlat)
  .get(protect, authorize('Admin', 'Security', 'Owner'), getFlats);
  
  router.put('/:id', protect, authorize('Admin'), updateFlat);
  router.delete('/:id', protect, authorize('Admin'), deleteFlat);

module.exports = router;