import React, { useState } from 'react';
import { X, CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const GoogleConnectModal = () => {
  const { isGoogleModalOpen, closeGoogleModal, connectGoogleAccount, candidateName } = useAuth();
  const navigate = useNavigate();

  const savedName = candidateName || localStorage.getItem('candidate_name') || '';
  const savedEmail = localStorage.getItem('candidate_email') || '';

  const [name, setName] = useState(savedName || 'Mallhar Patankar');
  const [email, setEmail] = useState(savedEmail || 'mallpat2008@gmail.com');
  const [loading, setLoading] = useState(false);

  if (!isGoogleModalOpen) return null;

  const handleConnect = async (e) => {
    e?.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setLoading(true);
    try {
      await connectGoogleAccount({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        photoURL: null
      });
      closeGoogleModal();
      navigate('/profile-setup', {
        state: {
          fullName: name.trim(),
          email: email.trim().toLowerCase()
        }
      });
    } catch (err) {
      console.error('Failed to connect Google account:', err);
    } finally {
      setLoading(false);
    }
  };

  const initialLetter = (name.trim().charAt(0) || 'G').toUpperCase();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10000,
      background: 'rgba(3, 7, 18, 0.82)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.25rem'
    }}>
      <div style={{
        background: '#0D1322',
        border: '1.5px solid rgba(0, 245, 160, 0.4)',
        borderRadius: '24px',
        padding: '1.75rem',
        width: '100%',
        maxWidth: '380px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 35px rgba(0, 245, 160, 0.15)',
        position: 'relative',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Close button */}
        <button
          onClick={closeGoogleModal}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94A3B8',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <X size={18} />
        </button>

        {/* Google G Header & Badge */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.85rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
          </div>

          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#FFFFFF',
            marginBottom: '0.35rem'
          }}>
            Connect Google Account
          </h2>
          <p style={{
            fontSize: '0.82rem',
            color: '#94A3B8',
            lineHeight: 1.45
          }}>
            Link your Google account to calibrate your interview profile and track your progress.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleConnect} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.78rem',
              color: '#CBD5E1',
              fontWeight: 600,
              marginBottom: '0.35rem'
            }}>
              Google Display Name
            </label>
            <input
              type="text"
              className="dark-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mallhar Patankar"
              required
              style={{
                width: '100%',
                padding: '0.75rem 0.9rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#FFF',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.78rem',
              color: '#CBD5E1',
              fontWeight: 600,
              marginBottom: '0.35rem'
            }}>
              Google Email Address
            </label>
            <input
              type="email"
              className="dark-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. yourname@gmail.com"
              required
              style={{
                width: '100%',
                padding: '0.75rem 0.9rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#FFF',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* Quick Preview Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '0.65rem 0.85rem',
            borderRadius: '12px',
            background: 'rgba(0, 245, 160, 0.06)',
            border: '1px solid rgba(0, 245, 160, 0.2)',
            marginTop: '0.2rem'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at center, rgba(0, 245, 160, 0.3) 0%, #0D1322 80%)',
              border: '1.5px solid #00F5A0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00F5A0',
              fontWeight: 800,
              fontSize: '0.9rem',
              flexShrink: 0
            }}>
              {initialLetter}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {name || 'Google Candidate'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#00F5A0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {email || 'connecting...'}
              </div>
            </div>
            <CheckCircle size={16} color="#00F5A0" />
          </div>

          {/* Connect Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-teal-glow"
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '14px',
              fontSize: '0.95rem',
              fontWeight: 700,
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Sparkles size={16} />
            <span>{loading ? 'Connecting...' : 'Connect & Continue'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
