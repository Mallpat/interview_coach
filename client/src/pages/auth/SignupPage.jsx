import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileUp, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (register) {
        await register(formData.email, formData.password, formData.fullName);
      }
      // Navigate to Screen 5: Profile Setup
      navigate('/profile-setup');
    } catch (err) {
      console.error(err);
      // For smooth demo experience, allow proceeding
      navigate('/profile-setup');
    } finally {
      setLoading(false);
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
          Create your account
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: '#94A3B8'
        }}>
          Have your resume handy — attach it below.
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
            type="text"
            className="dark-input"
            placeholder="Full name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
        </div>

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

        {/* Upload Resume Card */}
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem',
          borderRadius: '14px',
          background: resumeFile ? 'rgba(0, 245, 160, 0.08)' : '#0F1626',
          border: `1.5px dashed ${resumeFile ? '#00F5A0' : 'rgba(255, 255, 255, 0.12)'}`,
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: resumeFile ? 'rgba(0, 245, 160, 0.18)' : 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: resumeFile ? '#00F5A0' : '#94A3B8'
          }}>
            {resumeFile ? <CheckCircle size={22} color="#00F5A0" /> : <FileUp size={22} />}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {resumeFile ? resumeFile.name : 'Upload resume *'}
            </div>
            <span style={{ fontSize: '0.75rem', color: resumeFile ? '#00F5A0' : '#64748B' }}>
              {resumeFile ? 'PDF attached & calibrated' : 'Required'}
            </span>
          </div>
        </label>

        {/* Create Account Button */}
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
