/**
 * Behavioral Data Collector — Real-time capture of user interaction patterns
 * 
 * This module integrates mouse behavior and typing dynamics analysis
 * during the voting process to provide continuous behavioral biometric features.
 */

import MouseBehaviorAnalyzer from './mouseBehavior';
import TypingDynamicsAnalyzer from './typingDynamics';

class BehavioralDataCollector {
  constructor() {
    this.mouseAnalyzer = new MouseBehaviorAnalyzer();
    this.typingAnalyzer = new TypingDynamicsAnalyzer();
    this.isCollecting = false;
    this.sessionStart = null;
    this.interactionLog = [];
  }

  /**
   * Start collecting behavioral data
   */
  start() {
    this.isCollecting = true;
    this.sessionStart = Date.now();
    this.mouseAnalyzer.reset();
    this.typingAnalyzer.reset();
    this.interactionLog = [];
    
    // Attach event listeners
    this.attachListeners();
  }

  /**
   * Stop collecting behavioral data
   */
  stop() {
    this.isCollecting = false;
    this.detachListeners();
  }

  /**
   * Attach DOM event listeners for behavioral tracking
   */
  attachListeners() {
    if (!this.isCollecting) return;

    // Mouse movement tracking
    this.onMouseMove = (e) => {
      if (this.isCollecting) {
        this.mouseAnalyzer.onMouseMove(e.clientX, e.clientY);
        this.logInteraction('mouse_move', {
          x: e.clientX,
          y: e.clientY,
          timestamp: Date.now()
        });
      }
    };

    // Mouse click tracking
    this.onClick = (e) => {
      if (this.isCollecting) {
        this.mouseAnalyzer.onClick(e.clientX, e.clientY);
        this.logInteraction('mouse_click', {
          x: e.clientX,
          y: e.clientY,
          timestamp: Date.now(),
          target: e.target?.tagName || 'unknown'
        });
      }
    };

    // Keyboard tracking
    this.onKeyDown = (e) => {
      if (this.isCollecting) {
        this.typingAnalyzer.onKeyPress(e.key);
        this.logInteraction('key_down', {
          key: e.key,
          timestamp: Date.now(),
          target: e.target?.id || 'unknown'
        });
      }
    };

    this.onKeyUp = (e) => {
      if (this.isCollecting) {
        this.typingAnalyzer.onKeyRelease(e.key);
        this.logInteraction('key_up', {
          key: e.key,
          timestamp: Date.now()
        });
      }
    };

    // Scroll tracking
    this.onScroll = (e) => {
      if (this.isCollecting) {
        this.logInteraction('scroll', {
          scrollY: window.scrollY,
          timestamp: Date.now()
        });
      }
    };

    // Focus/blur tracking
    this.onFocus = (e) => {
      if (this.isCollecting) {
        this.logInteraction('focus', {
          timestamp: Date.now(),
          target: e.target?.id || 'unknown'
        });
      }
    };

    this.onBlur = (e) => {
      if (this.isCollecting) {
        this.logInteraction('blur', {
          timestamp: Date.now(),
          target: e.target?.id || 'unknown'
        });
      }
    };

    // Attach listeners
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('click', this.onClick);
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('scroll', this.onScroll);
    document.addEventListener('focus', this.onFocus, true);
    document.addEventListener('blur', this.onBlur, true);
  }

  /**
   * Detach all event listeners
   */
  detachListeners() {
    if (this.onMouseMove) document.removeEventListener('mousemove', this.onMouseMove);
    if (this.onClick) document.removeEventListener('click', this.onClick);
    if (this.onKeyDown) document.removeEventListener('keydown', this.onKeyDown);
    if (this.onKeyUp) document.removeEventListener('keyup', this.onKeyUp);
    if (this.onScroll) window.removeEventListener('scroll', this.onScroll);
    if (this.onFocus) document.removeEventListener('focus', this.onFocus, true);
    if (this.onBlur) document.removeEventListener('blur', this.onBlur, true);
  }

