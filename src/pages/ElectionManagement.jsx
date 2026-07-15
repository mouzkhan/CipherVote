import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import Navbar from "../components/Navbar";
import "../styles/dashboard.css";

/**
 * Election Management Page
 * 
 * Organization Admin can:
 * - View all elections
 * - Create new elections
 * - Edit/Delete elections
 * - View election status
 */
export default function ElectionManagement() {
  const { orgId } = useParams();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, draft, active, closed

  useEffect(() => {
    loadElections();
  }, [orgId]);

  const loadElections = async () => {
    try {
      const allElections = await api.getElections();
      // Filter by organization
      const orgElections = allElections.filter(e => e.organizationId === orgId);
      setElections(orgElections);
    } catch (err) {
      console.error("Failed to load elections:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredElections = elections.filter(e => {
    if (filter === "all") return true;
    return e.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'draft': return 'yellow';
      case 'closed': return 'blue';
      default: return 'blue';
    }
  };

  const copyInvitationLink = (code) => {
    const link = `${window.location.origin}/election/${code}`;
    navigator.clipboard.writeText(link);
    alert("Invitation link copied!");
  };

  return (
    <div className="page">
      <Navbar />
      <div className="dashboard-container container">
        {/* Header */}
        <div className="org-dashboard-header">
          <div>
            <h1 className="section-title">Election Management</h1>
            <p className="text-muted">Create and manage your organization's elections</p>
          </div>
          <Link to={`/org/${orgId}/elections/create`} className="btn btn-primary">
            + Create Election
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-3">
          <button 
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`btn btn-sm ${filter === 'draft' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter('draft')}
          >
            Draft
          </button>
          <button 
            className={`btn btn-sm ${filter === 'active' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button 
            className={`btn btn-sm ${filter === 'closed' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter('closed')}
          >
            Closed
          </button>
        </div>

        {/* Elections List */}
        <div className="card">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner" style={{ margin: "0 auto" }}></div>
            </div>
          ) : filteredElections.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No elections found.</p>
              <Link to={`/org/${orgId}/elections/create`} className="btn btn-primary mt-2">
                Create Your First Election
              </Link>
            </div>
          ) : (
            <div className="election-list">
              {filteredElections.map((election) => (
                <div key={election._id} className="election-item">
                  <div className="election-info">
                    <h3>{election.title}</h3>
                    <p>
                      {election.candidates?.length || 0} candidates • {election.totalVotes || 0} votes cast
                    </p>
                    <p className="text-muted" style={{ fontSize: "0.8rem" }}>
                      Code: {election.invitationCode}
                    </p>
                  </div>
                  <div className="election-actions">
                    <span className={`badge badge-${getStatusColor(election.status)}`}>
                      {election.status}
                    </span>
                    {election.status === 'active' && (
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => copyInvitationLink(election.invitationCode)}
                      >
                        Copy Link
                      </button>
                    )}
                    <Link 
                      to={`/org/${orgId}/elections/${election._id}`} 
                      className="btn btn-outline btn-sm"
                    >
                      Manage
                    </Link>
                    {election.status === 'active' && (
                      <Link 
                        to={`/org/${orgId}/elections/${election._id}/voters`} 
                        className="btn btn-outline btn-sm"
                      >
                        Voters
                      </Link>
                    )}
                    {election.status === 'closed' && (
                      <Link 
                        to={`/org/${orgId}/elections/${election._id}/analytics`} 
                        className="btn btn-primary btn-sm"
                      >
                        Results
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back Link */}
        <Link to={`/org/${orgId}/dashboard`} className="btn btn-outline mt-3">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
