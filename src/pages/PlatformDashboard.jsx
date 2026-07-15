import Navbar from '../components/Navbar';
import WorkflowCard from '../components/WorkflowCard';

export default function PlatformDashboard() {
  return (
    <div className="page">
      <Navbar />
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="card mb-3">
          <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 className="section-title">Welcome to CipherVote</h1>
              <p className="section-sub">Your secure voting platform for creating organizations, running elections, and managing verified voters.</p>
            </div>
            <div className="badge badge-green">Account Ready</div>
          </div>
          <div className="grid-3 mt-2">
            <div className="metric-card">
              <div className="metric-value">0</div>
              <div className="metric-label">Organizations</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">0</div>
              <div className="metric-label">Active Elections</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">78%</div>
              <div className="metric-label">Profile Completion</div>
            </div>
          </div>
        </div>

        <div className="dashboard-shell">
          <aside className="dashboard-sidebar">
            <div className="sidebar-section">
              <div className="sidebar-title">Workspace</div>
              <a href="/platform-dashboard" className="sidebar-link active">Overview</a>
              <a href="/create-organization" className="sidebar-link">Create Organization</a>
              <a href="/create-election" className="sidebar-link">New Election</a>
              <a href="/biometric-enroll" className="sidebar-link">Biometric Setup</a>
            </div>
            <div className="sidebar-section">
              <div className="sidebar-title">Progress</div>
              <div className="sidebar-stat">
                <strong>3 / 4 Steps</strong>
                <span>Setup complete</span>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
            <div className="sidebar-section">
              <div className="sidebar-title">Quick status</div>
              <div className="sidebar-stat">
                <strong>Trial</strong>
                <span>Free access enabled</span>
              </div>
              <div className="sidebar-stat">
                <strong>Secure</strong>
                <span>Biometric MFA ready</span>
              </div>
            </div>
          </aside>

          <div>
            <div className="grid-2 mb-3">
              <WorkflowCard title="Create Organization" description="Start by creating your organization workspace and establish the tenant for your elections." actionLabel="Create Organization" to="/create-organization" status="ready" icon="🏢" />
              <WorkflowCard title="Complete Identity Verification" description="Verify your account so you can manage organizations and election workflows with confidence." actionLabel="Verify Profile" to="/verify" status="pending" icon="🪪" />
              <WorkflowCard title="Complete Biometric Enrollment" description="Enroll your face to strengthen authentication and support secure voting workflows." actionLabel="Enroll Biometrics" to="/biometric-enroll" status="pending" icon="📷" />
              <WorkflowCard title="Start Free Trial" description="Use the trial to explore the platform before subscribing to a full plan." actionLabel="Start Trial" to="/pricing" status="pending" icon="🚀" />
            </div>

            <div className="grid-2">
              <div className="card">
                <h3 style={{ marginBottom: 8 }}>What happens next?</h3>
                <ul className="text-muted" style={{ paddingLeft: '1rem' }}>
                  <li>Create your organization</li>
                  <li>Choose a plan or start a free trial</li>
                  <li>Create your first election</li>
                  <li>Add candidates and publish</li>
                </ul>
                <div className="pill-row mt-3">
                  <span className="pill">Secure by design</span>
                  <span className="pill">Audit ready</span>
                  <span className="pill">Biometric MFA</span>
                </div>
              </div>
              <div className="card">
                <h3 style={{ marginBottom: 8 }}>Recent Activity</h3>
                <ul className="activity-list mt-2">
                  <li className="activity-item">
                    <strong>Platform setup started</strong>
                    <span>Welcome flow initialized for your account.</span>
                  </li>
                  <li className="activity-item">
                    <strong>Biometric readiness checked</strong>
                    <span>Your environment is prepared for secure verification.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
