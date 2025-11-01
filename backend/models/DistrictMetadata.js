const mongoose = require('mongoose');

const DistrictMetadataSchema = new mongoose.Schema({
  district_code: { type: String, unique: true, index: true },
  district_name: { type: String, index: true },
  state_name: { type: String, index: true },
  state_code: String,
  latitude: Number,
  longitude: Number,
  population: Number,
  rural_population: Number,
  total_gram_panchayats: Number
}, { timestamps: true });

DistrictMetadataSchema.index({ state_name: 1, district_name: 1 });

module.exports = mongoose.model('DistrictMetadata', DistrictMetadataSchema);
