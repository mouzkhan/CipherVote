/**
 * Cryptographic utilities for end-to-end verifiable voting.
 * Uses Web Crypto API (browser-native, no external deps).
 *
 * Research basis: Benaloh challenge + receipt-based verification
 * similar to Helios Voting (Adida, 2008) and ElectionGuard (Microsoft, 2019).
 */

/**
 * SHA-256 hash of a string — returns hex string.
 * Used to generate vote receipts that voters can later verify.
 */
export async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generate a cryptographically secure random nonce (salt).
 * Prevents dictionary attacks on vote receipts.
 */
export function generateNonce() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Build a vote commitment string before hashing.
 * Format: voterUID|candidateId|electionId|timestamp|nonce
 *
 * The nonce ensures the receipt is unique and un-guessable,
 * so an observer cannot brute-force which candidate was chosen.
 */
export function buildVotePayload(voterUID, candidateId, electionId, timestamp, nonce) {
  return `${voterUID}|${candidateId}|${electionId}|${timestamp}|${nonce}`;
}

/**
 * Compute the chain hash for a new vote, given the previous chain hash.
 * This creates a Merkle-chain: tampering with any vote breaks all subsequent hashes.
 * Conceptually equivalent to a simplified blockchain ledger entry.
 */
export async function computeChainHash(previousHash, voteReceiptHash) {
  return sha256(`${previousHash}:${voteReceiptHash}`);
}

/**
 * Verify a receipt: re-derive the hash from stored payload fields
 * and confirm it matches the stored receipt.
 */
export async function verifyReceipt({ voterUID, candidateId, electionId, timestamp, nonce, receipt }) {
  const payload = buildVotePayload(voterUID, candidateId, electionId, timestamp, nonce);
  const recomputed = await sha256(payload);
  return recomputed === receipt;
}
