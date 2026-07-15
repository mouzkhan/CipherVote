import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useToast } from '../components/ToastProvider';
import { validateVoterRegistration } from '../utils/validation';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import '../styles/login.css';

export default function Register() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [form, setForm] = useState({
    fullName: '',
    nationalId: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    gender: '',
    organization: '',
    department: '',
    studentId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validation = useMemo(() => validateVoterRegistration(form), [form]);

  const setField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.registerVoter({ ...form, uid: user?.uid || 'anonymous' });
      pushToast('Registration submitted successfully. You will be verified before voting.', 'success');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Unable to complete voter registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Navbar />
      <div className="login-outer">
        <div className="login-card card" style={{ maxWidth: 700 }}>
          <div className="login-logo">🧾</div>
          <h1 className="login-title">Voter Registration</h1>
          <p className="text-muted text-center mt-1 mb-3">
            Create a verified registration profile before participating in an election.
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid-2">
              <div className="form-group">
                <label className="label" htmlFor="fullName">Full name</label>
                <input id="fullName" className="input" value={form.fullName} onChange={setField('fullName')} placeholder="Amina Khan" />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="nationalId">National ID / CNIC</label>
                <input id="nationalId" className="input" value={form.nationalId} onChange={setField('nationalId')} placeholder="42301..." />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="email">Email address</label>
                <input id="email" type="email" className="input" value={form.email} onChange={setField('email')} placeholder="you@example.com" />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="phone">Mobile number</label>
                <input id="phone" className="input" value={form.phone} onChange={setField('phone')} placeholder="+923001234567" />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="dateOfBirth">Date of birth</label>
                <input id="dateOfBirth" type="date" className="input" value={form.dateOfBirth} onChange={setField('dateOfBirth')} />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="gender">Gender</label>
                <input id="gender" className="input" value={form.gender} onChange={setField('gender')} placeholder="Optional" />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="address">Address</label>
                <input id="address" className="input" value={form.address} onChange={setField('address')} placeholder="Optional" />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="organization">Organization</label>
                <input id="organization" className="input" value={form.organization} onChange={setField('organization')} placeholder="Optional" />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="department">Department</label>
                <input id="department" className="input" value={form.department} onChange={setField('department')} placeholder="Optional" />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="studentId">Student / Employee ID</label>
                <input id="studentId" className="input" value={form.studentId} onChange={setField('studentId')} placeholder="Optional" />
              </div>
            </div>

            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? 'Submitting…' : 'Register Voter'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
