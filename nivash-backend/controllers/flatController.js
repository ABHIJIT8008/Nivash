const Flat = require('../models/Flat');

// @desc    Create a new Flat
// @route   POST /api/flats
// @access  Private/Admin
const createFlat = async (req, res) => {
  try {
    const { block, flat_number } = req.body;

    // Check if flat already exists in this specific block
    const flatExists = await Flat.findOne({ block, flat_number });
    if (flatExists) {
      return res.status(400).json({ message: `Flat ${flat_number} already exists in Block ${block}` });
    }

    const flat = await Flat.create({
      block,
      flat_number
    });

    res.status(201).json(flat);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all flats (Optional: filter by block)
// @route   GET /api/flats
// @access  Private/Admin
const getFlats = async (req, res) => {
  try {
    // If a block name is passed as a query (?block=A), filter by it. Otherwise, return all.
    const filter = req.query.block ? { block: req.query.block } : {};
    const flats = await Flat.find(filter).populate('owner_id', 'name phone'); // Populates owner info if attached
    
    res.status(200).json(flats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add these to the bottom:
const updateFlat = async (req, res) => {
  try {
    const updatedFlat = await Flat.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    res.status(200).json(updatedFlat);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteFlat = async (req, res) => {
  try {
    await Flat.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { createFlat, getFlats, updateFlat, deleteFlat }; // Export them!
