import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import Navbar from "../components/Navbar";
import "../styles/dashboard.css";

/**
 * User Dashboard
 * 
 * This is the FIRST page after login.
 * 
 * Platform Users can:
 * - View their organizations
 * - Create new organizations
 * - View subscription plans
 * 
 * Platform Users CANNOT:
 * - Create elections (until they have an organization)
 * - Use biometric features (that's for voters only)
 */
export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const orgs = await api.getOrganizations();
      // Filter to only show organizations owned by this user
      const userOrgs = orgs.filter(org => org.ownerId === user?.uid);
      setOrganizations(userOrgs);
    } catch (err) {
      console.error("Failed to load organizations:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Navbar />
      <div className="dashboard-container container">
        {/* Welcome Section */}
        <div className="welcome-section card mb-3">
          <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 className="section-title">Welcome to CipherVote</h1>
              <p className="text-muted mt-1">
                {user?.email}
              </p>
            </div>
            <div className="badge badge-green">Platform User</div>
          </div>
        </div>

        {/* What is CipherVote */}
        <div className="info-card card mb-3">
          <h2 className="card-title">🗳️ What is CipherVote?</h2>
          <p className="text-muted">
            CipherVote is a <strong>Voting-as-a-Service (VaaS)</strong> platform that lets you conduct 
            secure, transparent, and verifiable elections for your organization. Create elections, 
            invite voters, and let our AI-powered fraud detection ensure election integrity.
          </p>
        </div>

        {/* Getting Started */}
        {organizations.length === 0 && (
          <div className="getting-started card mb-3">
            <h2 className="card-title">🚀 Get Started</h2>
            <p className="text-muted mb-3">
              To create elections and invite voters, you first need to create an organization.
            </p>
            <div className="steps-grid">
              <div className="step-item">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Create Organization</h3>
                  <p>Set up your organization (university, company, NGO, etc.)</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Choose Plan</h3>
                  <p>Select a subscription that fits your needs</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Create Elections</h3>
                  <p>Add candidates and generate invitation links</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Invite Voters</h3>
                  <p>Share links and monitor secure voting</p>
                </div>
              </div>
            </div>
            <Link to="/create-organization" className="btn btn-primary btn-lg mt-3">
              Create Your First Organization →
            </Link>
          </div>
        )}

        {/* Organizations List */}
        {organizations.length > 0 && (
          <div className="organizations-section mb-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="section-title">Your Organizations</h2>
              <Link to="/create-organization" className="btn btn-primary btn-sm">
                + New Organization
              </Link>
            </div>
            <div className="org-grid">
              {organizations.map((org) => (
                <div 
                  key={org._id} 
                  className="org-card card"
                  onClick={() => navigate(`/org/${org._id}/dashboard`)}
                >
                  <div className="org-header">
                    <div className="org-avatar">{org.name?.[0]?.toUpperCase()}</div>
                    <div>
                      <h3 className="org-name">{org.name}</h3>
                      <span className={`badge badge-${org.status === 'active' ? 'green' : 'yellow'}`}>
                        {org.status || 'active'}
                      </span>
                    </div>
                  </div>
                  <div className="org-stats">
                    <div className="org-stat">
                      <span className="stat-value">{org.electionsCount || 0}</span>
                      <span className="stat-label">Elections</span>
                    </div>
                    <div className="org-stat">
                      <span className="stat-value">{org.plan || 'Free'}</span>
                      <span className="stat-label">Plan</span>
                    </div>
                  </div>
                  <button className="btn btn-outline btn-sm mt-2 w-full">
                    Manage →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions-section card">
          <h2 className="card-title">Quick Actions</h2>
          <div className="quick-actions-grid">
            <Link to="/create-organization" className="quick-action-item">
              <span className="action-icon">🏢</span>
              <span className="action-text">Create Organization</span>
            </Link>
            <Link to="/pricing" className="quick-action-item">
              <span className="action-icon">💳</span>
              <span className="action-text">View Pricing</span>
            </Link>
            <Link to="/verify" className="quick-action-item">
              <span className="action-icon">🔍</span>
              <span className="action-text">Verify Vote</span>
            </Link>
            <Link to="/about" className="quick-action-item">
              <span className="action-icon">ℹ️</span>
              <span className="action-text">About CipherVote</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
