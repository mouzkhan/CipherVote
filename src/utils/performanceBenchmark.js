/**
 * Performance Benchmarking Module
 * 
 * Measures and reports:
 * - Vote submission latency
 * - API response times
 * - Biometric verification speed
 * - Blockchain verification speed
 * - System throughput
 * - Resource usage
 */

class PerformanceBenchmark {
  constructor() {
    this.metrics = {
      voteSubmission: [],
      apiCalls: [],
      biometricVerification: [],
      blockchainVerification: [],
      systemResources: [],
    };
    this.startTime = null;
    this.isRunning = false;
  }

  /**
   * Start a named timer
   */
  startTimer(name) {
    return {
      name,
      startTime: performance.now(),
      startMemory: this.getMemoryUsage(),
    };
  }

  /**
   * End timer and record metric
   */
  endTimer(timer, category = 'other') {
    const duration = performance.now() - timer.startTime;
    const memoryDelta = this.getMemoryUsage() - timer.startMemory;

    const metric = {
      name: timer.name,
      duration,
      memoryDelta,
      timestamp: new Date().toISOString(),
    };

    if (this.metrics[category]) {
      this.metrics[category].push(metric);
    } else {
      this.metrics.other = this.metrics.other || [];
      this.metrics.other.push(metric);
    }

    return metric;
  }

  /**
   * Measure vote submission performance
   */
  measureVoteSubmission(submitFunc) {
    return async (payload) => {
      const timer = this.startTimer('Vote Submission');
      try {
        const result = await submitFunc(payload);
        this.endTimer(timer, 'voteSubmission');
        return result;
      } catch (error) {
        this.endTimer(timer, 'voteSubmission');
        throw error;
      }
    };
  }

