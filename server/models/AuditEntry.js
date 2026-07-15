const mongoose = require("mongoose");

const AuditEntrySchema = new mongoose.Schema({
  sequenceNumber:   { type: Number, required: true },
  electionId:       { type: String, required: true },
  voteReceiptHash:  { type: String, required: true },
  previousHash:     { type: String, required: true },
  chainHash:        { type: String, required: true },
  recordedAt:       { type: Number, default: () => Date.now() },
});

AuditEntrySchema.index({ electionId: 1, sequenceNumber: 1 });

module.exports = mongoose.model("AuditEntry", AuditEntrySchema);
