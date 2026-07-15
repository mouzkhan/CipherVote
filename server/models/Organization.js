const mongoose = require("mongoose");

/**
 * Organization — a tenant in the Voting-as-a-Service model.
 * Each organization (university, company, govt body) gets:
 *   - Their own isolated elections
 *   - A unique API key for programmatic access
 *   - A subscription plan that limits how many elections/voters they can have
 *
 * This is the core of the VaaS (Voting as a Service) business model.
 * Organizations do NOT perform biometric verification - only voters do.
 */
const OrganizationSchema = new mongoose.Schema({
  name:        { type: String, required: true },          // e.g. "FAST NUCES Lahore"
  slug:        { type: String, required: true, unique: true }, // e.g. "fast-nuces-lahore"
  type:        { type: String, enum: ["university", "government", "corporate", "ngo", "community"], default: "university" },
  country:     { type: String, default: "Pakistan" },
  city:        { type: String, default: "" },
  contactEmail:{ type: String, required: true },
  apiKey:      { type: String, required: true, unique: true }, // generated on registration
  plan:        { type: String, enum: ["free", "basic", "professional", "enterprise"], default: "free" },
  status:      { type: String, enum: ["active", "suspended", "pending", "verified"], default: "pending" },
  verification: {
    status: { type: String, default: "pending" },
    ownerName: { type: String, default: "" },
    ownerEmail: { type: String, default: "" },
    ownerPhone: { type: String, default: "" },
    governmentId: { type: String, default: "" },
    documents: { type: [String], default: [] },
    registrationNumber: { type: String, default: "" },
    taxId: { type: String, default: "" },
    address: { type: String, default: "" },
    website: { type: String, default: "" },
    proofOfAuthority: { type: String, default: "" },
  },
  createdAt:   { type: Number, default: () => Date.now() },
  // Plan limits
  maxElections:{ type: Number, default: 3 },
  maxVoters:   { type: Number, default: 500 },
  // Usage counters
  electionsUsed: { type: Number, default: 0 },
});

module.exports = mongoose.model("Organization", OrganizationSchema);
