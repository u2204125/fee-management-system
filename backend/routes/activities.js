const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');

// Get all activities
router.get('/', async (req, res) => {
  try {
    const activities = await Activity.find().sort({ timestamp: -1 }).limit(100);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get activity by ID
router.get('/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create activity
router.post('/', async (req, res) => {
  const activity = new Activity(req.body);
  try {
    const newActivity = await activity.save();
    res.status(201).json(newActivity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete old activities (keep last 100)
router.delete('/cleanup', async (req, res) => {
  try {
    const activities = await Activity.find().sort({ timestamp: -1 });
    if (activities.length > 100) {
      const toDelete = activities.slice(100);
      const ids = toDelete.map(a => a._id);
      await Activity.deleteMany({ _id: { $in: ids } });
    }
    res.json({ message: 'Cleanup completed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
