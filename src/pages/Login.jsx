import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function Login() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(password);
      localStorage.setItem('admin_token', res.data?.token || res.token);
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Wrong password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 380 }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '.3rem' }}>Admin Login</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 1.5 + 'rem' }}>
          zinbohtetaung.com — restricted access
        </p>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
              required
              placeholder="Enter admin password"
            />
          </div>
          {error && (
            <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: '.75rem' }}>
              {error}
            </p>
          )}
          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? <span className="spinner" /> : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
