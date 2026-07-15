import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import Navbar from "../components/Navbar";
import "../styles/dashboard.css";

/**
 * Candidate Management Page
 * 
 * Organization Admin can:
 * - Add candidates with photo, name, description, symbol
 * - Edit candidates
 * - Delete candidates
 * - Upload candidate photos
 */
export default function CandidateManagement() {
  const { orgId, electionId } = useParams();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingCandidate, setEditingCandidate] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    position: '',
    photo: '',
    symbol: ''
  });

  // Common election symbols
  const symbolOptions = [
    '🐘', '🦁', '🐎', '🐂', '🦅', '🐅', '🐻', '🐺',
    '⭐', '🌟', '💫', '🔥', '💎', '🏆', '🎯', '💪',
    '🌻', '🌹', '🌳', '🌊', '☀️', '🌙', '⚡', '🌈'
  ];

  useEffect(() => {
    loadElection();
  }, [electionId]);

  const loadElection = async () => {
    try {
      const elections = await api.getElections();
      const found = elections.find(e => e._id === electionId);
      setElection(found);
    } catch (err) {
      console.error("Failed to load election:", err);
      setError("Failed to load election");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image file (JPG, PNG, GIF, WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");
    
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('photo', file);
      
      const result = await api.uploadCandidatePhoto(uploadFormData);
      
      if (result && result.photoUrl) {
        setFormData(prev => ({ ...prev, photo: result.photoUrl }));
        setSuccess("Photo uploaded successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Failed to upload photo: " + (err.message || "Please try again."));
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      position: '',
      photo: '',
      symbol: ''
    });
    setEditingCandidate(null);
    setShowForm(false);
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Please enter candidate name");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const candidate = {
        id: `candidate_${Date.now()}`,
        name: formData.name,
        description: formData.description,
        position: formData.position,
        photo: formData.photo,
        symbol: formData.symbol,
        votes: 0
      };

      const updatedCandidates = [...(election.candidates || []), candidate];
      
      await api.updateElection(electionId, {
        candidates: updatedCandidates
      });

      setElection({ ...election, candidates: updatedCandidates });
      resetForm();
      setSuccess("Candidate added successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to add candidate:", err);
      setError("Failed to add candidate. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditCandidate = (candidate) => {
    setEditingCandidate(candidate);
    setFormData({
      name: candidate.name || '',
      description: candidate.description || '',
      position: candidate.position || '',
      photo: candidate.photo || '',
      symbol: candidate.symbol || ''
    });
    setShowForm(true);
  };

  const handleUpdateCandidate = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Please enter candidate name");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const updatedCandidates = election.candidates.map(c => {
        if (c.id === editingCandidate.id) {
          return {
            ...c,
            name: formData.name,
            description: formData.description,
            position: formData.position,
            photo: formData.photo,
            symbol: formData.symbol
          };
        }
        return c;
      });

      await api.updateElection(electionId, {
        candidates: updatedCandidates
      });

      setElection({ ...election, candidates: updatedCandidates });
      resetForm();
      setSuccess("Candidate updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to update candidate:", err);
      setError("Failed to update candidate. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCandidate = async (candidateId) => {
    if (!window.confirm("Are you sure you want to remove this candidate?")) return;

    try {
      const updatedCandidates = election.candidates.filter(c => c.id !== candidateId);
      await api.updateElection(electionId, { candidates: updatedCandidates });
      setElection({ ...election, candidates: updatedCandidates });
      setSuccess("Candidate removed successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to delete candidate:", err);
      setError("Failed to remove candidate");
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

  return (
    <div className="page">
      <Navbar />
      <div className="dashboard-container container">
        {/* Header */}
        <div className="org-dashboard-header">
          <div>
            <h1 className="section-title">Candidate Management</h1>
            <p className="text-muted">{election?.title}</p>
          </div>
          {election?.status === 'draft' && (
            <button 
              className="btn btn-primary"
              onClick={() => {
                if (showForm && editingCandidate) {
                  resetForm();
                } else {
                  setShowForm(!showForm);
                }
              }}
            >
              {showForm ? "Cancel" : "+ Add Candidate"}
            </button>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`badge badge-${
            election?.status === 'active' ? 'green' : 
            election?.status === 'draft' ? 'yellow' : 'blue'
          }`}>
            {election?.status === 'active' ? '🟢 Active' : 
             election?.status === 'draft' ? '🟡 Draft' : '🔵 Closed'}
          </span>
          {election?.status !== 'draft' && (
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
              {election?.status === 'active' 
                ? "Cannot modify candidates while election is active"
                : "Election is closed"}
            </span>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="alert alert-success mb-2">{success}</div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-error mb-2">{error}</div>
        )}

        {/* Add/Edit Candidate Form */}
        {showForm && election?.status === 'draft' && (
          <div className="card mb-3">
            <h3 className="card-title">
              {editingCandidate ? 'Edit Candidate' : 'Add New Candidate'}
            </h3>
            <form onSubmit={editingCandidate ? handleUpdateCandidate : handleAddCandidate}>
              <div className="form-group">
                <label className="label">Candidate Name *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter candidate name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Position/Title</label>
                <input
                  type="text"
                  className="input"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="e.g., President, Secretary, Treasurer"
                />
              </div>

              <div className="form-group">
                <label className="label">Description</label>
                <textarea
                  className="input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description about the candidate, their background, vision, etc."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label className="label">Election Symbol</label>
                <div style={{ marginTop: 8 }}>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 8, 
                    marginBottom: 12,
                    padding: 12,
                    background: 'var(--bg)',
                    borderRadius: 8
                  }}>
                    {symbolOptions.map((symbol) => (
                      <button
                        key={symbol}
                        type="button"
                        onClick={() => setFormData({ ...formData, symbol })}
                        style={{
                          width: 44,
                          height: 44,
                          fontSize: '1.5rem',
                          border: formData.symbol === symbol ? '2px solid var(--accent)' : '2px solid var(--border)',
                          borderRadius: 8,
                          background: formData.symbol === symbol ? 'var(--accent-light)' : 'var(--surface)',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                  {formData.symbol && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Selected:</span>
                      <span style={{ fontSize: '1.8rem' }}>{formData.symbol}</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, symbol: '' })}
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--danger)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="label">Photo (Optional)</label>
                <div style={{ marginTop: 8 }}>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handlePhotoUpload}
                    style={{ marginBottom: 8 }}
                    disabled={uploading}
                  />
                  {uploading && (
                    <div className="text-muted" style={{ marginTop: 8 }}>
                      Uploading photo...
                    </div>
                  )}
                  {formData.photo && (
                    <div style={{ marginTop: 12 }}>
                      <img 
                        src={formData.photo} 
                        alt="Preview" 
                        style={{ 
                          width: 80, 
                          height: 80, 
                          borderRadius: 8, 
                          objectFit: 'cover',
                          border: '2px solid var(--accent)'
                        }}
                      />
                      <div style={{ marginTop: 4, color: 'var(--accent)', fontSize: '0.85rem' }}>
                        ✓ Photo uploaded
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving || uploading}
                >
                  {saving 
                    ? "Saving..." 
                    : editingCandidate 
                      ? "Update Candidate" 
                      : "Add Candidate"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Candidates List */}
        <div className="card">
          <h3 className="card-title">Candidates ({election?.candidates?.length || 0})</h3>
          
          {!election?.candidates?.length ? (
            <div className="text-center py-4">
              <p className="text-muted">No candidates added yet.</p>
              {election?.status === 'draft' && (
                <button 
                  className="btn btn-primary mt-2"
                  onClick={() => setShowForm(true)}
                >
                  Add Your First Candidate
                </button>
              )}
            </div>
          ) : (
            <div className="candidates-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 16
            }}>
              {election.candidates.map((candidate, index) => (
                <div key={candidate.id || index} className="candidate-card" style={{
                  padding: 16,
                  background: 'var(--surface)',
                  borderRadius: 12,
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                    {candidate.photo ? (
                      <img 
                        src={candidate.photo} 
                        alt={candidate.name}
                        style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: 64,
                        height: 64,
                        borderRadius: 8,
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-d))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1.4rem'
                      }}>
                        {candidate.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h4 style={{ margin: 0, fontSize: '1rem' }}>{candidate.name}</h4>
                        {candidate.symbol && (
                          <span style={{ fontSize: '1.5rem' }} title="Election Symbol">
                            {candidate.symbol}
                          </span>
                        )}
                      </div>
                      {candidate.position && (
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--accent)' }}>
                          {candidate.position}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {candidate.description && (
                    <p style={{ 
                      fontSize: '0.85rem', 
                      color: 'var(--muted)', 
                      margin: '0 0 12px 0',
                      lineHeight: 1.5
                    }}>
                      {candidate.description.length > 120 
                        ? candidate.description.slice(0, 120) + '...' 
                        : candidate.description}
                    </p>
                  )}

                  {election.status === 'draft' && (
                    <div className="flex gap-2">
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => handleEditCandidate(candidate)}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => handleDeleteCandidate(candidate.id)}
                        style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  )}

                  {election.status === 'closed' && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      paddingTop: 12,
                      borderTop: '1px solid var(--border)'
                    }}>
                      <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Votes received:</span>
                      <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '1.2rem' }}>
                        {candidate.votes || 0}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back Link */}
        <Link to={`/org/${orgId}/elections/${electionId}`} className="btn btn-outline mt-3">
          ← Back to Election
        </Link>
      </div>
    </div>
  );
}
