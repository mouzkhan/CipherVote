import { useState } from "react";
import { api } from "../api/client";
import { sha256, buildVotePayload } from "../utils/crypto";
import Navbar from "../components/Navbar";
import "../styles/verify.css";

/**
 * Public Receipt Verification Page
 * 
 * This implements the Benaloh Challenge - a key concept in end-to-end verifiable voting.
 * 
 * HOW IT WORKS:
 * 1. Voter receives a receipt after voting (contains hash + inputs)
 * 2. Voter can later verify their vote was counted correctly
 * 3. The verification happens in TWO steps:
 *    - Local: Re-compute hash from inputs (proves vote wasn't altered)
 *    - Server: Check if hash exists in audit ledger (proves vote was recorded)
 * 
 * PRIVACY: The candidate choice is NEVER sent to the server during verification.
 * Only the receipt hash is transmitted - which doesn't reveal who you voted for.
 */
export default function Verify() {
  const [form, setForm] = useState({
    voterUID: "",
    candidateId: "",
    electionId: "",
    timestamp: "",
    nonce: "",
    receiptHash: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recomputedHash, setRecomputedHash] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const verify = async () => {
    setLoading(true);
    setResult(null);
    setRecomputedHash("");

    try {
      const { voterUID, candidateId, electionId, timestamp, nonce, receiptHash } = form;
      
      // Validate inputs
      if (!voterUID || !candidateId || !electionId || !timestamp || !nonce || !receiptHash) {
        setResult({ error: "Please fill in all fields" });
        setLoading(false);
        return;
      }

      // STEP 1: LOCAL HASH RE-COMPUTATION
      // This proves the vote data hasn't been altered
      // Format: SHA-256(voterUID|candidateId|electionId|timestamp|nonce)
      const payload = buildVotePayload(
        voterUID.trim(),
        candidateId.trim(),
        electionId.trim(),
        Number(timestamp.trim()),
        nonce.trim()
      );
      
      const recomputed = await sha256(payload);
      setRecomputedHash(recomputed);
      
      const hashMatch = recomputed === receiptHash.trim();

      // STEP 2: LEDGER LOOKUP
      // Only check server if local hash matches
      let inLedger = false;
      let ledgerEntry = null;
      
      if (hashMatch) {
        try {
          const response = await api.verifyReceiptInLedger(electionId.trim(), receiptHash.trim());
          inLedger = response.found;
          ledgerEntry = response.entry;
        } catch (err) {
          console.warn("Ledger lookup failed:", err);
        }
      }

      setResult({ 
        hashMatch, 
        inLedger,
        ledgerEntry,
        recomputedHash: recomputed
      });
    } catch (err) {
      setResult({ error: err.message || "Verification failed. Please check your inputs." });
    } finally {
      setLoading(false);
    }
  };

  const pasteReceipt = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const p = JSON.parse(text);
      
      setForm({
        voterUID: p.voterUID || p.uid || "",
        candidateId: p.candidateId || "",
        electionId: p.electionId || "",
        timestamp: String(p.timestamp || ""),
        nonce: p.nonce || "",
        receiptHash: p.receiptHash || p.receipt || "",
      });
    } catch (err) {
      // Try parsing as form data format
      console.log("Could not parse clipboard as JSON");
    }
  };

  const loadSampleReceipt = () => {
    // Load the most recent receipt from session storage
    const stored = sessionStorage.getItem("voteReceipt");
    if (stored) {
      try {
        const p = JSON.parse(stored);
        setForm({
          voterUID: p.voterUID || p.uid || "",
          candidateId: p.candidateId || "",
          electionId: p.electionId || "",
          timestamp: String(p.timestamp || ""),
          nonce: p.nonce || "",
          receiptHash: p.receiptHash || "",
        });
      } catch (err) {
        console.log("Could not parse stored receipt");
      }
    } else {
      alert("No recent receipt found. You may need to vote first or paste your receipt JSON.");
    }
  };

  return (
    <div className="verify-page">
      <Navbar />
      
      <div className="verify-container">
        {/* Header */}
        <header className="verify-header">
          <div className="verify-icon">🔐</div>
          <h1>Verify Your Vote Receipt</h1>
          <p>
            Confirm your vote was recorded correctly. Your candidate choice is never 
            transmitted to any server during verification — only the receipt hash.
          </p>
        </header>

        <div className="verify-content">
          {/* Left: Form */}
          <div className="verify-form-card">
            <div className="form-header">
              <h2>Receipt Details</h2>
              <div className="form-actions">
                <button className="btn btn-outline btn-sm" onClick={pasteReceipt}>
                  📋 Paste JSON
                </button>
                <button className="btn btn-outline btn-sm" onClick={loadSampleReceipt}>
                  📥 Load Recent
                </button>
              </div>
            </div>

            <div className="form-fields">
              <div className="form-group">
                <label className="label">Your Voter ID</label>
                <input 
                  className="input" 
                  value={form.voterUID} 
                  onChange={set("voterUID")} 
                  placeholder="e.g., abc123xyz"
                />
              </div>

              <div className="form-group">
                <label className="label">Candidate ID</label>
                <input 
                  className="input" 
                  value={form.candidateId} 
                  onChange={set("candidateId")} 
                  placeholder="e.g., candidate_123"
                />
              </div>

              <div className="form-group">
                <label className="label">Election ID</label>
                <input 
                  className="input" 
                  value={form.electionId} 
                  onChange={set("electionId")} 
                  placeholder="e.g., election_456"
                />
              </div>

              <div className="form-group">
                <label className="label">Timestamp (milliseconds)</label>
                <input 
                  className="input" 
                  value={form.timestamp} 
                  onChange={set("timestamp")} 
                  placeholder="e.g., 1721068800000"
                />
              </div>

              <div className="form-group">
                <label className="label">Nonce (32-char hex)</label>
                <input 
                  className="input" 
                  value={form.nonce} 
                  onChange={set("nonce")} 
                  placeholder="Random secret from your receipt"
                  style={{ fontFamily: "monospace", fontSize: "0.85rem" }}
                />
              </div>

              <div className="form-group">
                <label className="label">Receipt Hash (SHA-256)</label>
                <input 
                  className="input" 
                  value={form.receiptHash} 
                  onChange={set("receiptHash")} 
                  placeholder="64-character hex hash"
                  style={{ fontFamily: "monospace", fontSize: "0.85rem" }}
                />
              </div>
            </div>

            <button
              className="btn btn-primary btn-block btn-lg"
              onClick={verify}
              disabled={loading || !form.receiptHash}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, marginRight: 8 }}></span>
                  Verifying...
                </>
              ) : (
                <>🔍 Verify Receipt</>
              )}
            </button>
          </div>

          {/* Right: Result or Explainer */}
          <div className="verify-result-panel">
            {result && !result.error && (
              <div className={`verify-result ${result.hashMatch && result.inLedger ? "success" : "fail"}`}>
                <div className="result-icon">
                  {result.hashMatch && result.inLedger ? "✅" : "❌"}
                </div>
                <h2 className="result-title">
                  {result.hashMatch && result.inLedger 
                    ? "Vote Verified Successfully" 
                    : "Verification Failed"}
                </h2>

                <div className="verification-checks">
                  {/* Check 1: Hash Integrity */}
                  <div className={`check ${result.hashMatch ? "pass" : "fail"}`}>
                    <div className="check-icon">
                      {result.hashMatch ? "✓" : "✗"}
                    </div>
                    <div className="check-content">
                      <h4>Hash Integrity</h4>
                      <p>
                        {result.hashMatch
                          ? "Re-computed hash matches your receipt. Your vote data is authentic."
                          : "Hash mismatch! The vote data may have been altered or inputs are incorrect."}
                      </p>
                      {recomputedHash && (
                        <div className="hash-display">
                          <span className="hash-label">Computed:</span>
                          <code>{recomputedHash.slice(0, 32)}...</code>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Check 2: Ledger Presence */}
                  <div className={`check ${result.inLedger ? "pass" : "fail"}`}>
                    <div className="check-icon">
                      {result.inLedger ? "✓" : "✗"}
                    </div>
                    <div className="check-content">
                      <h4>Audit Ledger Record</h4>
                      <p>
                        {result.inLedger
                          ? "Your receipt hash exists in the blockchain audit ledger. Your vote was counted."
                          : "Hash not found in ledger. The vote may not have been recorded correctly."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Security Explanation */}
                <div className="security-note">
                  <strong>🔒 Privacy Protected:</strong> Your candidate choice was never 
                  transmitted to any server. Only the receipt hash (which cannot reveal 
                  your vote) was checked against the ledger.
                </div>
              </div>
            )}

            {result?.error && (
              <div className="verify-error">
                <div className="error-icon">⚠️</div>
                <h3>Verification Error</h3>
                <p>{result.error}</p>
              </div>
            )}

            {!result && (
              <div className="verify-explainer">
                <h3>How Receipt Verification Works</h3>
                
                <div className="process-flow">
                  <div className="flow-step">
                    <div className="step-num">1</div>
                    <div className="step-content">
                      <h4>Enter Receipt Data</h4>
                      <p>Fill in the fields from your vote receipt, or paste the JSON directly.</p>
                    </div>
                  </div>
                  
                  <div className="flow-step">
                    <div className="step-num">2</div>
                    <div className="step-content">
                      <h4>Local Hash Computation</h4>
                      <p>Your browser computes SHA-256(voterID|candidate|election|time|nonce) locally.</p>
                      <p className="highlight">🛡️ Your vote choice never leaves your browser!</p>
                    </div>
                  </div>
                  
                  <div className="flow-step">
                    <div className="step-num">3</div>
                    <div className="step-content">
                      <h4>Hash Comparison</h4>
                      <p>If computed hash matches your receipt, the vote data is authentic.</p>
                    </div>
                  </div>
                  
                  <div className="flow-step">
                    <div className="step-num">4</div>
                    <div className="step-content">
                      <h4>Ledger Verification</h4>
                      <p>Server checks if the hash exists in the audit ledger (without knowing your vote).</p>
                    </div>
                  </div>
                </div>

                <div className="fraud-protection">
                  <h4>🛡️ How This Prevents Fraud</h4>
                  <ul>
                    <li><strong>Vote Alteration:</strong> If anyone changes your vote, the hash won't match.</li>
                    <li><strong>Missing Votes:</strong> If your vote wasn't recorded, the hash won't be in the ledger.</li>
                    <li><strong>Duplicate Votes:</strong> Each receipt is unique due to the nonce.</li>
                    <li><strong>Chain Tampering:</strong> The audit ledger is blockchain-linked; changing any entry breaks the chain.</li>
                  </ul>
                </div>

                <div className="research-citation">
                  <p>
                    This implements the <strong>Benaloh Challenge</strong> from academic research on 
                    end-to-end verifiable voting, similar to systems like <strong>Helios</strong> (MIT) 
                    and <strong>ElectionGuard</strong> (Microsoft).
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="verify-footer">
          <p>
            CipherVote uses cryptographic verification inspired by academic research in 
            secure electronic voting. Your vote is protected by mathematical guarantees.
          </p>
        </footer>
      </div>
    </div>
  );
}
