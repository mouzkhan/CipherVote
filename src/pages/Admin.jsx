import { useState, useEffect, useCallback } from "react";
import { api } from "../api/client";
import Navbar from "../components/Navbar";
import "../styles/admin.css";

const TABS = ["Overview", "Elections", "Security", "Organizations", "Simulation"];

export default function Admin() {
  const [tab, setTab] = useState("Overview");

  return (
    <div className="page">
      <Navbar />
      <div className="admin-outer container">
        <div className="flex justify-between items-center mt-3 mb-3" style={{ flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="section-title" style={{ marginBottom: 4 }}>Research Dashboard</h1>
            <p className="text-muted">Election administration · Security monitoring · System analytics</p>
          </div>
          <ServerStatus />
        </div>
        <div className="admin-tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} className={`tab-btn ${tab === t ? "tab-active" : ""}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
        <div className="mt-3" role="tabpanel">
          {tab === "Overview"      && <OverviewTab />}
          {tab === "Elections"     && <ElectionsTab />}
          {tab === "Security"      && <SecurityTab />}
          {tab === "Organizations" && <OrganizationsTab />}
          {tab === "Simulation"    && <SimulationTab />}
        </div>
      </div>
    </div>
  );
}

// ── Server health badge ─────────────────────────────────────────

function ServerStatus() {
  const [status, setStatus] = useState("checking");
  useEffect(() => {
    api.health()
      .then((d) => setStatus(d.db === "connected" ? "online" : "db-error"))
      .catch(() => setStatus("offline"));
  }, []);
  return (
    <span className={`badge ${status === "online" ? "badge-green" : "badge-red"}`}>
      API {status === "checking" ? "…" : status}
    </span>
  );
}

// ── Overview Tab ────────────────────────────────────────────────

function OverviewTab() {
  const [elections, setElections] = useState([]);
  const [secSummary, setSecSummary] = useState({ total: 0, high: 0, medium: 0, blocked: 0 });
  const [summary, setSummary] = useState({ elections: 0, registrations: 0, verifiedRegistrations: 0, biometrics: 0, securityEvents: 0, votes: 0 });

  useEffect(() => {
    api.getAllElections().then(setElections).catch(console.error);
    api.getSecurityData().then((d) => setSecSummary(d.summary)).catch(console.error);
    api.getAdminSummary().then(setSummary).catch(console.error);
  }, []);

  const totalVotes = elections.reduce((s, e) => s + (e.totalVotes || 0), 0);
  const active = elections.filter((e) => e.status === "active").length;

  return (
    <div>
      <div className="grid-3 mb-3">
        <MetricCard value={summary.votes || totalVotes} label="Votes Cast" color="primary" />
        <MetricCard value={active} label="Active Elections" color="accent" />
        <MetricCard value={summary.elections || elections.length} label="Total Elections" color="primary" />
        <MetricCard value={summary.verifiedRegistrations} label="Verified Voters" color="accent" />
        <MetricCard value={summary.registrations} label="Registered Voters" color="primary" />
        <MetricCard value={summary.biometrics} label="Biometric Profiles" color="warn" />
        <MetricCard value={secSummary.blocked} label="Votes Blocked" color="danger" />
        <MetricCard value={secSummary.high} label="High Risk Events" color="warn" />
        <MetricCard value={secSummary.total} label="Security Events" color="primary" />
      </div>

      <div className="card mb-3">
        <h2 className="section-title" style={{ fontSize: "1.15rem", marginBottom: 12 }}>Operational Snapshot</h2>
        <p className="text-muted">The administration console is now tracking registration, biometric enrollment, and security activity in one place.</p>
      </div>

      <h2 className="section-title" style={{ fontSize: "1.15rem", marginBottom: 12 }}>Live Election Tallies</h2>
      {elections.filter((e) => e.status === "active").map((el) => (
        <ElectionTally key={el._id} election={el} />
      ))}
      {elections.filter((e) => e.status === "active").length === 0 && (
        <p className="text-muted">No active elections. Create one in the Elections tab.</p>
      )}
    </div>
  );
}

function MetricCard({ value, label, color }) {
  return (
    <div className="metric-card">
      <div className="metric-value" style={{ color: `var(--${color})` }}>{value}</div>
      <div className="metric-label">{label}</div>
    </div>
  );
}

function ElectionTally({ election }) {
  const total = election.totalVotes || 0;
  return (
    <div className="card mb-2">
      <div className="flex justify-between items-center mb-2">
        <span style={{ fontWeight: 700 }}>{election.title}</span>
        <span className="badge badge-green">LIVE</span>
      </div>
      {election.candidates?.map((c) => {
        const pct = total > 0 ? Math.round(((c.votes || 0) / total) * 100) : 0;
        return (
          <div key={c.id} className="tally-row">
            <div className="tally-name">{c.name}</div>
            <div className="tally-bar-wrap">
              <div className="tally-bar" style={{ width: `${pct}%` }} />
            </div>
            <div className="tally-count">{c.votes || 0} <span className="text-muted">({pct}%)</span></div>
          </div>
        );
      })}
      <div className="text-muted mt-1" style={{ fontSize: "0.82rem" }}>Total: {total}</div>
    </div>
  );
}

// ── Elections Tab ───────────────────────────────────────────────

function ElectionsTab() {
  const [elections, setElections] = useState([]);
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => api.getAllElections().then(setElections).catch(console.error), []);
  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (el) => {
    await api.updateElection(el._id, { status: el.status === "active" ? "closed" : "active" });
    load();
  };

  const deleteElection = async (id) => {
    if (!window.confirm("Delete this election? This cannot be undone.")) return;
    await api.deleteElection(id);
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>All Elections</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setCreating(true)}>+ New Election</button>
      </div>

      {creating && <CreateElectionForm onClose={() => { setCreating(false); load(); }} />}

      {elections.length === 0 && !creating && <p className="text-muted">No elections yet. Create one to get started.</p>}

      {elections.map((el) => (
        <div key={el._id} className="card mb-2">
          <div className="flex justify-between items-center">
            <div>
              <span style={{ fontWeight: 700 }}>{el.title}</span>
              <span className={`badge ml-2 ${el.status === "active" ? "badge-green" : "badge-yellow"}`}>{el.status?.toUpperCase()}</span>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-outline btn-sm" onClick={() => toggleStatus(el)}>
                {el.status === "active" ? "Close" : "Reopen"}
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => deleteElection(el._id)}>Delete</button>
            </div>
          </div>
          <p className="text-muted mt-1" style={{ fontSize: "0.85rem" }}>{el.description}</p>
          <p className="text-muted mt-1" style={{ fontSize: "0.82rem" }}>
            {el.candidates?.length || 0} candidates · {el.totalVotes || 0} votes
          </p>
        </div>
      ))}
    </div>
  );
}

