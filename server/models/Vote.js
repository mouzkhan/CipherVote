const mongoose = require("mongoose");

const VoteSchema = new mongoose.Schema({
  electionId:   { type: String, required: true, index: true },
  email:        { type: String, index: true }, // For duplicate vote detection
  receiptHash:  { type: String, required: true },
  nonce:        { type: String, required: true },
  timestamp:    { type: Number, required: true },
  riskScore:    { type: Number, default: 0 },
  riskLevel:    { type: String, default: "LOW" },
  
  // Hybrid scoring
  hybridScore:  { type: Number, index: true },
  mlConfidence: { type: Number },
  modelVersion: { type: String },
  
  // Behavioral data (optional)
  mouseMovements: { type: Number, default: 0 },
  cursorPathLength: { type: Number, default: 0 },
  typingSpeed: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model("Vote", VoteSchema);
