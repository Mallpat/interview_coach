import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileUp, CheckCircle, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth, getSavedCandidateName, isInvalidOrAnanya } from '../../context/AuthContext';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle, candidateName, setCandidateName } = useAuth();
  
  const initialName = (!isInvalidOrAnanya(candidateName) ? candidateName : null) || getSavedCandidateName();
  const [formData, setFormData] = useState({
    fullName: initialName,
    email: '',
    password: ''
  });

  useEffect(() => {
    if (candidateName && !isInvalidOrAnanya(candidateName) && formData.fullName !== candidateName) {
      setFormData(prev => ({ ...prev, fullName: candidateName }));
    }
  }, [candidateName]);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const getFirebaseErrorMessage = (err) => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Try logging in.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please provide a valid email address.';
      case 'auth/network-request-failed':
        return 'Network connection issue. Please check your internet.';
      default:
        return err?.message || 'Unable to create account. Please try again.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const candidateNameEntered = formData.fullName.trim();
    if (!candidateNameEntered) {
      setError('Please enter your full name');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // Immediately persist entered name and dispatch live update
    if (setCandidateName) setCandidateName(candidateNameEntered);
    try {
      localStorage.setItem('candidate_name', candidateNameEntered);
      if (formData.email) localStorage.setItem('candidate_email', formData.email.trim());
      window.dispatchEvent(new CustomEvent('candidate_name_updated', { detail: candidateNameEntered }));
    } catch (err) {}

    setLoading(true);
    try {
      if (register && formData.email && formData.password) {
        await register(
          formData.email.trim(), 
          formData.password, 
          candidateNameEntered,
          resumeFile
        );
      }
    } catch (err) {
      console.warn('Registration notice:', err);
    } finally {
      setLoading(false);
      // Navigate directly from previous page (Signup) to this page (Profile Setup)
      navigate('/profile-setup', {
        state: { 
          fullName: candidateNameEntered, 
          email: formData.email.trim(),
          resumeName: resumeFile?.name || 'resume_final.pdf'
        }
      });
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      if (loginWithGoogle) {
        const loggedUser = await loginWithGoogle();
        if (loggedUser) {
          const googleName = loggedUser.name || '';
          if (googleName && setCandidateName) setCandidateName(googleName);
          navigate('/profile-setup', {
            state: { fullName: googleName || localStorage.getItem('candidate_name') || '' }
          });
        }
      }
    } catch (err) {
      console.warn('Google sign up notice:', err);
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
      <div style={{ marginBottom: '1.6rem', textAlign: 'left' }}>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: '#FFFFFF',
          marginBottom: '0.4rem',
          letterSpacing: '-0.02em'
        }}>
          Create your account
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: '#94A3B8'
        }}>
          Practice realistic interviews tailored to your resume.
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

      {/* 1-Click Google Sign Up */}
      <button
        type="button"
        onClick={handleGoogleSignUp}
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
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <div>
          <input
            type="text"
            className="dark-input"
            placeholder="Full name *"
            value={formData.fullName}
            onChange={(e) => {
              const val = e.target.value;
              setFormData(prev => ({ ...prev, fullName: val }));
              if (setCandidateName) setCandidateName(val);
              try {
                localStorage.setItem('candidate_name', val);
                window.dispatchEvent(new CustomEvent('candidate_name_updated', { detail: val }));
              } catch (err) {}
            }}
            required
          />
        </div>

        <div>
          <input
            type="email"
            className="dark-input"
            placeholder="Email address *"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div>
          <input
            type="password"
            className="dark-input"
            placeholder="Password (min. 6 characters) *"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>

        {/* Upload Resume Card */}
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.85rem 1rem',
          borderRadius: '14px',
          background: resumeFile ? 'rgba(0, 245, 160, 0.08)' : '#0F1626',
          border: `1.5px dashed ${resumeFile ? '#00F5A0' : 'rgba(255, 255, 255, 0.12)'}`,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginTop: '0.2rem'
        }}>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: resumeFile ? 'rgba(0, 245, 160, 0.18)' : 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: resumeFile ? '#00F5A0' : '#94A3B8'
          }}>
            {resumeFile ? <CheckCircle size={20} color="#00F5A0" /> : <FileUp size={20} />}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#FFFFFF',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {resumeFile ? resumeFile.name : 'Attach resume (optional)'}
            </div>
            <span style={{ fontSize: '0.72rem', color: resumeFile ? '#00F5A0' : '#64748B' }}>
              {resumeFile ? 'Attached for AI analysis' : 'Upload PDF or DOCX'}
            </span>
          </div>
        </label>

        {/* Create Account Button */}
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
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      {/* Already have an account? Log In */}
      <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
        <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{
              color: '#00F5A0',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};
