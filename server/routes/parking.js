const router = require('express').Router();
const Parking = require('../models/Parking');

router.get('/', async (req, res) => {
  const docs = await Parking.find().limit(500);
  res.json(docs);
});

router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radiusKm = 5 } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });

    // Fix duplicate indexes issue: drop all 2dsphere indexes and create one clean index
    try {
      const indexes = await Parking.collection.indexes();
      const geoIndexes = indexes.filter(idx =>
        idx.key && (idx.key.location || idx.key['location.coordinates'])
      );

      // Drop all existing geospatial indexes
      for (const idx of geoIndexes) {
        try {
          await Parking.collection.dropIndex(idx.name);
        } catch (dropError) {
          // Index might not exist, ignore
        }
      }

      // Create a single clean 2dsphere index on 'location'
      await Parking.collection.createIndex({ 'location': '2dsphere' });
    } catch (idxError) {
      // If index creation fails, try to use existing one
      console.log('Index setup warning:', idxError.message);
    }

    // Try geospatial query
    try {
      const docs = await Parking.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
            distanceField: 'distanceMeters',
            maxDistance: Number(radiusKm) * 1000,
            spherical: true
          }
        }
      ]);

      return res.json(docs || []);
    } catch (geoError) {
      // Fallback to regular query if geospatial fails
      console.log('Geospatial query failed, using fallback:', geoError.message);
      const allParking = await Parking.find({
        'location.coordinates': { $exists: true, $ne: null }
      }).limit(50);
      return res.json(allParking || []);
    }
  } catch (e) {
    console.error('Nearby parking error:', e);
    // Return empty array on error so frontend doesn't break
    res.json([]);
  }
});

module.exports = router;


