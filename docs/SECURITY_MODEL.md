# Security Model — CipherVote

**Version**: 2.0.0  
**Date**: July 15, 2026

---

## Overview

CipherVote implements a **defense-in-depth security model** combining cryptographic verifiability, AI-powered fraud detection, and behavioral biometrics. This document describes the complete threat model, security properties, and mitigation strategies.

---

## Threat Model

### Adversary Capabilities

| Capability | Mitigation | Status |
|------------|-----------|--------|
| Network eavesdropping | HTTPS, Web Crypto API | ✅ Mitigated |
| Database tampering | Merkle-chain audit ledger | ✅ Detectable |
| Bot vote flooding | Rate limiting + ML detection | ✅ Mitigated |
| Duplicate voting | Atomic DB writes | ✅ Prevented |
| Biometric spoofing | Liveness detection + Deepfake CNN | ✅ Mitigated |
| Admin abuse | Transparent audit trail | ✅ Detectable |
| Cryptographic attacks | SHA-256, CSPRNG | ✅ Mitigated |

### Adversary Goals

1. **Vote Tampering** — Alter votes after cast
2. **Ballot Stuffing** — Add fake votes
3. **Voter Impersonation** — Vote on behalf of others
4. **Privacy Breach** — Discover who voted for whom
5. **Denial of Service** — Prevent legitimate voting
6. **Reputation Damage** — Discredit election results

---

## Security Properties

### 1. Confidentiality

**Property**: Votes remain secret until tally

**Implementation**:
- SHA-256 vote hashing (Web Crypto API)
- Unique CSPRNG nonce per vote
- Receipt-only disclosure (vote hash, not choice)
- Admins cannot see individual votes

