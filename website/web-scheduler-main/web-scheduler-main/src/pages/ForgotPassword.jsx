import React, { useState } from 'react';
import './Login.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

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
      setStatus({ type: 'success', msg: data.message || 'If the email exists, a reset link was sent' });
    } catch (err) {
      setStatus({ type: 'error', msg: 'Failed to request reset link' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Forgot Password</h2>
      {status && <p className={`message ${status.type}`}>{status.msg}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
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
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  );
}
