import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './ResetPassword.css';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    if (!password || password.length < 6) {
      setStatus({ type: 'error', msg: 'Password must be at least 6 characters' });
      return;
    }
    if (password !== confirm) {
      setStatus({ type: 'error', msg: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8081/login/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reset password');
      setStatus({ type: 'success', msg: 'Password reset successful. Redirecting to login...' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const msg = err.message.includes('Invalid') || err.message.includes('expired')
        ? 'Reset link is invalid or expired. Please request a new one.'
        : err.message;
      setStatus({ type: 'error', msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <h2>Reset Password</h2>
      {status && <p className={`reset-message ${status.type}`}>{status.msg}</p>}
      <form onSubmit={handleSubmit} className="reset-form">
        <label>
          New Password
          <div className="reset-input-row">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
            <button type="button" className="toggle" onClick={() => setShowPw(v => !v)}>
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>
        <label>
          Confirm Password
          <div className="reset-input-row">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              required
            />
            <button type="button" className="toggle" onClick={() => setShowConfirm(v => !v)}>
              {showConfirm ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>
        <div className="reset-actions">
          <Link to="/forgot-password" className="link">Need a new link?</Link>
          <button type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      </form>
    </div>
  );
}
