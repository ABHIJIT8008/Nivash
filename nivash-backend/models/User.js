const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  }, // [cite: 83]
  role: { 
    type: String, 
    enum: ['Admin', 'Staff', 'Owner', 'Security'], 
    required: true 
  }, // Strict role-based access [cite: 84]
  flat_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Flat', 
    default: null 
  }, // Null for Admin/Staff 
  phone: { 
    type: String, 
    required: true, 
    unique: true 
  }, // Unique identifier for login [cite: 86]
  password_hash: { 
    type: String, 
    // required: true 
  }, // Encrypted password [cite: 87]
  fcm_token: { 
    type: String 
  } // For Push Notifications later [cite: 88]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);