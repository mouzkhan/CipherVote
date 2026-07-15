import { useState, useEffect, useRef } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { sha256, generateNonce, buildVotePayload } from "../utils/crypto";
import { computeRiskScore, logSecurityEvent } from "../utils/fraudDetection";
import behavioralCollector from "../utils/behavioralCollector";
import Navbar from "../components/Navbar";
import FraudReport from "../components/FraudReport";
import "../styles/vote.css";

export default function Vote() {
  const { user, failedLogins } = useAuth();

  const [elections, setElections] = useState([]);
  const [selected, setSelected] = useState(null);   // active election
  const [choice, setChoice] = useState("");           // candidateId
  const [phase, setPhase] = useState("select");       // select | confirm | submitting | done | error | blocked
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [eligibility, setEligibility] = useState(null);
  const [riskReport, setRiskReport] = useState(null);
  const pageEnteredAt = useRef(Date.now());
  const lastSubmitAt = useRef(0);

  // Start behavioral tracking when election is selected
  useEffect(() => {
    if (selected && phase === "select") {
      behavioralCollector.start();
    }
    return () => {
      // Stop tracking when navigating away
      if (phase !== "done" && phase !== "blocked") {
        behavioralCollector.stop();
      }
    };
  }, [selected, phase]);

  // Check if user already voted in selected election
  useEffect(() => {
    if (!selected || !user) return;
    const checkVoterStatus = async () => {
      try {
        const [status, eligibilityResponse] = await Promise.all([
          api.getVoterStatus(user.uid, selected.id),
          api.verifyVoterEligibility(user.uid, selected.id),
        ]);
        setHasVoted(status.hasVoted);
        setEligibility(eligibilityResponse);
      } catch (err) {
        console.error("Failed to check voter status:", err);
        setEligibility({ eligible: false, status: 'pending', alreadyVoted: false, electionOpen: false });
      }
    };
    checkVoterStatus();
  }, [selected, user]);

  const handleVote = async () => {
    const now = Date.now();
    const timeOnPage = now - pageEnteredAt.current;
    const timeSinceLast = lastSubmitAt.current ? now - lastSubmitAt.current : 9999;
    lastSubmitAt.current = now;

    // --- Collect Behavioral Biometrics ---
    behavioralCollector.stop();
    const behavioralData = behavioralCollector.exportData();

    // --- AI Fraud Detection (Enhanced with Behavioral Features) ---
    const risk = computeRiskScore({
      failedLogins,
      timeOnPageMs: timeOnPage,
      lastSubmitMs: timeSinceLast === 9999 ? 0 : timeSinceLast,
      userAgent: navigator.userAgent,
      hasVotedBefore: hasVoted,
      // NEW: Add behavioral features
      mouseMovements: behavioralData.behavioral.mouse.mouseMovements,
      cursorPathLength: behavioralData.behavioral.mouse.cursorPathLength,
      typingSpeed: behavioralData.behavioral.typing.typingSpeed,
      behavioralRiskScore: behavioralData.behavioral.riskScore,
    });

    logSecurityEvent({ 
      ...risk, 
      uid: user.uid, 
      electionId: selected.id, 
      timestamp: now,
      behavioral: behavioralData.behavioral 
    });

    if (risk.blocked) {
      setRiskReport({
        score: risk.score,
        level: risk.level,
        signals: risk.signals,
        recommendation: "This session appears suspicious. Please contact an administrator if you believe this is a mistake.",
        suspiciousPatterns: behavioralData.behavioral.patterns,
      });
      setPhase("blocked");
      setError(`Vote blocked. Risk score: ${risk.score}/100. Reason: ${risk.signals.map((s) => s.detail).join("; ")}`);
      return;
    }

    setPhase("submitting");
    try {
      // --- Cryptographic Receipt Generation ---
      const timestamp = now;
      const nonce = generateNonce();
      const payload = buildVotePayload(user.uid, choice, selected.id, timestamp, nonce);
      const receiptHash = await sha256(payload);

      // Submit vote to MongoDB API (server handles atomic operations)
      const voterEmail = sessionStorage.getItem('voterEmail') || user.uid;
      const result = await api.castVote({
        uid: user.uid,
        email: voterEmail,
        electionId: selected.id,
        candidateId: choice,
        receiptHash,
        nonce,
        timestamp,
        riskScore: risk.score,
        riskLevel: risk.level,
        behavioral: behavioralData.behavioral,
      });

      // Give voter their receipt
      setReceipt({
        receiptHash,
        nonce,
        timestamp,
        electionId: selected.id,
        electionTitle: selected.title,
        candidateId: choice,
        candidateName: selected.candidates.find((c) => c.id === choice)?.name,
        sequenceNumber: result.sequenceNumber,
        chainHash: result.chainHash,
        riskScore: risk.score,
      });

      setPhase("done");
    } catch (err) {
      console.error(err);
      setError(err.message);
      setPhase("error");
    }
  };

  // ── Render phases ─────────────────────────────────────────────

  if (phase === "done" && receipt) return <ReceiptView receipt={receipt} />;
  if (phase === "blocked") return <BlockedView error={error} />;

  return (
    <div className="page">
      <Navbar />
      <div className="vote-outer container">

        {/* Election selector */}
        {!selected && (
          <div>
            <h1 className="section-title mt-3">Active Elections</h1>
            <p className="section-sub">Select an election to cast your vote.</p>
            {elections.length === 0 && <div className="alert alert-info">No active elections at the moment. Check back later.</div>}
            <div className="grid-2">
              {elections.map((el) => (
                <button
                  key={el.id}
                  className="election-card card"
                  onClick={() => { setSelected(el); setPhase("select"); }}
                  aria-label={`Vote in ${el.title}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="badge badge-green">ACTIVE</span>
                    <span className="text-muted" style={{ fontSize: "0.8rem" }}>{el.candidates?.length || 0} candidates</span>
                  </div>
                  <h2 className="election-title">{el.title}</h2>
                  <p className="text-muted mt-1">{el.description}</p>
                  <div className="election-meta mt-2 text-muted">
                    {el.totalVotes || 0} votes cast
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Candidate selection */}
        {selected && phase === "select" && (
          <div className="vote-panel">
            <button className="btn btn-outline btn-sm mb-3" onClick={() => { setSelected(null); setChoice(""); }}>← Back to elections</button>
            <h1 className="section-title">{selected.title}</h1>
            <p className="section-sub">{selected.description}</p>

            {hasVoted && (
              <div className="alert alert-error">You have already voted in this election. Each voter may cast exactly one vote.</div>
            )}

            {eligibility && !eligibility.eligible && !hasVoted && (
              <div className="alert alert-info">
                Eligibility status: {eligibility.status || 'pending'} · {eligibility.alreadyVoted ? 'Already voted' : 'Verification required before voting.'}
              </div>
            )}

            {!hasVoted && eligibility?.eligible && (
              <>
                <p className="vote-instruction">Select your candidate. Your choice will be hashed — no one can see who you voted for from your receipt.</p>
                <div className="candidates-grid">
                  {selected.candidates?.map((c) => (
                    <button
                      key={c.id}
                      className={`candidate-card card ${choice === c.id ? "candidate-selected" : ""}`}
                      onClick={() => setChoice(c.id)}
                      aria-pressed={choice === c.id}
                      aria-label={`Select ${c.name}`}
                    >
                      <div className="candidate-avatar">{c.name?.[0]?.toUpperCase()}</div>
                      <div className="candidate-name">{c.name}</div>
                      <div className="text-muted" style={{ fontSize: "0.82rem" }}>{c.party || ""}</div>
                      {choice === c.id && <div className="candidate-check">✓ Selected</div>}
                    </button>
                  ))}
                </div>

                <div className="vote-footer mt-3">
                  <div className="crypto-notice">
                    🔐 Your vote will be hashed with a unique nonce and appended to the public audit chain.
                  </div>
                  <button
                    className="btn btn-primary mt-2"
                    disabled={!choice || !eligibility?.eligible}
                    onClick={() => setPhase("confirm")}
                  >
                    Review &amp; Confirm Vote →
                  </button>
                </div>
              </>
            )}

            {!hasVoted && eligibility && !eligibility.eligible && (
              <div className="alert alert-info">
                Your registration is still {eligibility.status || 'pending'}. Complete verification before voting.
              </div>
            )}
          </div>
        )}

        {/* Confirmation screen */}
        {selected && phase === "confirm" && (
          <div className="vote-panel">
            <h1 className="section-title">Confirm Your Vote</h1>
            <p className="section-sub">This cannot be undone. Review carefully.</p>

            <div className="confirm-box card">
              <div className="confirm-row">
                <span className="text-muted">Election</span>
                <span>{selected.title}</span>
              </div>
              <div className="confirm-row">
                <span className="text-muted">Your choice</span>
                <span style={{ fontWeight: 700, color: "var(--accent)" }}>
                  {selected.candidates.find((c) => c.id === choice)?.name}
                </span>
              </div>
              <div className="confirm-row">
                <span className="text-muted">Verification</span>
                <span className="badge badge-green">E2E Verifiable</span>
              </div>
              <div className="confirm-row">
                <span className="text-muted">Audit trail</span>
                <span className="badge badge-blue">Blockchain-chained</span>
              </div>
            </div>

            {error && <div className="alert alert-error mt-2">{error}</div>}

            {riskReport && <FraudReport {...riskReport} />}

            <div className="flex gap-2 mt-3">
              <button className="btn btn-outline" onClick={() => { setPhase("select"); setError(""); }}>← Change selection</button>
              <button className="btn btn-primary" onClick={handleVote} disabled={phase === "submitting"}>
                {phase === "submitting" ? "Submitting…" : "Cast Vote & Get Receipt"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Receipt View ────────────────────────────────────────────────

function ReceiptView({ receipt }) {
  const copyToClipboard = () => {
    const text = JSON.stringify(receipt, null, 2);
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div className="page">
      <Navbar />
      <div className="vote-outer container">
        <div className="receipt-card card">
          <div className="receipt-icon">✅</div>
          <h1 className="receipt-title">Vote Cast Successfully</h1>
          <p className="text-muted text-center mt-1 mb-3">
            Save your receipt. You can use it at any time to verify your vote was recorded and counted correctly.
          </p>

          <div className="receipt-grid">
            <ReceiptRow label="Election" value={receipt.electionTitle} />
            <ReceiptRow label="Candidate" value={receipt.candidateName} highlight />
            <ReceiptRow label="Timestamp" value={new Date(receipt.timestamp).toLocaleString()} />
            <ReceiptRow label="Ledger position" value={`#${receipt.sequenceNumber}`} />
            <ReceiptRow label="Risk score" value={`${receipt.riskScore}/100 (low)`} />
          </div>

          <div className="mt-3">
            <div className="label">Your vote receipt hash (SHA-256)</div>
            <div className="hash-display mt-1">{receipt.receiptHash}</div>
            <p className="text-muted mt-1" style={{ fontSize: "0.8rem" }}>
              This hash is derived from your voter ID, candidate choice, a unique nonce, and timestamp.
              No one can reverse it to learn your choice. You can re-derive it using the Verify page.
            </p>
          </div>

          <div className="mt-2">
            <div className="label">Chain hash (audit ledger entry)</div>
            <div className="hash-display mt-1">{receipt.chainHash}</div>
          </div>

          <div className="mt-2">
            <div className="label">Nonce (keep this private)</div>
            <div className="hash-display mt-1">{receipt.nonce}</div>
          </div>

          <div className="flex gap-2 mt-3" style={{ flexWrap: "wrap" }}>
            <button className="btn btn-accent" onClick={copyToClipboard}>📋 Copy Full Receipt</button>
            <a href="/verify" className="btn btn-outline">🔍 Verify Later</a>
            <a href="/audit" className="btn btn-outline">🔗 View Audit Log</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReceiptRow({ label, value, highlight }) {
  return (
    <div className="receipt-row">
      <span className="text-muted">{label}</span>
      <span style={highlight ? { color: "var(--accent)", fontWeight: 700 } : {}}>{value}</span>
    </div>
  );
}

function BlockedView({ error }) {
  return (
    <div className="page">
      <Navbar />
      <div className="vote-outer container">
        <div className="card text-center">
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>🚫</div>
          <h1 className="section-title text-danger">Vote Blocked by Security System</h1>
          <p className="text-muted mt-2 mb-3">Our AI fraud detection flagged your session as high-risk.</p>
          <div className="alert alert-error">{error}</div>
          <p className="text-muted mt-2" style={{ fontSize: "0.85rem" }}>
            If you believe this is an error, please contact the election administrator with your session details.
          </p>
        </div>
      </div>
    </div>
  );
}
