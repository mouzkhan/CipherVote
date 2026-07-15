import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import Navbar from "../components/Navbar";
import "../styles/dashboard.css";

/**
 * Organization Dashboard
 * 
 * This is the main dashboard for Organization Admins.
 * From here they can:
 * - Create and manage elections
 * - View election analytics
 * - Monitor voters
 * - View fraud alerts
 * 
 * This is ONLY accessible to users who own this organization.
 */
export default function OrganizationDashboard() {
  const { orgId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [organization, setOrganization] = useState(null);
  const [elections, setElections] = useState([]);
  const [stats, setStats] = useState({
    totalElections: 0,
    activeElections: 0,
    totalVoters: 0,
    totalVotes: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, [orgId]);

  const loadDashboardData = async () => {
    try {
      // Load organization details
      const orgs = await api.getOrganizations();
      const org = orgs.find(o => o._id === orgId);
      
      if (!org) {
        setError("Organization not found");
        return;
      }
      
      // Verify ownership
      if (org.ownerId && org.ownerId !== user?.uid) {
        setError("You don't have access to this organization");
        return;
      }
      
      setOrganization(org);

      // Load organization dashboard data
      const dashboardData = await api.getOrganizationDashboard(orgId);
      setStats({
        totalElections: dashboardData.totalElections || 0,
        activeElections: dashboardData.activeElections || 0,
        totalVoters: dashboardData.registeredVoters || 0,
        totalVotes: dashboardData.votesCast || 0
      });
      
      setElections(dashboardData.recentElections || []);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError("Failed to load organization data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <Navbar />
        <div className="container" style={{ padding: "2rem 0", textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto" }}></div>
          <p className="text-muted mt-2">Loading organization...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <Navbar />
        <div className="container" style={{ padding: "2rem 0" }}>
          <div className="card text-center">
            <h2 style={{ color: "var(--danger)" }}>Error</h2>
            <p className="text-muted">{error}</p>
            <Link to="/dashboard" className="btn btn-primary mt-2">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Navbar />
      <div className="dashboard-container container">
        {/* Organization Header */}
        <div className="org-dashboard-header">
          <div className="org-dashboard-title">
            <div className="org-dashboard-avatar">
              {organization?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="section-title">{organization?.name}</h1>
              <div className="flex items-center gap-2">
                <span className={`badge badge-${organization?.status === 'active' ? 'green' : 'yellow'}`}>
                  {organization?.status || 'Active'}
                </span>
                <span className="text-muted">•</span>
                <span className="text-muted">{organization?.plan || 'Free'} Plan</span>
              </div>
            </div>
          </div>
          <Link to={`/org/${orgId}/elections/create`} className="btn btn-primary">
            + Create Election
          </Link>
        </div>

        {/* Dashboard Navigation */}
        <nav className="dashboard-nav">
          <Link to={`/org/${orgId}/dashboard`} className="dashboard-nav-item active">
            Overview
          </Link>
          <Link to={`/org/${orgId}/elections`} className="dashboard-nav-item">
            Elections
          </Link>
          <Link to={`/org/${orgId}/voters`} className="dashboard-nav-item">
            Voters
          </Link>
          <Link to={`/org/${orgId}/analytics`} className="dashboard-nav-item">
            Analytics
          </Link>
          <Link to={`/org/${orgId}/settings`} className="dashboard-nav-item">
            Settings
          </Link>
        </nav>

        {/* Stats Overview */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.totalElections}</div>
            <div className="stat-label">Total Elections</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.activeElections}</div>
            <div className="stat-label">Active Elections</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalVoters}</div>
            <div className="stat-label">Registered Voters</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalVotes}</div>
            <div className="stat-label">Votes Cast</div>
          </div>
        </div>

        {/* Recent Elections */}
        <div className="card mb-3">
          <div className="flex justify-between items-center mb-2">
            <h2 className="card-title">Recent Elections</h2>
            <Link to={`/org/${orgId}/elections`} className="btn btn-outline btn-sm">
              View All
            </Link>
          </div>

          {elections.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No elections created yet.</p>
              <Link to={`/org/${orgId}/elections/create`} className="btn btn-primary mt-2">
                Create Your First Election
              </Link>
            </div>
          ) : (
            <div className="election-list">
              {elections.slice(0, 5).map((election) => (
                <div key={election._id} className="election-item">
                  <div className="election-info">
                    <h3>{election.title}</h3>
                    <p>
                      {election.candidates?.length || 0} candidates • {election.totalVotes || 0} votes
                    </p>
                  </div>
                  <div className="election-actions">
                    <span className={`badge badge-${
                      election.status === 'active' ? 'green' : 
                      election.status === 'draft' ? 'yellow' : 'blue'
                    }`}>
                      {election.status}
                    </span>
                    <Link 
                      to={`/org/${orgId}/elections/${election._id}`} 
                      className="btn btn-outline btn-sm"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="card-title">Quick Actions</h2>
          <div className="quick-actions-grid">
            <Link to={`/org/${orgId}/elections/create`} className="quick-action-item">
              <span className="action-icon">🗳️</span>
              <span className="action-text">Create Election</span>
            </Link>
            <Link to={`/org/${orgId}/elections`} className="quick-action-item">
              <span className="action-icon">📋</span>
              <span className="action-text">Manage Elections</span>
            </Link>
            <Link to={`/org/${orgId}/analytics`} className="quick-action-item">
              <span className="action-icon">📊</span>
              <span className="action-text">View Analytics</span>
            </Link>
            <Link to={`/org/${orgId}/settings`} className="quick-action-item">
              <span className="action-icon">⚙️</span>
              <span className="action-text">Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
