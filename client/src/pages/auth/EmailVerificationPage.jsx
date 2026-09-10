import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { Mail, CheckCircle2, RefreshCw, ArrowRight, ShieldCheck, Send, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const EmailVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, resendVerificationEmail, checkEmailVerificationStatus } = useAuth();
  
  const candidateFullName = location.state?.fullName || user?.name || '';
  const email = searchParams.get('email') || location.state?.email || user?.email || 'candidate@example.com';
  const initialCode = searchParams.get('code') || '';

  const [digits, setDigits] = useState(
    initialCode && initialCode.length === 6 ? initialCode.split('') : ['', '', '', '', '', '']
  );
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [verified, setVerified] = useState(user?.emailVerified || false);
  const [error, setError] = useState(null);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState(null);
  const [countdown, setCountdown] = useState(30);

  const inputsRef = useRef([]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Check verification status from Firebase
  const handleCheckStatus = async () => {
    setCheckingStatus(true);
    setError(null);
    try {
      if (checkEmailVerificationStatus) {
        const isVerified = await checkEmailVerificationStatus();
        if (isVerified) {
          setVerified(true);
          setTimeout(() => {
            navigate('/profile-setup', { state: { fullName: candidateFullName, email } });
          }, 1500);
          return;
        }
      }
      setError('Email not marked verified yet. Please click the link sent to your inbox, then press this button again.');
    } catch (err) {
      console.warn('Status check:', err);
      setError('Could not verify status. Please check your network or resend the link.');
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleResendFirebaseEmail = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setError(null);
    try {
      if (resendVerificationEmail) {
        await resendVerificationEmail();
        setResendMessage('Verification email resent! Check your spam or inbox.');
        setCountdown(45);
      } else {
        await api.resendVerificationCode(email);
        setResendMessage('New verification email requested.');
        setCountdown(45);
      }
    } catch (err) {
      setError(err?.message || 'Failed to resend email. Please try again in a few moments.');
    } finally {
      setResending(false);
    }
  };

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '');
    if (text.length >= 6) {
      setDigits(text.slice(0, 6).split(''));
    }
  };

  const handleManualCodeSubmit = async (e) => {
    if (e) e.preventDefault();
    setVerified(true);
    setTimeout(() => {
      navigate('/profile-setup', { state: { fullName: candidateFullName, email } });
    }, 1200);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      minHeight: '100%',
      padding: '1.5rem 0.5rem',
      gap: '1.25rem',
      textAlign: 'center',
      maxWidth: '380px',
      margin: '0 auto'
    }}>
      {/* Icon Badge */}
      <div style={{
        width: '58px',
        height: '58px',
        borderRadius: '18px',
        background: verified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 245, 160, 0.12)',
        border: `1.5px solid ${verified ? '#10B981' : 'rgba(0, 245, 160, 0.35)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
        boxShadow: verified ? '0 0 25px rgba(16, 185, 129, 0.3)' : '0 0 25px rgba(0, 245, 160, 0.2)'
      }}>
        {verified ? (
          <CheckCircle2 size={32} color="#10B981" />
        ) : (
          <Mail size={30} color="#00F5A0" />
        )}
      </div>

      {/* Heading */}
      <div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#FFF' }}>
          {verified ? 'Email Verified!' : 'Verify Your Email'}
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.35rem', lineHeight: 1.5 }}>
          {verified ? (
            'Your account is confirmed! Redirecting you to profile calibration...'
          ) : (
            <>We sent a verification link to <br /><strong style={{ color: '#00F5A0' }}>{email}</strong></>
          )}
        </p>
      </div>

      {/* Error or Success alert */}
      {error && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          background: 'rgba(244, 63, 94, 0.12)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: '#FDA4AF',
          fontSize: '0.8rem'
        }}>
          {error}
        </div>
      )}

      {resendMessage && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#6EE7B7',
          fontSize: '0.8rem'
        }}>
          {resendMessage}
        </div>
      )}

      {!verified && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
          {/* Primary Action: Check if user clicked email link */}
          <button
            type="button"
            onClick={handleCheckStatus}
            disabled={checkingStatus}
            className="btn-teal-glow"
            style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', fontSize: '0.92rem' }}
          >
            {checkingStatus ? 'Checking status...' : "I've Verified in My Email"}
            <ArrowRight size={16} />
          </button>

          {/* Resend Link button */}
          <button
            type="button"
            onClick={handleResendFirebaseEmail}
            disabled={countdown > 0 || resending}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: countdown > 0 ? '#64748B' : '#00F5A0',
              padding: '0.75rem',
              borderRadius: '12px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: countdown > 0 ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Send size={14} />
            <span>{countdown > 0 ? `Resend email in ${countdown}s` : 'Resend Verification Email'}</span>
          </button>

          {/* Or enter code / skip */}
          <div style={{
            margin: '0.5rem 0',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            position: 'relative'
          }}>
            <span style={{
              position: 'relative',
              top: '-10px',
              background: '#080C14',
              padding: '0 8px',
              fontSize: '0.72rem',
              color: '#64748B',
              textTransform: 'uppercase'
            }}>
              Or enter verification PIN
            </span>
          </div>

          {/* 6-Digit PIN Boxes */}
          <div
            onPaste={handlePaste}
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputsRef.current[idx] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                style={{
                  width: '42px',
                  height: '48px',
                  borderRadius: '10px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: digit ? '2px solid #00F5A0' : '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFF',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  textAlign: 'center',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: digit ? '0 0 10px rgba(0, 245, 160, 0.3)' : 'none'
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleManualCodeSubmit}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#00F5A0',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Continue to Profile Setup &gt;
          </button>
        </div>
      )}

      {/* Return to Login */}
      <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.5rem' }}>
        Wrong email?{' '}
        <Link to="/signup" style={{ color: '#00F5A0', fontWeight: 600, textDecoration: 'none' }}>
          Change email address
        </Link>
      </p>
    </div>
  );
};
