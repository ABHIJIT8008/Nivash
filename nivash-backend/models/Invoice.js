const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  flat_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Flat', 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  }, // e.g., "March 2026 Maintenance"
  amount: { 
    type: Number, 
    required: true 
  },
  dueDate: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Overdue'], 
    default: 'Pending' 
  },
  // We will use these when we integrate Razorpay!
  razorpay_order_id: { 
    type: String 
  },
  razorpay_payment_id: { 
    type: String 
  },
  paidAt: { 
    type: Date 
  }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);