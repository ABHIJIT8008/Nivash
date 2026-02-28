const Notice = require('../models/Notice');

// @desc    Admin creates a new society notice
// @route   POST /api/notices
// @access  Private/Admin
const createNotice = async (req, res) => {
  try {
    const { title, message } = req.body;

    const notice = await Notice.create({
      title,
      message,
      posted_by: req.user._id // Automatically grab the Admin's ID from the token
    });

    res.status(201).json({ success: true, notice });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Fetch all notices (sorted by newest first)
// @route   GET /api/notices
// @access  Private (Admin, Owner, Security)
const getNotices = async (req, res) => {
  try {
    // Populate the 'posted_by' field so we can display the Admin's name
    const notices = await Notice.find()
      .populate('posted_by', 'name')
      .sort({ createdAt: -1 }); // -1 means newest first
      
    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc Update a notice
// @route PUT /api/notices/:id
const updateNotice = async (req, res) => {
  try {
    const updatedFlat = await Flat.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    res.status(200).json(updatedNotice);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc Delete a notice
// @route DELETE /api/notices/:id
const deleteNotice = async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { createNotice, getNotices, updateNotice, deleteNotice }; // Export them!