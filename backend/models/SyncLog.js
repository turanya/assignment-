const mongoose = require('mongoose');

const SyncLogSchema = new mongoose.Schema({
  sync_timestamp: { type: Date, index: true },
  status: { type: String, enum: ['success', 'partial', 'failed', 'in_progress'] },
  records_fetched: Number,
  api_response_time: Number,
  error_message: String,
  state_processed: String
}, { timestamps: true });

module.exports = mongoose.model('SyncLog', SyncLogSchema);
