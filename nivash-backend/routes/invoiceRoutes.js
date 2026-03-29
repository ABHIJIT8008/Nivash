const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
  generateBulkInvoices, 
  getAllInvoices, 
  getMyDues, 
  createPaymentOrder,
  updateInvoiceStatus 
} = require('../controllers/invoiceController');

// Resident Routes
router.get('/my-dues', protect, authorize('Resident', 'Owner'), getMyDues);
router.post('/:id/create-order', protect, authorize('Resident', 'Owner'), createPaymentOrder);

// Admin Routes
router.post('/bulk', protect, authorize('Admin'), generateBulkInvoices);
router.get('/', protect, authorize('Admin'), getAllInvoices);

router.put('/:id/status', protect, authorize('Admin'), updateInvoiceStatus); 

module.exports = router;