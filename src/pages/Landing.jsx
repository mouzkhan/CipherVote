import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/landing.css";

const FEATURES = [
  {
    icon: "🏢",
    title: "Multi-Organization Platform",
    desc: "Voting-as-a-Service (VaaS) - Organizations can register, create elections, and manage voters all in one platform.",
    gradient: "linear-gradient(135deg, rgba(102,126,234,0.2), rgba(102,126,234,0.05))",
  },
  {
    icon: "🤖",
    title: "AI Fraud Detection",
    desc: "Real-time detection of duplicate votes and brute force login attempts with fraud scoring and explanations.",
    gradient: "linear-gradient(135deg, rgba(0,212,170,0.2), rgba(0,212,170,0.05))",
  },
  {
    icon: "🔐",
    title: "Secure Authentication",
    desc: "Password hashing with bcrypt, rate limiting, and CORS protection for secure voter and organization authentication.",
    gradient: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,212,255,0.05))",
  },
  {
    icon: "📊",
    title: "Election Management",
    desc: "Create elections, add candidates, manage voters, and track results all from an intuitive dashboard.",
    gradient: "linear-gradient(135deg, rgba(255,107,107,0.2), rgba(255,107,107,0.05))",
  },
  {
    icon: "📱",
    title: "Responsive Design",
    desc: "Works perfectly on mobile phones, tablets, laptops, and desktops with modern UI design.",
    gradient: "linear-gradient(135deg, rgba(255,193,7,0.2), rgba(255,193,7,0.05))",
  },
  {
    icon: "⚡",
    title: "Real-Time Alerts",
    desc: "Instant fraud alerts with explanations and fraud scores when suspicious activity is detected.",
    gradient: "linear-gradient(135deg, rgba(156,136,255,0.2), rgba(156,136,255,0.05))",
  },
];

const STATISTICS = [
  { value: "165", label: "Files", icon: "📁" },
  { value: "51K+", label: "Lines of Code", icon: "💻" },
  { value: "30+", label: "API Endpoints", icon: "🔌" },
  { value: "VaaS", label: "Platform", icon: "🚀" },
];

const SECURITY_PROPS = [
  { label: "Password Security", desc: "All passwords hashed with bcrypt (10 rounds) - never stored in plain text.", icon: "🔒" },
  { label: "Duplicate Prevention", desc: "Email-based tracking prevents the same voter from voting twice.", icon: "✅" },
  { label: "Brute Force Protection", desc: "Account lockout after 5 failed attempts for 30 minutes.", icon: "🛡️" },
  { label: "Rate Limiting", desc: "80 requests per minute limit prevents API abuse and DDoS attacks.", icon: "⏱️" },
  { label: "CORS Protection", desc: "Cross-origin protection configured for secure API access.", icon: "🌐" },
];

const TESTIMONIALS = [
  {
    quote: "A well-designed academic project demonstrating multi-organization voting platform capabilities.",
    author: "Academic Reviewer",
    role: "Computer Science Department",
  },
  {
    quote: "The VaaS architecture and fraud detection implementation show promise for small-scale elections.",
    author: "Project Evaluator",
    role: "Final Year Project Committee",
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
            Academic E-Voting Project
          </div>
          <h1 className="hero-title">
            CipherVote
            <span className="hero-title-accent">Secure Online Voting</span>
          </h1>
          <p className="hero-sub">
            Multi-organization voting platform with AI-powered fraud detection.
            A final year project demonstrating secure election management and duplicate vote prevention.
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
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link to="/org-login" className="link" style={{ fontSize: '0.9rem' }}>
              🏢 Organization Admin Login
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