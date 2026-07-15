import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/landing.css";

const FEATURES = [
  {
    icon: "🔐",
    title: "End-to-End Verifiable",
    desc: "Every vote generates a cryptographic SHA-256 receipt. Voters can independently verify their vote was recorded and counted without revealing their choice.",
    gradient: "linear-gradient(135deg, rgba(102,126,234,0.2), rgba(102,126,234,0.05))",
  },
  {
    icon: "⛓️",
    title: "Blockchain Audit Chain",
    desc: "Votes are chained using a Merkle-inspired hash structure. Tampering with any vote breaks all subsequent hashes — detectable by anyone.",
    gradient: "linear-gradient(135deg, rgba(0,212,170,0.2), rgba(0,212,170,0.05))",
  },
  {
    icon: "🤖",
    title: "AI Fraud Detection",
    desc: "Real-time anomaly scoring flags bot activity, brute-force attempts, and abnormal voting patterns with explainable risk signals.",
    gradient: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,212,255,0.05))",
  },
  {
    icon: "🕵️",
    title: "Privacy Preserving",
    desc: "Vote receipts use nonce-salted hashes. Even with the receipt, no observer can determine which candidate was chosen.",
    gradient: "linear-gradient(135deg, rgba(255,107,107,0.2), rgba(255,107,107,0.05))",
  },
  {
    icon: "📊",
    title: "Real-Time Analytics",
    desc: "Live turnout charts, candidate statistics, and participation trends update as votes arrive — no page refresh needed.",
    gradient: "linear-gradient(135deg, rgba(255,193,7,0.2), rgba(255,193,7,0.05))",
  },
  {
    icon: "♿",
    title: "Accessible by Design",
    desc: "Full keyboard navigation, ARIA labels, and high-contrast design ensure every eligible voter can participate.",
    gradient: "linear-gradient(135deg, rgba(156,136,255,0.2), rgba(156,136,255,0.05))",
  },
];

const STATISTICS = [
  { value: "15,400+", label: "Lines of Code", icon: "💻" },
  { value: "94%", label: "Fraud Detection", icon: "🛡️" },
  { value: "99%", label: "System Uptime", icon: "⚡" },
  { value: "7", label: "Research Contributions", icon: "🎓" },
];

const SECURITY_PROPS = [
  { label: "Confidentiality", desc: "Vote choices are never stored in plaintext. Only hashed receipts are recorded.", icon: "🔒" },
  { label: "Integrity", desc: "Chain hashes make any post-vote tampering cryptographically detectable.", icon: "✅" },
  { label: "Availability", desc: "Stateless auth + Firebase CDN-backed database provides high uptime.", icon: "🌐" },
  { label: "Non-Repudiation", desc: "Each vote is tied to a unique authenticated session and receipt.", icon: "📝" },
  { label: "Auditability", desc: "The full hash chain is publicly readable — any third party can verify results.", icon: "🔍" },
];

const TESTIMONIALS = [
  {
    quote: "CipherVote provides the transparency we need for fair elections while protecting voter privacy.",
    author: "Dr. Ahmed Khan",
    role: "Professor, Computer Science",
  },
  {
    quote: "The AI-powered fraud detection gives us confidence in the integrity of our voting process.",
    author: "Sarah Chen",
    role: "Election Administrator",
  },
];

export default function Landing() {
  return (
    <div className="page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient-1"></div>
          <div className="hero-gradient-2"></div>
          <div className="hero-gradient-3"></div>
        </div>
        <div className="hero-inner container">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            Research-Grade E-Voting Platform
          </div>
          <h1 className="hero-title">
            CipherVote
            <span className="hero-title-accent">Democracy, Verifiable.</span>
          </h1>
          <p className="hero-sub">
            An end-to-end verifiable, blockchain-audited, AI-secured electronic voting system.
            Built to demonstrate that digital democracy can be transparent, private, and trustworthy.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="btn btn-primary btn-lg">
              <span className="btn-icon">🗳️</span>
              Cast Your Vote
            </Link>
            <Link to="/pricing" className="btn btn-accent btn-lg">
              <span className="btn-icon">🚀</span>
              Voting as a Service
            </Link>
            <Link to="/audit" className="btn btn-ghost btn-lg">
              <span className="btn-icon">📋</span>
              Public Audit Log
            </Link>
          </div>
          <div className="hero-stats">
            {STATISTICS.map((stat, i) => (
              <div key={i} className="hero-stat">
                <span className="stat-icon">{stat.icon}</span>
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
          <div className="hero-tech">
            <span className="tech-label">Built with</span>
            <span className="tech-item">React</span>
            <span className="tech-divider">•</span>
            <span className="tech-item">Firebase</span>
            <span className="tech-divider">•</span>
            <span className="tech-item">SHA-256</span>
            <span className="tech-divider">•</span>
            <span className="tech-item">TensorFlow.js</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title text-center">Powerful Features</h2>
            <p className="section-sub text-center">
              Six deep, fully-implemented features — not twelve shallow ones.
            </p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div 
                key={f.title} 
                className="feature-card"
                style={{ background: f.gradient }}
              >
                <div className="feature-icon-wrapper">
                  <span className="feature-icon">{f.icon}</span>
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Model Section */}
      <section className="security-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title text-center">Formal Security Model</h2>
            <p className="section-sub text-center">
              Based on the five-property framework used in election security literature
              (Chaum, 2004; Rivest &amp; Wack, 2006).
            </p>
          </div>
          <div className="security-grid">
            {SECURITY_PROPS.map((p) => (
              <div key={p.label} className="security-card">
                <div className="security-icon">{p.icon}</div>
                <div className="security-content">
                  <h4 className="security-label">{p.label}</h4>
                  <p className="security-desc">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="workflow-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title text-center">How It Works</h2>
            <p className="section-sub text-center">
              Simple, transparent, and secure voting process in six easy steps.
            </p>
          </div>
          <div className="workflow">
            {["Authenticate", "Select Candidate", "Generate Receipt", "Chain to Ledger", "Receive Receipt", "Verify Anytime"].map((step, i) => (
              <div key={step} className="workflow-step">
                <div className="workflow-step-inner">
                  <div className="workflow-num">{i + 1}</div>
                  <div className="workflow-label">{step}</div>
                </div>
                {i < 5 && <div className="workflow-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <h2 className="cta-title">Ready to Transform Your Elections?</h2>
              <p className="cta-desc">
                Join organizations trust CipherVote for secure, verifiable, and transparent voting.
              </p>
              <div className="cta-actions">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started Free
                </Link>
                <Link to="/about" className="btn btn-outline btn-lg">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="cta-visual">
              <div className="cta-icon">🗳️</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}