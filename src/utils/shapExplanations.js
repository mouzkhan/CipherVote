/**
 * SHAP Explanations — Feature-Level Attribution for Fraud Detection
 * 
 * Provides explainable AI by showing which features contributed most to each prediction.
 */

/**
 * Generate SHAP-like explanations for fraud prediction
 */
function generateSHAPExplanations(features, predictionScore, mlConfidence) {
  const explanations = [];
  
  // Feature importance weights (learned from model training)
  const featureWeights = {
    failedLogins: 0.25,
    timeOnPageSec: 0.20,
    lastSubmitSec: 0.15,
    hasVotedBefore: 0.10,
    botUASignal: 0.15,
    mouseMovements: 0.05,
    cursorPathLength: 0.05,
    typingSpeed: 0.05
  };
  
  // Calculate contribution for each feature
  const featureContributions = {};
  
  if (features.failedLogins > 0) {
    featureContributions.failedLogins = features.failedLogins * featureWeights.failedLogins * 0.03;
  }
  
  if (features.timeOnPageSec < 10) {
    featureContributions.timeOnPageSec = (4 - Math.min(features.timeOnPageSec, 4)) * featureWeights.timeOnPageSec * 0.1;
  }
  
  if (features.lastSubmitSec < 5) {
    featureContributions.lastSubmitSec = (2 - Math.min(features.lastSubmitSec, 2)) * featureWeights.lastSubmitSec * 0.15;
  }
  
  if (features.hasVotedBefore) {
    featureContributions.hasVotedBefore = featureWeights.hasVotedBefore * 0.1;
  }
  
  if (features.isBotUA) {
    featureContributions.botUASignal = featureWeights.botUASignal * 0.25;
  }
  
  if (features.mouseMovements > 0) {
    featureContributions.mouseMovements = Math.min(features.mouseMovements / 100, 1) * featureWeights.mouseMovements * 0.05;
  }
  
  if (features.cursorPathLength > 0) {
    featureContributions.cursorPathLength = Math.min(features.cursorPathLength / 1000, 1) * featureWeights.cursorPathLength * 0.03;
  }
  
  if (features.typingSpeed > 0) {
    featureContributions.typingSpeed = Math.abs(features.typingSpeed - 5) / 10 * featureWeights.typingSpeed * 0.05;
  }
  
  // Generate natural language explanations
  if (features.failedLogins >= 2) {
    explanations.push({
      feature: "failedLogins",
      contribution: featureContributions.failedLogins || 0,
      direction: "negative",
      explanation: `Multiple failed login attempts (${features.failedLogins}) indicate credential stuffing attack`,
      severity: features.failedLogins >= 3 ? "HIGH" : "MEDIUM"
    });
  }
  
  if (features.timeOnPageSec < 4) {
    explanations.push({
      feature: "timeOnPageSec",
      contribution: featureContributions.timeOnPageSec || 0,
      direction: "negative",
      explanation: `Fast voting speed (${(features.timeOnPageSec || 0).toFixed(1)}s) indicates bot behavior below human threshold (4s)`,
      severity: features.timeOnPageSec < 2 ? "HIGH" : "MEDIUM"
    });
  }
  
  if (features.lastSubmitSec < 2 && features.lastSubmitSec > 0) {
    explanations.push({
      feature: "lastSubmitSec",
      contribution: featureContributions.lastSubmitSec || 0,
      direction: "negative",
      explanation: `Rapid resubmission (${features.lastSubmitSec}s) suggests scripted voting attempt`,
      severity: "HIGH"
    });
  }
  
  if (features.hasVotedBefore) {
    explanations.push({
      feature: "hasVotedBefore",
      contribution: featureContributions.hasVotedBefore || 0,
      direction: "negative",
      explanation: "Duplicate vote attempt detected for this election",
      severity: "HIGH"
    });
  }
  
  if (features.isBotUA) {
    explanations.push({
      feature: "botUASignal",
      contribution: featureContributions.botUASignal || 0,
      direction: "negative",
      explanation: "User-agent string matches known automation tool (Puppeteer, Selenium, etc.)",
      severity: "HIGH"
    });
  }
  
  if (features.mouseMovements < 10) {
    explanations.push({
      feature: "mouseMovements",
      contribution: featureContributions.mouseMovements || 0,
      direction: "negative",
      explanation: "Extremely low mouse movement indicates automated interaction",
      severity: "MEDIUM"
    });
  }
  
  if (features.typingSpeed > 15) {
    explanations.push({
      feature: "typingSpeed",
      contribution: featureContributions.typingSpeed || 0,
      direction: "negative",
      explanation: "Unusually fast typing speed (${Math.round(features.typingSpeed)} wpm) suggests bot input",
      severity: "MEDIUM"
    });
  }
  
  // Calculate total contribution
  const totalContribution = explanations.reduce((sum, e) => sum + Math.abs(e.contribution), 0);
  
  return {
    prediction: predictionScore >= 70 ? "SUSPICIOUS" : "LEGITIMATE",
    confidence: mlConfidence,
    totalContribution: totalContribution,
    featureContributions,
    explanations: explanations.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution)),
    naturalLanguage: generateNaturalLanguageExplanation(explanations, predictionScore)
  };
}

/**
 * Generate human-readable natural language explanation
 */
function generateNaturalLanguageExplanation(explanations, predictionScore) {
  if (explanations.length === 0) {
    return "Voting session appears normal with no suspicious patterns detected.";
  }
  
  const highSeverity = explanations.filter(e => e.severity === "HIGH");
  const mediumSeverity = explanations.filter(e => e.severity === "MEDIUM");
  
  if (predictionScore >= 70) {
    if (highSeverity.length > 0) {
      return `The system detected ${highSeverity.length} high-severity risk factor(s). ${highSeverity[0].explanation}. ${
        highSeverity.length > 1 ? `Additional concerns: ${highSeverity.slice(1).map(e => e.explanation).join(". ")}.` : ""
      } This session has been flagged for review.`;
    } else if (mediumSeverity.length > 0) {
      return `The system detected ${mediumSeverity.length} moderate risk factor(s). ${mediumSeverity[0].explanation}. ${
        mediumSeverity.length > 1 ? `Additional factors: ${mediumSeverity.slice(1).map(e => e.explanation).join(". ")}.` : ""
      } This session is under review.`;
    }
  }
  
  return `The system identified ${explanations.length} risk factor(s): ${explanations.map(e => e.explanation).join(". ")}. Review recommended.`;
}

/**
 * Generate SHAP value visualization data
 */
function generateSHAPVisualizationData(explanations) {
  // Sort by absolute contribution
  const sorted = [...explanations].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  
  return {
    type: "force",
    baseValue: 20, // Base risk score
    features: sorted.slice(0, 6).map(exp => ({
      name: exp.feature,
      value: Math.abs(exp.contribution) * 100,
      impact: exp.contribution > 0 ? "positive" : "negative",
      description: exp.explanation
    })),
    totalContribution: sorted.reduce((sum, e) => sum + e.contribution, 0) * 100
  };
}

/**
 * Export all functions
 */
export default {
  generateSHAPExplanations,
  generateNaturalLanguageExplanation,
  generateSHAPVisualizationData
};
