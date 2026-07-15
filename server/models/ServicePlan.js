/**
 * VaaS Pricing Plans — Pakistan context pricing (PKR)
 * These are defined as a static config, not a DB model,
 * since plans rarely change and don't need persistence.
 */

const PLANS = {
  free: {
    name: "Free",
    price_pkr: 0,
    price_usd: 0,
    maxElections: 3,
    maxVoters: 500,
    features: [
      "3 elections per year",
      "Up to 500 voters per election",
      "Basic audit log",
      "Email support",
      "CipherVote branding",
    ],
    ideal: "Student societies, small clubs",
  },
  basic: {
    name: "Basic",
    price_pkr: 4999,
    price_usd: 18,
    maxElections: 10,
    maxVoters: 5000,
    features: [
      "10 elections per year",
      "Up to 5,000 voters per election",
      "Full cryptographic audit chain",
      "AI fraud detection",
      "Custom election branding",
      "Priority email support",
    ],
    ideal: "University departments, NGOs",
  },
  professional: {
    name: "Professional",
    price_pkr: 19999,
    price_usd: 72,
    maxElections: 50,
    maxVoters: 50000,
    features: [
      "50 elections per year",
      "Up to 50,000 voters per election",
      "Advanced analytics dashboard",
      "SMS voter notifications",
      "API access",
      "Dedicated support",
      "White-label option",
    ],
    ideal: "Universities, government departments, corporations",
  },
  enterprise: {
    name: "Enterprise",
    price_pkr: null,
    price_usd: null,
    maxElections: -1,  // unlimited
    maxVoters: -1,     // unlimited
    features: [
      "Unlimited elections",
      "Unlimited voters",
      "National-scale infrastructure",
      "SLA guarantee (99.9% uptime)",
      "On-premise deployment option",
      "Dedicated infrastructure",
      "24/7 support",
      "Custom legal compliance (PEMRA, ECP)",
    ],
    ideal: "Election Commission of Pakistan, Provincial governments, Large universities",
  },
};

module.exports = PLANS;
