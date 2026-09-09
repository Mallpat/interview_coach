import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      justifyContent: 'center',
      padding: '1.5rem 1.25rem',
      maxWidth: '380px',
      margin: '0 auto'
    }}>
      {/* Glowing Lock Icon */}
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '16px',
        background: 'radial-gradient(circle at center, rgba(0, 245, 160, 0.25) 0%, rgba(13, 19, 34, 0.95) 80%)',
        border: '1.5px solid rgba(0, 245, 160, 0.45)',
        boxShadow: '0 0 25px rgba(0, 245, 160, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem'
      }}>
        <Lock size={26} color="#00F5A0" />
      </div>

      {/* Header */}
      <div style={{ marginBottom: '1.8rem', textAlign: 'left' }}>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: '#FFFFFF',
          marginBottom: '0.4rem',
          letterSpacing: '-0.02em'
        }}>
          Reset your password
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: '#94A3B8',
          lineHeight: 1.5
        }}>
          Enter your email and we'll send a reset link.
        </p>
      </div>

      {submitted ? (
        <div style={{
          background: 'rgba(0, 245, 160, 0.08)',
          border: '1px solid rgba(0, 245, 160, 0.3)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center',
          marginBottom: '1.5rem'
        }}>
          <CheckCircle2 size={36} color="#00F5A0" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFF', marginBottom: '0.3rem' }}>
            Reset Link Sent!
          </h3>
          <p style={{ fontSize: '0.825rem', color: '#94A3B8' }}>
            Check your inbox at <strong style={{ color: '#FFF' }}>{email}</strong> for instructions to reset your password.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="btn-teal-glow"
            style={{ width: '100%', marginTop: '1.25rem', borderRadius: '12px' }}
          >
            Back to login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <input
              type="email"
              className="dark-input"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-teal-glow"
            style={{
              width: '100%',
              padding: '0.9rem',
              borderRadius: '14px',
              fontSize: '0.95rem'
            }}
          >
            {loading ? 'Sending link...' : 'Send reset link'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="btn-dark-secondary"
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '14px',
              fontSize: '0.925rem'
            }}
          >
            Back to login
          </button>
        </form>
      )}
    </div>
  );
};
