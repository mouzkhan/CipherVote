/**
 * Typing Dynamics Analyzer — Behavioral Biometric Feature Extraction
 * 
 * Captures keystroke timing patterns to detect:
 * - Bot vs human typing
 * - Automated input patterns
 * - Individual typing signatures
 */

class TypingDynamicsAnalyzer {
  constructor() {
    this.keyEvents = [];
    this.keyPresses = [];
    this.keyReleases = [];
  }

  /**
   * Record key press
   */
  onKeyPress(key, elementId = null) {
    const timestamp = Date.now();
    this.keyPresses.push({ key, timestamp, elementId });
    this.keyEvents.push({ type: 'press', key, timestamp, elementId });
  }

  /**
   * Record key release
   */
  onKeyRelease(key, elementId = null) {
    const timestamp = Date.now();
    this.keyReleases.push({ key, timestamp, elementId });
    this.keyEvents.push({ type: 'release', key, timestamp, elementId });
  }

  /**
   * Calculate hold time (time between key press and release)
   */
  calculateHoldTime(key) {
    const press = this.keyPresses.find(p => p.key === key);
    const release = this.keyReleases.find(r => r.key === key && r.timestamp > (press?.timestamp || 0));
    
    if (press && release) {
      return release.timestamp - press.timestamp;
    }
    return 0;
  }

  /**
   * Calculate flight time (time between key release and next press)
   */
  calculateFlightTime(key1, key2) {
    const release = this.keyReleases.find(r => r.key === key1);
    const nextPress = this.keyPresses.find(p => p.key === key2 && p.timestamp > (release?.timestamp || 0));
    
    if (release && nextPress) {
      return nextPress.timestamp - release.timestamp;
    }
    return 0;
  }

  /**
   * Calculate hold time statistics
   */
  getHoldTimeStats() {
    const holdTimes = this.keyPresses.map(p => this.calculateHoldTime(p.key)).filter(t => t > 0);
    
    if (holdTimes.length === 0) {
      return { mean: 0, std: 0, min: 0, max: 0 };
    }
    
    const mean = holdTimes.reduce((a, b) => a + b, 0) / holdTimes.length;
    const variance = holdTimes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / holdTimes.length;
    
    return {
      mean: mean,
      std: Math.sqrt(variance),
      min: Math.min(...holdTimes),
      max: Math.max(...holdTimes)
    };
  }

  /**
   * Calculate flight time statistics
   */
  getFlightTimeStats() {
    const flightTimes = [];
    
    for (let i = 0; i < this.keyReleases.length - 1; i++) {
      const release1 = this.keyReleases[i];
      const release2 = this.keyReleases[i + 1];
      
      if (release2.timestamp > release1.timestamp) {
        const flightTime = release2.timestamp - release1.timestamp;
        flightTimes.push(flightTime);
      }
    }
    
    if (flightTimes.length === 0) {
      return { mean: 0, std: 0 };
    }
    
    const mean = flightTimes.reduce((a, b) => a + b, 0) / flightTimes.length;
    const variance = flightTimes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / flightTimes.length;
    
    return {
      mean: mean,
      std: Math.sqrt(variance)
    };
  }

  /**
   * Calculate typing speed (characters per second)
   */
  calculateTypingSpeed() {
    if (this.keyPresses.length < 2) return 0;
    
    const firstPress = this.keyPresses[0].timestamp;
    const lastRelease = this.keyReleases[this.keyReleases.length - 1]?.timestamp || Date.now();
    
    const durationSeconds = (lastRelease - firstPress) / 1000;
    return durationSeconds > 0 ? this.keyPresses.length / durationSeconds : 0;
  }

  /**
   * Calculate rhythm consistency (human vs bot)
   */
  calculateRhythm() {
    const holdTimes = this.getHoldTimeStats();
    const flightTimes = this.getFlightTimeStats();
    
    // Humans have consistent but variable rhythm
    // Bots often have more consistent rhythm (programmed)
    
    return {
      holdTimeMean: holdTimes.mean,
      holdTimeStd: holdTimes.std,
      flightTimeMean: flightTimes.mean,
      flightTimeStd: flightTimes.std,
      typingSpeed: this.calculateTypingSpeed(),
      isHumanLike: this.isHumanTyping(holdTimes, flightTimes)
    };
  }

  /**
   * Detect human-like typing patterns
   */
  isHumanTyping(holdTimes, flightTimes) {
    // Humans have variable timing
    // Bots often have very consistent timing
    
    return (
      holdTimes.std > 10 &&      // Variable hold times (human)
      flightTimes.std > 10 &&    // Variable flight times (human)
      holdTimes.mean > 50 &&     // Reasonable typing speed (not too fast)
      holdTimes.mean < 500       // Not too slow (not machine)
    );
  }

  /**
   * Get all typing features
   */
  getFeatures() {
    return {
      totalKeystrokes: this.keyPresses.length,
      typingSpeed: this.calculateTypingSpeed(),
      holdTimeMean: this.getHoldTimeStats().mean,
      holdTimeStd: this.getHoldTimeStats().std,
      flightTimeMean: this.getFlightTimeStats().mean,
      flightTimeStd: this.getFlightTimeStats().std,
      rhythm: this.calculateRhythm(),
      isHumanLike: this.isHumanTyping(this.getHoldTimeStats(), this.getFlightTimeStats())
    };
  }

  /**
   * Reset analyzer for new input session
   */
  reset() {
    this.keyEvents = [];
    this.keyPresses = [];
    this.keyReleases = [];
  }
}

export default TypingDynamicsAnalyzer;
