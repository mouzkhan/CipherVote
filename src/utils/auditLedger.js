/**
 * Audit Ledger — Blockchain-inspired immutable vote chain.
 *
 * Simulates a simplified append-only ledger where each entry contains:
 *   - its own hash
 *   - the previous entry's hash (chain link)
 *
 * This means any modification to a past entry breaks all subsequent hashes,
 * making tampering immediately detectable — the core property of blockchain
 * without requiring a distributed network (appropriate for a single-institution FYP).
 *
 * Analogous to the audit trail mechanism in STAR-Vote (Bell et al., 2013)
 * and the Ethereum event log model.
 *
 * In production: entries would be written to Firestore with server-side timestamps
 * and replicated to a public audit endpoint. Here we expose the full chain for
 * inspection on the public audit page.
 */

import { computeChainHash } from "./crypto";

// Genesis block — the chain anchor. Public and fixed.
export const GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

/**
 * Build a new ledger entry to be stored in Firestore.
 * @param {string} previousHash - hash of the last entry (or GENESIS_HASH if first)
 * @param {string} voteReceiptHash - SHA-256 receipt of the vote
 * @param {string} electionId
 * @param {number} sequenceNumber - monotonically increasing entry index
 * @returns {Promise<Object>} ledger entry ready to write to Firestore
 */
export async function buildLedgerEntry(previousHash, voteReceiptHash, electionId, sequenceNumber) {
  const chainHash = await computeChainHash(previousHash, voteReceiptHash);
  return {
    sequenceNumber,
    electionId,
    voteReceiptHash,       // SHA-256 of (voterUID|candidateId|electionId|timestamp|nonce)
    previousHash,
    chainHash,             // SHA-256 of (previousHash:voteReceiptHash)
    recordedAt: Date.now(),
  };
}

/**
 * Verify chain integrity: walk all entries in order and recompute each chainHash.
 * Returns { valid: boolean, brokenAt: number|null }
 */
export async function verifyChainIntegrity(entries) {
  if (!entries || entries.length === 0) return { valid: true, brokenAt: null };

  const sorted = [...entries].sort((a, b) => a.sequenceNumber - b.sequenceNumber);

  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i];
    const expectedPrev = i === 0 ? GENESIS_HASH : sorted[i - 1].chainHash;

    if (entry.previousHash !== expectedPrev) {
      return { valid: false, brokenAt: entry.sequenceNumber };
    }

    const recomputed = await computeChainHash(entry.previousHash, entry.voteReceiptHash);
    if (recomputed !== entry.chainHash) {
      return { valid: false, brokenAt: entry.sequenceNumber };
    }
  }

  return { valid: true, brokenAt: null };
}