  /**
   * Measure API call performance
   */
  measureAPICall(endpoint, method = 'GET') {
    return async (data = null) => {
      const timer = this.startTimer(`${method} ${endpoint}`);
      try {
        const response = await fetch(`${endpoint}`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: data ? JSON.stringify(data) : undefined,
        });
        const result = await response.json();
        this.endTimer(timer, 'apiCalls');
        return result;
      } catch (error) {
        this.endTimer(timer, 'apiCalls');
        throw error;
      }
    };
  }

  /**
   * Measure biometric verification time
   */
  measureBiometricVerification(verifyFunc) {
    return async (biometricData) => {
      const timer = this.startTimer('Biometric Verification');
      try {
        const result = await verifyFunc(biometricData);
        this.endTimer(timer, 'biometricVerification');
        return result;
      } catch (error) {
        this.endTimer(timer, 'biometricVerification');
        throw error;
      }
    };
  }

  /**
   * Measure blockchain verification time
   */
  measureBlockchainVerification(verifyFunc) {
    return async (blockData) => {
      const timer = this.startTimer('Blockchain Verification');
      try {
        const result = await verifyFunc(blockData);
        this.endTimer(timer, 'blockchainVerification');
        return result;
      } catch (error) {
        this.endTimer(timer, 'blockchainVerification');
        throw error;
      }
    };
  }

  /**
   * Get memory usage (KB)
   */
  getMemoryUsage() {
    if (performance.memory) {
      return performance.memory.usedJSHeapSize / 1024; // Convert to KB
    }
    return 0;
  }

  /**
   * Calculate statistics for a metric category
   */
  calculateStats(category) {
    const metrics = this.metrics[category] || [];

    if (metrics.length === 0) {
      return {
        count: 0,
        average: 0,
        min: 0,
        max: 0,
        median: 0,
        stddev: 0,
        p95: 0,
        p99: 0,
      };
    }

    const durations = metrics.map(m => m.duration).sort((a, b) => a - b);

    const average = durations.reduce((a, b) => a + b, 0) / durations.length;
    const variance = durations.reduce((a, b) => a + Math.pow(b - average, 2), 0) / durations.length;
    const stddev = Math.sqrt(variance);

    return {
      count: metrics.length,
      average: Math.round(average * 100) / 100,
      min: Math.round(durations[0] * 100) / 100,
      max: Math.round(durations[durations.length - 1] * 100) / 100,
      median: Math.round(durations[Math.floor(durations.length / 2)] * 100) / 100,
      stddev: Math.round(stddev * 100) / 100,
      p95: Math.round(durations[Math.floor(durations.length * 0.95)] * 100) / 100,
      p99: Math.round(durations[Math.floor(durations.length * 0.99)] * 100) / 100,
      totalTime: Math.round(durations.reduce((a, b) => a + b, 0) * 100) / 100,
    };
  }

  /**
   * Calculate throughput (votes per second)
   */
  calculateThroughput(timeWindowMs = 60000) {
    const now = Date.now();
    const cutoff = now - timeWindowMs;

    const recentSubmissions = this.metrics.voteSubmission.filter(m => {
      const metricTime = new Date(m.timestamp).getTime();
      return metricTime >= cutoff;
    });

    const votesPerMs = recentSubmissions.length / timeWindowMs;
    const votesPerSecond = votesPerMs * 1000;

    return {
      votesPerSecond: Math.round(votesPerSecond * 100) / 100,
      votesPerMinute: Math.round(votesPerSecond * 60 * 100) / 100,
      votesPerHour: Math.round(votesPerSecond * 3600 * 100) / 100,
      votesPerDay: Math.round(votesPerSecond * 86400 * 100) / 100,
    };
  }

  /**
   * Generate comprehensive performance report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: {},
      throughput: this.calculateThroughput(),
      systemHealth: this.assessSystemHealth(),
      topBottlenecks: this.identifyBottlenecks(),
      recommendations: this.generatePerformanceRecommendations(),
    };

    // Calculate stats for each category
    for (const category of Object.keys(this.metrics)) {
      report.metrics[category] = this.calculateStats(category);
    }

    return report;
  }

  /**
   * Assess system health based on metrics
   */
  assessSystemHealth() {
    const stats = this.calculateStats('voteSubmission');
    let health = {
      status: 'good',
      latencyScore: 100,
      throughputScore: 100,
      memoryScore: 100,
      overall: 100,
    };

    // Latency assessment (target: <100ms average)
    if (stats.average > 500) {
      health.latencyScore = 40;
      health.status = 'critical';
    } else if (stats.average > 200) {
      health.latencyScore = 60;
      health.status = 'degraded';
    } else if (stats.average > 100) {
      health.latencyScore = 80;
      health.status = 'fair';
    }

    // Throughput assessment (target: >100 votes/sec)
    const throughput = this.calculateThroughput().votesPerSecond;
    if (throughput < 50) {
      health.throughputScore = 40;
      health.status = health.status === 'critical' ? 'critical' : 'degraded';
    } else if (throughput < 100) {
      health.throughputScore = 70;
    } else if (throughput < 200) {
      health.throughputScore = 85;
    }

    // Overall score
    health.overall = Math.round(
      (health.latencyScore * 0.4 +
       health.throughputScore * 0.4 +
       health.memoryScore * 0.2) * 100
    ) / 100;

    return health;
  }

  /**
   * Identify performance bottlenecks
   */
  identifyBottlenecks() {
    const bottlenecks = [];

    // Check each category
    for (const [category, metrics] of Object.entries(this.metrics)) {
      if (metrics.length === 0) continue;

      const stats = this.calculateStats(category);

      if (stats.average > 1000) {
        bottlenecks.push({
          category,
          severity: 'critical',
          issue: 'Very high average latency',
          value: `${stats.average}ms`,
          recommendation: `Optimize ${category} operations`,
        });
      } else if (stats.p99 > 5000) {
        bottlenecks.push({
          category,
          severity: 'high',
          issue: 'High 99th percentile latency',
          value: `${stats.p99}ms`,
          recommendation: `Investigate slow outliers in ${category}`,
        });
      } else if (stats.stddev > stats.average * 0.5) {
        bottlenecks.push({
          category,
          severity: 'medium',
          issue: 'High latency variance',
          value: `σ=${stats.stddev}ms`,
          recommendation: `Stabilize ${category} performance`,
        });
      }
    }

    return bottlenecks.sort((a, b) => {
      const severityScore = { critical: 3, high: 2, medium: 1, low: 0 };
      return severityScore[b.severity] - severityScore[a.severity];
    });
  }

  /**
   * Generate performance recommendations
   */
  generatePerformanceRecommendations() {
    const recommendations = [];
    const health = this.assessSystemHealth();
    const bottlenecks = this.identifyBottlenecks();

    if (health.status === 'critical') {
      recommendations.push({
        priority: 'urgent',
        action: 'Activate failover systems immediately',
        rationale: 'System is operating at critical performance levels',
      });
    }

    bottlenecks.slice(0, 3).forEach(bn => {
      recommendations.push({
        priority: bn.severity === 'critical' ? 'urgent' : bn.severity === 'high' ? 'high' : 'medium',
        action: bn.recommendation,
        rationale: `${bn.category}: ${bn.issue} (${bn.value})`,
      });
    });

    if (health.overall >= 80) {
      recommendations.push({
        priority: 'low',
        action: 'Performance is nominal - continue monitoring',
        rationale: 'System is operating within healthy parameters',
      });
    }

    return recommendations;
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics() {
    return {
      timestamp: new Date().toISOString(),
      report: this.generateReport(),
      rawMetrics: this.metrics,
    };
  }

  /**
   * Export metrics as CSV
   */
  exportCSV(category = 'voteSubmission') {
    const metrics = this.metrics[category] || [];

    const headers = ['Timestamp', 'Name', 'Duration (ms)', 'Memory Delta (KB)'];
    const rows = metrics.map(m => [
      m.timestamp,
      m.name,
      Math.round(m.duration * 100) / 100,
      Math.round(m.memoryDelta * 100) / 100,
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csv;
  }

  /**
   * Reset metrics
   */
  reset() {
    this.metrics = {
      voteSubmission: [],
      apiCalls: [],
      biometricVerification: [],
      blockchainVerification: [],
      systemResources: [],
    };
  }

  /**
   * Get live metrics dashboard data
   */
  getLiveMetrics() {
    return {
      voteSubmission: this.calculateStats('voteSubmission'),
      apiCalls: this.calculateStats('apiCalls'),
      biometricVerification: this.calculateStats('biometricVerification'),
      blockchainVerification: this.calculateStats('blockchainVerification'),
      throughput: this.calculateThroughput(),
      health: this.assessSystemHealth(),
    };
  }
}

export default new PerformanceBenchmark();
