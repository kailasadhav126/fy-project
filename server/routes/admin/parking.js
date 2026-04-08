const router = require('express').Router();
const Parking = require('../../models/Parking');

// Get all parking spaces
router.get('/', async (req, res) => {
  try {
    const parking = await Parking.find().sort({ createdAt: -1 });
    res.json(parking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single parking space
router.get('/:id', async (req, res) => {
  try {
    const parking = await Parking.findById(req.params.id);
    if (!parking) {
      return res.status(404).json({ error: 'Parking space not found' });
    }
    res.json(parking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create parking space
router.post('/', async (req, res) => {
  try {
    const parking = new Parking(req.body);
    await parking.save();
    res.status(201).json(parking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update parking space
router.put('/:id', async (req, res) => {
  try {
    const parking = await Parking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!parking) {
      return res.status(404).json({ error: 'Parking space not found' });
    }
    res.json(parking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete parking space
router.delete('/:id', async (req, res) => {
  try {
    const parking = await Parking.findByIdAndDelete(req.params.id);
    if (!parking) {
      return res.status(404).json({ error: 'Parking space not found' });
    }
    res.json({ message: 'Parking space deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

