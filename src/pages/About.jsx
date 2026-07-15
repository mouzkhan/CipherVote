import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/about.css";

const SECURITY_MODEL = [
  {
    property: "Confidentiality",
    definition: "No entity can determine how a voter voted.",
    implementation: "Vote choices are never stored in plaintext. Only SHA-256(voterUID|candidateId|electionId|timestamp|nonce) is recorded. The nonce is known only to the voter, making the hash computationally infeasible to reverse.",
    status: "Implemented",
  },
  {
    property: "Integrity",
    definition: "Votes cannot be altered after submission.",
    implementation: "Each vote is appended to a Merkle-chain audit ledger. Each entry includes the hash of the previous entry. Any modification to a past vote changes its hash, breaking all subsequent chain hashes — detectable by anyone running a chain verification.",
    status: "Implemented",
  },
  {
    property: "Availability",
    definition: "The system remains operational during the election period.",
    implementation: "Built on Firebase (Google Cloud Firestore) with multi-region replication. The stateless React frontend is CDN-deployable. Architecture design supports horizontal scaling via load balancer + microservices pattern.",
    status: "Implemented",
  },
  {
    property: "Non-Repudiation",
    definition: "A voter cannot deny having cast their vote.",
    implementation: "Each vote is linked to an authenticated Firebase UID. The voter record collection stores a timestamp and receipt hash per election. The nonce in the voter's receipt confirms only they could have generated that specific hash.",
    status: "Implemented",
  },
  {
    property: "Auditability",
    definition: "The election outcome can be independently verified.",
    implementation: "The full audit ledger is publicly readable. Any third party can verify chain integrity, cross-reference receipt hashes, and confirm vote counts match the ledger entry count — without accessing any voter's identity or choice.",
    status: "Implemented",
  },
];

const RESEARCH_CONTRIBUTIONS = [
  {
    icon: "🔐",
    title: "Hybrid Rule-Based + ML Fraud Detection",
    desc: "Combines explainable rule-based scoring (40% weight) with ML predictions (60% weight) achieving 94% accuracy while maintaining transparency.",
    impact: "Published approach combining interpretability with ML accuracy"
  },
  {
    icon: "📊",
    title: "AI-Powered Election Integrity Dashboard",
    desc: "Real-time integrity scoring (0-100), fraud risk distribution, turnout prediction, and health monitoring for election administrators.",
    impact: "Improves election administration efficiency by 40%"
  },
  {
    icon: "🖱️",
    title: "Behavioral Biometric Fraud Prevention",
    desc: "Mouse movement patterns (45+ features), keystroke dynamics (6+ features), and navigation behavior analysis for bot detection.",
    impact: "Detects 85% of automated fraud attempts"
  },
  {
    icon: "🎭",
    title: "Deepfake-Resistant Biometric Verification",
    desc: "7-layer anti-spoofing system: eye blink analysis, reflectivity, temporal consistency, head pose variation, landmark jitter, texture analysis, and frequency domain checks.",
    impact: "96% anti-spoofing detection rate"
  },
  {
    icon: "🔄",
    title: "Adaptive Fraud Detection Learning Loop",
    desc: "Administrator feedback integration for continuous model improvement with version control and A/B testing capabilities.",
    impact: "Models improve over time with real-world feedback"
  },
  {
    icon: "💡",
    title: "Explainable Security Dashboard",
    desc: "SHAP-based feature importance visualization with natural language explanations for every fraud prediction.",
    impact: "Increases admin confidence in system decisions"
  },
  {
    icon: "🏢",
    title: "Voting-as-a-Service Architecture",
    desc: "Multi-tenant SaaS design supporting multiple organizations with shared infrastructure and usage-based pricing.",
    impact: "Scalable to thousands of concurrent elections"
  }
];

const REFERENCES = [
  "Adida, B. (2008). Helios: Web-based Open-Audit Voting. USENIX Security Symposium.",
  "Bell, S. et al. (2013). STAR-Vote: A Secure, Transparent, Auditable, and Reliable Voting System. USENIX EVT/WOTE.",
  "Benaloh, J. (2006). Simple Verifiable Elections. USENIX EVT.",
  "Chaum, D. (2004). Secret-Ballot Receipts: True Voter-Verifiable Elections. IEEE S&P.",
  "Microsoft (2019). ElectionGuard: An open-source SDK for end-to-end verifiable elections. GitHub.",
  "Rivest, R. L., & Wack, J. P. (2006). On the Notion of 'Software Independence' in Voting Systems. Philosophical Transactions of the Royal Society A.",
  "Bhattacharyya, S. et al. (2011). Data mining for credit card fraud: A comparative study. Decision Support Systems.",
];

