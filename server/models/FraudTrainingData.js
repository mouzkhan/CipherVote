const mongoose = require("mongoose");

/**
 * FraudTrainingData — Stores labeled examples for ML model training.
 * Administrators can label fraud predictions as:
 * - true_positive: Confirmed fraud
 * - false_positive:误flagged legitimate voter
 * - verified_legitimate: Verified no fraud after review
 */
const FraudTrainingDataSchema = new mongoose.Schema({
  predictionId: { type: String, required: true, index: true },
  uid: { type: String, required: true },
  electionId: { type: String, required: true },
  
  // Features for ML model
  failedLogins: { type: Number, default: 0 },
  timeOnPageMs: { type: Number, default: 9999 },
  lastSubmitMs: { type: Number, default: 9999 },
  userAgent: { type: String, default: "" },
  hasVotedBefore: { type: Boolean, default: false },
  
  // Behavioral biometrics (Phase 6)
  mouseMovements: { type: Number, default: 0 },
  cursorPathLength: { type: Number, default: 0 },
  typingSpeed: { type: Number, default: 0 },
  holdTimeMean: { type: Number, default: 0 },
  holdTimeStd: { type: Number, default: 0 },
  flightTimeMean: { type: Number, default: 0 },
  
  // Original scoring
  ruleScore: { type: Number, default: 0 },
  mlConfidence: { type: Number, default: 0 },
  hybridScore: { type: Number, default: 0 },
  
  // Labels (added by admin)
  isFraud: { type: Boolean }, // true = fraud, false = legitimate
  labelAddedAt: { type: Number },
  labelAddedBy: { type: String },
  labelNotes: { type: String },
  
  // Metadata
  timestamp: { type: Number, default: () => Date.now() },
  modelVersion: { type: String, default: "v1" },
  predictionSource: { type: String, default: "hybrid" }
}, {
  timestamps: true
});

// Index for efficient queries
FraudTrainingDataSchema.index({ uid: 1, timestamp: -1 });
FraudTrainingDataSchema.index({ isFraud: 1, modelVersion: 1 });

module.exports = mongoose.model("FraudTrainingData", FraudTrainingDataSchema);
