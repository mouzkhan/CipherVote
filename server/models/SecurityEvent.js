const mongoose = require("mongoose");

const SecurityEventSchema = new mongoose.Schema({
  uid:        { type: String, index: true },
  electionId: { type: String, index: true },
  score:      { type: Number, index: true },
  level:      { type: String },
  blocked:    { type: Boolean },
  signals:    [{ type: String }],
  shapExplanations: [{ 
    feature: String,
    contribution: Number,
    direction: String,
    explanation: String
  }],
  mlConfidence: { type: Number },
  modelVersion: { type: String },
  timestamp:  { type: Number, default: () => Date.now() },
}, {
  timestamps: true
});

module.exports = mongoose.model("SecurityEvent", SecurityEventSchema);
