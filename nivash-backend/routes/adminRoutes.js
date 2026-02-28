const express = require('express');
const router = express.Router();

// 1. Import the new functions we just made in adminController
const { createUser, getUsers, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// 2. Map them to the root path ("/") so they match React's API.post('/users')
router.post('/', protect, authorize('Admin'), createUser);
router.get('/', protect, authorize('Admin'), getUsers);

// 3. Map the delete route so React's API.delete('/users/:id') works
router.delete('/:id', protect, authorize('Admin'), deleteUser);

module.exports = router;