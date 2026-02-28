const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  visitor_name: { 
    type: String, 
    required: true 
  },
  photo_url: { 
    type: String, 
    required: true 
  }, // This will hold the Cloudinary Image Link
  visiting_flat_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Flat', 
    required: true 
  },
  entry_time: { 
    type: Date, 
    default: Date.now 
  },
  exit_time: { 
    type: Date 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Denied'], 
    default: 'Pending' 
  },
  approved_by: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Visitor', visitorSchema);