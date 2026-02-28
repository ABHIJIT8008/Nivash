const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title for the issue']
  },
  description: {
    type: String,
    required: [true, 'Please describe the issue']
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved'],
    default: 'Open'
  },
  raised_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  flat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flat',
    required: true
  },
  resolved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // The Admin who fixes it
  }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);