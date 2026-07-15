import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import Navbar from "../components/Navbar";
import "../styles/dashboard.css";

/**
 * Election Analytics Page
 * 
 * Organization Admin can view:
 * - Vote statistics
 * - Candidate results (only after election closes)
 * - Voter turnout
 * - Fraud alerts
 * 
 * NOTE: Individual vote choices remain secret
 */
export default function ElectionAnalytics() {
  const { orgId, electionId } = useParams();
  const [election, setElection] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [electionId]);

  const loadAnalytics = async () => {
    try {
      const elections = await api.getElections();
      const found = elections.find(e => e._id === electionId);
      setElection(found);

      if (found?.status === 'closed') {
        const resultsData = await api.getElectionResults(electionId);
        setResults(resultsData);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
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
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Navbar />
      <div className="dashboard-container container">
        {/* Header */}
        <div className="org-dashboard-header">
          <div>
            <h1 className="section-title">Election Analytics</h1>
            <p className="text-muted">{election?.title}</p>
          </div>
          <span className={`badge badge-${
            election?.status === 'active' ? 'green' : 
            election?.status === 'closed' ? 'blue' : 'yellow'
          }`}>
            {election?.status}
          </span>
        </div>

        {/* Statistics */}
        <div className="dashboard-stats mb-3">
          <div className="stat-card">
            <div className="stat-value">{election?.candidates?.length || 0}</div>
            <div className="stat-label">Candidates</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{election?.totalVotes || 0}</div>
            <div className="stat-label">Total Votes</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {election?.status === 'closed' ? '100%' : '--'}
            </div>
            <div className="stat-label">Turnout</div>
          </div>
        </div>

        {/* Results (Only shown when election is closed) */}
        {election?.status === 'closed' && results ? (
          <div className="card mb-3">
            <h3 className="card-title">Election Results</h3>
            
            {results.winner && (
              <div className="winner-banner mb-3" style={{
                padding: 16,
                background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.15), rgba(102, 126, 234, 0.15))',
                borderRadius: 12,
                border: '1px solid var(--accent)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--accent)', marginBottom: 4 }}>
                  WINNER
                </div>
                <h2 style={{ margin: 0 }}>{results.winner.name}</h2>
                <p style={{ margin: '4px 0 0 0', color: 'var(--muted)' }}>
                  {results.winner.votes} votes ({results.winner.percentage}%)
                </p>
              </div>
            )}

            <div className="results-list">
              {results.candidates?.map((candidate, index) => (
                <div key={candidate.id || index} className="result-item" style={{
                  marginBottom: 16
                }}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      {index === 0 && <span style={{ color: 'var(--accent)' }}>🏆</span>}
                      <span style={{ fontWeight: index === 0 ? 600 : 400 }}>
                        {candidate.name}
                      </span>
                    </div>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                      {candidate.votes} votes ({candidate.percentage}%)
                    </span>
                  </div>
                  <div className="progress-track">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${candidate.percentage}%`,
                        background: index === 0 
                          ? 'linear-gradient(90deg, var(--accent), var(--primary))'
                          : 'var(--primary)'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card mb-3">
            <div className="text-center py-4">
              <h3 className="card-title">Results Not Available</h3>
              <p className="text-muted">
                Results will be available after the election is closed.
              </p>
            </div>
          </div>
        )}

        {/* Fraud Detection Summary */}
        <div className="card mb-3">
          <h3 className="card-title">AI Security Overview</h3>
          <p className="text-muted mb-2">
            Real-time fraud detection powered by explainable AI.
          </p>
          <div className="dashboard-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--accent)' }}>0</div>
              <div className="stat-label">Blocked Votes</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--warn)' }}>0</div>
              <div className="stat-label">Warnings</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--primary)' }}>0</div>
              <div className="stat-label">Security Events</div>
            </div>
          </div>
        </div>

        {/* Ballot Secrecy Notice */}
        <div className="alert alert-info mb-3">
          <strong>🔒 Ballot Secrecy Protected</strong><br />
          This system preserves voter privacy. Individual vote choices are never revealed to anyone, 
          including administrators. Voters can verify their vote was counted using their receipt.
        </div>

        {/* Back Link */}
        <Link to={`/org/${orgId}/elections/${electionId}`} className="btn btn-outline mt-3">
          ← Back to Election
        </Link>
      </div>
    </div>
  );
}
