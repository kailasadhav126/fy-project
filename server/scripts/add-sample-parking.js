const mongoose = require('mongoose');
require('dotenv').config();

const Parking = require('../models/Parking');

const sampleParkingData = [
  {
    name: "Ramkund Parking Area",
    nameHindi: "रामकुंड पार्किंग क्षेत्र",
    address: "Near Ramkund Ghat, Panchavati, Nashik, Maharashtra 422003",
    location: {
      type: "Point",
      coordinates: [73.7898, 19.9975] // [longitude, latitude]
    },
    capacity: 150,
    total_spaces: 150,
    available_spaces: 85,
    price_per_hour: 20,
    price_per_day: 200,
    opening_hours: "24 hours",
    phone: "+91-253-2571234",
    verified: true
  },
  {
    name: "Panchavati Multi-Level Parking",
    nameHindi: "पंचवटी बहुमंजिला पार्किंग",
    address: "Panchavati Circle, Near CBS, Nashik, Maharashtra 422003",
    location: {
      type: "Point",
      coordinates: [73.7850, 19.9950] // [longitude, latitude]
    },
    capacity: 200,
    total_spaces: 200,
    available_spaces: 120,
    price_per_hour: 25,
    price_per_day: 250,
    opening_hours: "24 hours",
    phone: "+91-253-2571235",
    verified: true
  }
];

async function addSampleParking() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kumbh-sahyogi';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing parking data (optional - comment out if you want to keep existing data)
    // await Parking.deleteMany({});
    // console.log('Cleared existing parking data');

    // Check if parking already exists
    const existingParking = await Parking.find({
      name: { $in: sampleParkingData.map(p => p.name) }
    });

    if (existingParking.length > 0) {
      console.log('Sample parking data already exists. Updating...');
      
      for (const parking of sampleParkingData) {
        await Parking.findOneAndUpdate(
          { name: parking.name },
          parking,
          { upsert: true, new: true }
        );
        console.log(`Updated/Created: ${parking.name}`);
      }
    } else {
      // Insert sample parking data
      const result = await Parking.insertMany(sampleParkingData);
      console.log(`Successfully added ${result.length} parking locations`);
    }

    // Verify the data
    const allParking = await Parking.find({});
    console.log('\nAll Parking Locations:');
    allParking.forEach((parking, index) => {
      console.log(`\n${index + 1}. ${parking.name}`);
      console.log(`   Address: ${parking.address}`);
      console.log(`   Coordinates: [${parking.location.coordinates[0]}, ${parking.location.coordinates[1]}]`);
      console.log(`   Available: ${parking.available_spaces}/${parking.total_spaces}`);
      console.log(`   Price: ₹${parking.price_per_hour}/hour, ₹${parking.price_per_day}/day`);
    });

    console.log('\n✅ Sample parking data added successfully!');
    
  } catch (error) {
    console.error('Error adding sample parking:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the script
addSampleParking();
