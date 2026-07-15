import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const steps = ['Details', 'Schedule', 'Candidates', 'Review', 'Publish'];

export default function CreateElectionWizard() {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { user } = useAuth();
  
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdElection, setCreatedElection] = useState(null);
  
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    startDate: '', 
    endDate: '', 
    candidates: [],
    settings: {
      requireBiometric: true,
      allowRegistration: true
    }
  });
  
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    photo: '',
    description: '',
    position: '',
    symbol: '' // Election symbol for the candidate
  });
  
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingSymbol, setUploadingSymbol] = useState(false);

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }
    
    setUploadingPhoto(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const data = await api.uploadCandidatePhoto(formData);
      
      if (data && data.photoUrl) {
        setNewCandidate({ ...newCandidate, photo: data.photoUrl });
      }
    } catch (err) {
      setError('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSymbolUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file for symbol');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Symbol image must be less than 2MB');
      return;
    }
    
    setUploadingSymbol(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const data = await api.uploadCandidatePhoto(formData);
      
      if (data && data.photoUrl) {
        setNewCandidate({ ...newCandidate, symbol: data.photoUrl });
      }
    } catch (err) {
      setError('Failed to upload symbol');
    } finally {
      setUploadingSymbol(false);
    }
  };

  const addCandidate = () => {
    if (!newCandidate.name.trim()) {
      setError('Please enter candidate name');
      return;
    }
    const candidate = {
      id: `c${Date.now()}`,
      name: newCandidate.name.trim(),
      photo: newCandidate.photo,
      description: newCandidate.description,
      position: newCandidate.position,
      symbol: newCandidate.symbol,
      votes: 0
    };
    setForm(prev => ({ ...prev, candidates: [...prev.candidates, candidate] }));
    setNewCandidate({ name: '', photo: '', description: '', position: '', symbol: '' });
    setError('');
    setSuccess('Candidate added!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const removeCandidate = (id) => {
    setForm(prev => ({ 
      ...prev, 
      candidates: prev.candidates.filter(c => c.id !== id) 
    }));
  };

  const publishElection = async () => {
    setError('');
    setLoading(true);

    try {
      const payload = {
        organizationId: orgId,
        organizationName: user?.displayName || 'Organization',
        title: form.name,
        description: form.description,
        startDate: form.startDate ? new Date(form.startDate).getTime() : Date.now(),
        endDate: form.endDate ? new Date(form.endDate).getTime() : Date.now() + 7 * 24 * 60 * 60 * 1000,
        status: 'draft',
        candidates: form.candidates,
        settings: form.settings
      };
      
      const election = await api.createElection(payload);
      setCreatedElection(election);
      setSuccess('Election created successfully! Redirecting...');
      
      // Navigate to organization dashboard after 2 seconds
      setTimeout(() => {
        navigate(`/org/${orgId}/dashboard`);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Unable to create election');
    } finally {
      setLoading(false);
    }
  };

  const handlePrimaryAction = () => {
    if (step === steps.length - 2) {
      publishElection();
      return;
    }
    next();
  };

  return (
    <div className="page">
      <Navbar />
      <div className="container" style={{ padding: '2rem 0', maxWidth: 920 }}>
        <div className="card">
          <div className="flex justify-between items-center mb-3" style={{ flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 className="section-title">Create Election</h1>
              <p className="section-sub">Setup your election step by step</p>
            </div>
            <div className="badge badge-blue">Step {step + 1} of {steps.length}</div>
          </div>

          {/* Progress Steps */}
          <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
            {steps.map((label, index) => (
              <span key={label} className={`badge ${index <= step ? 'badge-green' : 'badge-yellow'}`}>
                {index + 1}. {label}
              </span>
            ))}
          </div>

          {error && <div className="alert alert-error mb-2">{error}</div>}
          {success && <div className="alert alert-success mb-2">{success}</div>}

          {/* Step 1: Details */}
          {step === 0 && (
            <div>
              <div className="form-group">
                <label className="label">Election Title *</label>
                <input 
                  className="input" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  placeholder="e.g., Student Council Election 2026" 
                />
              </div>
              <div className="form-group">
                <label className="label">Description</label>
                <textarea 
                  className="input" 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  placeholder="Describe the purpose and scope of this election"
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Step 2: Schedule */}
          {step === 1 && (
            <div>
              <div className="form-group">
                <label className="label">Start Date & Time</label>
                <input 
                  className="input" 
                  type="datetime-local" 
                  value={form.startDate} 
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label className="label">End Date & Time</label>
                <input 
                  className="input" 
                  type="datetime-local" 
                  value={form.endDate} 
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={form.settings.requireBiometric}
                    onChange={(e) => setForm({
                      ...form, 
                      settings: { ...form.settings, requireBiometric: e.target.checked }
                    })}
                  />
                  <span>Require biometric verification for voters</span>
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Candidates */}
          {step === 2 && (
            <div>
              <h3 style={{ marginBottom: 16 }}>Add Candidates</h3>
              
              {/* Candidate Form */}
              <div style={{ 
                background: 'var(--surface)', 
                padding: 16, 
                borderRadius: 12, 
                marginBottom: 20,
                border: '1px solid var(--border)'
              }}>
                <div className="form-group">
                  <label className="label">Candidate Name *</label>
                  <input 
                    className="input" 
                    value={newCandidate.name} 
                    onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })} 
                    placeholder="Full name"
                  />
                </div>
                
                <div className="grid-2">
                  <div className="form-group">
                    <label className="label">Photo</label>
                    <input 
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                    />
                    {uploadingPhoto && <span className="text-muted">Uploading...</span>}
                    {newCandidate.photo && (
                      <img 
                        src={newCandidate.photo} 
                        alt="Preview" 
                        style={{ width: 60, height: 60, borderRadius: 8, marginTop: 8, objectFit: 'cover' }}
                      />
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label className="label">Election Symbol</label>
                    <input 
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleSymbolUpload}
                      disabled={uploadingSymbol}
                    />
                    {uploadingSymbol && <span className="text-muted">Uploading...</span>}
                    {newCandidate.symbol && (
                      <img 
                        src={newCandidate.symbol} 
                        alt="Symbol" 
                        style={{ width: 50, height: 50, marginTop: 8, objectFit: 'contain' }}
                      />
                    )}
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="label">Position/Title</label>
                  <input 
                    className="input" 
                    value={newCandidate.position} 
                    onChange={(e) => setNewCandidate({ ...newCandidate, position: e.target.value })} 
                    placeholder="e.g., President, Secretary"
                  />
                </div>
                
                <div className="form-group">
                  <label className="label">Bio/Description</label>
                  <textarea 
                    className="input" 
                    value={newCandidate.description} 
                    onChange={(e) => setNewCandidate({ ...newCandidate, description: e.target.value })} 
                    placeholder="Candidate's background, achievements, and platform"
                    rows={3}
                  />
                </div>
                
                <button 
                  className="btn btn-primary"
                  onClick={addCandidate}
                  disabled={!newCandidate.name.trim()}
                >
                  + Add Candidate
                </button>
              </div>
              
              {/* Candidates List */}
              {form.candidates.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: 12 }}>Added Candidates ({form.candidates.length})</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {form.candidates.map((candidate) => (
                      <div 
                        key={candidate.id} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 12, 
                          padding: 12,
                          background: 'var(--surface)',
                          borderRadius: 8,
                          border: '1px solid var(--border)'
                        }}
                      >
                        {candidate.photo ? (
                          <img 
                            src={candidate.photo} 
                            alt={candidate.name}
                            style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{
                            width: 50, height: 50, borderRadius: 8,
                            background: 'linear-gradient(135deg, var(--primary), var(--primary-d))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 700
                          }}>
                            {candidate.name[0]}
                          </div>
                        )}
                        
                        {candidate.symbol && (
                          <img 
                            src={candidate.symbol} 
                            alt="Symbol"
                            style={{ width: 40, height: 40, objectFit: 'contain' }}
                          />
                        )}
                        
                        <div style={{ flex: 1 }}>
                          <strong>{candidate.name}</strong>
                          {candidate.position && (
                            <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                              {candidate.position}
                            </div>
                          )}
                        </div>
                        
                        <button 
                          className="btn btn-outline btn-sm"
                          onClick={() => removeCandidate(candidate.id)}
                          style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {step === 3 && (
            <div>
              <h3 style={{ marginBottom: 16 }}>Review Election</h3>
              
              <div style={{ 
                background: 'var(--surface)', 
                padding: 16, 
                borderRadius: 8,
                marginBottom: 16 
              }}>
                <div style={{ marginBottom: 8 }}><strong>Title:</strong> {form.name || 'Not set'}</div>
                <div style={{ marginBottom: 8 }}><strong>Description:</strong> {form.description || 'Not set'}</div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Duration:</strong> {form.startDate ? new Date(form.startDate).toLocaleDateString() : 'Now'} 
                  {' '} to {form.endDate ? new Date(form.endDate).toLocaleDateString() : '7 days'}
                </div>
                <div style={{ marginBottom: 8 }}><strong>Candidates:</strong> {form.candidates.length}</div>
                <div><strong>Biometric Required:</strong> {form.settings.requireBiometric ? 'Yes' : 'No'}</div>
              </div>
              
              {form.candidates.length === 0 && (
                <div className="alert alert-error">
                  Please add at least one candidate before publishing
                </div>
              )}
            </div>
          )}

          {/* Step 5: Publishing */}
          {step === 4 && (
            <div className="text-center">
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>🗳️</div>
              <h2 className="section-title">Election Created!</h2>
              <p className="text-muted mb-3">
                Your election has been created as a draft. Activate it when you're ready to invite voters.
              </p>
              <div className="alert alert-success">
                ✓ Election saved<br />
                ✓ {form.candidates.length} candidates added<br />
                ✓ Redirecting to dashboard...
              </div>
            </div>
          )}

          {/* Navigation */}
          {step < 4 && (
            <div className="flex justify-between mt-3">
              <button 
                className="btn btn-outline" 
                onClick={prev} 
                disabled={step === 0}
              >
                ← Back
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handlePrimaryAction} 
                disabled={loading || (step === 3 && form.candidates.length === 0)}
              >
                {loading ? 'Creating...' : step === 3 ? 'Create Election' : 'Continue →'}
              </button>
            </div>
          )}
        </div>
        
        {/* Back to Dashboard */}
        {step < 4 && (
          <button 
            className="btn btn-outline mt-3"
            onClick={() => navigate(`/org/${orgId}/dashboard`)}
          >
            ← Back to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
