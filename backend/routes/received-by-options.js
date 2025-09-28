const express = require('express');
const ReceivedByOption = require('../models/ReceivedByOption');
const router = express.Router();

// Get all received by options
router.get('/', async (req, res) => {
  try {
    const receivedByOptions = await ReceivedByOption.find().sort({ name: 1 });
    res.json(receivedByOptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get received by option by ID
router.get('/:id', async (req, res) => {
  try {
    const receivedByOption = await ReceivedByOption.findById(req.params.id);
    if (!receivedByOption) {
      return res.status(404).json({ message: 'Received by option not found' });
    }
    res.json(receivedByOption);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new received by option
router.post('/', async (req, res) => {
  try {
    const receivedByOption = new ReceivedByOption(req.body);
    const savedReceivedByOption = await receivedByOption.save();
    res.status(201).json(savedReceivedByOption);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update received by option
router.put('/:id', async (req, res) => {
  try {
    const receivedByOption = await ReceivedByOption.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!receivedByOption) {
      return res.status(404).json({ message: 'Received by option not found' });
    }
    res.json(receivedByOption);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete received by option
router.delete('/:id', async (req, res) => {
  try {
    const receivedByOption = await ReceivedByOption.findByIdAndDelete(req.params.id);
    if (!receivedByOption) {
      return res.status(404).json({ message: 'Received by option not found' });
    }
    res.json({ message: 'Received by option deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
