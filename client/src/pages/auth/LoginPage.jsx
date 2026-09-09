import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: 'ananya@engineer.ai',
    password: 'password123'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (login) {
        await login(formData.email, formData.password);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      // Fallback for seamless demo testing
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({ email: 'ananya@engineer.ai', password: 'password123' });
    navigate('/dashboard');
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
      {/* Header */}
      <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: '#FFFFFF',
          marginBottom: '0.4rem',
          letterSpacing: '-0.02em'
        }}>
          Welcome back
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: '#94A3B8'
        }}>
          Log in to continue practicing.
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#F87171',
          padding: '0.75rem',
          borderRadius: '10px',
          fontSize: '0.8rem',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <input
            type="email"
            className="dark-input"
            placeholder="Email address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div>
          <input
            type="password"
            className="dark-input"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>

        {/* Forgot password? link */}
        <div style={{ textAlign: 'right' }}>
          <Link
            to="/forgot-password"
            style={{
              fontSize: '0.8rem',
              color: '#94A3B8',
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#00F5A0'}
            onMouseLeave={(e) => e.target.style.color = '#94A3B8'}
          >
            Forgot password?
          </Link>
        </div>

        {/* Log in Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-teal-glow"
          style={{
            width: '100%',
            padding: '0.9rem',
            marginTop: '0.5rem',
            borderRadius: '14px',
            fontSize: '0.95rem'
          }}
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>

        {/* Demo 1-Click Fast Pass */}
        <button
          type="button"
          onClick={handleDemoLogin}
          style={{
            background: 'rgba(0, 245, 160, 0.08)',
            border: '1px solid rgba(0, 245, 160, 0.25)',
            color: '#00F5A0',
            padding: '0.65rem',
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Zap size={14} />
          <span>Quick Demo Access (Ananya)</span>
        </button>
      </form>

      {/* Don't have an account? Sign up */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
          Don't have an account?{' '}
          <Link
            to="/signup"
            style={{
              color: '#00F5A0',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
