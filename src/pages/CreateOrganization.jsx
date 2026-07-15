import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import Navbar from "../components/Navbar";
import "../styles/dashboard.css";

/**
 * Create Organization Page
 * 
 * Platform Users create organizations here.
 * After creating an organization, they become Organization Admins
 * and can access election management features.
 * 
 * This is the ONLY way to become an Organization Admin.
 */
export default function CreateOrganization() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState("details"); // details, plan, review, success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    country: "Pakistan",
    city: "",
    contactEmail: "",
    password: "",
    confirmPassword: ""
  });
  
  const [selectedPlan, setSelectedPlan] = useState("free");

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "PKR 0",
      period: "/year",
      features: ["3 Elections", "500 Voters", "Basic Analytics"],
      maxElections: 3,
      maxVoters: 500
    },
    {
      id: "basic",
      name: "Basic",
      price: "PKR 4,999",
      period: "/year",
      features: ["10 Elections", "5,000 Voters", "Advanced Analytics", "Email Support"],
      maxElections: 10,
      maxVoters: 5000,
      popular: true
    },
    {
      id: "professional",
      name: "Professional",
      price: "PKR 19,999",
      period: "/year",
      features: ["50 Elections", "50,000 Voters", "Full Analytics", "Priority Support", "Custom Branding"],
      maxElections: 50,
      maxVoters: 50000
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      period: "",
      features: ["Unlimited Elections", "Unlimited Voters", "Dedicated Support", "Custom Features", "SLA"],
      maxElections: -1,
      maxVoters: -1
    }
  ];

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError("Organization name is required");
      return;
    }

    if (!formData.password) {
      setError("Password is required");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await api.registerOrganization({
        name: formData.name,
        type: formData.type,
        description: formData.description,
        country: formData.country,
        city: formData.city,
        contactEmail: formData.contactEmail || user?.email,
        password: formData.password,
        plan: selectedPlan
      });

      setStep("success");
      
      // Navigate to organization dashboard after 2 seconds
      setTimeout(() => {
        navigate(`/org/${result.organizationId}/dashboard`);
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to create organization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Navbar />
      <div className="dashboard-container container" style={{ maxWidth: 900 }}>
        {/* Header */}
        <div className="text-center mb-3">
          <h1 className="section-title">Create Your Organization</h1>
          <p className="text-muted">
            Set up your organization to start conducting secure elections
          </p>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps mb-3" style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
          marginBottom: 32
        }}>
          {["Details", "Plan", "Review"].map((s, i) => (
            <div key={s} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              opacity: step === "success" ? 1 : 
                (step === "details" && i === 0) || 
                (step === "plan" && i <= 1) ||
                (step === "review" && i <= 2) ? 1 : 0.4
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: step === "success" || 
                  (step === "details" && i === 0) || 
                  (step === "plan" && i <= 1) ||
                  (step === "review" && i <= 2) 
                    ? 'linear-gradient(135deg, var(--primary), var(--accent))'
                    : 'var(--surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.85rem',
                border: '2px solid var(--border)'
              }}>
                {step === "success" || 
                 (step === "details" && i === 0) ||
                 (step === "plan" && i <= 1) ||
                 (step === "review" && i <= 2) ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: '0.9rem' }}>{s}</span>
            </div>
          ))}
        </div>

        {/* Step: Organization Details */}
        {step === "details" && (
          <div className="card">
            <h3 className="card-title">Organization Details</h3>
            <p className="text-muted mb-3">
              Enter your organization information. This will be visible to voters.
            </p>

            {error && <div className="alert alert-error mb-2">{error}</div>}

            <div className="form-group">
              <label className="label">Organization Name *</label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., FAST National University"
              />
            </div>

            <div className="form-group">
              <label className="label">Organization Type</label>
              <select
                className="input"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="">Select type...</option>
                <option value="university">University</option>
                <option value="company">Company</option>
                <option value="government">Government</option>
                <option value="ngo">NGO / Non-Profit</option>
                <option value="association">Association</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label">Description</label>
              <textarea
                className="input"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of your organization"
                rows={3}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="label">Country</label>
                <input
                  type="text"
                  className="input"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="label">City</label>
                <input
                  type="text"
                  className="input"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g., Lahore"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Contact Email</label>
              <input
                type="email"
                className="input"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder={user?.email || "admin@organization.com"}
              />
            </div>

            <div className="form-group">
              <label className="label">Password * (for organization admin login)</label>
              <input
                type="password"
                className="input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 6 characters"
              />
              <small className="text-muted">You'll use this to login to your organization dashboard</small>
            </div>

            <div className="form-group">
              <label className="label">Confirm Password *</label>
              <input
                type="password"
                className="input"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Re-enter your password"
              />
            </div>

            <button 
              className="btn btn-primary btn-block"
              onClick={() => setStep("plan")}
            >
              Continue to Plan Selection →
            </button>
          </div>
        )}

        {/* Step: Plan Selection */}
        {step === "plan" && (
          <div className="card">
            <h3 className="card-title">Select Your Plan</h3>
            <p className="text-muted mb-3">
              Choose a plan that fits your needs. You can upgrade anytime.
            </p>

            <div className="plans-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16
            }}>
              {plans.map((plan) => (
                <div 
                  key={plan.id}
                  className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                  style={{
                    padding: 20,
                    background: selectedPlan === plan.id 
                      ? 'rgba(102, 126, 234, 0.15)' 
                      : 'var(--surface)',
                    border: `2px solid ${selectedPlan === plan.id 
                      ? 'var(--primary)' 
                      : 'var(--border)'}`,
                    borderRadius: 12,
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s'
                  }}
                >
                  {plan.popular && (
                    <div style={{
                      position: 'absolute',
                      top: -10,
                      right: 16,
                      background: 'var(--accent)',
                      color: '#0f0f1a',
                      padding: '2px 12px',
                      borderRadius: 12,
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}>
                      POPULAR
                    </div>
                  )}
                  <h4 style={{ margin: '0 0 4px 0' }}>{plan.name}</h4>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {plan.price}
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{plan.period}</span>
                  </div>
                  <ul style={{ 
                    margin: '12px 0', 
                    padding: 0, 
                    listStyle: 'none',
                    fontSize: '0.85rem'
                  }}>
                    {plan.features.map((f, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>✓ {f}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-3">
              <button 
                className="btn btn-outline"
                onClick={() => setStep("details")}
              >
                ← Back
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => setStep("review")}
              >
                Continue to Review →
              </button>
            </div>
          </div>
        )}

        {/* Step: Review */}
        {step === "review" && (
          <div className="card">
            <h3 className="card-title">Review & Create</h3>
            <p className="text-muted mb-3">
              Please review your organization details before creating.
            </p>

            <div className="review-section" style={{
              background: 'var(--surface)',
              padding: 16,
              borderRadius: 8,
              marginBottom: 16
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--muted)', fontSize: '0.85rem' }}>
                ORGANIZATION DETAILS
              </h4>
              <div style={{ display: 'grid', gap: 12 }}>
                <div>
                  <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Name:</span>
                  <span style={{ marginLeft: 8, fontWeight: 600 }}>{formData.name}</span>
                </div>
                {formData.type && (
                  <div>
                    <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Type:</span>
                    <span style={{ marginLeft: 8 }}>{formData.type}</span>
                  </div>
                )}
                <div>
                  <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Location:</span>
                  <span style={{ marginLeft: 8 }}>{formData.city}, {formData.country}</span>
                </div>
              </div>
            </div>

            <div className="review-section" style={{
              background: 'var(--surface)',
              padding: 16,
              borderRadius: 8,
              marginBottom: 16
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--muted)', fontSize: '0.85rem' }}>
                SELECTED PLAN
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                    {plans.find(p => p.id === selectedPlan)?.name}
                  </span>
                  <span style={{ marginLeft: 8, color: 'var(--muted)' }}>
                    {plans.find(p => p.id === selectedPlan)?.price}
                  </span>
                </div>
                <span className="badge badge-blue">{selectedPlan}</span>
              </div>
            </div>

            {error && <div className="alert alert-error mb-2">{error}</div>}

            <div className="flex gap-2">
              <button 
                className="btn btn-outline"
                onClick={() => setStep("plan")}
              >
                ← Back
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Organization"}
              </button>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="card text-center">
            <div style={{ fontSize: "4rem", marginBottom: 16 }}>🎉</div>
            <h2 className="section-title">Organization Created!</h2>
            <p className="text-muted mt-2 mb-3">
              Your organization has been created successfully. You can now start creating elections.
            </p>
            <div className="alert alert-success">
              ✓ Organization registered<br />
              ✓ Plan activated<br />
              ✓ Redirecting to dashboard...
            </div>
          </div>
        )}

        {/* Back Link */}
        {step !== "success" && (
          <button 
            className="btn btn-outline mt-3"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
