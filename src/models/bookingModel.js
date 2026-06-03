const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  fare: { type: Number, required: true },
  
  // 🧠 The New Secure Business State Lifecycle
  status: { 
    type: String, 
    enum: ['Awaiting_Invoice', 'Invoiced', 'Payment_Confirmed', 'Dispatched_To_Drivers', 'Completed', 'Cancelled'], 
    default: 'Awaiting_Invoice' 
  },
  
  // Financial Tracking Records
  invoiceUrl: { type: String, default: null },
  paymentReferenceId: { type: String, default: null },
  invoiceSentAt: { type: Date, default: null },
  paymentConfirmedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);