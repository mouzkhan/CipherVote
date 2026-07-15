const mongoose = require("mongoose");

const CandidateSchema = new mongoose.Schema({
  id:          { type: String, required: true, auto: true },
  name:        { type: String, required: true },
  photo:       { type: String, default: "" }, // URL to candidate photo
  description: { type: String, default: "" },
  position:    { type: String, default: "" },
  votes:       { type: Number, default: 0 },
});

const ElectionSchema = new mongoose.Schema({
  organizationId: { type: String, required: true },
  organizationName: { type: String, required: true },
  title:          { type: String, required: true },
  description:     { type: String, default: "" },
  startDate:      { type: Number, required: true },
  endDate:        { type: Number, required: true },
  status:         { type: String, enum: ["draft", "active", "closed"], default: "draft" },
  invitationCode: { type: String, required: true, unique: true }, // Unique code for invitation link
  candidates:     [CandidateSchema],
  totalVotes:     { type: Number, default: 0 },
  createdAt:      { type: Number, default: () => Date.now() },
});

ElectionSchema.index({ organizationId: 1 });

module.exports = mongoose.model("Election", ElectionSchema);
