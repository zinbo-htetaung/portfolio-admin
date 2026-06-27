import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function Login() {
  const [step, setStep]         = useState('password'); // 'password' | 'otp'
  const [password, setPassword] = useState('');
  const [code, setCode]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  async function handlePassword(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.login(password);
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Wrong password');
    } finally {
      setLoading(false);
    }
  }

  async function handleOtp(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.verifyOtp(code);
      localStorage.setItem('admin_token', res.data?.token || res.token);
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Invalid code');
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
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: '1.5rem' }}>
          {step === 'password' ? 'zinbohtetaung.com — restricted access' : 'Enter the code sent to your email'}
        </p>

        {step === 'password' ? (
          <form onSubmit={handlePassword}>
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
            {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: '.75rem' }}>{error}</p>}
            <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? <span className="spinner" /> : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtp}>
            <div className="field">
              <label>Verification Code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                autoFocus
                required
                placeholder="6-digit code"
                style={{ letterSpacing: '0.3em', fontSize: '1.1rem', textAlign: 'center' }}
              />
            </div>
            {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: '.75rem' }}>{error}</p>}
            <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? <span className="spinner" /> : 'Verify'}
            </button>
            <button
              type="button" className="btn-ghost"
              style={{ width: '100%', marginTop: '.5rem' }}
              onClick={() => { setStep('password'); setError(''); setCode(''); }}
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
