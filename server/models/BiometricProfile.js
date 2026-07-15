const mongoose = require("mongoose");

const BiometricProfileSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  descriptor: {
    type: [Number], // 128-dimensional face descriptor as array
    required: true
  },
  enrolledAt: {
    type: Number,
    required: true
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("BiometricProfile", BiometricProfileSchema);
