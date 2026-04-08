const router = require('express').Router();
const Hotel = require('../models/Hotel');

// Get all hotels
router.get('/', async (req, res) => {
  try {
    const docs = await Hotel.find().limit(500);
    res.json(docs);
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({ error: 'Failed to fetch hotels' });
  }
});

// Get nearby hotels based on user location
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radiusKm = 10 } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng required' });
    }
    
    // Fix duplicate indexes issue: drop all 2dsphere indexes and create one clean index
    try {
      const indexes = await Hotel.collection.indexes();
      const geoIndexes = indexes.filter(idx => 
        idx.key && (idx.key.location || idx.key['location.coordinates'])
      );
      
      // Drop all existing geospatial indexes
      for (const idx of geoIndexes) {
        try {
          await Hotel.collection.dropIndex(idx.name);
        } catch (dropError) {
          // Index might not exist, ignore
        }
      }
      
      // Create a single clean 2dsphere index on 'location'
      await Hotel.collection.createIndex({ 'location': '2dsphere' });
    } catch (idxError) {
      // If index creation fails, try to use existing one
      console.log('Index setup warning:', idxError.message);
    }
    
    // Try geospatial query
    try {
      const docs = await Hotel.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
            distanceField: 'distanceMeters',
            maxDistance: Number(radiusKm) * 1000,
            spherical: true
          }
        },
        {
          $limit: 50 // Limit nearby results
        }
      ]);
      
      console.log(`Found ${docs.length} nearby hotels within ${radiusKm}km`);
      return res.json(docs || []);
    } catch (geoError) {
      // Fallback to regular query if geospatial fails
      console.log('Geospatial query failed, using fallback:', geoError.message);
      const allHotels = await Hotel.find({ 
        'location.coordinates': { $exists: true, $ne: null } 
      }).limit(50);
      return res.json(allHotels || []);
    }
  } catch (e) {
    console.error('Nearby hotels error:', e);
    // Return empty array on error so frontend doesn't break
    res.json([]);
  }
});

module.exports = router;


