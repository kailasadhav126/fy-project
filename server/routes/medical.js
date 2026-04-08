const router = require('express').Router();
const MedicalService = require('../models/MedicalService');

router.get('/', async (req, res) => {
  const docs = await MedicalService.find().limit(500);
  res.json(docs);
});

router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radiusKm = 5 } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });
    const docs = await MedicalService.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          distanceField: 'distanceMeters',
          maxDistance: Number(radiusKm) * 1000,
          spherical: true
        }
      }
    ]);
    res.json(docs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;


