import { Link } from 'react-router-dom';

export default function WorkflowCard({ title, description, actionLabel, to, status, icon }) {
  return (
    <div className="card" style={{ minHeight: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: '1.4rem' }}>{icon}</div>
        <span className={`badge ${status === 'ready' ? 'badge-green' : status === 'pending' ? 'badge-yellow' : 'badge-blue'}`}>
          {status === 'ready' ? 'Ready' : status === 'pending' ? 'Pending' : 'Next'}
        </span>
      </div>
      <h3 style={{ marginBottom: 8 }}>{title}</h3>
      <p className="text-muted" style={{ marginBottom: 16 }}>{description}</p>
      <Link to={to} className="btn btn-primary btn-sm">{actionLabel}</Link>
    </div>
  );
}
