import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import Navbar from "../components/Navbar";
import "../styles/dashboard.css";

/**
 * Voter Management Page
 * 
 * Organization Admin can:
 * - View all registered voters
 * - See verification status
 * - See voting status
 * - View voter details
 * 
 * NOTE: Admin can see WHO voted, but NOT who they voted for (ballot secrecy)
 */
export default function VoterManagement() {
  const { orgId, electionId } = useParams();
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, verified, pending, voted

  useEffect(() => {
    loadVoters();
  }, [electionId]);

  const loadVoters = async () => {
    try {
      // This would be a new API endpoint to get voters for an election
      // For now, we'll use the admin summary
      const summary = await api.getAdminSummary();
      setVoters([]); // Will be populated from API
    } catch (err) {
      console.error("Failed to load voters:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Navbar />
      <div className="dashboard-container container">
        {/* Header */}
        <div className="org-dashboard-header">
          <div>
            <h1 className="section-title">Voter Management</h1>
            <p className="text-muted">Monitor registered voters and their verification status</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="alert alert-info mb-3">
          <strong>🔒 Ballot Secrecy Protected</strong><br />
          You can see who has voted and their verification status, but you cannot see which candidate they selected.
          This protects voter privacy and ensures election integrity.
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-3">
          <button 
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter('all')}
          >
            All Voters
          </button>
          <button 
            className={`btn btn-sm ${filter === 'verified' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter('verified')}
          >
            Verified
          </button>
          <button 
            className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter('pending')}
          >
            Pending Verification
          </button>
          <button 
            className={`btn btn-sm ${filter === 'voted' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter('voted')}
          >
            Voted
          </button>
        </div>

        {/* Voters List */}
        <div className="card">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner" style={{ margin: "0 auto" }}></div>
            </div>
          ) : voters.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No voters have registered yet.</p>
              <p className="text-muted" style={{ fontSize: "0.85rem" }}>
                Share the election invitation link to invite voters.
              </p>
            </div>
          ) : (
            <div className="voters-list">
              {voters.map((voter) => (
                <div key={voter._id} className="voter-item" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 16,
                  background: 'var(--surface)',
                  borderRadius: 8,
                  marginBottom: 8,
                  border: '1px solid var(--border)',
                  flexWrap: 'wrap',
                  gap: 12
                }}>
                  <div>
                    <h4 style={{ margin: 0 }}>{voter.fullName}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>
                      {voter.email} • {voter.phone}
                    </p>
                  </div>
                  <div className="flex gap-2" style={{ alignItems: 'center' }}>
                    <span className={`badge badge-${voter.biometricVerified ? 'green' : 'yellow'}`}>
                      {voter.biometricVerified ? 'Verified' : 'Pending'}
                    </span>
                    {voter.hasVoted && (
                      <span className="badge badge-blue">Voted</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back Link */}
        <Link to={`/org/${orgId}/elections/${electionId}`} className="btn btn-outline mt-3">
          ← Back to Election
        </Link>
      </div>
    </div>
  );
}
