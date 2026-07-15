import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Protected Route Component
 * 
 * Supports multiple protection levels:
 * 1. Basic - Just requires login
 * 2. requireOrganization - User must own an organization
 * 3. adminOnly - User must be platform admin
 */
export default function ProtectedRoute({ children, requireOrganization = false, adminOnly = false }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="spinner-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0f0f1a" }}>
        <div className="spinner" aria-label="Loading" />
      </div>
    );
  }

  // Not logged in
  if (!user) return <Navigate to="/login" replace />;
  
  // Admin only access
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;

  // Note: Organization ownership check would require additional API call
  // For now, we let the component handle this via routing

  return children;
}
