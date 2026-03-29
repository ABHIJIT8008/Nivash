const Invoice = require('../models/Invoice');
const Flat = require('../models/Flat');
const Razorpay = require('razorpay');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyIdHere',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourTestSecretKeyHere',
});

// @desc    Generate maintenance invoices for all flats (Admin)
// @route   POST /api/invoices/bulk
const generateBulkInvoices = async (req, res) => {
  try {
    const { title, amount, dueDate } = req.body;

    if (!title || !amount || !dueDate) {
      return res.status(400).json({ message: 'Please provide title, amount, and due date' });
    }

    const flats = await Flat.find();

    if (flats.length === 0) {
      return res.status(400).json({ message: 'No flats found to bill.' });
    }

    const invoicesToCreate = flats.map(flat => ({
      flat_id: flat._id,
      title,
      amount,
      dueDate
    }));

    const result = await Invoice.insertMany(invoicesToCreate);

    res.status(201).json({ 
      message: `Successfully generated ${result.length} invoices!`,
      invoices: result 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error generating invoices' });
  }
};

// @desc    Get all invoices for Admin dashboard
// @route   GET /api/invoices
const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('flat_id', 'block flat_number').sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching invoices' });
  }
};

// @desc    Get my pending dues (Resident App)
// @route   GET /api/invoices/my-dues
const getMyDues = async (req, res) => {
  try {
    if (!req.user.flat_id) {
      return res.status(400).json({ message: 'No flat assigned to this resident.' });
    }

    const myInvoices = await Invoice.find({ flat_id: req.user.flat_id }).sort({ dueDate: 1 });
    res.json(myInvoices);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching dues' });
  }
};

// @desc    Create a Razorpay Order for a specific invoice
// @route   POST /api/invoices/:id/create-order
const createPaymentOrder = async (req, res) => {
  try {
    const invoiceId = req.params.id;

    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.flat_id.toString() !== req.user.flat_id.toString()) {
      return res.status(403).json({ message: 'Not authorized to pay this invoice' });
    }

    if (invoice.status === 'Paid') {
      return res.status(400).json({ message: 'This invoice is already paid!' });
    }

    // Multiply by 100 because Razorpay expects paise!
    const options = {
      amount: invoice.amount * 100, 
      currency: 'INR',
      receipt: `receipt_inv_${invoice._id}`,
    };

    const order = await razorpay.orders.create(options);

    invoice.razorpay_order_id = order.id;
    await invoice.save();

    res.status(200).json({
      message: 'Order created successfully',
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Server error generating payment order' });
  }
};

// @desc    Manually update invoice status (Admin - for Cash/UPI payments)
// @route   PUT /api/invoices/:id/status
const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    invoice.status = status;
    if (status === 'Paid') {
      invoice.paidAt = Date.now();
    }

    await invoice.save();
    res.json({ message: `Invoice marked as ${status}`, invoice });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating invoice status' });
  }
};

module.exports = {
  generateBulkInvoices,
  getAllInvoices,
  getMyDues,
  createPaymentOrder,
  updateInvoiceStatus
};