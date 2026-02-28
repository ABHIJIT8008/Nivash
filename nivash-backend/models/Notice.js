const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title for the notice']
  },
  message: {
    type: String,
    required: [true, 'Please add the notice message']
  },
  posted_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);