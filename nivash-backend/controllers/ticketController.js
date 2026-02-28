const Ticket = require('../models/Ticket');

// @desc    Resident creates a new maintenance ticket
// @route   POST /api/tickets
// @access  Private/Owner
const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;

    // We get the user ID and flat ID directly from the authenticated JWT token payload!
    const ticket = await Ticket.create({
      title,
      description,
      raised_by: req.user._id,
      flat_id: req.user.flat_id
    });

    res.status(201).json({ message: 'Ticket raised successfully', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Resident gets ONLY their own tickets
// @route   GET /api/tickets/my-tickets
// @access  Private/Owner
const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ raised_by: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Admin gets ALL tickets in the society
// @route   GET /api/tickets
// @access  Private/Admin
const getAllTickets = async (req, res) => {
  try {
    // Populate pulls in the actual names and flat numbers instead of just showing IDs
    const tickets = await Ticket.find()
      .populate('raised_by', 'name phone')
      .populate('flat_id', 'block flat_number')
      .sort({ createdAt: -1 });
      
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Admin updates ticket status (e.g., marks as Resolved)
// @route   PUT /api/tickets/:id
// @access  Private/Admin
const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.status = status;
    if (status === 'Resolved') {
      ticket.resolved_by = req.user._id;
    }

    await ticket.save();
    res.status(200).json({ message: `Ticket marked as ${status}`, ticket });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createTicket, getMyTickets, getAllTickets, updateTicketStatus };