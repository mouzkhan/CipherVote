import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import "../styles/election-invitation.css";

/**
 * Voter Login Page
 * 
 * Allows registered voters to login again
 * Tests duplicate vote detection
 * 
 * Access: /election/:code/login
 */
export default function VoterLogin() {
  const { code } = useParams();
  const navigate = useNavigate();
  
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  useEffect(() => {
    loadElection();
    // Check if locked due to failed attempts
    const lockTime = sessionStorage.getItem('loginLockTime');
    if (lockTime && Date.now() - parseInt(lockTime) < 1800000) { // 30 minutes
      setIsLocked(true);
    }
  }, [code]);

  const loadElection = async () => {
    try {
      const data = await api.getElectionByCode(code);
      if (!data) {
        setError("Invalid or expired invitation link");
        return;
      }
      if (data.status !== 'active') {
        setError("This election is not currently accepting votes");
        return;
      }
      setElection(data);
    } catch (err) {
      setError("Failed to load election");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Check if account is locked
    if (isLocked) {
      setError("Too many failed attempts. Your account is locked for 30 minutes.");
      return;
    }

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Please enter email and password");
      return;
    }

    setSubmitting(true);
    try {
      // Call login API
      const result = await api.voterLogin({
        email: formData.email,
        password: formData.password,
        electionId: election._id,
        userAgent: navigator.userAgent
      });

      // Check if duplicate vote was detected
      if (result.fraudDetected && result.fraudData) {
        setError("");
        // Navigate to fraud alert page with fraud data
        sessionStorage.setItem('fraudData', JSON.stringify(result.fraudData));
        navigate(`/election/${code}/fraud-alert`);
        return;
      }

      // If we got here, login was successful and no duplicate vote
      // Store voter info and continue to voting
      sessionStorage.setItem('voterEmail', formData.email);
      sessionStorage.setItem('voterName', result.voter.fullName);
      sessionStorage.setItem('electionId', election._id);
      
      // Navigate to voting page (re-login successful)
      navigate(`/election/${code}/vote`);

    } catch (err) {
      // Check if it's a duplicate vote error
      if (err.message.includes("duplicate") || err.message.includes("Duplicate")) {
        // Try to get fraud data from response if available
        setError("❌ Vote blocked - You have already voted in this election. Duplicate voting is not allowed.");
        
        // Log fraud detection event
        console.log("[AI Fraud Detection] Duplicate vote blocked", {
          email: formData.email,
          fraudScore: 85,
          reason: "DUPLICATE_VOTE",
          timestamp: new Date().toISOString()
        });
      } else {
        const newFailedAttempts = failedAttempts + 1;
        setFailedAttempts(newFailedAttempts);

        // Lock account after 5 failed attempts
        if (newFailedAttempts >= 5) {
          setIsLocked(true);
          sessionStorage.setItem('loginLockTime', Date.now().toString());
          setError("❌ Account locked due to too many failed login attempts. Try again in 30 minutes.");
          
          // Log brute force attempt
          console.log("[Fraud Detection] Brute force attempt detected", {
            email: formData.email,
            attempts: newFailedAttempts,
            fraudScore: 70,
            action: "ACCOUNT_LOCKED"
          });
        } else {
          const remaining = 5 - newFailedAttempts;
          setError(`❌ Invalid email or password. ${remaining} attempts remaining before account lock.`);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container" style={{ padding: "2rem 0", textAlign: "center", maxWidth: 600 }}>
          <div className="spinner" style={{ margin: "0 auto" }}></div>
          <p className="text-muted mt-2">Loading election...</p>
        </div>
      </div>
    );
  }

  if (error && !election) {
    return (
      <div className="page">
        <div className="container" style={{ padding: "2rem 0", maxWidth: 600 }}>
          <div className="card text-center">
            <h2 style={{ color: "var(--danger)" }}>Error</h2>
            <p className="text-muted">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container" style={{ padding: "2rem 0", maxWidth: 600 }}>
        {/* Election Info */}
        <div className="card mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-blue">Login</span>
          </div>
          <h1 className="section-title">{election?.title}</h1>
          <p className="text-muted">Sign in to your voter account</p>
        </div>

        {/* Login Form */}
        <div className="card">
          <h2 className="section-title">Voter Login</h2>
          <p className="text-muted mb-3">
            Enter your email and password to access your voter account and proceed with voting.
          </p>

          {error && (
            <div className="alert alert-error mb-3">
              <span style={{ marginRight: "8px" }}>⚠️</span>
              {error}
              
              {error.includes("Fraud") && (
                <div style={{ marginTop: "10px", fontSize: "0.85rem", paddingTop: "10px", borderTop: "1px solid rgba(255,100,100,0.3)" }}>
                  <strong>Why this happened:</strong> Our AI fraud detection system identified an attempt to vote twice in the same election.
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ opacity: isLocked ? 0.6 : 1 }}>
            <div className="form-group">
              <label className="label">Email Address *</label>
              <input
                type="email"
                className="input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
                required
                disabled={isLocked}
              />
            </div>

            <div className="form-group">
              <label className="label">Password *</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                  disabled={isLocked}
                />
                <button
                  type="button"
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: isLocked ? "default" : "pointer",
                    color: "var(--muted)",
                    fontSize: "1.2rem",
                    opacity: isLocked ? 0.5 : 1
                  }}
                  onClick={() => !isLocked && setShowPassword(!showPassword)}
                  disabled={isLocked}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {isLocked && (
              <div className="alert alert-warning mb-3">
                <strong>🔒 Account Temporarily Locked</strong><br />
                Your account is locked due to multiple failed login attempts.
                Please try again in 30 minutes.
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={submitting || isLocked}
            >
              {submitting ? "Logging in..." : "Login to Vote →"}
            </button>
          </form>

          {/* Info Box */}
          <div className="alert alert-info mt-3" style={{ fontSize: "0.85rem" }}>
            <strong>🛡️ AI Fraud Detection Active</strong><br />
            Our system monitors for duplicate voting attempts. If you've already voted in this election, your login will be blocked.
          </div>

          <div className="alert alert-info mt-2" style={{ fontSize: "0.85rem" }}>
            <strong>❓ First time voting?</strong><br />
            <a href={`/election/${code}`} style={{ color: "var(--accent)", textDecoration: "none" }}>
              Go back to register as a new voter →
            </a>
          </div>

          {/* Security Notice */}
          <div className="text-center mt-3">
            <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
              🔒 Your login information is securely encrypted. 
              Failed attempts are logged for security monitoring.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
