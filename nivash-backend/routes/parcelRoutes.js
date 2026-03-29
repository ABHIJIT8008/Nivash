const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// 👇 We added getAllParcels to this import list!
const { 
  receiveParcel, 
  getMyParcels, 
  verifyAndCollect, 
  getAllParcels 
} = require('../controllers/parcelController');

// Resident Route: View their packages and OTPs
router.get('/my-parcels', protect, authorize('Resident', 'Owner'), getMyParcels);

// Security/Admin Routes: Log packages and verify OTPs
router.get('/', protect, authorize('Admin', 'Security'), getAllParcels); 
router.post('/', protect, authorize('Admin', 'Security'), receiveParcel);
router.put('/:id/verify', protect, authorize('Admin', 'Security'), verifyAndCollect);

module.exports = router;