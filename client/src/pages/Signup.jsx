import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getError } from '../api';
import AuthLayout from '../components/AuthLayout.jsx';

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', hostel: '', roomNumber: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Enter your name.');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Enter a valid email address.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setBusy(true);
    try {
      await register(form);
      navigate('/complaints');
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Students sign up here. It takes a minute.">
      <form onSubmit={handleSubmit} className="form" noValidate>
        {error && <div className="alert">{error}</div>}
        <label>Full name
          <input name="name" value={form.name} onChange={handleChange} placeholder="Aarav Sharma" />
        </label>
        <label>Email
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@college.edu" />
        </label>
        <label>Password
          <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" />
        </label>
        <div className="row">
          <label>Hostel / block
            <input name="hostel" value={form.hostel} onChange={handleChange} placeholder="Block B" />
          </label>
          <label>Room number
            <input name="roomNumber" value={form.roomNumber} onChange={handleChange} placeholder="214" />
          </label>
        </div>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Creating account...' : 'Sign up'}</button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
    </AuthLayout>
  );
}
