import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import FaceCamera from "../components/FaceCamera";
import "../styles/biometric.css";

/**
 * Voter Biometric Verification Page
 * 
 * This is the ONLY place biometric verification happens.
 * Voters complete this step AFTER registering via invitation link.
 * 
 * This is NOT part of platform user flow.
 * Platform users do NOT do biometric verification.
 */
export default function VoterBiometric() {
  const { code } = useParams();
  const navigate = useNavigate();
  
  const [step, setStep] = useState("intro"); // intro, scan, done
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Get voter info from session
  const voterEmail = sessionStorage.getItem('voterEmail');
  const voterName = sessionStorage.getItem('voterName');
  const electionId = sessionStorage.getItem('electionId');

  const handleSuccess = async ({ descriptor }) => {
    setSaving(true);
    try {
      // Save biometric profile
      // The descriptor is a 128-dimensional face vector
      // No image is ever stored
      await api.saveBiometricProfile(voterEmail, descriptor);
      
      setStep("done");
    } catch (err) {
      setError(err.message || "Failed to save biometric profile");
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = () => {
    // Navigate to voting page
    navigate(`/election/${code}/vote`);
  };

  return (
    <div className="page">
      <div className="biometric-outer container">
        {step === "intro" && (
          <div className="biometric-card card">
            <div className="biometric-icon">👤</div>
            <h1 className="section-title text-center">Biometric Verification</h1>
            <p className="text-muted text-center mt-2 mb-3">
              Welcome, {voterName}. To ensure election security, please complete a quick face verification.
              This prevents fraud and ensures only registered voters can cast votes.
            </p>

            <div className="biometric-steps mb-3">
              {[
                { icon: "📷", title: "Camera Access", desc: "Your browser will request camera permission" },
                { icon: "👁", title: "Liveness Check", desc: "Blink twice to prove you're a real person" },
                { icon: "🔐", title: "Secure Storage", desc: "Only a mathematical vector is stored, never your photo" },
              ].map((s, i) => (
                <div key={i} className="biometric-step">
                  <div className="biometric-step-icon">{s.icon}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{s.title}</div>
                    <div className="text-muted" style={{ fontSize: "0.82rem" }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="alert alert-info" style={{ fontSize: "0.84rem" }}>
              🔒 <strong>Privacy Protected:</strong> Your face image is processed locally in your browser 
              using neural networks. No image is ever uploaded. Only a 128-number mathematical vector 
              is stored, which cannot be reversed back into your face.
            </div>

            <div className="flex gap-2 mt-3">
              <button 
                className="btn btn-outline" 
                onClick={() => navigate(`/election/${code}`)}
              >
                Back
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => setStep("scan")}
              >
                Begin Face Verification →
              </button>
            </div>
          </div>
        )}

        {step === "scan" && (
          <div className="biometric-card card">
            <h1 className="section-title text-center mb-2">Face Verification</h1>
            <p className="text-muted text-center mb-3">
              Position your face in the oval and blink twice when prompted.
            </p>
            
            {error && <div className="alert alert-error mb-2">{error}</div>}
            {saving && <div className="alert alert-info mb-2">Saving your biometric profile...</div>}
            
            <FaceCamera
              mode="register"
              onSuccess={handleSuccess}
              onFail={(reason) => setError(`Verification failed: ${reason}. Please try again.`)}
              onCancel={() => setStep("intro")}
            />
          </div>
        )}

        {step === "done" && (
          <div className="biometric-card card text-center">
            <div style={{ fontSize: "4rem", marginBottom: 16 }}>✅</div>
            <h1 className="section-title">Verification Complete</h1>
            <p className="text-muted mt-2 mb-3">
              Your identity has been verified. You can now proceed to cast your vote.
            </p>
            <div className="alert alert-success mb-3">
              ✓ Biometric verification successful<br />
              ✓ You are eligible to vote in this election
            </div>
            <button className="btn btn-primary" onClick={handleContinue}>
              Proceed to Vote →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
