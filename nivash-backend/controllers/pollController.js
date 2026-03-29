const Poll = require('../models/Poll');
const User = require('../models/User');

// @desc    Create a new poll
// @route   POST /api/polls
// @access  Private (Admin/Owner)
const createPoll = async (req, res) => {
  try {
    const { question, options, target_scope } = req.body;

    // The frontend will send options as an array of strings (e.g., ['Yes', 'No']). 
    // We map them into objects with a starting vote count of 0.
    const formattedOptions = options.map(opt => ({ text: opt, votes: 0 }));

    const poll = await Poll.create({
      question,
      options: formattedOptions,
      target_scope,
      createdBy: req.user.id // Assumes your auth middleware attaches the user ID
    });

    res.status(201).json(poll);
  } catch (error) {
    res.status(500).json({ message: 'Error creating poll', error: error.message });
  }
};

// @desc    Get polls relevant to the user
// @route   GET /api/polls
// @access  Private
const getPolls = async (req, res) => {
  try {
    // 1. Fetch the user and populate their flat details so we know their Block
    const user = await User.findById(req.user.id).populate('flat_id');
    
    let query = {};

    // 2. SCOPE LOGIC: If the user is a Resident (has a flat), filter the polls.
    if (user.flat_id) {
      query = {
        $or: [
          { 'target_scope.type': 'Society' }, // Global Polls
          { 'target_scope.type': 'Block', 'target_scope.target_value': user.flat_id.block } // Local Block Polls
        ]
      };
    } 
    // (If the user is an Admin without a flat, the query remains {} and fetches everything)

    const polls = await Poll.find(query).sort({ createdAt: -1 });
    res.status(200).json(polls);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching polls', error: error.message });
  }
};

// @desc    Cast a vote on a poll
// @route   POST /api/polls/:id/vote
// @access  Private
const castVote = async (req, res) => {
  try {
    const { optionId } = req.body;
    const pollId = req.params.id;

    // We get the user's flat_id straight from the token/auth middleware
    const userFlatId = req.user.flat_id;

    if (!userFlatId) {
      return res.status(403).json({ message: 'Only residents assigned to a flat can vote.' });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });

    // 3. THE BOUNCER: Check if this flat's ID is already in the array
    if (poll.voted_flats.includes(userFlatId)) {
      return res.status(400).json({ message: 'Your flat has already voted on this poll!' });
    }

    // Find the specific option they tapped
    const option = poll.options.id(optionId);
    if (!option) return res.status(404).json({ message: 'Option not found' });

    // 4. Increment the vote & add the flat to the bouncer list
    option.votes += 1;
    poll.voted_flats.push(userFlatId);

    await poll.save();

    res.status(200).json({ message: 'Vote cast successfully!', poll });
  } catch (error) {
    res.status(500).json({ message: 'Error casting vote', error: error.message });
  }
};

module.exports = { createPoll, getPolls, castVote };