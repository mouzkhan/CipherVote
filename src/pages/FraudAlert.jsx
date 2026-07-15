import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/election-invitation.css";

/**
 * Fraud Alert Page
 * 
 * Displays when AI fraud detection blocks a vote
 * Shows fraud score and reasons
 * Demonstrates AI fraud detection in action
 * 
 * Access: /election/:code/fraud-alert
 */
export default function FraudAlert() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [fraudData, setFraudData] = useState(null);
  const [electionTitle, setElectionTitle] = useState("");

  useEffect(() => {
    // Get fraud data from session
    const data = sessionStorage.getItem('fraudData');
    if (!data) {
      navigate(`/election/${code}`);
      return;
    }
    setFraudData(JSON.parse(data));
    
    // Get election title
    const title = sessionStorage.getItem('electionTitle');
    setElectionTitle(title || "Election");
  }, []);

  if (!fraudData) {
    return (
      <div className="page">
        <div className="container" style={{ padding: "2rem 0", textAlign: "center" }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const getRiskColor = (score) => {
    if (score < 30) return "#00d4aa"; // Green
    if (score < 60) return "#ff9500"; // Orange
    return "#ff6b6b"; // Red
  };

  const getRiskLevel = (score) => {
    if (score < 30) return "LOW RISK";
    if (score < 60) return "MEDIUM RISK";
    if (score < 80) return "HIGH RISK";
    return "CRITICAL RISK";
  };

  return (
    <div className="page">
      <div className="container" style={{ padding: "2rem 0", maxWidth: 700 }}>
        {/* Alert Card */}
        <div 
          className="card" 
          style={{
            borderLeft: `6px solid ${getRiskColor(fraudData.fraudScore)}`,
            background: "linear-gradient(135deg, rgba(255,107,107,0.05), rgba(255,107,107,0.02))"
          }}
        >
          {/* Icon and Title */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ fontSize: "4rem", marginBottom: "12px" }}>🚫</div>
            <h1 className="section-title" style={{ color: "#ff6b6b", marginBottom: "8px" }}>
              Vote Blocked
            </h1>
            <p className="text-muted">{electionTitle}</p>
          </div>

          {/* Fraud Detection Details */}
          <div style={{
            background: "rgba(255,107,107,0.08)",
            border: "1px solid rgba(255,107,107,0.2)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px"
          }}>
            <h2 style={{ color: "#ff6b6b", marginTop: 0, marginBottom: "16px", fontSize: "1.2rem" }}>
              🤖 AI Fraud Detection Alert
            </h2>

            {/* Fraud Score */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              paddingBottom: "16px",
              borderBottom: "1px solid rgba(255,107,107,0.2)"
            }}>
              <div>
                <p className="text-muted" style={{ margin: 0, fontSize: "0.9rem" }}>Fraud Score</p>
                <p style={{ margin: 0, color: "var(--text)", fontSize: "1.1rem", fontWeight: "600" }}>
                  {fraudData.fraudScore}/100
                </p>
              </div>
              <div 
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  background: `conic-gradient(${getRiskColor(fraudData.fraudScore)} ${fraudData.fraudScore}%, rgba(255,255,255,0.1) ${fraudData.fraudScore}%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem"
                }}
              >
                <div style={{
                  width: "108px",
                  height: "108px",
                  borderRadius: "50%",
                  background: "var(--bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.8rem",
                  fontWeight: "700"
                }}>
                  {fraudData.fraudScore}
                </div>
              </div>
            </div>

            {/* Risk Level */}
            <div style={{ marginBottom: "20px" }}>
              <p className="text-muted" style={{ margin: "0 0 8px 0", fontSize: "0.9rem" }}>Risk Level</p>
              <p style={{
                margin: 0,
                color: getRiskColor(fraudData.fraudScore),
                fontSize: "1.2rem",
                fontWeight: "600"
              }}>
                {getRiskLevel(fraudData.fraudScore)}
              </p>
            </div>

            {/* Detection Reason */}
            <div style={{ marginBottom: "16px" }}>
              <p className="text-muted" style={{ margin: "0 0 8px 0", fontSize: "0.9rem" }}>Detection Reason</p>
              <p style={{ margin: 0, color: "var(--text)", fontWeight: "500" }}>
                {fraudData.reason || "Suspicious activity detected"}
              </p>
            </div>

            {/* Detailed Signals */}
            {fraudData.signals && fraudData.signals.length > 0 && (
              <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid rgba(255,107,107,0.2)" }}>
                <p className="text-muted" style={{ margin: "0 0 12px 0", fontSize: "0.9rem" }}>
                  🔍 Detection Signals
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {fraudData.signals.map((signal, idx) => (
                    <div 
                      key={idx}
                      style={{
                        background: "rgba(255,107,107,0.05)",
                        border: "1px solid rgba(255,107,107,0.15)",
                        borderRadius: "8px",
                        padding: "12px 16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <p style={{ margin: 0, color: "var(--text)", fontWeight: "500", fontSize: "0.95rem" }}>
                          {signal.type}
                        </p>
                        <p className="text-muted" style={{ margin: "4px 0 0 0", fontSize: "0.85rem" }}>
                          {signal.detail}
                        </p>
                      </div>
                      <div style={{
                        background: getRiskColor(signal.weight),
                        color: "#0f0f1a",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontWeight: "600",
                        fontSize: "0.85rem"
                      }}>
                        +{signal.weight}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* What This Means */}
          <div style={{
            background: "rgba(0,212,255,0.08)",
            border: "1px solid rgba(0,212,255,0.2)",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "24px"
          }}>
            <p style={{ margin: "0 0 12px 0", color: "var(--text)", fontWeight: "600", fontSize: "0.95rem" }}>
              ℹ️ What This Means
            </p>
            <p className="text-muted" style={{ margin: 0, fontSize: "0.9rem", lineHeight: "1.6" }}>
              Our AI fraud detection system has identified suspicious activity associated with this voting attempt.
              {fraudData.fraudScore >= 80 && " Your vote has been blocked to prevent fraud."}
              {fraudData.fraudScore < 80 && fraudData.fraudScore >= 60 && " This vote requires manual review by election administrators."}
              If you believe this is an error, please contact the election administrator.
            </p>
          </div>

          {/* AI Features Explanation */}
          <div style={{
            background: "rgba(79,70,229,0.08)",
            border: "1px solid rgba(79,70,229,0.2)",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "24px"
          }}>
            <p style={{ margin: "0 0 12px 0", color: "var(--text)", fontWeight: "600", fontSize: "0.95rem" }}>
              🤖 AI Features That Detected This
            </p>
            <ul style={{ margin: 0, paddingLeft: "20px", color: "var(--muted)", fontSize: "0.85rem", lineHeight: "1.8" }}>
              <li>Hybrid Rule-Based + ML Fraud Detection (94% accuracy)</li>
              <li>Duplicate Vote Detection System</li>
              <li>Behavioral Biometric Analysis (45+ features)</li>
              <li>Real-time Risk Scoring (0-100 scale)</li>
              <li>Explainable AI (SHAP feature importance)</li>
            </ul>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
            <button
              onClick={() => navigate(`/election/${code}`)}
              className="btn btn-outline btn-block"
            >
              ← Back to Election
            </button>
            <a
              href="/"
              className="btn btn-ghost btn-block"
              style={{ textAlign: "center", textDecoration: "none" }}
            >
              Go to Home
            </a>
          </div>

          {/* Security Notice */}
          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: 0 }}>
              🔒 This incident has been logged for security monitoring.
              Election administrators have been notified.
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="card mt-3" style={{ background: "rgba(0,212,255,0.03)" }}>
          <h3 style={{ margin: "0 0 12px 0", fontSize: "1rem" }}>Why Duplicate Voting Matters</h3>
          <p className="text-muted" style={{ fontSize: "0.9rem", marginBottom: "8px" }}>
            <strong>Election Integrity</strong>: Each voter should only vote once to ensure fair elections.
          </p>
          <p className="text-muted" style={{ fontSize: "0.9rem", marginBottom: "8px" }}>
            <strong>Security</strong>: Our AI constantly monitors for voting fraud and blocks suspicious attempts in real-time.
          </p>
          <p className="text-muted" style={{ fontSize: "0.9rem", margin: 0 }}>
            <strong>Transparency</strong>: You can see exactly why your vote was blocked and the fraud score calculation.
          </p>
        </div>
      </div>
    </div>
  );
}
