import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import Navbar from "../components/Navbar";
import "../styles/dashboard.css";

/**
 * Election Details Page
 * 
 * Organization Admin can:
 * - View election details
 * - Edit election details
 * - Delete election
 * - Manage candidates
 * - Generate invitation link
 * - View statistics
 * - Change election status
 */
export default function ElectionDetails() {
  const { orgId, electionId } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadElection();
  }, [electionId]);

  const loadElection = async () => {
    try {
      const elections = await api.getElections();
      const found = elections.find(e => e._id === electionId);
      setElection(found);
      if (found) {
        setEditForm({
          title: found.title || '',
          description: found.description || '',
          startDate: found.startDate ? found.startDate.slice(0, 10) : '',
          endDate: found.endDate ? found.endDate.slice(0, 10) : ''
        });
      }
    } catch (err) {
      console.error("Failed to load election:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyInvitationLink = () => {
    if (!election?.invitationCode) return;
    const link = `${window.location.origin}/election/${election.invitationCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusChange = async (newStatus) => {
    const confirmMsg = newStatus === 'active' 
      ? "Are you sure you want to activate this election? Once activated, voters can start registering and voting."
      : "Are you sure you want to close this election? No more votes will be accepted.";
    
    if (!window.confirm(confirmMsg)) return;
    
    try {
      await api.updateElection(electionId, { status: newStatus });
      setElection({ ...election, status: newStatus });
      setSuccess(`Election ${newStatus === 'active' ? 'activated' : 'closed'} successfully!`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update election status");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleEditElection = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim()) {
      setError("Election title is required");
      return;
    }
    
    setSaving(true);
    setError("");
    
    try {
      await api.updateElection(electionId, {
        title: editForm.title,
        description: editForm.description,
        startDate: editForm.startDate,
        endDate: editForm.endDate
      });
      
      setElection({
        ...election,
        title: editForm.title,
        description: editForm.description,
        startDate: editForm.startDate,
        endDate: editForm.endDate
      });
      
      setShowEditModal(false);
      setSuccess("Election updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update election: " + (err.message || "Please try again."));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteElection = async () => {
    if (election?.status === 'active') {
      setError("Cannot delete an active election. Please close it first.");
      setShowDeleteModal(false);
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    try {
      await api.deleteElection(electionId);
      navigate(`/org/${orgId}/elections`);
    } catch (err) {
      setError("Failed to delete election");
      setTimeout(() => setError(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <Navbar />
        <div className="container" style={{ padding: "2rem 0", textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto" }}></div>
        </div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="page">
        <Navbar />
        <div className="container" style={{ padding: "2rem 0" }}>
          <div className="card text-center">
            <h2>Election not found</h2>
            <Link to={`/org/${orgId}/elections`} className="btn btn-primary mt-2">
              Back to Elections
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const invitationLink = `${window.location.origin}/election/${election.invitationCode}`;

  return (
    <div className="page">
      <Navbar />
      <div className="dashboard-container container">
        {/* Success Message */}
        {success && (
          <div className="alert alert-success mb-2">{success}</div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-error mb-2">{error}</div>
        )}

        {/* Header */}
        <div className="org-dashboard-header">
          <div>
            <h1 className="section-title">{election.title}</h1>
            <p className="text-muted">{election.description}</p>
          </div>
          <div className="flex gap-2">
            {election.status === 'draft' && (
              <>
                <button 
                  className="btn btn-outline"
                  onClick={() => setShowEditModal(true)}
                >
                  ✏️ Edit
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleStatusChange('active')}
                >
                  ▶️ Activate Election
                </button>
              </>
            )}
            {election.status === 'active' && (
              <button 
                className="btn btn-danger"
                onClick={() => handleStatusChange('closed')}
              >
                ⏹️ Close Election
              </button>
            )}
            {election.status === 'closed' && (
              <button 
                className="btn btn-outline"
                style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                onClick={() => setShowDeleteModal(true)}
              >
                🗑️ Delete
              </button>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`badge badge-${
            election.status === 'active' ? 'green' : 
            election.status === 'draft' ? 'yellow' : 'blue'
          }`}>
            {election.status === 'active' ? '🟢 Active' : 
             election.status === 'draft' ? '🟡 Draft' : '🔵 Closed'}
          </span>
          {election.startDate && (
            <span className="text-muted">
              {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Invitation Link */}
        {(election.status === 'active' || election.status === 'draft') && (
          <div className="card mb-3">
            <h3 className="card-title">Voter Invitation Link</h3>
            <p className="text-muted mb-2">
              {election.status === 'active' 
                ? "Share this link with voters so they can register and vote."
                : "Activate the election to enable voter registration."}
            </p>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={invitationLink} 
                readOnly 
                className="input"
                style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
              />
              <button 
                className="btn btn-primary"
                onClick={copyInvitationLink}
                disabled={election.status !== 'active'}
              >
                {copied ? "✓ Copied!" : "Copy"}
              </button>
            </div>
            {election.status === 'draft' && (
              <p style={{ fontSize: '0.85rem', color: 'var(--warning)', marginTop: 8 }}>
                ⚠️ Activate the election to make the invitation link work for voters.
              </p>
            )}
          </div>
        )}

        {/* Statistics */}
        <div className="dashboard-stats mb-3">
          <div className="stat-card">
            <div className="stat-value">{election.candidates?.length || 0}</div>
            <div className="stat-label">Candidates</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{election.totalVotes || 0}</div>
            <div className="stat-label">Votes Cast</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ fontSize: '1rem', fontFamily: 'monospace' }}>
              {election.invitationCode}
            </div>
            <div className="stat-label">Election Code</div>
          </div>
        </div>

        {/* Candidates */}
        <div className="card mb-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="card-title">Candidates</h3>
            {election.status === 'draft' && (
              <Link to={`/org/${orgId}/elections/${electionId}/candidates`} className="btn btn-primary btn-sm">
                + Add Candidates
              </Link>
            )}
          </div>
          
          {election.candidates?.length === 0 ? (
            <div className="text-center py-3">
              <p className="text-muted">No candidates added yet.</p>
              {election.status === 'draft' && (
                <Link to={`/org/${orgId}/elections/${electionId}/candidates`} className="btn btn-primary mt-2">
                  Add Your First Candidate
                </Link>
              )}
            </div>
          ) : (
            <div className="candidates-list">
              {election.candidates?.map((candidate, index) => (
                <div key={candidate.id || index} className="candidate-item" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '12px',
                  background: 'var(--surface)',
                  borderRadius: 8,
                  marginBottom: 8,
                  border: '1px solid var(--border)'
                }}>
                  {candidate.photo ? (
                    <img 
                      src={candidate.photo} 
                      alt={candidate.name}
                      style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, var(--primary), var(--primary-d))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 700
                    }}>
                      {candidate.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{candidate.name}</h4>
                      {candidate.symbol && (
                        <span style={{ fontSize: '1.2rem' }} title="Election Symbol">
                          {candidate.symbol}
                        </span>
                      )}
                    </div>
                    {candidate.position && (
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--accent)' }}>
                        {candidate.position}
                      </p>
                    )}
                    {candidate.description && (
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)' }}>
                        {candidate.description.length > 80 
                          ? candidate.description.slice(0, 80) + '...' 
                          : candidate.description}
                      </p>
                    )}
                  </div>
                  {election.status === 'closed' && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '1.1rem' }}>
                        {candidate.votes || 0}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>votes</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="card-title">Quick Actions</h3>
          <div className="quick-actions-grid">
            <Link to={`/org/${orgId}/elections/${electionId}/candidates`} className="quick-action-item">
              <span className="action-icon">👥</span>
              <span className="action-text">Manage Candidates</span>
            </Link>
            <Link to={`/org/${orgId}/elections/${electionId}/voters`} className="quick-action-item">
              <span className="action-icon">📋</span>
              <span className="action-text">View Voters</span>
            </Link>
            <Link to={`/org/${orgId}/elections/${electionId}/analytics`} className="quick-action-item">
              <span className="action-icon">📊</span>
              <span className="action-text">Analytics</span>
            </Link>
          </div>
        </div>

        {/* Back Link */}
        <Link to={`/org/${orgId}/elections`} className="btn btn-outline mt-3">
          ← Back to Elections
        </Link>
      </div>

      {/* Edit Election Modal */}
      {showEditModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal" style={{
            background: 'var(--surface)',
            borderRadius: 12,
            padding: 24,
            width: '100%',
            maxWidth: 500,
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginTop: 0 }}>Edit Election</h2>
            <form onSubmit={handleEditElection}>
              <div className="form-group">
                <label className="label">Election Title *</label>
                <input
                  type="text"
                  className="input"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Enter election title"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="label">Description</label>
                <textarea
                  className="input"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Election description"
                  rows={3}
                />
              </div>
              
              <div className="form-group">
                <label className="label">Start Date</label>
                <input
                  type="date"
                  className="input"
                  value={editForm.startDate}
                  onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label className="label">End Date</label>
                <input
                  type="date"
                  className="input"
                  value={editForm.endDate}
                  onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                />
              </div>
              
              <div className="flex gap-2 mt-3">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal" style={{
            background: 'var(--surface)',
            borderRadius: 12,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
            <h2 style={{ marginTop: 0 }}>Delete Election?</h2>
            <p className="text-muted">
              Are you sure you want to delete "{election.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-2 mt-3" style={{ justifyContent: 'center' }}>
              <button 
                className="btn btn-outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleDeleteElection}
              >
                Delete Election
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
