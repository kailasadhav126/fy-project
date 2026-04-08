const mongoose = require('mongoose');

const MedicalServiceSchema = new mongoose.Schema({
  name: String,
  nameHindi: String,
  type: String,
  typeHindi: String,
  category: String,
  categoryHindi: String,
  address: String,
  rating: Number,
  reviews: Number,
  services: [String],
  servicesHindi: [String],
  emergency: Boolean,
  open24x7: Boolean,
  phone: String,
  image_url: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] }
  }
}, { timestamps: true });

// Create 2dsphere index on the entire location field
MedicalServiceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('MedicalService', MedicalServiceSchema);


