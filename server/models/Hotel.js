const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
  name: String,
  nameHindi: String,
  address: String,
  price: Number,
  rating: Number,
  reviews: Number,
  amenities: [String],
  image_url: String,
  verified: Boolean,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] } // [lng, lat]
  }
}, { timestamps: true });

// Create 2dsphere index on the entire location field (not on coordinates subfield)
HotelSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Hotel', HotelSchema);