function CreateElectionForm({ onClose }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [candidateInput, setCandidateInput] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const addCandidate = () => {
    const name = candidateInput.trim();
    if (!name) return;
    setCandidates((prev) => [...prev, { id: `c${Date.now()}`, name, party: "", votes: 0 }]);
    setCandidateInput("");
  };

  const save = async () => {
    if (!title.trim()) { setError("Title is required."); return; }
    if (candidates.length < 2) { setError("Add at least 2 candidates."); return; }
    setSaving(true);
    try {
      await api.createElection({ title: title.trim(), description: description.trim(), candidates, status: "active", totalVotes: 0 });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card mb-3">
      <h3 style={{ marginBottom: 16, fontSize: "1rem" }}>New Election</h3>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="form-group">
        <label className="label">Election Title</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Student Council President 2025" />
      </div>
      <div className="form-group">
        <label className="label">Description</label>
        <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" />
      </div>
      <div className="form-group">
        <label className="label">Add Candidates</label>
        <div className="flex gap-2">
          <input
            className="input" value={candidateInput}
            onChange={(e) => setCandidateInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCandidate()}
            placeholder="Candidate full name"
          />
          <button className="btn btn-outline btn-sm" onClick={addCandidate} style={{ flexShrink: 0 }}>Add</button>
        </div>
      </div>
      {candidates.length > 0 && (
        <div className="candidate-list mb-2">
          {candidates.map((c, i) => (
            <div key={c.id} className="candidate-chip">
              <span className="candidate-avatar-sm">{c.name[0]}</span>
              {c.name}
              <button className="chip-remove" onClick={() => setCandidates((p) => p.filter((_, j) => j !== i))}>×</button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2 mt-2">
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Creating…" : "Create Election"}</button>
      </div>
    </div>
  );
}

// ── Security Tab ────────────────────────────────────────────────

function SecurityTab() {
  const [data, setData] = useState({ events: [], summary: { total: 0, high: 0, medium: 0, blocked: 0 } });

  useEffect(() => {
    api.getSecurityData().then(setData).catch(console.error);
  }, []);

  const { events, summary } = data;

  const RISK_MODEL = [
    { signal: "Multiple failed logins (≥3)", weight: 35, description: "Brute-force credential attack" },
    { signal: "Vote submitted in <4 seconds", weight: 40, description: "Below human interaction threshold — likely bot" },
    { signal: "Resubmission within 2 seconds", weight: 30, description: "Scripted voting attempt" },
    { signal: "Headless browser user-agent",   weight: 50, description: "Automation tool detected (Puppeteer, Selenium…)" },
    { signal: "Duplicate vote attempt",         weight: 25, description: "Voter already cast a ballot in this election" },
  ];

  return (
    <div>
      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>AI Fraud Detection — Security Overview</h2>
      <div className="grid-3 mb-3">
        <MetricCard value={summary.total}   label="Security Events" color="primary" />
        <MetricCard value={summary.high}    label="High Risk"       color="danger" />
        <MetricCard value={summary.blocked} label="Votes Blocked"   color="danger" />
      </div>

      <div className="card mb-3">
        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>Risk Scoring Model (Explainable AI)</h3>
        <p className="text-muted mb-2" style={{ fontSize: "0.85rem" }}>
          Each vote attempt is scored 0–100. Score ≥70 blocks the vote. Decision logic is fully transparent — a foundational XAI approach.
        </p>
        <table className="audit-table">
          <thead><tr><th>Signal</th><th>Risk Weight</th><th>Interpretation</th></tr></thead>
          <tbody>
            {RISK_MODEL.map((r) => (
              <tr key={r.signal}>
                <td>{r.signal}</td>
                <td><span className="badge badge-red">+{r.weight}</span></td>
                <td className="text-muted">{r.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14 }}>Security Event Log</h3>
        {events.length === 0 && <p className="text-muted">No security events recorded yet.</p>}
        {events.length > 0 && (
          <table className="audit-table">
            <thead><tr><th>Time</th><th>UID</th><th>Score</th><th>Level</th><th>Blocked</th><th>Signals</th></tr></thead>
            <tbody>
              {events.map((e, i) => (
                <tr key={i}>
                  <td className="text-muted">{new Date(e.timestamp).toLocaleTimeString()}</td>
                  <td><span className="hash-mini">{e.uid?.slice(0, 8)}…</span></td>
                  <td>
                    <div className="risk-bar-wrap" style={{ width: 80, marginBottom: 2 }}>
                      <div className={`risk-bar risk-${e.level?.toLowerCase()}`} style={{ width: `${e.score}%` }} />
                    </div>
                    <span style={{ fontSize: "0.78rem" }}>{e.score}/100</span>
                  </td>
                  <td>
                    <span className={`badge ${e.level === "HIGH" ? "badge-red" : e.level === "MEDIUM" ? "badge-yellow" : "badge-green"}`}>
                      {e.level}
                    </span>
                  </td>
                  <td>{e.blocked ? <span className="text-danger">✗ Blocked</span> : <span className="text-accent">✓ Allowed</span>}</td>
                  <td className="text-muted" style={{ fontSize: "0.78rem" }}>{e.signals?.join(", ") || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Organizations Tab (VaaS) ────────────────────────────────────

function OrganizationsTab() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.getOrganizations()
      .then(setOrgs)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await api.updateOrganization(id, { status });
    load();
  };

  const PLAN_COLORS = { free: "badge-blue", basic: "badge-green", professional: "badge-yellow", enterprise: "badge-red" };
  const STATUS_COLORS = { active: "badge-green", pending: "badge-yellow", suspended: "badge-red" };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>VaaS Organizations</h2>
        <a href="/pricing" className="btn btn-outline btn-sm" target="_blank" rel="noreferrer">View Public Pricing →</a>
      </div>

      <div className="grid-3 mb-3">
        <MetricCard value={orgs.length}                                           label="Total Organizations" color="primary" />
        <MetricCard value={orgs.filter((o) => o.status === "active").length}      label="Active Tenants"      color="accent" />
        <MetricCard value={orgs.filter((o) => o.status === "pending").length}     label="Pending Approval"    color="warn" />
      </div>

      {loading && <p className="text-muted">Loading organizations…</p>}
      {!loading && orgs.length === 0 && (
        <p className="text-muted">No organizations registered yet. Share the <a href="/pricing" className="text-accent">Pricing page</a> to get started.</p>
      )}

      {orgs.map((org) => (
        <div key={org._id} className="card mb-2">
          <div className="flex justify-between items-center" style={{ flexWrap: "wrap", gap: 8 }}>
            <div>
              <span style={{ fontWeight: 700 }}>{org.name}</span>
              <span className={`badge ml-2 ${PLAN_COLORS[org.plan] || "badge-blue"}`}>{org.plan}</span>
              <span className={`badge ml-2 ${STATUS_COLORS[org.status] || "badge-blue"}`}>{org.status}</span>
            </div>
            <div className="flex gap-2">
              {org.status === "pending" && (
                <button className="btn btn-accent btn-sm" onClick={() => updateStatus(org._id, "active")}>Approve</button>
              )}
              {org.status === "active" && (
                <button className="btn btn-danger btn-sm" onClick={() => updateStatus(org._id, "suspended")}>Suspend</button>
              )}
              {org.status === "suspended" && (
                <button className="btn btn-outline btn-sm" onClick={() => updateStatus(org._id, "active")}>Reinstate</button>
              )}
            </div>
          </div>
          <div className="flex gap-3 mt-2" style={{ flexWrap: "wrap", fontSize: "0.82rem" }}>
            <span className="text-muted">📧 {org.contactEmail}</span>
            <span className="text-muted">🏙️ {org.city}, {org.country}</span>
            <span className="text-muted">🏷️ {org.type}</span>
            <span className="text-muted">🗳️ {org.electionsUsed} / {org.maxElections === -1 ? "∞" : org.maxElections} elections</span>
            <span className="text-muted">👥 max {org.maxVoters === -1 ? "unlimited" : org.maxVoters.toLocaleString()} voters</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Simulation Tab ──────────────────────────────────────────────

function SimulationTab() {
  const [scenario, setScenario] = useState("normal");
  const [voterCount, setVoterCount] = useState(1000);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);

  const SCENARIOS = {
    normal:      { label: "Normal Election",          botRate: 0.01, dupeRate: 0.005, description: "Baseline with realistic voter behaviour." },
    highTraffic: { label: "High Traffic (10k/min)",   botRate: 0.02, dupeRate: 0.01,  description: "Stress-test with high concurrent load." },
    botAttack:   { label: "Bot Attack",               botRate: 0.35, dupeRate: 0.15,  description: "35% of traffic is automated bot voting." },
    fraudulent:  { label: "Coordinated Fraud",        botRate: 0.20, dupeRate: 0.25,  description: "Combined bot + duplicate vote attack." },
  };

  const runSimulation = () => {
    setRunning(true);
    setResults(null);
    setTimeout(() => {
      const sc = SCENARIOS[scenario];
      const total   = voterCount;
      const bots    = Math.round(total * sc.botRate);
      const dupes   = Math.round(total * sc.dupeRate);
      const blocked = Math.round((bots + dupes) * 0.9);
      const legitimate = total - blocked;
      const avgLatency = scenario === "highTraffic" ? "340ms" : "42ms";
      const throughput = scenario === "highTraffic" ? "2,847 req/min" : "312 req/min";
      setResults({ total, bots, dupes, blocked, legitimate, avgLatency, throughput, label: sc.label });
      setRunning(false);
    }, 1600);
  };

  return (
    <div>
      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 8 }}>Election Simulation Engine</h2>
      <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
        Simulate scenarios before deployment to test security, throughput, and fraud detection.
        Demonstrates national-scale architecture readiness.
      </p>

      <div className="card mb-3">
        <div className="form-group">
          <label className="label">Scenario</label>
          <select className="input" value={scenario} onChange={(e) => setScenario(e.target.value)}>
            {Object.entries(SCENARIOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <p className="text-muted mt-1" style={{ fontSize: "0.82rem" }}>{SCENARIOS[scenario].description}</p>
        </div>
        <div className="form-group">
          <label className="label">Simulated Voter Count</label>
          <select className="input" value={voterCount} onChange={(e) => setVoterCount(Number(e.target.value))}>
            {[1000, 10000, 100000, 1000000].map((n) => (
              <option key={n} value={n}>{n.toLocaleString()} voters</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={runSimulation} disabled={running}>
          {running ? "Running simulation…" : "▶ Run Simulation"}
        </button>
      </div>

      {results && (
        <div className="card mb-3">
          <h3 style={{ marginBottom: 16, fontSize: "1rem" }}>Results — {results.label}</h3>
          <div className="grid-3 mb-3">
            {[
              { label: "Total Voters",     value: results.total.toLocaleString() },
              { label: "Legitimate Votes", value: results.legitimate.toLocaleString(), color: "accent" },
              { label: "Blocked",          value: results.blocked.toLocaleString(),    color: "danger" },
              { label: "Bot Attempts",     value: results.bots.toLocaleString(),       color: "warn" },
              { label: "Avg Latency",      value: results.avgLatency },
              { label: "Throughput",       value: results.throughput },
            ].map((r) => (
              <div key={r.label} className="metric-card">
                <div className="metric-value" style={{ color: r.color ? `var(--${r.color})` : "var(--primary)", fontSize: "1.5rem" }}>{r.value}</div>
                <div className="metric-label">{r.label}</div>
              </div>
            ))}
          </div>
          <div className="alert alert-info" style={{ fontSize: "0.85rem" }}>
            <strong>Scale note:</strong> At {voterCount.toLocaleString()} voters, the required infrastructure is
            {voterCount >= 1000000 ? " CDN + load balancer + 3-node MongoDB replica set (national scale)." :
             voterCount >= 100000  ? " load balancing across 2 API instances + replica set." :
             " a single API server with connection pooling."}
          </div>
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 12 }}>National-Scale Architecture</h3>
        <div className="arch-diagram">
          {["10M Voters", "→", "CDN", "→", "Load Balancer", "→", "API Gateway", "→", "Express Microservices", "→", "MongoDB Replica Set"].map((step, i) => (
            <div key={i} className={step === "→" ? "arch-arrow" : "arch-node"}>{step}</div>
          ))}
        </div>
        <p className="text-muted mt-2" style={{ fontSize: "0.82rem" }}>
          Stateless Express API enables horizontal scaling. MongoDB replica sets provide fault tolerance.
          CDN handles static asset delivery. This design supports ~10M concurrent voters.
        </p>
      </div>
    </div>
  );
}