**Threats Mitigated**:
- ✅ Vote selling detection (receipt proves vote but not choice)
- ✅ Coercion resistance (receipt doesn't reveal choice)

### 2. Integrity

**Property**: Votes cannot be altered after casting

**Implementation**:
- Merkle-chain audit ledger
- Server-side chain hash computation
- Client-side verification available
- Tampering breaks chain integrity

**Verification**:
```javascript
// Verify receipt at any time
await api.verifyReceiptInLedger(electionId, receiptHash);
```

### 3. Availability

**Property**: System remains operational during attack

**Implementation**:
- Stateless API (horizontal scaling)
- MongoDB replica sets (fault tolerance)
- CDN for static assets
- Rate limiting (DDoS protection)

### 4. Non-Repudiation

**Property**: Voters cannot deny casting their vote

**Implementation**:
- Unique receipt with voter UID
- Immutable audit log
- Timestamped entries
- Chain verification

**Note**: Non-repudiation applies to the system, not individual votes (ballot secrecy maintained).

### 5. Auditability

**Property**: Anyone can verify election integrity

**Implementation**:
- Public audit ledger
- Chain integrity verification
- Receipt verification
- Real-time monitoring dashboard

---

## Attack Vectors and Mitigations

### 1. Bot Attack

**Attack**: Automated script submitting votes rapidly

**Detection Signals**:
- User-agent matches known bots (Puppeteer, Selenium)
- Time on page < 4 seconds
- Mouse movements < 10
- Keystroke patterns too regular

**Mitigation**:
- Hybrid rule-based + ML fraud detection
- Behavioral biometric analysis
- CAPTCHA alternative (behavioral analysis)
- Rate limiting per IP

### 2. Credential Stuffing

**Attack**: Multiple failed logins from botnet

**Detection**:
- Failed login threshold (≥3 attempts)
- IP-based rate limiting
- Account lockout after repeated failures

**Mitigation**:
- Failed login tracking
- Account lockout policy
- Admin alert for suspicious patterns

### 3. Duplicate Voting

**Attack**: Same voter casts multiple votes

**Detection**:
- Unique voter ID check
- Atomic database writes
- Duplicate key constraint

**Mitigation**:
- Single-write guarantee
- Vote record with unique (uid, electionId)
- Server-side duplicate prevention

### 4. Biometric Spoofing

**Attack**: Photo/video replay of voter's face

**Detection**:
- Liveness detection (blink, head movement)
- Eye Aspect Ratio (EAR) analysis
- Texture analysis
- Depth estimation (future)

**Mitigation**:
- Multi-frame liveness check
- Randomized blink patterns
- Anti-spoofing CNN (future)

### 5. Deepfake Attack

**Attack**: Synthetic face generation to bypass verification

**Detection**:
- Face quality scoring
- Illumination analysis
- Occlusion detection
- Deepfake detection CNN (future)

**Mitigation**:
- Liveness combined with deepfake detection
- Multiple verification challenges
- Administrator review for high-risk cases

### 6. Sybil Attack

**Attack**: Multiple fake identities created

**Detection**:
- National ID verification
- Biometric uniqueness check
- Cross-election fraud detection
- Graph-based anomaly detection (future)

**Mitigation**:
- Real-world identity verification
- Biometric matching against existing profiles
- Organization-level voter registration

---

## Cryptographic Protocol

### Vote Casting Protocol

```
1. Voter authenticates (Firebase Auth)
2. Election loaded
3. Candidate selected
4. Client computes:
   - votePayload = sha256(uid|candidateId|electionId|timestamp|nonce)
   - nonce = CSPRNG(16 bytes)
5. Vote submitted to server with:
   - votePayload
   - nonce
   - Timestamp
   - Behavioral features
6. Server verifies:
   - Not already voted (atomic check)
   - Election still active
   - Fraud detection (hybrid scoring)
7. Server writes:
   - Vote record
   - Audit entry (chain hash)
   - Security event (if flagged)
8. Response returns:
   - Receipt hash
   - Nonce
   - Sequence number
   - Chain hash
9. Voter can verify at any time
```

### Receipt Verification Protocol

```
1. Voter provides receipt data
2. System recomputes:
   - votePayload = sha256(uid|candidateId|electionId|timestamp|nonce)
   - receiptHash = sha256(votePayload)
3. System queries audit ledger for receiptHash
4. System verifies chain integrity:
   - Traverse chain from genesis
   - Recompute each chain hash
   - Verify matches stored hash
5. System returns:
   - Found: boolean
   - Chain position
   - Integrity status
```

### Chain Integrity Verification

```
Genesis Hash: 0000000000000000000000000000000000000000000000000000000000000000

Entry 0:
  previousHash = GENESIS_HASH
  voteReceiptHash = sha256(votePayload_0)
  chainHash = sha256(previousHash:voteReceiptHash)

Entry 1:
  previousHash = Entry_0.chainHash
  voteReceiptHash = sha256(votePayload_1)
  chainHash = sha256(previousHash:voteReceiptHash)

Entry N:
  previousHash = Entry_N-1.chainHash
  voteReceiptHash = sha256(votePayload_N)
  chainHash = sha256(previousHash:voteReceiptHash)

Tampering Detection:
- Any modification to Entry K breaks Entry K+1.chainHash
- Recomputing chain from Entry K reveals mismatch
```

---

## ML Model Security

### Model Robustness

| Attack Type | Mitigation |
|-------------|-----------|
| Model Inversion | No raw data exposure, only predictions |
| Membership Inference | Differential privacy (future) |
| Poisoning | Input validation, anomaly detection |
| Evasion | Adversarial training (future) |
| Model Stealing | Rate limiting, obfuscation |

### Data Privacy

**Biometric Data**:
- Only 128-dimensional descriptor stored
- Original image never stored
- GDPR-compliant data minimization
- Right to deletion implemented

**Voting Data**:
- Vote hashing prevents choice revelation
- Receipt provides proof without secrecy breach
- Aggregate-only statistics for admins

---

## Compliance

### GDPR Compliance

| Requirement | Implementation |
|-------------|----------------|
| Lawfulness | Explicit consent via registration |
| Data minimization | Only biometric descriptor stored |
| Purpose limitation | Voting only, no secondary use |
| Storage limitation | Data retention policy |
| Right to access | Voting receipt provides verification |
| Right to erasure | Delete biometric profile on request |
| Data portability | Receipt can be exported |

### Election Commission Compliance

| Requirement | Implementation |
|-------------|----------------|
| Audit trail | Public Merkle-chain ledger |
| Transparency | Full audit log visible to public |
| Verifiability | Receipt verification API |
| Security | Multi-layered protection |

---

## Security Headers

```javascript
// Express middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  next();
});
```

---

## Incident Response

### Suspicious Activity Detection

**Automatic Actions**:
1. Flag high-risk vote (score ≥ 70)
2. Block vote submission
3. Create security event
4. Notify admin via dashboard

**Admin Actions**:
1. Review flagged votes in dashboard
2. Label predictions (true positive/false positive)
3. Add custom rules if needed
4. Trigger model retraining

### Breach Response

**If database compromised**:
1. Audit chain integrity immediately
2. Verify all votes against chain
3. Identify tampered entries
4. Notify authorities
5. Implement additional monitoring

**If biometric data leaked**:
1. Invalidate all active sessions
2. Require re-enrollment
3. Notify affected voters
4. Review access logs

---

## Future Security Enhancements

### 1. Zero-Knowledge Proofs

Implement ZK-SNARKs for vote verification without revealing vote contents.

### 2. Homomorphic Encryption

Enable computation on encrypted votes without decryption.

### 3. Secure Multi-Party Computation

Distribute trust across multiple tallying authorities.

### 4. Quantum-Resistant Cryptography

Transition to post-quantum hash functions (SHA-3, BLAKE3).

---

## Conclusion

CipherVote's security model provides **production-grade protection** for electronic voting with:

✅ **Confidentiality**: Vote secrecy maintained via hashing  
✅ **Integrity**: Merkle-chain prevents vote tampering  
✅ **Availability**: Scalable architecture withstands attacks  
✅ **Non-repudiation**: Verifiable vote records  
✅ **Auditability**: Public transparency for all

The hybrid AI security system adds **adaptive protection** that learns from new attack patterns while maintaining full explainability for administrators and auditors.
