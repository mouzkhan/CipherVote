/**
 * AI-inspired Fraud Detection Module
 *
 * Implements a rule-based anomaly scoring system modeled after
 * supervised classification approaches used in e-fraud literature
 * (Bhattacharyya et al., 2011; Ahmed et al., 2016).
 *
 * In a production system this would call a Python ML backend.
 * Here we compute a transparent, explainable risk score in-browser
 * so reviewers can see the decision logic — which is itself a
 * research contribution (Explainable AI / XAI).
 *
 * Risk score: 0–100. Above 70 = flagged as suspicious.
 */

const THRESHOLDS = {
  MAX_LOGIN_ATTEMPTS: 3,       // >3 failed logins → suspicious
  MIN_TIME_ON_PAGE_MS: 4000,   // voted in <4s → likely bot
  RAPID_RESUBMIT_MS: 2000,     // resubmit within 2s → scripted
  KNOWN_BOT_UA_PATTERNS: [/headless/i, /phantom/i, /selenium/i, /puppeteer/i, /playwright/i],
};

/**
 * Compute a risk score and return structured, explainable signals.
 * @param {Object} context
 * @param {number} context.failedLogins - number of failed login attempts this session
 * @param {number} context.timeOnPageMs - ms spent on the vote page before submitting
 * @param {number} context.lastSubmitMs - ms since last submission attempt (0 if first)
 * @param {string} context.userAgent - navigator.userAgent string
 * @param {boolean} context.hasVotedBefore - whether this UID already voted
 * @returns {{ score: number, level: string, signals: Array, blocked: boolean }}
 */
export function computeRiskScore(context) {
  const { failedLogins = 0, timeOnPageMs = 9999, lastSubmitMs = 9999, userAgent = "", hasVotedBefore = false } = context;

  const signals = [];
  let score = 0;

  // Signal 1: Multiple failed logins
  if (failedLogins >= THRESHOLDS.MAX_LOGIN_ATTEMPTS) {
    score += 35;
    signals.push({ type: "BRUTE_FORCE", weight: 35, detail: `${failedLogins} failed login attempts detected` });
  } else if (failedLogins >= 2) {
    score += 15;
    signals.push({ type: "MULTIPLE_FAILURES", weight: 15, detail: `${failedLogins} failed login attempts` });
  }

  // Signal 2: Voted too fast (bot behavior)
  if (timeOnPageMs < THRESHOLDS.MIN_TIME_ON_PAGE_MS) {
    score += 40;
    signals.push({ type: "BOT_SPEED", weight: 40, detail: `Vote submitted in ${(timeOnPageMs / 1000).toFixed(1)}s — below human threshold (4s)` });
  }

  // Signal 3: Rapid resubmission
  if (lastSubmitMs > 0 && lastSubmitMs < THRESHOLDS.RAPID_RESUBMIT_MS) {
    score += 30;
    signals.push({ type: "RAPID_RESUBMIT", weight: 30, detail: `Resubmission attempt ${lastSubmitMs}ms after last attempt` });
  }

  // Signal 4: Headless browser / automation tool detected
  const isBot = THRESHOLDS.KNOWN_BOT_UA_PATTERNS.some((p) => p.test(userAgent));
  if (isBot) {
    score += 50;
    signals.push({ type: "AUTOMATION_AGENT", weight: 50, detail: `User-agent matches known automation tool: ${userAgent}` });
  }

  // Signal 5: Duplicate vote attempt
  if (hasVotedBefore) {
    score += 25;
    signals.push({ type: "DUPLICATE_VOTE", weight: 25, detail: "This voter ID has already cast a vote in this election" });
  }

  score = Math.min(score, 100);

  const level = score >= 70 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW";
  const blocked = score >= 70;

  return { score, level, signals, blocked };
}

/**
 * Log a security event to in-memory store (for demo; in prod → Firestore security_events collection).
 */
const securityLog = [];

export function logSecurityEvent(event) {
  securityLog.push({ ...event, timestamp: Date.now() });
}

export function getSecurityLog() {
  return [...securityLog];
}

/**
 * Summarise the log for the admin dashboard.
 */
export function getSecuritySummary() {
  const total = securityLog.length;
  const high = securityLog.filter((e) => e.level === "HIGH").length;
  const medium = securityLog.filter((e) => e.level === "MEDIUM").length;
  const blocked = securityLog.filter((e) => e.blocked).length;
  return { total, high, medium, blocked };
}
