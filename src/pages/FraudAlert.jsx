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

          {/* Explainable AI Section - Clean Format */}
          <div style={{
            background: "rgba(255,107,107,0.08)",
            border: "2px solid rgba(255,107,107,0.3)",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "24px"
          }}>
            {/* Fraud Risk Header */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              paddingBottom: "16px",
              borderBottom: "2px solid rgba(255,107,107,0.2)"
            }}>
              <h2 style={{ 
                color: "#ff6b6b", 
                margin: 0, 
                fontSize: "1.4rem",
                fontWeight: "700"
              }}>
                Fraud Risk
              </h2>
              <div style={{
                background: getRiskColor(fraudData.fraudScore),
                color: "#0f0f1a",
                padding: "10px 24px",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "1.4rem"
              }}>
                {fraudData.fraudScore}%
              </div>
            </div>

            {/* Detection Reasons - Clean List */}
            <div style={{ marginBottom: "0" }}>
              <p style={{ 
                margin: "0 0 16px 0", 
                color: "var(--text)", 
                fontWeight: "600",
                fontSize: "1.05rem"
              }}>
                Reasons:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {fraudData.signals && fraudData.signals.length > 0 ? (
                  fraudData.signals.map((signal, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        color: "var(--text)",
                        fontSize: "0.95rem"
                      }}
                    >
                      <span style={{ 
                        color: getRiskColor(signal.weight),
                        fontSize: "1.2rem"
                      }}>
                        •
                      </span>
                      <span>{signal.type}: {signal.detail}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text)", fontSize: "0.95rem" }}>
                      <span style={{ color: "#ff6b6b", fontSize: "1.2rem" }}>•</span>
                      <span>{fraudData.reason || "Suspicious activity detected"}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Additional Info */}
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
              Your vote has been blocked to maintain election integrity. If you believe this is an error, please contact the election administrator.
            </p>
          </div>

          {/* AI Features Badge */}
          <div style={{
            background: "linear-gradient(135deg, rgba(102,126,234,0.1), rgba(0,212,170,0.1))",
            border: "1px solid rgba(102,126,234,0.3)",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "24px",
            textAlign: "center"
          }}>
            <p style={{ margin: "0 0 8px 0", fontSize: "1.1rem" }}>
              ⭐⭐⭐⭐⭐
            </p>
            <p style={{ margin: "0", color: "var(--text)", fontWeight: "600", fontSize: "0.95rem" }}>
              Explainable AI
            </p>
            <p style={{ margin: "4px 0 0 0", color: "var(--muted)", fontSize: "0.85rem" }}>
              Excellent for research • Transparent fraud detection
            </p>
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
              🔒 This incident has been logged for security monitoring
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
