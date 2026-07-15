/**
 * API client — all communication with the Express/MongoDB backend.
 * Base URL read from env var so it works in dev and production.
 */

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Configuration
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Utility to sleep between retries
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Perform a single request with timeout handling and improved error reporting
 */
async function requestWithTimeout(method, path, body, isFormData = false, signal) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  
  try {
    const options = {
      method,
      signal: signal || controller.signal,
    };

    // Set headers based on content type
    if (isFormData) {
      options.body = body;
      // Don't set Content-Type for FormData - browser will set it with boundary
    } else {
      options.headers = { "Content-Type": "application/json" };
      if (body) {
        options.body = JSON.stringify(body);
      }
    }

    const fullUrl = `${BASE}${path}`;
    console.log(`[API] ${method} ${fullUrl}`);
    
    const res = await fetch(fullUrl, options);
    clearTimeout(timeoutId);
    
    // Try to parse as JSON
    let data;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = { error: await res.text() };
    }

    if (!res.ok) {
      const error = data.error || `HTTP ${res.status}: ${res.statusText}`;
      console.error(`[API Error] ${method} ${path}: ${error}`);
      throw new Error(error);
    }
    
    console.log(`[API Success] ${method} ${path}`);
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    
    if (err.name === 'AbortError') {
      console.error(`[API Timeout] ${method} ${path} - Request timed out after ${REQUEST_TIMEOUT}ms`);
      throw new Error('Request timed out. Please check your internet connection and try again.');
    }
    
    console.error(`[API Error] ${method} ${path}: ${err.message}`);
    throw err;
  }
}

/**
 * Execute a request with retry logic for network failures
 */
async function requestWithRetry(method, path, body, isFormData = false) {
  let lastError;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await requestWithTimeout(method, path, body, isFormData);
    } catch (err) {
      lastError = err;
      
      // Don't retry on non-network errors (4xx, 5xx responses, etc.)
      if (err.name === 'AbortError' || err.message.includes('Failed to fetch')) {
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY * attempt); // Exponential backoff
          continue;
        }
      }
      
      throw err;
    }
  }
  
  throw lastError;
}

export const api = {
  // Elections
  getElections:       (status) => requestWithRetry("GET", `/elections${status ? `?status=${status}` : ""}`),
  getAllElections:     ()       => requestWithRetry("GET", "/elections"),
  createElection:     (body)   => requestWithRetry("POST", "/elections", body),
  updateElection:     (id, b)  => requestWithRetry("PATCH", `/elections/${id}`, b),
  deleteElection:     (id)     => requestWithRetry("DELETE", `/elections/${id}`),
  getElectionByCode:  (code)   => requestWithRetry("GET", `/elections/by-code/${code}`),
  getElectionResults: (id)     => requestWithRetry("GET", `/elections/${id}/results`),
  
  // Organization
  getOrganizationDashboard: (orgId) => requestWithRetry("GET", `/organizations/${orgId}/dashboard`),
  uploadCandidatePhoto: (formData) => requestWithRetry("POST", "/upload/candidate-photo", formData, true),

  // Voting
  castVote:           (body)   => requestWithRetry("POST", "/vote", body),
  getVoterStatus:     (uid, electionId) => requestWithRetry("GET", `/voter/${uid}/${electionId}`),
  registerVoterByInvitation: (body) => requestWithRetry("POST", "/voters/register-by-invitation", body),
  voterLogin:                (body) => requestWithRetry("POST", "/voters/login", body),
  verifyVoterCredentials:    (body) => requestWithRetry("POST", "/voters/verify-credentials", body),
  checkVoterVoteStatus:      (body) => requestWithRetry("POST", "/voters/check-vote-status", body),

  // Audit
  getAuditLog:        (electionId) => requestWithRetry("GET", `/audit/${electionId}`),
  verifyReceiptInLedger: (electionId, hash) => requestWithRetry("GET", `/audit/${electionId}/verify/${hash}`),

  // Security
  logSecurityEvent:   (event)  => requestWithRetry("POST", "/security", event),
  getSecurityData:    ()       => requestWithRetry("GET", "/security"),

  // Biometric profiles (MongoDB)
  saveBiometricProfile: (uid, descriptor) => requestWithRetry("POST", "/biometric/profile", { uid, descriptor }),
  getBiometricProfile: async (uid) => {
    try {
      return await requestWithRetry("GET", `/biometric/profile/${uid}`);
    } catch (err) {
      if (String(err.message).includes("not found") || String(err.message).includes("404")) {
        return { descriptor: null, exists: false };
      }
      throw err;
    }
  },

  // Health
  health:             ()       => requestWithRetry("GET", "/health"),

  // Voter registration and verification
  registerVoter:        (body)    => requestWithRetry("POST", "/voters/register", body),
  getVoterRegistration: (uid)     => requestWithRetry("GET", `/voters/${uid}`),
  verifyVoterEligibility: (uid, electionId) => requestWithRetry("GET", `/voters/${uid}/eligibility/${electionId}`),
  getAdminSummary:      ()        => requestWithRetry("GET", "/admin/summary"),

  // VaaS — Voting as a Service
  getPlans:              ()        => requestWithRetry("GET", "/plans"),
  registerOrganization:  (body)    => requestWithRetry("POST", "/organizations/register", body),
  getOrganizations:      ()        => requestWithRetry("GET", "/organizations"),
  updateOrganization:    (id, b)   => requestWithRetry("PATCH", `/organizations/${id}`, b),
  
  // ML Model Management
  getMLModels:           ()        => requestWithRetry("GET", "/ml/models"),
  trainMLModel:          ()        => requestWithRetry("POST", "/ml/train", {}),
  activateMLModel:       (id)      => requestWithRetry("PATCH", `/ml/models/${id}/activate`, {}),
  evaluateMLModel:       (id)      => requestWithRetry("GET", `/ml/models/${id}/evaluate`),
  
  // Adaptive Learning (Feedback)
  submitFeedback:        (body)    => requestWithRetry("POST", "/ml/feedback", body),
  getFeedbackStats:      ()        => requestWithRetry("GET", "/ml/feedback/stats"),

  // Predictive Analytics
  getPredictiveAnalytics: (electionId) => requestWithRetry("GET", `/analytics/predictions/${electionId}`),
  getElectionHealth:      (electionId) => requestWithRetry("GET", `/analytics/health/${electionId}`),
  getFraudHeatmap:        (electionId) => requestWithRetry("GET", `/analytics/fraud-heatmap/${electionId}`),
  getTurnoutPrediction:   (electionId) => requestWithRetry("GET", `/analytics/turnout/${electionId}`),
  
  // Performance Metrics
  getPerformanceMetrics:  ()        => requestWithRetry("GET", "/metrics/performance"),
  recordMetric:           (metric)  => requestWithRetry("POST", "/metrics/record", metric),
  getBenchmarkReport:     ()        => requestWithRetry("GET", "/metrics/benchmark"),
};
