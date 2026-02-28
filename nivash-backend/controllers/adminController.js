const User = require('../models/User');

// @desc    Pre-seed a new user (Resident/Guard/Admin)
// @route   POST /api/users
const createUser = async (req, res) => {
  try {
    // 1. We tell the backend to look for flat_id!
    const { name, phone, role, flat_id } = req.body;

    const userExists = await User.findOne({ phone });
    if (userExists) {
      return res.status(400).json({ message: 'User with this phone number already exists.' });
    }

    // 2. We save the flat_id to the database (only if they are an Owner)
    const user = await User.create({
      name,
      phone,
      role,
      flat_id: role === 'Owner' ? flat_id : undefined 
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users for the Admin table
// @route   GET /api/users
const getUsers = async (req, res) => {
  try {
    // We use .populate() so the React table can display the Block and Flat Number
    const users = await User.find().populate('flat_id', 'block flat_number');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createUser, getUsers, deleteUser };