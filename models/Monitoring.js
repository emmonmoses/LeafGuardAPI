const mongoose = require('mongoose');

const treeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
});

const monitoringSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  kabale: {
    type: String,
    required: true,
  },
  houseNumber: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  trees: [treeSchema],
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

const Monitoring = mongoose.model('Monitoring', monitoringSchema);

module.exports = Monitoring;
