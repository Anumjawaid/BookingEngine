const mongoose = require('mongoose');

const rateSchema = new mongoose.Schema({
  originCity: { type: String, required: true, trim: true },
  destinationCity: { type: String, required: true, trim: true },
  basePrice: { type: Number, required: true },
  perKmRate: { type: Number, required: true },
  vehicleType: { type: String, required: true, enum: ['Sedan', 'SUV', 'Luxury'] }
}, { timestamps: true });

module.exports = mongoose.model('Rate', rateSchema);