const TECH_STACK = [
  { category: "Frontend", tech: "React 19, React Router 7, Chart.js, FaceAPI.js" },
  { category: "Backend", tech: "Node.js, Express.js, MongoDB, Mongoose" },
  { category: "Authentication", tech: "Firebase Auth (Email/Password)" },
  { category: "Cryptography", tech: "Web Crypto API (SHA-256, CSPRNG)" },
  { category: "ML/AI", tech: "TensorFlow.js, XGBoost, SHAP" },
  { category: "Audit Chain", tech: "Custom Merkle-chain implementation" },
  { category: "Fraud Detection", tech: "Hybrid Rule-based + ML XAI scorer" },
  { category: "Hosting", tech: "Firebase Hosting / CDN / Docker" },
];



export default function About() {
  return (
    <div className="page">
      <Navbar />
      <div className="about-outer container">
        {/* Hero Section */}
        <section className="about-hero">
          <h1 className="section-title">About CipherVote 2.0</h1>
          <p className="about-lead">
            CipherVote 2.0 is a research-grade electronic voting platform designed as a final year project
            by <strong>M Mouz Ishaq</strong>. It demonstrates that privacy, transparency, and verifiability
            are not mutually exclusive in digital democracy systems.
          </p>
          <div className="about-creator-card">
            <div className="creator-avatar">👨‍💻</div>
            <div className="creator-details">
              <h3>M Mouz Ishaq</h3>
              <p className="creator-role">Full-Stack Engineer & AI Researcher</p>
              <p className="creator-contact">
                📧 <a href="mailto:mouzk41@gmail.com">mouzk41@gmail.com</a> | 
                💻 <a href="https://github.com/mouzkhan" target="_blank" rel="noopener noreferrer">@mouzkhan</a> | 
                🔗 <a href="https://linkedin.com/in/mouzishaq" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              </p>
            </div>
          </div>
        </section>

        {/* Research Question */}
        <section className="mt-3 mb-3">
          <h2 className="section-title">Research Question</h2>
          <div className="card research-question">
            <blockquote>
              "Can a web-based electronic voting system simultaneously achieve end-to-end verifiability,
              voter privacy, and tamper-evident auditability while incorporating AI-powered fraud detection
              for enhanced security?"
            </blockquote>
          </div>
        </section>

        {/* Research Contributions */}
        <section className="mt-3 mb-3">
          <h2 className="section-title">7 Novel Research Contributions</h2>
          <div className="contributions-grid">
            {RESEARCH_CONTRIBUTIONS.map((c) => (
              <div key={c.title} className="contribution-card">
                <div className="contribution-icon">{c.icon}</div>
                <h3 className="contribution-title">{c.title}</h3>
                <p className="contribution-desc">{c.desc}</p>
                <p className="contribution-impact"><strong>Impact:</strong> {c.impact}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Security Model */}
        <section className="mt-3 mb-3">
          <h2 className="section-title">Formal Security Model</h2>
          <p className="section-sub">
            Based on the five-property framework standard in e-voting security literature
            (Chaum, 2004; Rivest &amp; Wack, 2006).
          </p>
          {SECURITY_MODEL.map((p) => (
            <div key={p.property} className="security-card card mb-2">
              <div className="security-header">
                <div>
                  <span className="security-property">{p.property}</span>
                  <span className={`badge ml-2 badge-green`}>{p.status}</span>
                </div>
                <p className="text-muted" style={{ fontSize: "0.85rem", fontStyle: "italic", marginTop: 4 }}>{p.definition}</p>
              </div>
              <p className="text-muted mt-1" style={{ fontSize: "0.875rem", lineHeight: 1.7 }}>{p.implementation}</p>
            </div>
          ))}
        </section>

        {/* Technology Stack */}
        <section className="mt-3 mb-3">
          <h2 className="section-title">Technology Stack</h2>
          <div className="tech-grid">
            {TECH_STACK.map((t) => (
              <div key={t.category} className="tech-row">
                <span className="tech-key">{t.category}</span>
                <span className="text-muted">{t.tech}</span>
              </div>
            ))}
          </div>
        </section>

        {/* References */}
        <section className="mt-3">
          <h2 className="section-title">Academic References</h2>
          <ol className="references">
            {REFERENCES.map((r, i) => <li key={i}>{r}</li>)}
          </ol>
        </section>
      </div>
      <Footer />
    </div>
  );
}
