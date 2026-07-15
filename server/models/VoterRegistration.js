const mongoose = require('mongoose');

const VoterRegistrationSchema = new mongoose.Schema({
  uid: { type: String, required: true, index: true },
  fullName: { type: String, required: true, trim: true },
  nationalId: { type: String, required: true, trim: true, unique: true, index: true },
  email: { type: String, required: true, trim: true, lowercase: true, index: true },
  phone: { type: String, required: true, trim: true },
  dateOfBirth: { type: String, default: '' },
  address: { type: String, default: '' },
  gender: { type: String, default: '' },
  organization: { type: String, default: '' },
  department: { type: String, default: '' },
  studentId: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  verifiedAt: { type: Number, default: 0 },
  createdAt: { type: Number, default: () => Date.now() },
  updatedAt: { type: Number, default: () => Date.now() },
});

VoterRegistrationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('VoterRegistration', VoterRegistrationSchema);
