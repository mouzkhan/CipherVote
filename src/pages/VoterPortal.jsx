import Navbar from '../components/Navbar';

export default function VoterPortal() {
  return (
    <div className="page">
      <Navbar />
      <div className="container" style={{ padding: '2rem 0' }}>
        <h1 className="section-title">Election Portal</h1>
        <p className="section-sub">Review election rules, verify identity, and cast your ballot securely.</p>
        <div className="card">
          <h3>Election Rules</h3>
          <p className="text-muted">Only verified voters may participate. Biometric verification is required before voting.</p>
          <button className="btn btn-primary">Continue to Verification</button>
        </div>
      </div>
    </div>
  );
}
