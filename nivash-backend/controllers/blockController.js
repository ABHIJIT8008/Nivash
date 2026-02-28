const Block = require('../models/Block');

// @desc    Create a new Block
// @route   POST /api/blocks
// @access  Private/Admin
const createBlock = async (req, res) => {
  try {
    const { name } = req.body;

    const blockExists = await Block.findOne({ name });
    if (blockExists) {
      return res.status(400).json({ message: 'Block already exists' });
    }

    const block = await Block.create({ name });
    res.status(201).json(block);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all Blocks
// @route   GET /api/blocks
// @access  Private/Admin
const getBlocks = async (req, res) => {
  try {
    const blocks = await Block.find({});
    res.status(200).json(blocks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createBlock, getBlocks };