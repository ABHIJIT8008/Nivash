const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register user (Claiming a pre-seeded account)
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { phone, password, name,  } = req.body;

    // 1. Check if Admin has pre-seeded this phone number
    const user = await User.findOne({ phone });
    
    if (!user) {
      return res.status(403).json({ 
        message: 'Phone number not found. Please contact Society Admin to add your details first.' 
      });
    }

    // 2. Check if the user has already registered (already has a password)
    if (user.password_hash) {
      return res.status(400).json({ message: 'User already registered. Please log in.' });
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Update the pre-seeded user record
    user.password_hash = hashedPassword;
    if (name) user.name = name; // Update name if provided
    await user.save();

    res.status(201).json({ message: 'Registration successful. You can now log in.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // 1. Find user by phone
    const user = await User.findOne({ phone }).populate('flat_id', 'block flat_number');
    
    // If user doesn't exist or hasn't set up a password yet
    if (!user || !user.password_hash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. Check password match
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Generate JWT Token
    // We embed the user's ID and role inside the token payload
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // 4. Send success response
    res.status(200).json({
      _id: user._id,
      name: user.name,
      role: user.role,
      token: token,
      flat_id: user.flat_id
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { registerUser, loginUser };