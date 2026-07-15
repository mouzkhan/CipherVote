import { createContext, useContext, useEffect, useState } from "react";
import { auth, ADMIN_EMAIL } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]                   = useState(undefined); // undefined = loading
  const [failedLogins, setFailedLogins]   = useState(0);
  const [mfaStep, setMfaStep]             = useState("password"); // "password" | "otp" | "face" | "complete"
  const [faceVerified, setFaceVerified]   = useState(false);
  const [hasFaceEnrolled, setHasFaceEnrolled] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u ?? null);
      if (u) {
        setHasFaceEnrolled(false);
        setFaceVerified(false);
        setMfaStep("password");
      } else {
        setHasFaceEnrolled(false);
        setFaceVerified(false);
        setMfaStep("password");
      }
    });
    return unsub;
  }, []);

  const isAdmin = user?.email === ADMIN_EMAIL;
  const loading = user === undefined;

  const incrementFailedLogin = () => setFailedLogins((n) => n + 1);
  const resetFailedLogins    = () => setFailedLogins(0);
  const completeFaceVerification = () => { setFaceVerified(true); setMfaStep("complete"); };
  const completeMfa = () => setMfaStep("complete");

  return (
    <AuthContext.Provider value={{
      user, isAdmin, loading,
      failedLogins, incrementFailedLogin, resetFailedLogins,
      mfaStep, setMfaStep,
      faceVerified, completeFaceVerification,
      hasFaceEnrolled, setHasFaceEnrolled,
      completeMfa,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
