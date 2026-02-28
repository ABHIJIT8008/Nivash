const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true // e.g., 'A', 'B', 'Tower 1'
  }
}, { timestamps: true });

module.exports = mongoose.model('Block', blockSchema);