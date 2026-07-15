import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import "../styles/election-invitation.css";

/**
 * Voter Registration Page
 * 
 * This page is accessed via the election invitation link.
 * Voters register their details before biometric verification.
 * 
 * This is NOT part of the platform login flow.
 * Voters do NOT need to create an account.
 */
export default function VoterRegistration() {
  const { code } = useParams();
  const navigate = useNavigate();
  
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    nationalId: "",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);

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
      if (data.status !== 'active') {
        setError("This election is not currently accepting registrations");
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
    
    if (!formData.fullName.trim() || !formData.email.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    // Password validation
    if (!formData.password || formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      await api.registerVoterByInvitation({
        electionId: election._id,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        nationalId: formData.nationalId,
        password: formData.password
      });

      // Store voter info in session for biometric step
      sessionStorage.setItem('voterEmail', formData.email);
      sessionStorage.setItem('voterName', formData.fullName);
      sessionStorage.setItem('electionId', election._id);
      sessionStorage.setItem('voterPassword', formData.password);

      // Navigate to biometric verification
      navigate(`/election/${code}/biometric`);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
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
            <span className="badge badge-green">Active Election</span>
          </div>
          <h1 className="section-title">{election?.title}</h1>
          <p className="text-muted">{election?.description}</p>
          <div className="mt-2 text-muted" style={{ fontSize: "0.85rem" }}>
            {election?.candidates?.length || 0} candidates • Organized by {election?.organizationName}
          </div>
        </div>

        {/* Registration Form */}
        <div className="card">
          <h2 className="section-title">Voter Registration</h2>
          <p className="text-muted mb-3">
            Please provide your details to register for this election. 
            After registration, you'll complete biometric verification before voting.
          </p>

          {error && (
            <div className="alert alert-error mb-2">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">Full Name *</label>
              <input
                type="text"
                className="input"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter your full legal name"
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Email Address *</label>
              <input
                type="email"
                className="input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Phone Number</label>
              <input
                type="tel"
                className="input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+92 XXX XXXXXXX"
              />
            </div>

            <div className="form-group">
              <label className="label">National ID / CNIC</label>
              <input
                type="text"
                className="input"
                value={formData.nationalId}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                placeholder="XXXXX-XXXXXXX-X"
              />
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem", marginTop: "1rem" }}>
              <h3 className="section-title" style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
                Create Login Credentials
              </h3>
              <p className="text-muted mb-2" style={{ fontSize: "0.9rem" }}>
                Set a password to secure your voter account. You'll use your email and password to access your voting information.
              </p>

              <div className="form-group">
                <label className="label">Password *</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="At least 6 characters"
                    required
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
                      cursor: "pointer",
                      color: "var(--muted)",
                      fontSize: "1.2rem"
                    }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="label">Confirm Password *</label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-enter your password"
                  required
                />
              </div>

              <div className="alert alert-info mb-2" style={{ fontSize: "0.85rem" }}>
                <strong>💡 Why Password?</strong><br />
                This allows us to detect duplicate voting attempts by the same voter across multiple devices.
                It also prevents unauthorized access to your voting information.
              </div>
            </div>

            <div className="alert alert-info mb-2" style={{ fontSize: "0.85rem" }}>
              <strong>Next Steps:</strong><br />
              After registration, you'll complete a quick face verification to confirm your identity, 
              then you can cast your vote.
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={submitting}
            >
              {submitting ? "Registering..." : "Continue to Verification →"}
            </button>
          </form>
        </div>

        {/* Security Notice */}
        <div className="text-center mt-3">
          <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
            🔒 Your information is encrypted and securely stored. 
            Biometric data is stored as a mathematical vector, never as an image.
          </p>
        </div>
      </div>
    </div>
  );
}
