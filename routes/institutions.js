const express = require('express');
const router = express.Router();
const Institution = require('../models/Institution');

// Get all institutions
router.get('/', async (req, res) => {
  try {
    const institutions = await Institution.find();
    res.json(institutions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get institution by ID
router.get('/:id', async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);
    if (!institution) return res.status(404).json({ message: 'Institution not found' });
    res.json(institution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create institution
router.post('/', async (req, res) => {
  const institution = new Institution(req.body);
  try {
    const newInstitution = await institution.save();
    res.status(201).json(newInstitution);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update institution
router.put('/:id', async (req, res) => {
  try {
    const institution = await Institution.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!institution) return res.status(404).json({ message: 'Institution not found' });
    res.json(institution);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete institution
router.delete('/:id', async (req, res) => {
  try {
    const institution = await Institution.findByIdAndDelete(req.params.id);
    if (!institution) return res.status(404).json({ message: 'Institution not found' });
    res.json({ message: 'Institution deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
