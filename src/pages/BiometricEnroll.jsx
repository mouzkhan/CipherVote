import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import FaceCamera from "../components/FaceCamera";
import Navbar from "../components/Navbar";
import "../styles/biometric.css";

/**
 * Biometric Enrollment Page
 *
 * Guides the voter through a one-time face registration.
 * Only the 128-dimensional descriptor vector is stored — never the image.
 * This complies with data minimization principles in biometric privacy frameworks.
 */
export default function BiometricEnroll() {
  const { user, setHasFaceEnrolled } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState("intro"); // intro | scan | done
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSuccess = async ({ descriptor }) => {
    setSaving(true);
    try {
      // Store only the descriptor — no image data ever touches the server
      await api.saveBiometricProfile(user.uid, descriptor);
      setHasFaceEnrolled(true);
      setStep("done");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <Navbar />
      <div className="biometric-outer container">

        {step === "intro" && (
          <div className="biometric-card card">
            <div className="biometric-icon">👤</div>
            <h1 className="section-title text-center">Set Up Face Verification</h1>
            <p className="text-muted text-center mt-2 mb-3">
              Add an extra layer of security to your account. Your face scan is used to verify
              your identity before you vote.
            </p>

            <div className="biometric-steps mb-3">
              {[
                { icon: "📷", title: "Camera access", desc: "Your browser will ask for camera permission. This is required." },
                { icon: "👁", title: "Liveness check", desc: "Blink twice to prove you are a live person, not a photo." },
                { icon: "🔐", title: "Descriptor stored", desc: "Only a 128-number mathematical vector is saved — never your photo." },
                { icon: "✅", title: "Vote securely", desc: "Every time you vote, your face is matched against this descriptor." },
              ].map((s) => (
                <div key={s.title} className="biometric-step">
                  <div className="biometric-step-icon">{s.icon}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{s.title}</div>
                    <div className="text-muted" style={{ fontSize: "0.82rem" }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="alert alert-info" style={{ fontSize: "0.84rem" }}>
              🔒 Privacy note: Face images are processed locally in your browser using a neural network model.
              No image is ever uploaded. Only a 128-dimensional mathematical vector is stored, which cannot
              be reversed into your face.
            </div>

            <div className="flex gap-2 mt-3">
              <button className="btn btn-outline" onClick={() => navigate("/vote")}>Skip for now</button>
              <button className="btn btn-primary" onClick={() => setStep("scan")}>Begin Face Setup →</button>
            </div>
          </div>
        )}

        {step === "scan" && (
          <div className="biometric-card card">
            <h1 className="section-title text-center mb-2">Face Registration</h1>
            <p className="text-muted text-center mb-3">
              Look directly at the camera. Blink {2} times when prompted.
            </p>
            {error && <div className="alert alert-error mb-2">{error}</div>}
            {saving && <div className="alert alert-info mb-2">Saving your face profile…</div>}
            <FaceCamera
              mode="register"
              onSuccess={handleSuccess}
              onFail={(reason) => setError(`Registration failed: ${reason}. Please try again.`)}
              onCancel={() => setStep("intro")}
            />
          </div>
        )}

        {step === "done" && (
          <div className="biometric-card card text-center">
            <div style={{ fontSize: "4rem", marginBottom: 16 }}>🎉</div>
            <h1 className="section-title">Face Enrolled Successfully</h1>
            <p className="text-muted mt-2 mb-3">
              Your biometric profile has been saved. From now on, you will be asked to verify
              your face before casting a vote.
            </p>
            <div className="alert alert-success mb-3">
              ✅ 128-dimensional face descriptor stored securely. No image was saved.
            </div>
            <div className="biometric-mfa-badge">
              <span>🔐</span>
              <div>
                <div style={{ fontWeight: 700 }}>Multi-Factor Authentication Active</div>
                <div className="text-muted" style={{ fontSize: "0.82rem" }}>Password + Face Biometric</div>
              </div>
            </div>
            <button className="btn btn-primary mt-3" onClick={() => navigate("/vote")}>
              Go to Vote →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
