const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  // We store options as an array of objects so each option has its own vote counter
  options: [
    {
      text: { type: String, required: true },
      votes: { type: Number, default: 0 },
    }
  ],
  target_scope: {
    // 'Society' means everyone. 'Block' means only a specific building.
    type: {
      type: String,
      enum: ['Society', 'Block'],
      required: true,
      default: 'Society'
    },
    // If type is 'Block', this holds the block name (e.g., 'A', 'B'). If 'Society', it can be null.
    target_value: {
      type: String,
      default: null
    }
  },
  // THE BOUNCER: We push a Flat's ID into this array the moment they vote.
  voted_flats: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flat'
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Poll', pollSchema);