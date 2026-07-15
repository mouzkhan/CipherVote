import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { sha256, generateNonce, buildVotePayload } from "../utils/crypto";
import "../styles/election-invitation.css";

/**
 * Voter Vote Page
 * 
 * This is where voters cast their vote.
 * Voters select a candidate and submit.
 * They receive a cryptographic receipt.
 * 
 * Voter flow: Invitation → Register → Biometric → Vote → Confirmation
 */
export default function VoterVote() {
  const { code } = useParams();
  const navigate = useNavigate();
  
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [phase, setPhase] = useState("select"); // select, confirm, submitting, done
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);

  const voterEmail = sessionStorage.getItem('voterEmail');

  useEffect(() => {
    loadElection();
  }, [code]);

  const loadElection = async () => {
    try {
      const data = await api.getElectionByCode(code);
      setElection(data);
    } catch (err) {
      setError("Failed to load election");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCandidate = (candidateId) => {
    setSelectedCandidate(candidateId);
  };

  const handleConfirmVote = async () => {
    if (!selectedCandidate) {
      setError("Please select a candidate");
      return;
    }

    setPhase("submitting");
    setError("");

    try {
      const timestamp = Date.now();
      const nonce = generateNonce();
      const payload = buildVotePayload(voterEmail, selectedCandidate, election._id, timestamp, nonce);
      const receiptHash = await sha256(payload);

      const result = await api.castVote({
        uid: voterEmail,
        electionId: election._id,
        candidateId: selectedCandidate,
        receiptHash,
        nonce,
        timestamp,
        riskScore: 0,
        riskLevel: "LOW"
      });

      setReceipt({
        voterUID: voterEmail,
        candidateId: selectedCandidate,
        electionId: election._id,
        receiptHash,
        nonce,
        timestamp,
        electionTitle: election.title,
        candidateName: election.candidates.find(c => c.id === selectedCandidate)?.name,
        sequenceNumber: result.sequenceNumber,
        chainHash: result.chainHash
      });

      setPhase("done");
      
      // Store FULL receipt for confirmation and verification pages
      sessionStorage.setItem('voteReceipt', JSON.stringify({
        voterUID: voterEmail,
        candidateId: selectedCandidate,
        electionId: election._id,
        receiptHash,
        nonce,
        timestamp,
        electionTitle: election.title,
        candidateName: election.candidates.find(c => c.id === selectedCandidate)?.name,
        sequenceNumber: result.sequenceNumber,
        chainHash: result.chainHash
      }));

      // Navigate to confirmation
      navigate(`/election/${code}/confirm`);
    } catch (err) {
      setError(err.message || "Failed to submit vote");
      setPhase("select");
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container" style={{ padding: "2rem 0", textAlign: "center", maxWidth: 800 }}>
          <div className="spinner" style={{ margin: "0 auto" }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container" style={{ padding: "2rem 0", maxWidth: 800 }}>
        {/* Election Header */}
        <div className="card mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-green">Active Election</span>
          </div>
          <h1 className="section-title">{election?.title}</h1>
          <p className="text-muted">{election?.description}</p>
        </div>

        {error && <div className="alert alert-error mb-2">{error}</div>}

        {/* Candidate Selection */}
        {phase === "select" && (
          <div className="card">
            <h2 className="section-title">Select Your Candidate</h2>
            <p className="text-muted mb-3">
              Choose one candidate. Your vote is secret - no one will know who you voted for.
            </p>

            <div className="candidates-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16
            }}>
              {election?.candidates?.map((candidate) => (
                <button
                  key={candidate.id}
                  className={`candidate-card ${selectedCandidate === candidate.id ? 'selected' : ''}`}
                  onClick={() => handleSelectCandidate(candidate.id)}
                  style={{
                    padding: 20,
                    background: selectedCandidate === candidate.id 
                      ? 'rgba(102, 126, 234, 0.15)' 
                      : 'var(--surface)',
                    border: `2px solid ${selectedCandidate === candidate.id 
                      ? 'var(--primary)' 
                      : 'var(--border)'}`,
                    borderRadius: 12,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {candidate.photo ? (
                      <img 
                        src={candidate.photo} 
                        alt={candidate.name}
                        style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: 56,
                        height: 56,
                        borderRadius: 8,
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-d))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.2rem'
                      }}>
                        {candidate.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem' }}>{candidate.name}</h3>
                      {candidate.position && (
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--accent)' }}>
                          {candidate.position}
                        </p>
                      )}
                    </div>
                  </div>
                  {candidate.description && (
                    <p style={{ margin: '12px 0 0 0', fontSize: '0.85rem', color: 'var(--muted)' }}>
                      {candidate.description}
                    </p>
                  )}
                  {selectedCandidate === candidate.id && (
                    <div style={{ 
                      marginTop: 12, 
                      color: 'var(--primary)', 
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}>
                      ✓ Selected
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button 
              className="btn btn-primary btn-block mt-3"
              onClick={() => selectedCandidate && setPhase("confirm")}
              disabled={!selectedCandidate}
            >
              Continue to Confirmation →
            </button>
          </div>
        )}

        {/* Confirmation */}
        {phase === "confirm" && (
          <div className="card">
            <h2 className="section-title">Confirm Your Vote</h2>
            <p className="text-muted mb-3">
              Please confirm your selection. Once submitted, you cannot change your vote.
            </p>

            <div className="alert alert-info mb-3">
              <strong>You are about to vote for:</strong><br />
              <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                {election?.candidates?.find(c => c.id === selectedCandidate)?.name}
              </span>
            </div>

            <div className="alert alert-error mb-3" style={{ fontSize: '0.85rem' }}>
              ⚠️ <strong>Important:</strong> After submission, you will receive a cryptographic receipt. 
              Save this receipt - it allows you to verify your vote was counted without revealing your choice.
            </div>

            <div className="flex gap-2">
              <button 
                className="btn btn-outline"
                onClick={() => setPhase("select")}
              >
                ← Back
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleConfirmVote}
              >
                Submit Vote
              </button>
            </div>
          </div>
        )}

        {/* Submitting */}
        {phase === "submitting" && (
          <div className="card text-center">
            <div className="spinner" style={{ margin: "0 auto" }}></div>
            <h2 className="section-title mt-3">Submitting Your Vote...</h2>
            <p className="text-muted">
              Your vote is being securely recorded with cryptographic verification.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
