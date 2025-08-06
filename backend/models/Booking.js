const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  phone: { type: String, required: true },
  alternative_phone: String,
  date: { type: String, required: true },
  days: { type: Number, default: 1 },
  event_type: { type: String, required: true },
  religion: String,
  timings: String, // combined startTime - endTime as a string
  services: {
    // Dynamic keys for services with boolean values
    type: Map,
    of: Boolean,
  },

  // Billing details
  cost: { type: Number, default: 0 }, // base cost (manual input)
  generatorHours: { type: Number, default: 0 },
  unitUsed: { type: Number, default: 0 },
  otherCharges: { type: Number, default: 0 }, // NEW FIELD
  discount: { type: Number, default: 0 },
  advance: { type: Number, default: 0 },  
  gstIncluded: { type: Boolean, default: false }, // default unchecked

  // Calculated billing summary
  baseCost: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },        
  
  // URL to the generated GST bill PDF (if any)
  gstBillUrl: { type: String, default: null },
}, {
  timestamps: true 
});

module.exports = mongoose.model("Booking", bookingSchema);
