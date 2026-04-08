/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Hotel = require('../models/Hotel');
const MedicalService = require('../models/MedicalService');
const Parking = require('../models/Parking');

function importCSV(file, mapRow) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(file)
      .pipe(csv())
      .on('data', (r) => rows.push(mapRow(r)))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const dataRoot = path.resolve(__dirname, '../../client/public/data');

    // Hotels
    const hotels = await importCSV(path.join(dataRoot, 'hotels_nashik.csv'), (r) => ({
      name: r.name,
      nameHindi: r.nameHindi,
      address: r.address,
      price: Number(r.price) || 0,
      rating: Number(r.rating) || 0,
      reviews: Number(r.reviews) || 0,
      amenities: (r.amenities || '').split('|').map(s => s.trim()).filter(Boolean),
      image_url: r.image_url,
      verified: String(r.verified || '').toLowerCase() === 'true',
      location: { type: 'Point', coordinates: [Number(r.longitude), Number(r.latitude)] }
    }));
    await Hotel.deleteMany({});
    if (hotels.length) await Hotel.insertMany(hotels);

    // Medical
    const medical = await importCSV(path.join(dataRoot, 'medical_services_nashik.csv'), (r) => ({
      name: r.name,
      nameHindi: r.nameHindi,
      type: r.type,
      typeHindi: r.typeHindi,
      category: r.category,
      categoryHindi: r.categoryHindi,
      address: r.address,
      rating: Number(r.rating) || 0,
      reviews: Number(r.reviews) || 0,
      services: (r.services || '').split('|').map(s => s.trim()).filter(Boolean),
      servicesHindi: (r.servicesHindi || '').split('|').map(s => s.trim()).filter(Boolean),
      emergency: String(r.emergency || '').toLowerCase() === 'true',
      open24x7: String(r.open24x7 || '').toLowerCase() === 'true',
      phone: r.phone,
      image_url: r.image_url,
      location: { type: 'Point', coordinates: [Number(r.longitude), Number(r.latitude)] }
    }));
    await MedicalService.deleteMany({});
    if (medical.length) await MedicalService.insertMany(medical);

    // Parking
    const parking = await importCSV(path.join(dataRoot, 'parking_nashik.csv'), (r) => ({
      name: r.name,
      nameHindi: r.nameHindi,
      address: r.address,
      capacity: Number(r.capacity) || 0,
      total_spaces: Number(r.total_spaces) || 0,
      available_spaces: Number(r.available_spaces) || 0,
      price_per_hour: Number(r.price_per_hour) || 0,
      price_per_day: Number(r.price_per_day) || 0,
      opening_hours: r.opening_hours,
      phone: r.phone,
      verified: String(r.verified || '').toLowerCase() === 'true',
      location: { type: 'Point', coordinates: [Number(r.longitude), Number(r.latitude)] }
    }));
    await Parking.deleteMany({});
    if (parking.length) await Parking.insertMany(parking);

    console.log('Seeding completed');
    process.exit(0);
  } catch (e) {
    console.error('Seed error:', e);
    process.exit(1);
  }
})();