  /**
   * Log interaction for analysis
   */
  logInteraction(type, data) {
    if (this.isCollecting) {
      this.interactionLog.push({
        type,
        ...data,
        timestamp: data.timestamp || Date.now()
      });
    }
  }

  /**
   * Get all collected behavioral features
   */
  getFeatures() {
    if (!this.isCollecting && this.sessionStart === null) {
      return {
        mouseFeatures: {},
        typingFeatures: {},
        sessionDuration: 0,
        interactionCount: 0,
        riskScore: 0
      };
    }

    const sessionDuration = Date.now() - this.sessionStart;
    const mouseFeatures = this.mouseAnalyzer.getFeatures();
    const typingFeatures = this.typingAnalyzer.getFeatures();

    return {
      mouseFeatures,
      typingFeatures,
      sessionDuration,
      interactionCount: this.interactionLog.length,
      interactionLog: this.interactionLog,
      riskScore: this.calculateBehavioralRisk(mouseFeatures, typingFeatures, sessionDuration)
    };
  }

  /**
   * Calculate behavioral anomaly risk score
   * Returns 0-100 risk score based on behavioral patterns
   */
  calculateBehavioralRisk(mouseFeatures, typingFeatures, sessionDuration) {
    let riskScore = 0;

    // Mouse behavior analysis
    if (!mouseFeatures.isHumanLike) {
      riskScore += 20; // Bot-like mouse movement
    }

    if (mouseFeatures.mouseMovements < 5) {
      riskScore += 15; // Very few mouse movements (automated?)
    }

    if (mouseFeatures.cursorPathLength < 50) {
      riskScore += 10; // Direct path (bot-like)
    }

    if (mouseFeatures.velocityVariance < 0.3) {
      riskScore += 15; // Too consistent velocity (bot-like)
    }

    // Typing behavior analysis
    if (!typingFeatures.isHumanLike) {
      riskScore += 15; // Bot-like typing
    }

    if (typingFeatures.typingSpeed > 15) {
      riskScore += 10; // Extremely fast typing (automated?)
    }

    if (typingFeatures.holdTimeMean < 30 || typingFeatures.holdTimeMean > 500) {
      riskScore += 10; // Unusual hold times
    }

    // Session duration analysis
    if (sessionDuration < 3000) {
      riskScore += 10; // Very quick submission (bot-like)
    }

    if (sessionDuration > 600000) {
      riskScore += 5; // Very long session (abandoned browser?)
    }

    // Cap at 100
    return Math.min(riskScore, 100);
  }

  /**
   * Get summary of suspicious patterns
   */
  getSuspiciousPatterns() {
    const patterns = [];
    const features = this.getFeatures();

    if (!features.mouseFeatures.isHumanLike) {
      patterns.push({
        type: 'bot_mouse_pattern',
        severity: 'high',
        description: 'Mouse movement pattern appears automated'
      });
    }

    if (!features.typingFeatures.isHumanLike) {
      patterns.push({
        type: 'bot_typing_pattern',
        severity: 'high',
        description: 'Typing pattern appears automated'
      });
    }

    if (features.sessionDuration < 3000) {
      patterns.push({
        type: 'too_fast',
        severity: 'medium',
        description: 'Voting completed unusually quickly'
      });
    }

    if (features.interactionCount < 3) {
      patterns.push({
        type: 'minimal_interaction',
        severity: 'medium',
        description: 'Very few user interactions detected'
      });
    }

    return patterns;
  }

  /**
   * Reset collector for new session
   */
  reset() {
    this.isCollecting = false;
    this.sessionStart = null;
    this.mouseAnalyzer.reset();
    this.typingAnalyzer.reset();
    this.interactionLog = [];
    this.detachListeners();
  }

  /**
   * Export data for server submission
   */
  exportData() {
    const features = this.getFeatures();
    return {
      behavioral: {
        mouse: features.mouseFeatures,
        typing: features.typingFeatures,
        sessionDuration: features.sessionDuration,
        interactionCount: features.interactionCount,
        riskScore: features.riskScore,
        patterns: this.getSuspiciousPatterns()
      }
    };
  }
}

// Export singleton instance
export default new BehavioralDataCollector();
