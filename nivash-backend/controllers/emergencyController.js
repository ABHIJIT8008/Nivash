const Emergency = require('../models/Emergency');
const User = require('../models/User');

// @desc    Trigger panic button
// @route   POST /api/emergency/trigger
// @access  Private (Resident)
const triggerPanic = async (req, res) => {
  try {
    const user = req.user;

    if (!user.flat_id) {
      return res.status(400).json({ message: 'No flat assigned to this user.' });
    }

    // 1. Save it to the database
    const emergency = await Emergency.create({
      resident_id: user._id,
      flat_id: user.flat_id,
    });

    // We populate the flat info so the Admin panel knows exactly which door to run to
    const populatedEmergency = await Emergency.findById(emergency._id)
      .populate('resident_id', 'name phone')
      .populate('flat_id', 'block number');

    // 2. THE MAGIC: Emit the WebSocket event to the Admin Panel!
    const io = req.app.get('socketio');
    io.emit('panicAlert', populatedEmergency); // 'panicAlert' is the signal name

    res.status(201).json({ message: 'Emergency alert sent successfully!', emergency: populatedEmergency });
  } catch (error) {
    console.error('Panic trigger error:', error);
    res.status(500).json({ message: 'Server error triggering panic button' });
  }
};

module.exports = { triggerPanic };