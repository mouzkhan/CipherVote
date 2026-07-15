import Navbar from '../components/Navbar';

export default function ElectionWorkspace() {
  return (
    <div className="page">
      <Navbar />
      <div className="container" style={{ padding: '2rem 0' }}>
        <h1 className="section-title">Election Workspace</h1>
        <p className="section-sub">Create and manage elections with rules, verification requirements, and audit settings.</p>
        <div className="card">
          <div className="form-group">
            <label className="label">Election Name</label>
            <input className="input" placeholder="e.g. Student Council Election" />
          </div>
          <div className="form-group">
            <label className="label">Description</label>
            <input className="input" placeholder="Brief description" />
          </div>
          <div className="form-group">
            <label className="label">Security Level</label>
            <select className="input">
              <option value="standard">Standard</option>
              <option value="enhanced">Enhanced</option>
              <option value="high">High</option>
            </select>
          </div>
          <button className="btn btn-primary">Create Election</button>
        </div>
      </div>
    </div>
  );
}
