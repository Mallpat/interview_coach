import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const getFirebaseErrorMessage = (err) => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return 'Incorrect email or password. Please check and try again.';
      case 'auth/user-not-found':
        return 'No account exists with this email. Please sign up first.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many login attempts. Please wait a minute and try again.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      default:
        return err?.message || 'Login failed. Please verify your credentials.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password) {
      setError('Please enter both your email and password.');
      return;
    }

    setLoading(true);
    try {
      try {
        localStorage.setItem('candidate_email', formData.email.trim());
      } catch (e) {}
      if (login) {
        await login(formData.email.trim(), formData.password);
      }
      navigate('/dashboard');
    } catch (err) {
      console.warn('Login attempt:', err);
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      if (loginWithGoogle) {
        const res = await loginWithGoogle();
        if (res) {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.warn('Google login notice:', err);
    } finally {
      setGoogleLoading(false);
    }
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
      <div style={{ marginBottom: '1.8rem', textAlign: 'left' }}>
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
          Log in to continue your interview practice.
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
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* 1-Click Google Sign In */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading || loading}
        style={{
          width: '100%',
          padding: '0.8rem',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          color: '#FFFFFF',
          fontSize: '0.88rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '1.25rem',
          transition: 'all 0.2s ease'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        <span>{googleLoading ? 'Connecting Google...' : 'Continue with Google'}</span>
      </button>

      {/* Divider */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        margin: '0 0 1.25rem',
        color: '#64748B',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
        <span style={{ padding: '0 10px' }}>or with email</span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
      </div>

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
          disabled={loading || googleLoading}
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
