/**
 * Mouse Behavior Analyzer — Behavioral Biometric Feature Extraction
 * 
 * Captures mouse movement patterns to detect:
 * - Bot vs human behavior
 * - Automated script patterns
 * - Device fingerprinting
 */

class MouseBehaviorAnalyzer {
  constructor() {
    this.cursorPath = [];
    this.mouseMovements = 0;
    this.clickPositions = [];
    this.timeStamps = [];
    this.startTimestamp = Date.now();
  }

  /**
   * Record mouse movement
   */
  onMouseMove(x, y) {
    this.mouseMovements++;
    this.cursorPath.push({ x, y, timestamp: Date.now() });
    this.timeStamps.push(Date.now());
  }

  /**
   * Record mouse click
   */
  onClick(x, y) {
    this.clickPositions.push({ x, y, timestamp: Date.now() });
  }

  /**
   * Calculate average cursor speed
   */
  calculateAvgSpeed() {
    if (this.cursorPath.length < 2) return 0;
    
    let totalDistance = 0;
    let totalTime = 0;
    
    for (let i = 1; i < this.cursorPath.length; i++) {
      const prev = this.cursorPath[i - 1];
      const curr = this.cursorPath[i];
      
      const distance = Math.sqrt(
        Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
      );
      
      const time = curr.timestamp - prev.timestamp;
      
      totalDistance += distance;
      totalTime += time;
    }
    
    return totalTime > 0 ? totalDistance / (totalTime / 1000) : 0;
  }

  /**
   * Calculate total cursor path length
   */
  calculatePathLength() {
    if (this.cursorPath.length < 2) return 0;
    
    let totalLength = 0;
    
    for (let i = 1; i < this.cursorPath.length; i++) {
      const prev = this.cursorPath[i - 1];
      const curr = this.cursorPath[i];
      
      totalLength += Math.sqrt(
        Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
      );
    }
    
    return totalLength;
  }

  /**
   * Calculate path complexity (Fractal dimension approximation)
   */
  calculatePathComplexity() {
    if (this.cursorPath.length < 3) return 0;
    
    const totalLength = this.calculatePathLength();
    const directDistance = Math.sqrt(
      Math.pow(this.cursorPath[this.cursorPath.length - 1].x - this.cursorPath[0].x, 2) +
      Math.pow(this.cursorPath[this.cursorPath.length - 1].y - this.cursorPath[0].y, 2)
    );
    
    // Higher ratio = more complex, meandering path (human-like)
    // Lower ratio = direct path (bot-like)
    return totalLength > 0 ? directDistance / totalLength : 0;
  }

  /**
   * Calculate mouse velocity variance (human vs bot)
   */
  calculateVelocityVariance() {
    if (this.cursorPath.length < 3) return 0;
    
    const velocities = [];
    
    for (let i = 1; i < this.cursorPath.length; i++) {
      const prev = this.cursorPath[i - 1];
      const curr = this.cursorPath[i];
      
      const distance = Math.sqrt(
        Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
      );
      
      const time = curr.timestamp - prev.timestamp;
      velocities.push(time > 0 ? distance / time : 0);
    }
    
    if (velocities.length === 0) return 0;
    
    const mean = velocities.reduce((a, b) => a + b, 0) / velocities.length;
    const variance = velocities.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / velocities.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Detect human-like patterns (heuristic)
   */
  isHumanLike() {
    // Humans have variable speed, bots often have constant speed
    const velocityVariance = this.calculateVelocityVariance();
    const complexity = this.calculatePathComplexity();
    const pathLength = this.calculatePathLength();
    
    // Heuristic: humans have more complex paths with variable speed
    return (
      velocityVariance > 0.5 && // Variable speed
      complexity > 0.3 &&       // Non-linear path
      pathLength > 100          // Reasonable path length
    );
  }

  /**
   * Get all behavioral features
   */
  getFeatures() {
    return {
      mouseMovements: this.mouseMovements,
      cursorPathLength: this.calculatePathLength(),
      avgSpeed: this.calculateAvgSpeed(),
      complexity: this.calculatePathComplexity(),
      velocityVariance: this.calculateVelocityVariance(),
      isHumanLike: this.isHumanLike(),
      totalClicks: this.clickPositions.length,
      sessionDuration: Date.now() - this.startTimestamp
    };
  }

  /**
   * Reset analyzer for new session
   */
  reset() {
    this.cursorPath = [];
    this.mouseMovements = 0;
    this.clickPositions = [];
    this.timeStamps = [];
    this.startTimestamp = Date.now();
  }
}

export default MouseBehaviorAnalyzer;
