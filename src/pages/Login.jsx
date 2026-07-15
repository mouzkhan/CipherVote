import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import FaceCamera from "../components/FaceCamera";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getDashboardRoute } from "../utils/navigation";
import "../styles/login.css";

/**
 * Multi-Factor Authentication Login
 *
 * Step 1 — Password (Firebase Auth)
 * Step 2 — Face Biometric (if enrolled): camera verification against stored descriptor
 * Step 3 — Redirect to vote / admin
 *
 * If face is NOT enrolled, user goes straight through after password
 * and is prompted to enroll on the vote page.
 */
export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode]         = useState("login"); // "login" | "register"
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [authStep, setAuthStep] = useState("password"); // "password" | "face"
  const [storedDescriptor, setStoredDescriptor] = useState(null);
  const [signedInUser, setSignedInUser] = useState(null);

  const { user, isAdmin, failedLogins, incrementFailedLogin, resetFailedLogins, completeFaceVerification, completeMfa } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && authStep === "password") {
      const route = getDashboardRoute({ user, isAdmin, hasOrganization: false });
      navigate(route, { replace: true });
    }
  }, [user, isAdmin, authStep, navigate]);

  const validate = () => {
    if (!email.trim()) return "Email is required.";
    if (!/\S+@\S+\.\S+/.test(email)) return "Enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      const cred = mode === "login"
        ? await auth.signInWithEmailAndPassword(email, password)
        : await auth.createUserWithEmailAndPassword(email, password);

      resetFailedLogins();
      const uid = cred.user.uid;
      setSignedInUser(cred.user);

      // Biometric lookup is now optional and should not block onboarding or organization setup.
      try {
        const profile = await api.getBiometricProfile(uid);
        if (profile?.descriptor && profile.descriptor.length === 128) {
          setStoredDescriptor(profile.descriptor);
          setAuthStep("face");
        } else {
          completeMfa();
          const route = getDashboardRoute({ user: cred.user, isAdmin: cred.user.email === "admin@gmail.com", hasOrganization: false });
          navigate(route, { replace: true });
        }
      } catch (err) {
        completeMfa();
        const route = getDashboardRoute({ user: cred.user, isAdmin: cred.user.email === "admin@gmail.com", hasOrganization: false });
        navigate(route, { replace: true });
      }
    } catch (err) {
      incrementFailedLogin();
      const msg = err.code === "auth/wrong-password" || err.code === "auth/user-not-found"
        ? "Invalid email or password."
        : err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFaceSuccess = ({ confidence }) => {
    completeFaceVerification();
    const route = getDashboardRoute({ user: signedInUser, isAdmin: signedInUser?.email === "admin@gmail.com", hasOrganization: false });
    navigate(route, { replace: true });
  };

  const handleFaceFail = (reason) => {
    setError(`Face verification failed: ${reason}. Try again or sign in without face.`);
    // Sign the user back out so they can't bypass
    auth.signOut();
    setAuthStep("password");
    setStoredDescriptor(null);
  };

  const skipFace = () => {
    completeMfa();
    const route = getDashboardRoute({ user: signedInUser, isAdmin: signedInUser?.email === "admin@gmail.com", hasOrganization: false });
    navigate(route, { replace: true });
  };

  // ── Render ──────────────────────────────────────────────────

  return (
    <div className="page">
      <Navbar />
      <div className="login-outer">

        {/* ── MFA Step Indicator ── */}
        <div className="mfa-steps-indicator">
          <MfaStep num={1} label="Password"  active={authStep === "password"} done={authStep === "face"} />
          <div className="mfa-divider" />
          <MfaStep num={2} label="Face Scan" active={authStep === "face"}     done={false} optional />
        </div>

        {/* ── Step 1: Password ── */}
        {authStep === "password" && (
          <div className="login-card card">
            <div className="login-logo">🗳️</div>
            <h1 className="login-title">
              {mode === "login" ? "Sign in to CipherVote" : "Create an account"}
            </h1>
            <p className="text-muted text-center mt-1 mb-3">
              {mode === "login"
                ? "Step 1 of 2 — Password authentication"
                : "Register to participate in verified elections."}
            </p>

            {failedLogins >= 2 && (
              <div className="alert alert-error" role="alert">
                ⚠️ {failedLogins} failed attempts detected. Session monitored.
              </div>
            )}
            {error && <div className="alert alert-error" role="alert">{error}</div>}

            <form onSubmit={handlePasswordSubmit} noValidate>
              <div className="form-group">
                <label className="label" htmlFor="email">Email address</label>
                <input
                  id="email" type="email" className="input" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email" aria-required="true" placeholder="you@example.com"
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="password">Password</label>
                <input
                  id="password" type="password" className="input" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  aria-required="true" placeholder="••••••••"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading
                  ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Please wait…</>
                  : mode === "login" ? "Continue to Face Scan →" : "Create Account"}
              </button>
            </form>

            <div className="login-switch mt-3 text-center">
              {mode === "login" ? (
                <span className="text-muted">
                  New here? <button className="link-btn" onClick={() => { setMode("register"); setError(""); }}>Create an account</button>
                </span>
              ) : (
                <span className="text-muted">
                  Already registered? <button className="link-btn" onClick={() => { setMode("login"); setError(""); }}>Sign in</button>
                </span>
              )}
            </div>

            <div className="mfa-badge mt-3">
              <span>🔐</span>
              <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                Multi-Factor: Password + Face Biometric · SHA-256 vote receipts
              </span>
            </div>
          </div>
        )}

        {/* ── Step 2: Face Biometric ── */}
        {authStep === "face" && (
          <div className="login-card card" style={{ maxWidth: 500 }}>
            <h1 className="login-title mb-2">Step 2 — Face Verification</h1>
            <p className="text-muted text-center mb-3" style={{ fontSize: "0.88rem" }}>
              Look at the camera and blink twice to confirm your identity.
              This matches your live face against your enrolled biometric profile.
            </p>

            {error && <div className="alert alert-error mb-2">{error}</div>}

            <FaceCamera
              mode="verify"
              storedDescriptor={storedDescriptor}
              onSuccess={handleFaceSuccess}
              onFail={handleFaceFail}
              onCancel={skipFace}
            />

            <div className="flex gap-2 mt-3">
              <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={handleFaceFail.bind(null, "user_cancelled")}>
                Cancel & Sign Out
              </button>
              <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={skipFace}>
                Skip (reduced security)
              </button>
            </div>

            <p className="text-muted mt-2 text-center" style={{ fontSize: "0.78rem" }}>
              Face processing happens entirely in your browser. No image is uploaded.
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

function MfaStep({ num, label, active, done, optional }) {
  return (
    <div className={`mfa-step ${active ? "mfa-step-active" : done ? "mfa-step-done" : ""}`}>
      <div className="mfa-step-num">
        {done ? "✓" : num}
      </div>
      <div className="mfa-step-label">
        {label}
        {optional && <span className="text-muted" style={{ fontSize: "0.72rem" }}> (if enrolled)</span>}
      </div>
    </div>
  );
}
