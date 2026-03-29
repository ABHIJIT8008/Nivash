const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
  resident_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  flat_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Flat', 
    required: true 
  },
  type: { 
    type: String, 
    default: 'Panic Button' 
  },
  status: { 
    type: String, 
    enum: ['Active', 'Resolved'], 
    default: 'Active' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Emergency', emergencySchema);