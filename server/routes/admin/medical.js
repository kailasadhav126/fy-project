const router = require('express').Router();
const MedicalService = require('../../models/MedicalService');

// Get all medical services
router.get('/', async (req, res) => {
  try {
    const services = await MedicalService.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single medical service
router.get('/:id', async (req, res) => {
  try {
    const service = await MedicalService.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Medical service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create medical service
router.post('/', async (req, res) => {
  try {
    const service = new MedicalService(req.body);
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update medical service
router.put('/:id', async (req, res) => {
  try {
    const service = await MedicalService.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!service) {
      return res.status(404).json({ error: 'Medical service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete medical service
router.delete('/:id', async (req, res) => {
  try {
    const service = await MedicalService.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Medical service not found' });
    }
    res.json({ message: 'Medical service deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

