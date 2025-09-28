const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: { type: String, required: true },
  description: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
  user: { type: String, required: true }
});

module.exports = mongoose.model('Activity', activitySchema);
