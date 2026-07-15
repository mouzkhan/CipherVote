const mongoose = require("mongoose");

// Voter registration record - for voters who register via invitation link
const VoterRegistrationSchema = new mongoose.Schema({
  electionId:    { type: String, required: true },
  fullName:      { type: String, required: true },
  email:         { type: String, required: true },
  phone:         { type: String, default: "" },
  nationalId:    { type: String, default: "" },
  password:      { type: String, required: true }, // For re-login and duplicate vote detection
  biometricVerified: { type: Boolean, default: false },
  hasVoted:      { type: Boolean, default: false },
  registeredAt:  { type: Number, default: () => Date.now() },
});

VoterRegistrationSchema.index({ electionId: 1, email: 1 }, { unique: true });

// Vote record - prevents double voting
const VoteRecordSchema = new mongoose.Schema({
  uid:         { type: String, required: true },
  electionId:  { type: String, required: true },
  candidateId: { type: String, required: true },
  votedAt:     { type: Number, required: true },
  receiptHash: { type: String, required: true },
});

VoteRecordSchema.index({ uid: 1, electionId: 1 }, { unique: true });

const VoterSchema = new mongoose.Schema({
  uid:         { type: String, required: true },
  electionId:  { type: String, required: true },
  votedAt:     { type: Number, required: true },
  receiptHash: { type: String, required: true },
});

VoterSchema.index({ uid: 1, electionId: 1 }, { unique: true });

module.exports = {
  Voter: mongoose.model("Voter", VoterSchema),
  VoterRegistration: mongoose.model("VoterRegistration", VoterRegistrationSchema),
  VoteRecord: mongoose.model("VoteRecord", VoteRecordSchema),
};
