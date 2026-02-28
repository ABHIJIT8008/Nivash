const express = require('express');
const router = express.Router();
const { 
  createTicket, 
  getMyTickets, 
  getAllTickets, 
  updateTicketStatus 
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Resident routes
router.post('/', protect, authorize('Owner'), createTicket);
router.get('/my-tickets', protect, authorize('Owner'), getMyTickets);

// Admin routes
router.get('/', protect, authorize('Admin'), getAllTickets);
router.put('/:id', protect, authorize('Admin'), updateTicketStatus);

module.exports = router;