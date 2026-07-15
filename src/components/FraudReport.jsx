export default function FraudReport({ score, level, signals, recommendation }) {
  return (
    <div className="card mt-3">
      <h3 className="section-title" style={{ fontSize: '1.1rem' }}>Fraud Risk Report</h3>
      <p className="text-muted mb-3">The system evaluated your voting session for suspicious behavior.</p>
      <div className="metric-card mb-3">
        <div className="metric-value" style={{ color: score >= 70 ? 'var(--danger)' : score >= 40 ? 'var(--warn)' : 'var(--accent)' }}>{score}%</div>
        <div className="metric-label">Risk Score · {level}</div>
      </div>
      <div className="mb-3">
        <h4 style={{ marginBottom: 8 }}>Risk Factors</h4>
        <ul>
          {signals.map((signal) => (
            <li key={signal.type} className="text-muted">✓ {signal.detail}</li>
          ))}
        </ul>
      </div>
      <div className="alert alert-info">{recommendation}</div>
    </div>
  );
}
