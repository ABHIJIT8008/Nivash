const mongoose = require('mongoose');

const parcelSchema = new mongoose.Schema({
  flat_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Flat', 
    required: true 
  },
  delivery_company: { 
    type: String, 
    required: true 
  }, // e.g., Amazon, Flipkart, Myntra
  otp: { 
    type: String, 
    required: true 
  }, // The 4-digit secret code
  status: { 
    type: String, 
    enum: ['Pending', 'Collected'], 
    default: 'Pending' 
  },
  collectedAt: { 
    type: Date 
  }
}, { timestamps: true });

module.exports = mongoose.model('Parcel', parcelSchema);