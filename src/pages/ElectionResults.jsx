import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import Navbar from "../components/Navbar";
import "../styles/election-results.css";

export default function ElectionResults() {
  const { id } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResults = async () => {
      try {
        const data = await api.getElectionResults(id);
        setResults(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadResults();
  }, [id]);

  if (loading) {
    return (
      <div className="page">
        <Navbar />
        <div className="container" style={{ padding: "2rem 0", textAlign: "center" }}>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <Navbar />
        <div className="container" style={{ padding: "2rem 0", textAlign: "center" }}>
          <div className="card">
            <h2 style={{ color: "#e74c3c" }}>Error</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const maxVotes = Math.max(...results.candidates.map((c) => c.votes), 1);

  return (
    <div className="page">
      <Navbar />
      <div className="container" style={{ padding: "2rem 0", maxWidth: 900 }}>
        <div className="card mb-3">
          <h1 className="section-title">{results.electionTitle} - Results</h1>
          <p className="section-sub">
            Status: <span className={`badge ${results.status === "closed" ? "badge-green" : "badge-blue"}`}>
              {results.status.toUpperCase()}
            </span>
            <span style={{ marginLeft: "1rem" }}>Total Votes: {results.totalVotes}</span>
          </p>
        </div>

        {results.winner && (
          <div className="card mb-3 winner-card">
            <h2 style={{ marginBottom: 8 }}>🏆 Winner</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {results.winner.photo && (
                <img
                  src={results.winner.photo}
                  alt={results.winner.name}
                  className="winner-photo"
                />
              )}
              <div>
                <h3 style={{ margin: 0 }}>{results.winner.name}</h3>
                {results.winner.position && <p className="text-muted">{results.winner.position}</p>}
                <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold" }}>
                  {results.winner.votes} votes ({results.winner.percentage}%)
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <h2 style={{ marginBottom: 16 }}>Vote Distribution</h2>
          <div className="results-chart">
            {results.candidates.map((candidate) => (
              <div key={candidate.id} className="result-item">
                <div className="result-header">
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                    {candidate.photo && (
                      <img
                        src={candidate.photo}
                        alt={candidate.name}
                        className="candidate-photo-small"
                      />
                    )}
                    <div>
                      <strong>{candidate.name}</strong>
                      {candidate.position && (
                        <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                          {candidate.position}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="result-stats">
                    <strong>{candidate.votes}</strong>
                    <span className="text-muted">({candidate.percentage}%)</span>
                  </div>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${(candidate.votes / maxVotes) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card mt-3">
          <h3 style={{ marginBottom: 12 }}>Candidate Details</h3>
          <div className="candidates-grid">
            {results.candidates.map((candidate) => (
              <div key={candidate.id} className="candidate-card-small">
                {candidate.photo && (
                  <img
                    src={candidate.photo}
                    alt={candidate.name}
                    className="candidate-photo-medium"
                  />
                )}
                <div className="candidate-info-small">
                  <h4>{candidate.name}</h4>
                  {candidate.position && <p className="text-muted">{candidate.position}</p>}
                  {candidate.description && (
                    <p className="text-muted" style={{ fontSize: "0.85rem" }}>
                      {candidate.description}
                    </p>
                  )}
                  <div className="vote-count">
                    <strong>{candidate.votes}</strong> votes
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
