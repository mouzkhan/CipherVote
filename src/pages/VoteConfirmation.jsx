import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";

/**
 * Vote Confirmation Page
 * 
 * Shows the voter their cryptographic receipt after voting.
 * This receipt allows them to verify their vote was counted
 * without revealing which candidate they selected.
 * 
 * SECURITY CONCEPTS:
 * 1. SHA-256 Hash: Unique fingerprint of the vote
 * 2. Nonce: Random secret prevents vote guessing
 * 3. Audit Ledger: Blockchain-linked storage
 * 4. End-to-End Verifiability: Voter can prove vote was counted
 */
export default function VoteConfirmation() {
  const { code } = useParams();
  
  // Get receipt from session storage
  const receiptJson = sessionStorage.getItem('voteReceipt');
  const receipt = receiptJson ? JSON.parse(receiptJson) : null;
  
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(null);

  const copyReceipt = () => {
    if (!receipt) return;
    
    const receiptData = {
      voterUID: receipt.voterUID,
      candidateId: receipt.candidateId,
      electionId: receipt.electionId,
      timestamp: receipt.timestamp,
      nonce: receipt.nonce,
      receiptHash: receipt.receiptHash
    };
    
    navigator.clipboard.writeText(JSON.stringify(receiptData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verifyNow = async () => {
    if (!receipt) return;
    
    setVerifying(true);
    try {
      // Check if receipt exists in ledger
      const response = await api.verifyReceiptInLedger(receipt.electionId, receipt.receiptHash);
      setVerified(response.found);
    } catch (err) {
      setVerified(false);
    } finally {
      setVerifying(false);
    }
  };

  if (!receipt) {
    return (
      <div className="confirmation-page">
        <div className="confirmation-container">
          <div className="no-receipt-card">
            <div className="error-icon">⚠️</div>
            <h1>No Vote Receipt Found</h1>
            <p>
              We couldn't find your vote receipt. This may happen if you navigated 
              away from the confirmation page or your session expired.
            </p>
            <Link to={`/election/${code}`} className="btn btn-primary">
              Return to Election
            </Link>
          </div>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="confirmation-page">
      <div className="confirmation-container">
        {/* Success Banner */}
        <div className="success-banner">
          <div className="success-icon">✅</div>
          <h1>Vote Submitted Successfully</h1>
          <p>
            Your vote has been cryptographically recorded on the audit ledger.
            Save your receipt below to verify your vote was counted.
          </p>
        </div>

        {/* Receipt Card */}
        <div className="receipt-card">
          <div className="receipt-header">
            <h2>🗳️ Your Vote Receipt</h2>
            <button className="btn btn-outline btn-sm" onClick={copyReceipt}>
              {copied ? "✓ Copied!" : "📋 Copy Receipt"}
            </button>
          </div>

          <div className="receipt-body">
            {/* Vote Summary */}
            <div className="receipt-section">
              <h3>Vote Summary</h3>
              <div className="receipt-grid">
                <div className="receipt-item">
                  <span className="label">Election</span>
                  <span className="value">{receipt.electionTitle}</span>
                </div>
                <div className="receipt-item">
                  <span className="label">Your Vote</span>
                  <span className="value highlight">{receipt.candidateName}</span>
                </div>
                <div className="receipt-item">
                  <span className="label">Timestamp</span>
                  <span className="value">{new Date(receipt.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Cryptographic Data */}
            <div className="receipt-section">
              <h3>Cryptographic Receipt Data</h3>
              <p className="section-hint">
                These fields are used to verify your vote without revealing your choice to others.
              </p>
              
              <div className="crypto-fields">
                <div className="crypto-item">
                  <span className="label">Your Voter ID</span>
                  <code className="value">{receipt.voterUID}</code>
                </div>
                
                <div className="crypto-item">
                  <span className="label">Candidate ID</span>
                  <code className="value">{receipt.candidateId}</code>
                </div>
                
                <div className="crypto-item">
                  <span className="label">Election ID</span>
                  <code className="value">{receipt.electionId}</code>
                </div>
                
                <div className="crypto-item">
                  <span className="label">Timestamp (ms)</span>
                  <code className="value">{receipt.timestamp}</code>
                </div>
                
                <div className="crypto-item">
                  <span className="label">Nonce (Secret)</span>
                  <code className="value">{receipt.nonce}</code>
                  <span className="hint">🔒 Keep this secret!</span>
                </div>
                
                <div className="crypto-item full-width">
                  <span className="label">Receipt Hash (SHA-256)</span>
                  <code className="value">{receipt.receiptHash}</code>
                </div>
                
                {receipt.sequenceNumber !== undefined && (
                  <div className="crypto-item">
                    <span className="label">Ledger Position</span>
                    <code className="value">#{receipt.sequenceNumber}</code>
                  </div>
                )}
                
                {receipt.chainHash && (
                  <div className="crypto-item full-width">
                    <span className="label">Chain Hash</span>
                    <code className="value" style={{ fontSize: '0.7rem' }}>{receipt.chainHash}</code>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Verification */}
            <div className="receipt-section">
              <h3>Quick Verification</h3>
              
              {verified === null ? (
                <div className="verify-action">
                  <p>Check if your vote is recorded in the audit ledger:</p>
                  <button 
                    className="btn btn-primary" 
                    onClick={verifyNow}
                    disabled={verifying}
                  >
                    {verifying ? "Checking..." : "🔍 Verify Now"}
                  </button>
                </div>
              ) : verified ? (
                <div className="verify-success">
                  <span className="verify-icon">✓</span>
                  <div>
                    <strong>Vote Confirmed!</strong>
                    <p>Your receipt hash exists in the audit ledger. Your vote was counted.</p>
                  </div>
                </div>
              ) : (
                <div className="verify-fail">
                  <span className="verify-icon">⚠️</span>
                  <div>
                    <strong>Verification Pending</strong>
                    <p>The ledger is still processing. Try again in a few seconds.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* How Verification Works */}
        <div className="info-card">
          <h3>🔐 How This Protects Your Vote</h3>
          
          <div className="protection-grid">
            <div className="protection-item">
              <span className="icon">🔏</span>
              <div>
                <h4>End-to-End Encryption</h4>
                <p>Your vote is hashed locally. Only you know who you voted for.</p>
              </div>
            </div>
            
            <div className="protection-item">
              <span className="icon">🔗</span>
              <div>
                <h4>Blockchain Audit Trail</h4>
                <p>Every vote is linked in a chain. Tampering breaks the chain.</p>
              </div>
            </div>
            
            <div className="protection-item">
              <span className="icon">🎲</span>
              <div>
                <h4>Random Nonce</h4>
                <p>A secret random value ensures no one can guess your vote.</p>
              </div>
            </div>
            
            <div className="protection-item">
              <span className="icon">✓</span>
              <div>
                <h4>Public Verifiability</h4>
                <p>Anyone can verify votes were counted without seeing choices.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fraud Prevention Explanation */}
        <div className="fraud-card">
          <h3>🛡️ How This Prevents Fraud</h3>
          
          <div className="fraud-list">
            <div className="fraud-item">
              <strong>❌ Vote Alteration</strong>
              <p>If someone changes your vote, the hash won't match your receipt.</p>
            </div>
            
            <div className="fraud-item">
              <strong>❌ Missing Votes</strong>
              <p>If your vote wasn't recorded, the hash won't exist in the ledger.</p>
            </div>
            
            <div className="fraud-item">
              <strong>❌ Duplicate Voting</strong>
              <p>Each receipt has a unique nonce, preventing vote copying.</p>
            </div>
            
            <div className="fraud-item">
              <strong>❌ Chain Tampering</strong>
              <p>Changing any audit entry breaks all subsequent entries in the chain.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="action-grid">
          <Link to="/verify" className="action-card">
            <span className="action-icon">🔍</span>
            <span className="action-text">Verify Receipt</span>
            <span className="action-hint">Full verification page</span>
          </Link>
          
          <Link to={`/audit/${receipt.electionId}`} className="action-card">
            <span className="action-icon">📋</span>
            <span className="action-text">Audit Log</span>
            <span className="action-hint">View blockchain ledger</span>
          </Link>
          
          <Link to="/" className="action-card">
            <span className="action-icon">🏠</span>
            <span className="action-text">Go Home</span>
            <span className="action-hint">Return to dashboard</span>
          </Link>
        </div>

        {/* Thank You */}
        <div className="thank-you">
          <p>
            Thank you for participating in this secure election powered by <strong>CipherVote</strong>.
          </p>
          <p className="citation">
            Based on the Benaloh Challenge, Helios Voting, and ElectionGuard research.
          </p>
        </div>
      </div>
      
      <style>{styles}</style>
    </div>
  );
}

const styles = `
.confirmation-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.confirmation-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* Success Banner */
.success-banner {
  text-align: center;
  padding: 40px 24px;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(99, 102, 241, 0.1));
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 20px;
  margin-bottom: 24px;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.success-banner h1 {
  font-size: 1.8rem;
  margin: 0 0 12px;
}

.success-banner p {
  font-size: 1rem;
  color: #9ca3af;
  margin: 0;
}

/* No Receipt */
.no-receipt-card {
  text-align: center;
  padding: 60px 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
}

.no-receipt-card .error-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.no-receipt-card h1 {
  font-size: 1.5rem;
  margin: 0 0 12px;
}

.no-receipt-card p {
  color: #9ca3af;
  margin: 0 0 24px;
}

/* Receipt Card */
.receipt-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  margin-bottom: 24px;
  overflow: hidden;
}

.receipt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: rgba(99, 102, 241, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.receipt-header h2 {
  margin: 0;
  font-size: 1.1rem;
}

.receipt-body {
  padding: 24px;
}

.receipt-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.receipt-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.receipt-section h3 {
  font-size: 0.95rem;
  margin: 0 0 16px;
  color: #a5b4fc;
}

.section-hint {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0 0 12px;
}

.receipt-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.receipt-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.receipt-item .label {
  font-size: 0.8rem;
  color: #6b7280;
}

.receipt-item .value {
  font-weight: 600;
}

.receipt-item .value.highlight {
  color: #4ade80;
}

/* Crypto Fields */
.crypto-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.crypto-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.crypto-item.full-width {
  grid-column: 1 / -1;
}

.crypto-item .label {
  font-size: 0.75rem;
  color: #6b7280;
}

.crypto-item .value {
  font-family: monospace;
  font-size: 0.8rem;
  color: #a5b4fc;
  word-break: break-all;
}

.crypto-item .hint {
  font-size: 0.7rem;
  color: #4ade80;
}

/* Verify Action */
.verify-action {
  text-align: center;
}

.verify-action p {
  color: #9ca3af;
  margin: 0 0 12px;
}

.verify-success, .verify-fail {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
}

.verify-success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.verify-fail {
  background: rgba(234, 179, 8, 0.1);
  border: 1px solid rgba(234, 179, 8, 0.3);
}

.verify-icon {
  font-size: 1.5rem;
}

.verify-success strong {
  color: #4ade80;
}

.verify-fail strong {
  color: #fbbf24;
}

.verify-success p, .verify-fail p {
  font-size: 0.85rem;
  color: #9ca3af;
  margin: 4px 0 0;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-outline {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #c4b5fd;
}

.btn-outline:hover {
  background: rgba(99, 102, 241, 0.1);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
}

/* Info Card */
.info-card {
  background: rgba(99, 102, 241, 0.05);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.info-card h3 {
  margin: 0 0 20px;
  font-size: 1rem;
}

.protection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.protection-item {
  display: flex;
  gap: 12px;
}

.protection-item .icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.protection-item h4 {
  margin: 0 0 4px;
  font-size: 0.9rem;
}

.protection-item p {
  margin: 0;
  font-size: 0.8rem;
  color: #9ca3af;
}

/* Fraud Card */
.fraud-card {
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.fraud-card h3 {
  margin: 0 0 20px;
  font-size: 1rem;
  color: #f87171;
}

.fraud-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.fraud-item strong {
  display: block;
  margin-bottom: 4px;
  font-size: 0.9rem;
}

.fraud-item p {
  margin: 0;
  font-size: 0.85rem;
  color: #9ca3af;
}

/* Action Grid */
.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
}

.action-card:hover {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
  transform: translateY(-2px);
}

.action-icon {
  font-size: 1.5rem;
}

.action-text {
  font-weight: 600;
  font-size: 0.9rem;
}

.action-hint {
  font-size: 0.75rem;
  color: #6b7280;
}

/* Thank You */
.thank-you {
  text-align: center;
  padding: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.thank-you p {
  margin: 0;
  font-size: 0.9rem;
  color: #9ca3af;
}

.thank-you .citation {
  margin-top: 8px;
  font-size: 0.8rem;
  color: #6b7280;
}

@media (max-width: 600px) {
  .receipt-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .receipt-grid {
    grid-template-columns: 1fr;
  }
  
  .crypto-fields {
    grid-template-columns: 1fr;
  }
}
`;
