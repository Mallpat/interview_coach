import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, CheckCircle2, RefreshCw, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';

export const EmailVerificationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || 'alex.chen@example.com';
  const initialCode = searchParams.get('code') || '';

  const [digits, setDigits] = useState(
    initialCode && initialCode.length === 6 ? initialCode.split('') : ['', '', '', '', '', '']
  );
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
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

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    // Auto-advance focus to next input
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

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const code = digits.join('');
    if (code.length < 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.verifyEmail(email, code);
      setVerified(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setError(null);
    try {
      const res = await api.resendVerificationCode(email);
      setResendMessage(`New code generated: ${res.verificationCode || '123456'}`);
      setCountdown(45);
      if (res.verificationCode) {
        setDigits(res.verificationCode.split(''));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      minHeight: '100%',
      padding: '1.5rem 0.5rem',
      gap: '1.5rem',
      textAlign: 'center'
    }}>
      {/* Icon Badge */}
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '16px',
        background: 'rgba(0, 242, 254, 0.12)',
        border: '1px solid rgba(0, 242, 254, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
        boxShadow: '0 0 25px rgba(0, 242, 254, 0.25)'
      }}>
        {verified ? (
          <CheckCircle2 size={30} color="#10B981" />
        ) : (
          <Mail size={28} color="#00F2FE" />
        )}
      </div>

      {/* Heading */}
      <div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#FFF' }}>
          {verified ? 'Email Verified!' : 'Check Your Inbox'}
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.35rem', lineHeight: 1.5 }}>
          {verified ? (
            'Your candidate account is verified and ready. Redirecting to your dashboard...'
          ) : (
            <>We sent a 6-digit verification code to <br /><strong style={{ color: '#00F2FE' }}>{email}</strong></>
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
        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* 6-Digit PIN Boxes */}
          <div
            onPaste={handlePaste}
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.5rem'
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
                  width: '44px',
                  height: '52px',
                  borderRadius: '10px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: digit ? '2px solid #00F2FE' : '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFF',
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  textAlign: 'center',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: digit ? '0 0 10px rgba(0, 242, 254, 0.3)' : 'none'
                }}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <button
            type="submit"
            disabled={loading || digits.join('').length < 6}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
          >
            {loading ? 'Verifying...' : 'Verify & Continue'} <ArrowRight size={16} />
          </button>

          {/* 1-Click Auto-Fill Demo Code */}
          <button
            type="button"
            onClick={() => {
              setDigits(['1', '2', '3', '4', '5', '6']);
              setError(null);
            }}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.55rem', fontSize: '0.75rem' }}
          >
            <ShieldCheck size={14} color="#00F2FE" />
            Auto-fill Test Code (123456)
          </button>

          {/* Resend Code */}
          <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || resending}
              style={{
                background: 'none',
                border: 'none',
                color: countdown > 0 ? '#64748B' : '#00F2FE',
                fontWeight: 700,
                cursor: countdown > 0 ? 'default' : 'pointer',
                padding: 0
              }}
            >
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
            </button>
          </div>
        </form>
      )}

      {/* Return to Login */}
      <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
        Wrong email?{' '}
        <Link to="/signup" style={{ color: '#00F2FE', fontWeight: 600, textDecoration: 'none' }}>
          Change email address
        </Link>
      </p>
    </div>
  );
};
