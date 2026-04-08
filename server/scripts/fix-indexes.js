/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');

(async () => {
  try {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI missing');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Get all indexes
    const indexes = await Hotel.collection.indexes();
    console.log('Current indexes:', indexes.map(idx => ({ name: idx.name, key: idx.key })));

    // Find all geospatial indexes
    const geoIndexes = indexes.filter(idx => 
      idx.key && (idx.key.location || idx.key['location.coordinates'])
    );

    if (geoIndexes.length === 0) {
      console.log('No geospatial indexes found. Creating one...');
      await Hotel.collection.createIndex({ 'location': '2dsphere' });
      console.log('✅ Created 2dsphere index on location');
    } else if (geoIndexes.length > 1) {
      console.log(`Found ${geoIndexes.length} geospatial indexes. Cleaning up...`);
      
      // Drop all existing geospatial indexes
      for (const idx of geoIndexes) {
        try {
          await Hotel.collection.dropIndex(idx.name);
          console.log(`✅ Dropped index: ${idx.name}`);
        } catch (dropError) {
          console.log(`⚠️  Could not drop ${idx.name}:`, dropError.message);
        }
      }
      
      // Create a single clean index
      await Hotel.collection.createIndex({ 'location': '2dsphere' });
      console.log('✅ Created clean 2dsphere index on location');
    } else {
      console.log('✅ Only one geospatial index exists. No cleanup needed.');
    }

    // Verify final state
    const finalIndexes = await Hotel.collection.indexes();
    const finalGeoIndexes = finalIndexes.filter(idx => 
      idx.key && (idx.key.location || idx.key['location.coordinates'])
    );
    console.log(`\n✅ Final geospatial indexes: ${finalGeoIndexes.length}`);
    
    process.exit(0);
  } catch (e) {
    console.error('Fix indexes failed:', e.message);
    process.exit(1);
  }
})();

