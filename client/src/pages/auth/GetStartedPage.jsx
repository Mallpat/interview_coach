import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mic, Sparkles, ArrowRight } from 'lucide-react';

export const GetStartedPage = () => {
  const navigate = useNavigate();
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

      {/* Bottom Controls: Carousel Dots + Button + Login Link */}
      <div style={{
        width: '100%',
        maxWidth: '340px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem'
      }}>
        {/* Pagination Dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            padding: '0.95rem',
            fontSize: '1rem',
            borderRadius: '16px'
          }}
        >
          <span>Get started</span>
          <ArrowRight size={18} />
        </button>

        {/* Already have an account? Log In */}
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
