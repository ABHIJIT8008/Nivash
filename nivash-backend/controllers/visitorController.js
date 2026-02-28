const Visitor = require('../models/Visitor');
const Flat = require('../models/Flat');

// @desc    Security Guard logs a new visitor
// @route   POST /api/visitors
// @access  Private/Security
const logVisitor = async (req, res) => {
  try {
    const { visitor_name, photo_url, visiting_flat_id } = req.body;

    // 1. Save the visitor to MongoDB with "Pending" status
    const visitor = await Visitor.create({
      visitor_name,
      photo_url,
      visiting_flat_id
    });

    // Fetch flat details to make the notification look nice
    const populatedVisitor = await visitor.populate('visiting_flat_id', 'block flat_number');

    // 2. THE WEBSOCKET MAGIC!
    // We grab the Socket.io instance we injected into the Express app in server.js
    const io = req.app.get('socketio');
    
    // We emit an event ONLY to the specific room for this flat
    io.to(`room_flat_${visiting_flat_id}`).emit('new_visitor_alert', populatedVisitor);

    res.status(201).json({ message: 'Visitor logged and Resident notified', visitor: populatedVisitor });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Resident approves or denies a visitor
// @route   PUT /api/visitors/:id/status
// @access  Private/Owner
const updateVisitorStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'Approved' or 'Denied'
    const visitorId = req.params.id;

    // 1. Update the database record
    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    visitor.status = status;
    visitor.approved_by = req.user._id; // We know who approved it from their JWT token
    await visitor.save();

    // 2. THE WEBSOCKET MAGIC (Reverse!)
    // Tell the specific Security Guard's screen to update instantly (Green for Go, Red for Stop)
    const io = req.app.get('socketio');
    io.emit('visitor_status_updated', visitor); // Emitting globally to guards for now

    res.status(200).json({ message: `Visitor ${status}`, visitor });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Resident fetches their own visitor history
// @route   GET /api/visitors/my-visitors
// @access  Private/Owner
const getMyVisitors = async (req, res) => {
  try {
    // Find all visitors where the visiting_flat_id matches the logged-in user's flat
    const visitors = await Visitor.find({ visiting_flat_id: req.user.flat_id })
      .sort({ createdAt: -1 }); // Newest visitors first
      
    res.status(200).json(visitors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Admin fetches all visitors across the entire society
// @route   GET /api/visitors
// @access  Private/Admin
const getAllVisitors = async (req, res) => {
  try {
    // We use .populate() to pull in the actual Block and Flat Number instead of just the ID
    const visitors = await Visitor.find()
      .populate('visiting_flat_id', 'block flat_number')
      .sort({ createdAt: -1 }); // Newest first
      
    res.status(200).json(visitors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { logVisitor, updateVisitorStatus, getMyVisitors, getAllVisitors };