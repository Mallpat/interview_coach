import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mic, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const GetStartedPage = () => {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: "Ace your next interview with an AI coach",
      subtitle: "Practice with realistic mock interviews, get instant feedback and improve every session."
    },
    {
      title: "Real-time voice & camera feedback",
      subtitle: "Get evaluated on eye contact, pacing, smile, and technical answer precision."
    },
    {
      title: "Targeted learning & ATS resume boost",
      subtitle: "Close critical knowledge gaps and align your profile with top tech requirements."
    }
  ];

  const handleGoogleClick = async () => {
    try {
      const res = await loginWithGoogle();
      if (res) {
        navigate('/profile-setup', {
          state: { fullName: res.name || localStorage.getItem('candidate_name') || '' }
        });
      }
    } catch (err) {
      console.warn('Google login notice:', err);
    }
  };

  return (
    <div style={{
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '2rem 1.2rem',
      textAlign: 'center',
      position: 'relative'
    }}>
      {/* Top subtle badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '0.35rem 0.8rem',
        borderRadius: '9999px',
        background: 'rgba(0, 245, 160, 0.08)',
        border: '1px solid rgba(0, 245, 160, 0.25)',
        color: '#00F5A0',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.04em'
      }}>
        <Sparkles size={13} />
        <span>AI INTERVIEW COACH PRO</span>
      </div>

      {/* Center Hero: Glowing Mic Badge + Text */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2.5rem',
        marginTop: 'auto',
        marginBottom: 'auto',
        maxWidth: '340px'
      }}>
        {/* Glowing Mic Box */}
        <div style={{
          position: 'relative',
          width: '84px',
          height: '84px',
          borderRadius: '24px',
          background: 'radial-gradient(circle at center, rgba(0, 245, 160, 0.22) 0%, rgba(13, 19, 34, 0.95) 75%)',
          border: '1.5px solid rgba(0, 245, 160, 0.45)',
          boxShadow: '0 0 35px rgba(0, 245, 160, 0.25), inset 0 0 15px rgba(0, 245, 160, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Mic size={36} color="#00F5A0" />
        </div>

        {/* Text Content */}
        <div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            lineHeight: 1.25,
            color: '#FFFFFF',
            marginBottom: '0.9rem'
          }}>
            {slides[activeSlide].title}
          </h1>

          <p style={{
            fontSize: '0.9rem',
            color: '#94A3B8',
            lineHeight: 1.55,
            padding: '0 0.5rem'
          }}>
            {slides[activeSlide].subtitle}
          </p>
        </div>
      </div>

      {/* Bottom Controls: Carousel Dots + Buttons + Login Link */}
      <div style={{
        width: '100%',
        maxWidth: '340px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.9rem'
      }}>
        {/* Pagination Dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem' }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              style={{
                width: activeSlide === i ? '24px' : '7px',
                height: '7px',
                borderRadius: '9999px',
                background: activeSlide === i ? '#00F5A0' : 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: activeSlide === i ? '0 0 10px rgba(0, 245, 160, 0.5)' : 'none'
              }}
            />
          ))}
        </div>

        {/* Get Started Button */}
        <button
          onClick={() => navigate('/signup')}
          className="btn-teal-glow"
          style={{
            width: '100%',
            padding: '0.9rem',
            fontSize: '0.98rem',
            borderRadius: '16px'
          }}
        >
          <span>Get started</span>
          <ArrowRight size={18} />
        </button>

        {/* 1-Click Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleClick}
          style={{
            width: '100%',
            padding: '0.85rem',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            color: '#FFFFFF',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.2s ease'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Already have an account? Log In */}
        <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.25rem' }}>
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
