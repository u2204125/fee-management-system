const express = require('express');
const ReferenceOption = require('../models/ReferenceOption');
const router = express.Router();

// Get all reference options
router.get('/', async (req, res) => {
  try {
    const referenceOptions = await ReferenceOption.find().sort({ name: 1 });
    res.json(referenceOptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reference option by ID
router.get('/:id', async (req, res) => {
  try {
    const referenceOption = await ReferenceOption.findById(req.params.id);
    if (!referenceOption) {
      return res.status(404).json({ message: 'Reference option not found' });
    }
    res.json(referenceOption);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new reference option
router.post('/', async (req, res) => {
  try {
    const referenceOption = new ReferenceOption(req.body);
    const savedReferenceOption = await referenceOption.save();
    res.status(201).json(savedReferenceOption);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update reference option
router.put('/:id', async (req, res) => {
  try {
    const referenceOption = await ReferenceOption.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!referenceOption) {
      return res.status(404).json({ message: 'Reference option not found' });
    }
    res.json(referenceOption);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete reference option
router.delete('/:id', async (req, res) => {
  try {
    const referenceOption = await ReferenceOption.findByIdAndDelete(req.params.id);
    if (!referenceOption) {
      return res.status(404).json({ message: 'Reference option not found' });
    }
    res.json({ message: 'Reference option deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
