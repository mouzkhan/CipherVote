import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/pricing.css";

/**
 * CipherVote — Voting as a Service (VaaS) Pricing Page
 * Targets: Pakistani universities, government departments, corporations, NGOs
 */

const PLANS = [
  {
    key: "free",
    name: "Free",
    price_pkr: 0,
    price_label: "Free forever",
    ideal: "Student societies, small clubs",
    badge: null,
    features: [
      "3 elections per year",
      "Up to 500 voters",
      "Basic audit log",
      "SHA-256 vote receipts",
      "Email support",
      "CipherVote branding",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    key: "basic",
    name: "Basic",
    price_pkr: 4999,
    price_label: "PKR 4,999 / year",
    ideal: "University departments, NGOs",
    badge: null,
    features: [
      "10 elections per year",
      "Up to 5,000 voters",
      "Full blockchain audit chain",
      "AI fraud detection",
      "Custom election branding",
      "Priority email support",
    ],
    cta: "Start Free Trial",
    highlight: false,
  },
  {
    key: "professional",
    name: "Professional",
    price_pkr: 19999,
    price_label: "PKR 19,999 / year",
    ideal: "Universities, government offices",
    badge: "Most Popular",
    features: [
      "50 elections per year",
      "Up to 50,000 voters",
      "Advanced analytics dashboard",
      "SMS voter notifications",
      "API access",
      "Dedicated support",
      "White-label option",
    ],
    cta: "Get Started",
    highlight: true,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price_pkr: null,
    price_label: "Custom pricing",
    ideal: "ECP, Provincial govts, Large universities",
    badge: "National Scale",
    features: [
      "Unlimited elections",
      "Unlimited voters",
      "National-scale infrastructure",
      "99.9% uptime SLA",
      "On-premise deployment",
      "24/7 dedicated support",
      "ECP & legal compliance ready",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

const USE_CASES = [
  {
    icon: "🎓",
    title: "Universities",
    examples: ["Student union elections", "Faculty senate voting", "Department head selection", "Course representative polls"],
    orgs: "FAST, LUMS, NUST, UET, Comsats, IBA",
  },
  {
    icon: "🏛️",
    title: "Government",
    examples: ["Municipal committee votes", "Local body elections", "Internal departmental ballots", "Policy consultation polls"],
    orgs: "Provincial govts, Municipal corps, Ministries",
  },
  {
    icon: "🏢",
    title: "Corporations",
    examples: ["Board of directors elections", "Employee representative voting", "AGM shareholder votes", "Union elections"],
    orgs: "Pakistan Stock Exchange listed companies",
  },
  {
    icon: "🤝",
    title: "NGOs & Societies",
    examples: ["Executive committee elections", "Project prioritization votes", "Member polls", "Annual conference votes"],
    orgs: "Registered NGOs, Bar councils, Professional bodies",
  },
];

const TRUST_ITEMS = [
  { icon: "🔐", title: "Cryptographic Receipts", desc: "Every voter gets a SHA-256 receipt they can verify independently." },
  { icon: "⛓️", title: "Tamper-Proof Chain", desc: "Merkle-chain audit ledger makes any vote manipulation immediately detectable." },
  { icon: "🤖", title: "AI Fraud Detection", desc: "Real-time risk scoring blocks bot attacks and duplicate voting automatically." },
  { icon: "📋", title: "Public Audit Log", desc: "Any observer can verify the election result without accessing voter identities." },
  { icon: "🇵🇰", title: "Pakistan-First", desc: "Priced in PKR, hosted in Asia, designed for local institutional needs." },
  { icon: "📄", title: "Research-Backed", desc: "Built on published e-voting research: Helios, STAR-Vote, ElectionGuard." },
];

export default function Pricing() {
  const [showRegister, setShowRegister] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("form");
  const [result, setResult] = useState(null);

  return (
    <div className="page pricing-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pricing-hero-section">
        <div className="container">
          <div className="hero-badge">Voting as a Service</div>
          <h1 className="pricing-title">
            Run Any Election.<br />
            <span className="text-accent">Verifiable. Secure. Affordable.</span>
          </h1>
          <p className="pricing-sub">
            CipherVote lets universities, government bodies, corporations, and NGOs across Pakistan run
            cryptographically verified elections — without building their own infrastructure.
          </p>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="pricing-plans-section">
        <div className="container">
          <div className="plans-grid">
            {PLANS.map((plan) => (
              <div key={plan.key} className={`plan-card ${plan.highlight ? "plan-featured" : ""}`}>
                {plan.badge && <div className="plan-badge">{plan.badge}</div>}
                <div className="plan-header">
                  <h3 className="plan-name">{plan.name}</h3>
                  <div className="plan-price">{plan.price_label}</div>
                  <p className="plan-ideal">{plan.ideal}</p>
                </div>
                <ul className="plan-features">
                  {plan.features.map((f, i) => (
                    <li key={i}><span className="check-icon">✓</span> {f}</li>
                  ))}
                </ul>
                <button
                  className={`btn ${plan.highlight ? "btn-primary" : "btn-outline"} w-full plan-cta`}
                  onClick={() => { setSelectedPlan(plan.key); setShowRegister(true); }}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="use-cases-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title text-center">Who Uses CipherVote</h2>
            <p className="section-sub text-center">Designed for Pakistan's institutions — from student bodies to government departments.</p>
          </div>
          <div className="use-cases-grid">
            {USE_CASES.map((uc) => (
              <div key={uc.title} className="use-case-card">
                <div className="use-case-header">
                  <span className="use-case-icon">{uc.icon}</span>
                  <h3 className="use-case-title">{uc.title}</h3>
                </div>
                <ul className="use-case-list">
                  {uc.examples.map((e) => <li key={e}>{e}</li>)}
                </ul>
                <p className="use-case-orgs">Examples: {uc.orgs}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section">
        <div className="container">
          <div className="trust-card">
            <div className="section-header">
              <h2 className="section-title text-center">Why Trust CipherVote?</h2>
            </div>
            <div className="trust-grid">
              {TRUST_ITEMS.map((t) => (
                <div key={t.title} className="trust-item">
                  <div className="trust-icon">{t.icon}</div>
                  <h4 className="trust-title">{t.title}</h4>
                  <p className="trust-desc">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      {showRegister && (
        <RegisterModal 
          plan={selectedPlan} 
          onClose={() => { setShowRegister(false); setStep("form"); setError(""); }}
        />
      )}

      <Footer />
    </div>
  );
}

// Registration Modal Component
function RegisterModal({ plan, onClose }) {
  const [form, setForm] = useState({
    name: "", 
    type: "university", 
    city: "", 
    contactEmail: "", 
    plan,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("form");
  const [result, setResult] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim() || !form.contactEmail.trim()) {
      setError("Organization name and email are required.");
      return;
    }
    
    setSaving(true);
    setError("");
    
    try {
      const res = await api.registerOrganization({ ...form, country: "Pakistan" });
      setResult(res);
      setStep("success");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Register organization">
      <div className="modal-box">
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

        {step === "form" && (
          <>
            <h2 className="modal-title">Register Your Organization</h2>
            <p className="modal-subtitle">
              Selected plan: <strong>{plan.charAt(0).toUpperCase() + plan.slice(1)}</strong>
            </p>
            
            {error && <div className="alert alert-error">{error}</div>}
            
            <div className="form-group">
              <label className="label">Organization Name</label>
              <input className="input" value={form.name} onChange={set("name")} placeholder="e.g. FAST NUCES Lahore" />
            </div>
            
            <div className="form-group">
              <label className="label">Organization Type</label>
              <select className="input" value={form.type} onChange={set("type")}>
                <option value="university">University / Educational Institute</option>
                <option value="government">Government Department</option>
                <option value="corporate">Corporation / Company</option>
                <option value="ngo">NGO / Non-Profit</option>
                <option value="community">Community / Society</option>
              </select>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="label">City</label>
                <input className="input" value={form.city} onChange={set("city")} placeholder="e.g. Lahore" />
              </div>
              <div className="form-group">
                <label className="label">Contact Email</label>
                <input className="input" type="email" value={form.contactEmail} onChange={set("contactEmail")} placeholder="admin@org.edu.pk" />
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={submit} disabled={saving}>
                {saving ? "Registering…" : "Register & Continue"}
              </button>
            </div>
          </>
        )}

        {step === "success" && result && (
          <div className="success-content">
            <div className="success-icon">🎉</div>
            <h2 className="modal-title">Registration Successful!</h2>
            <p className="modal-subtitle">Your organization has been registered.</p>
            
            <div className="result-card">
              <div className="result-row">
                <span className="result-label">Organization Slug</span>
                <span className="result-value hash-display">{result.slug}</span>
              </div>
              <div className="result-row">
                <span className="result-label">API Key</span>
                <span className="result-value hash-display">{result.apiKey}</span>
              </div>
            </div>
            
            <p className="warning-text">
              ⚠️ Save your API key now — it won't be shown again!
            </p>
            
            <button className="btn btn-primary w-full" onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}