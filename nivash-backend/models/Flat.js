const mongoose = require('mongoose');

const flatSchema = new mongoose.Schema({
  block: { 
    type: String, 
    required: true 
  }, // e.g., 'A' 
  flat_number: { 
    type: String, 
    required: true 
  }, // e.g., '101' [cite: 95]
  owner_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }, // Link to the primary owner [cite: 96]
  current_residents: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }] // Handling multiple family members [cite: 97]
}, { timestamps: true });

module.exports = mongoose.model('Flat', flatSchema);