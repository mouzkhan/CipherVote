import { useState, useEffect } from "react";
import { api } from "../api/client";
import { verifyChainIntegrity } from "../utils/auditLedger";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/audit.css";

export default function AuditLog() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState("");
  const [entries, setEntries] = useState([]);
  const [integrity, setIntegrity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [selectedElectionTitle, setSelectedElectionTitle] = useState("");

  useEffect(() => {
    api.getAllElections().then(setElections).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedElection) { 
      setEntries([]); 
      setIntegrity(null);
      setSelectedElectionTitle("");
      return; 
    }
    
    const election = elections.find(e => e._id === selectedElection);
    setSelectedElectionTitle(election?.title || "");
    
    setLoading(true);
    setIntegrity(null);
    api.getAuditLog(selectedElection)
      .then(setEntries)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedElection, elections]);

  const runIntegrityCheck = async () => {
    setChecking(true);
    const mapped = entries.map((e) => ({
      sequenceNumber: e.sequenceNumber,
      voteReceiptHash: e.voteReceiptHash,
      previousHash: e.previousHash,
      chainHash: e.chainHash,
    }));
    const result = await verifyChainIntegrity(mapped);
    setIntegrity(result);
    setChecking(false);
  };

  return (
    <div className="page">
      <Navbar />
      
      <section className="audit-hero">
        <div className="container">
          <h1 className="section-title">Public Audit Log</h1>
          <p className="section-sub">
            A tamper-evident, publicly verifiable log of all vote hashes. No candidate choices are stored here — only cryptographic commitments.
          </p>
        </div>
      </section>

      <section className="audit-main">
        <div className="container">
          {/* Selection Controls */}
          <div className="audit-controls card">
            <div className="controls-header">
              <div className="form-group">
                <label className="label" htmlFor="electionSelect">Select Election to Audit</label>
                <select
                  id="electionSelect"
                  className="input"
                  value={selectedElection}
                  onChange={(e) => setSelectedElection(e.target.value)}
                >
                  <option value="">— Choose an election —</option>
                  {elections.map((el) => (
                    <option key={el._id} value={el._id}>{el.title}</option>
                  ))}
                </select>
              </div>
              {entries.length > 0 && (
                <button
                  className="btn btn-primary"
                  onClick={runIntegrityCheck}
                  disabled={checking}
                >
                  {checking ? (
                    <><span className="spinner-icon">⟳</span> Verifying…</>
                  ) : (
                    <><span className="btn-icon">🔍</span> Verify Chain Integrity</>
                  )}
                </button>
              )}
            </div>

            {/* Integrity Result */}
            {integrity && (
              <div className={`alert ${integrity.valid ? "alert-success" : "alert-error"}`}>
                {integrity.valid ? (
                  <>
                    <span className="alert-icon">✅</span>
                    <span>Chain integrity verified — all {entries.length} entries intact. No tampering detected.</span>
                  </>
                ) : (
                  <>
                    <span className="alert-icon">❌</span>
                    <span>Chain broken at entry #{integrity.brokenAt}. Ledger may have been tampered with.</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading audit ledger…</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && entries.length === 0 && selectedElection && (
            <div className="alert alert-info">
              <span className="alert-icon">ℹ️</span>
              <span>No audit entries found for this election yet.</span>
            </div>
          )}

          {/* Stats & Table */}
          {entries.length > 0 && (
            <>
              {/* Statistics Cards */}
              <div className="audit-stats">
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-content">
                    <div className="stat-value">{entries.length}</div>
                    <div className="stat-label">Total Votes Recorded</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🔗</div>
                  <div className="stat-content">
                    <div className="stat-value">{entries[entries.length - 1]?.sequenceNumber ?? 0}</div>
                    <div className="stat-label">Latest Sequence #</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⛓️</div>
                  <div className="stat-content">
                    <div className="stat-value">
                      {integrity === null ? "—" : integrity.valid ? "✓" : "✗"}
                    </div>
                    <div className="stat-label">Chain Integrity</div>
                  </div>
                </div>
              </div>

              {/* Audit Table */}
              <div className="audit-table-wrapper card">
                <div className="table-header">
                  <h3>Vote Hash Ledger</h3>
                  <p className="text-muted">Each entry contains the SHA-256 hash of a vote and the chain hash linking to the previous entry.</p>
                </div>
                <div className="table-responsive">
                  <table className="audit-table" role="table" aria-label="Audit ledger entries">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Vote Receipt Hash</th>
                        <th>Previous Hash</th>
                        <th>Chain Hash</th>
                        <th>Recorded At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((e, i) => (
                        <tr key={e.sequenceNumber} className={i % 2 === 0 ? "row-even" : ""}>
                          <td className="seq-cell">{e.sequenceNumber}</td>
                          <td><span className="hash-badge">{e.voteReceiptHash?.slice(0, 16)}…</span></td>
                          <td><span className="hash-badge">{e.previousHash?.slice(0, 16)}…</span></td>
                          <td><span className="hash-badge hash-chain">{e.chainHash?.slice(0, 16)}…</span></td>
                          <td className="time-cell text-muted">{new Date(e.recordedAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="table-footer">
                  <p className="text-muted">
                    Hashes truncated for display. Chain verification recomputes every SHA-256 link in-browser using the Web Crypto API.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
