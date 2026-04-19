const mongoose = require('mongoose');

const detectionSchema = new mongoose.Schema({
  detected: Boolean,
  confidence: Number,
  distance: Number,
  zone: String,
  coverage: Number,
  type: String,
  severity: String,
  cracks: Number
}, { _id: false });

const alertSchema = new mongoose.Schema({
  type: String,
  message: String,
  severity: String,
  time: String
}, { _id: false });

const monumentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  state: String,
  city: String,
  lat: Number,
  lng: Number,
  category: String,
  yearBuilt: Number,
  status: { type: String, enum: ['safe', 'warning', 'critical'], default: 'safe' },
  riskScore: Number,
  lastInspected: String,
  threats: [String],
  detections: {
    encroachment: detectionSchema,
    vegetation: detectionSchema,
    structural: detectionSchema,
    vandalism: detectionSchema
  },
  description: String,
  alerts: [alertSchema]
}, { timestamps: true });

module.exports = mongoose.model('Monument', monumentSchema);
