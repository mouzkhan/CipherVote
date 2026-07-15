import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";

/**
 * Election Invitation Page - Professional Voter Landing
 * 
 * This is the landing page for voters who click an election invitation link.
 * Voters see complete election info with candidate details and can register to participate.
 * 
 * Professional design similar to real-world voting systems like Helios
 */
export default function ElectionInvitation() {
  const { code } = useParams();
  const navigate = useNavigate();
  
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    loadElection();
  }, [code]);

  const loadElection = async () => {
    try {
      const data = await api.getElectionByCode(code);
      if (!data) {
        setError("Invalid or expired invitation link");
        return;
      }
      setElection(data);
    } catch (err) {
      setError("Invalid or expired invitation link");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigate(`/election/${code}/register`);
  };

  const handleViewResults = () => {
    navigate(`/election/${code}/results`);
  };

  if (loading) {
    return (
      <div className="election-invitation-page">
        <div className="invitation-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading election details...</p>
          </div>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="election-invitation-page">
        <div className="invitation-container">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h1>Election Not Found</h1>
            <p>{error}</p>
            <p className="error-hint">
              This invitation link may have expired or is invalid. 
              Please contact the election organizer for a new link.
            </p>
            <a href="/" className="btn-primary">
              Go to CipherVote Home
            </a>
          </div>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="election-invitation-page">
      <div className="invitation-container">
        {/* Header with Organization */}
        <header className="invitation-header">
          <div className="org-badge">
            <div className="org-avatar">
              {election?.organizationName?.[0]?.toUpperCase()}
            </div>
            <div className="org-info">
              <span className="org-name">{election?.organizationName}</span>
              <span className="org-label">Election Organizer</span>
            </div>
          </div>
          <div className="cipher-logo">
            <span className="logo-icon">🔐</span>
            <span className="logo-text">CipherVote</span>
          </div>
        </header>

        {/* Election Status Banner */}
        <div className={`status-banner ${election?.status}`}>
          {election?.status === 'active' && (
            <>
              <span className="status-icon">🟢</span>
              <span className="status-text">Election is Open for Voting</span>
            </>
          )}
          {election?.status === 'closed' && (
            <>
              <span className="status-icon">🔵</span>
              <span className="status-text">Election Has Ended</span>
            </>
          )}
          {election?.status === 'draft' && (
            <>
              <span className="status-icon">🟡</span>
              <span className="status-text">Election Coming Soon</span>
            </>
          )}
        </div>

        {/* Election Title & Description */}
        <div className="election-hero">
          <h1 className="election-title">{election?.title}</h1>
          <p className="election-description">{election?.description}</p>
          
          {/* Election Meta Info */}
          <div className="election-meta">
            <div className="meta-item">
              <span className="meta-icon">👥</span>
              <div className="meta-content">
                <span className="meta-value">{election?.candidates?.length || 0}</span>
                <span className="meta-label">Candidates</span>
              </div>
            </div>
            <div className="meta-item">
              <span className="meta-icon">🗳️</span>
              <div className="meta-content">
                <span className="meta-value">{election?.totalVotes || 0}</span>
                <span className="meta-label">Votes Cast</span>
              </div>
            </div>
            {election?.startDate && (
              <div className="meta-item">
                <span className="meta-icon">📅</span>
                <div className="meta-content">
                  <span className="meta-value">
                    {new Date(election.startDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  <span className="meta-label">Start Date</span>
                </div>
              </div>
            )}
            {election?.endDate && (
              <div className="meta-item">
                <span className="meta-icon">🏁</span>
                <div className="meta-content">
                  <span className="meta-value">
                    {new Date(election.endDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  <span className="meta-label">End Date</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Candidates Section */}
        <section className="candidates-section">
          <h2 className="section-title">
            <span className="title-icon">🏆</span>
            Meet the Candidates
          </h2>
          
          <div className="candidates-grid">
            {election?.candidates?.map((candidate, index) => (
              <div 
                key={candidate.id || index} 
                className={`candidate-card ${selectedCandidate === candidate.id ? 'selected' : ''}`}
                onClick={() => setSelectedCandidate(candidate.id)}
              >
                <div className="candidate-header">
                  {candidate.photo ? (
                    <img 
                      src={candidate.photo} 
                      alt={candidate.name}
                      className="candidate-photo"
                    />
                  ) : (
                    <div className="candidate-avatar">
                      {candidate.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  
                  {candidate.symbol && (
                    <div className="candidate-symbol">
                      {candidate.symbol}
                    </div>
                  )}
                </div>
                
                <div className="candidate-info">
                  <h3 className="candidate-name">{candidate.name}</h3>
                  {candidate.position && (
                    <span className="candidate-position">{candidate.position}</span>
                  )}
                  
                  {candidate.description && (
                    <p className="candidate-description">
                      {candidate.description}
                    </p>
                  )}
                </div>
                
                {election?.status === 'closed' && (
                  <div className="vote-count">
                    <span className="vote-number">{candidate.votes || 0}</span>
                    <span className="vote-label">votes</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Action Section */}
        <section className="action-section">
          {election?.status === 'active' ? (
            <>
              <div className="voting-process">
                <h3>How to Cast Your Vote</h3>
                <div className="process-steps">
                  <div className="process-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h4>Register</h4>
                      <p>Enter your details to create a voter profile</p>
                    </div>
                  </div>
                  <div className="process-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h4>Verify Identity</h4>
                      <p>Complete biometric verification for security</p>
                    </div>
                  </div>
                  <div className="process-step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h4>Cast Vote</h4>
                      <p>Select your candidate and submit your vote</p>
                    </div>
                  </div>
                  <div className="process-step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <h4>Get Receipt</h4>
                      <p>Receive cryptographic proof of your vote</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="security-features">
                <div className="security-feature">
                  <span className="feature-icon">🔒</span>
                  <span>End-to-End Encrypted</span>
                </div>
                <div className="security-feature">
                  <span className="feature-icon">🧬</span>
                  <span>Biometric Verified</span>
                </div>
                <div className="security-feature">
                  <span className="feature-icon">📋</span>
                  <span>Blockchain Audited</span>
                </div>
                <div className="security-feature">
                  <span className="feature-icon">🔍</span>
                  <span>Vote Verifiable</span>
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={handleRegister} className="btn-vote">
                  <span className="btn-icon">🗳️</span>
                  Register & Vote Now
                </button>
                <button 
                  onClick={() => navigate(`/election/${code}/login`)}
                  style={{
                    ...{
                      padding: "12px 32px",
                      fontSize: "1rem",
                      fontWeight: "600",
                      borderRadius: "10px",
                      border: "2px solid var(--primary)",
                      background: "transparent",
                      color: "var(--primary)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "var(--primary)";
                    e.target.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                    e.target.style.color = "var(--primary)";
                  }}
                >
                  <span>🔑 Already Registered? Login</span>
                </button>
              </div>
            </>
          ) : election?.status === 'closed' ? (
            <>
              <div className="results-preview">
                <h3>📊 Election Results Available</h3>
                <p>This election has concluded. View the final results to see the winner.</p>
              </div>
              <button onClick={handleViewResults} className="btn-results">
                View Election Results
              </button>
            </>
          ) : (
            <div className="coming-soon">
              <h3>⏳ Election Not Yet Open</h3>
              <p>This election is still being prepared. Please check back later or contact the organizer.</p>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="invitation-footer">
          <div className="footer-security">
            <p>
              <strong>🔐 Secured by CipherVote</strong>
            </p>
            <p>
              Your vote is protected with cryptographic verification, 
              blockchain audit trails, and AI-powered fraud detection.
            </p>
          </div>
          <div className="footer-links">
            <a href="/">About CipherVote</a>
            <span>•</span>
            <a href="/">How It Works</a>
            <span>•</span>
            <a href="/">Privacy Policy</a>
          </div>
        </footer>
      </div>
      <style>{styles}</style>
    </div>
  );
}

const styles = `
.election-invitation-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.invitation-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px 20px 60px;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 80px 20px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error State */
.error-state {
  text-align: center;
  padding: 60px 20px;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.error-state h1 {
  font-size: 1.8rem;
  margin: 0 0 12px;
  color: #ef4444;
}

.error-state p {
  color: #9ca3af;
  margin: 0 0 8px;
}

.error-hint {
  font-size: 0.9rem;
  max-width: 400px;
  margin: 0 auto 24px !important;
}

/* Header */
.invitation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.org-badge {
  display: flex;
  align-items: center;
  gap: 12px;
}

.org-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
}

.org-info {
  display: flex;
  flex-direction: column;
}

.org-name {
  font-weight: 600;
  font-size: 1rem;
}

.org-label {
  font-size: 0.8rem;
  color: #9ca3af;
}

.cipher-logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  font-size: 1.5rem;
}

.logo-text {
  font-weight: 700;
  font-size: 1.1rem;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Status Banner */
.status-banner {
  padding: 16px 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.status-banner.active {
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-banner.closed {
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.status-banner.draft {
  background: rgba(234, 179, 8, 0.15);
  border: 1px solid rgba(234, 179, 8, 0.3);
}

.status-icon {
  font-size: 1.2rem;
}

.status-text {
  font-weight: 600;
  font-size: 1rem;
}

/* Election Hero */
.election-hero {
  text-align: center;
  margin-bottom: 48px;
}

.election-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 16px;
  background: linear-gradient(135deg, #ffffff, #c4b5fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.election-description {
  font-size: 1.1rem;
  color: #9ca3af;
  max-width: 600px;
  margin: 0 auto 32px;
  line-height: 1.6;
}

.election-meta {
  display: flex;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.1);
}

.meta-icon {
  font-size: 1.5rem;
}

.meta-content {
  display: flex;
  flex-direction: column;
}

.meta-value {
  font-size: 1.3rem;
  font-weight: 700;
}

.meta-label {
  font-size: 0.8rem;
  color: #9ca3af;
}

/* Candidates Section */
.candidates-section {
  margin-bottom: 48px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 24px;
}

.title-icon {
  font-size: 1.3rem;
}

.candidates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.candidate-card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.candidate-card:hover {
  border-color: rgba(99, 102, 241, 0.5);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(99, 102, 241, 0.15);
}

.candidate-card.selected {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
}

.candidate-header {
  position: relative;
  padding: 24px;
  display: flex;
  justify-content: center;
}

.candidate-photo {
  width: 100px;
  height: 100px;
  border-radius: 16px;
  object-fit: cover;
  border: 3px solid rgba(255,255,255,0.1);
}

.candidate-avatar {
  width: 100px;
  height: 100px;
  border-radius: 16px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 700;
}

.candidate-symbol {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 2rem;
  background: rgba(255,255,255,0.1);
  padding: 8px;
  border-radius: 8px;
}

.candidate-info {
  padding: 0 24px 24px;
  text-align: center;
}

.candidate-name {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 8px;
}

.candidate-position {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(99, 102, 241, 0.2);
  border-radius: 20px;
  font-size: 0.8rem;
  color: #a5b4fc;
  margin-bottom: 12px;
}

.candidate-description {
  font-size: 0.9rem;
  color: #9ca3af;
  line-height: 1.6;
  margin: 0;
}

.vote-count {
  padding: 16px 24px;
  background: rgba(34, 197, 94, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.vote-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4ade80;
}

.vote-label {
  font-size: 0.9rem;
  color: #86efac;
}

/* Action Section */
.action-section {
  text-align: center;
  padding: 40px;
  background: rgba(255,255,255,0.03);
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.1);
  margin-bottom: 32px;
}

.voting-process h3 {
  font-size: 1.3rem;
  margin: 0 0 24px;
}

.process-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.process-step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  text-align: left;
  padding: 16px;
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
}

.step-number {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.step-content h4 {
  margin: 0 0 4px;
  font-size: 0.95rem;
}

.step-content p {
  margin: 0;
  font-size: 0.8rem;
  color: #9ca3af;
}

.security-features {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 32px;
}

.security-feature {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 20px;
  font-size: 0.85rem;
}

.feature-icon {
  font-size: 1rem;
}

.btn-vote {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 18px 48px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-vote:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.4);
}

.btn-icon {
  font-size: 1.3rem;
}

.btn-primary {
  display: inline-block;
  padding: 14px 32px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 10px;
  color: white;
  text-decoration: none;
  font-weight: 600;
}

.btn-results {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 18px 48px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
}

.results-preview h3 {
  margin: 0 0 12px;
}

.results-preview p {
  color: #9ca3af;
  margin: 0 0 24px;
}

.coming-soon h3 {
  margin: 0 0 12px;
}

.coming-soon p {
  color: #9ca3af;
  margin: 0;
}

/* Footer */
.invitation-footer {
  text-align: center;
  padding-top: 32px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.footer-security {
  margin-bottom: 20px;
}

.footer-security p {
  margin: 0;
  font-size: 0.9rem;
  color: #9ca3af;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.footer-links a {
  color: #6366f1;
  text-decoration: none;
  font-size: 0.85rem;
}

.footer-links a:hover {
  text-decoration: underline;
}

.footer-links span {
  color: #4b5563;
}

/* Responsive */
@media (max-width: 768px) {
  .election-title {
    font-size: 1.8rem;
  }
  
  .election-meta {
    gap: 12px;
  }
  
  .meta-item {
    padding: 12px 16px;
  }
  
  .invitation-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .org-badge {
    flex-direction: column;
  }
  
  .process-steps {
    grid-template-columns: 1fr;
  }
  
  .security-features {
    flex-direction: column;
    align-items: center;
  }
}
`;
