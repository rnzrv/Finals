import React, { useState } from 'react';
import './ForgotPasswordModal.css';

export default function ForgotPasswordModal({ open, onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    if (!email) {
      setStatus({ type: 'error', msg: 'Please enter your email' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8081/login/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setStatus({ type: 'success', msg: data.message || 'If the email exists, a reset link was sent. Please check your inbox.' });
    } catch (err) {
      setStatus({ type: 'error', msg: 'Failed to send reset email' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="fp-modal" role="dialog" aria-modal="true">
        <div className="fp-header">
          <h3>Forgot Password</h3>
          <button className="fp-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {status && <p className={`fp-message ${status.type}`}>{status.msg}</p>}

        <form onSubmit={handleSubmit} className="fp-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
          <div className="fp-actions">
            <button type="button" className="fp-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="fp-btn primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
