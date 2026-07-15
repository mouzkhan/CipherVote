import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import Navbar from "../components/Navbar";
import "../styles/login.css";

/**
 * Organization Login Page
 * 
 * Allows organization admins to login to their organization dashboard
 * using the email and password they set during registration.
 */
export default function OrganizationLogin() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError("Please enter your email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await api.loginOrganization({
        email: formData.email,
        password: formData.password
      });

      if (result.ok && result.organization) {
        // Store organization info in sessionStorage
        sessionStorage.setItem("organizationAuth", JSON.stringify(result.organization));
        
        // Navigate to organization dashboard
        navigate(`/org/${result.organization.id}/dashboard`);
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Navbar />
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">🏢</div>
            <h1 className="auth-title">Organization Login</h1>
            <p className="auth-subtitle">
              Access your organization dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="alert alert-error mb-2">
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="label">Organization Email</label>
              <input
                type="email"
                className="input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@organization.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login to Organization"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an organization? {" "}
              <Link to="/create-organization" className="link">
                Create one here
              </Link>
            </p>
            <p>
              <Link to="/login" className="link">
                Login as Platform User instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
