const mongoose = require('mongoose');

const ParkingSchema = new mongoose.Schema({
  name: String,
  nameHindi: String,
  address: String,
  capacity: Number,
  total_spaces: Number,
  available_spaces: Number,
  price_per_hour: Number,
  price_per_day: Number,
  opening_hours: String,
  phone: String,
  verified: Boolean,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] }
  }
}, { timestamps: true });

// Create 2dsphere index on the entire location field
ParkingSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Parking', ParkingSchema);


