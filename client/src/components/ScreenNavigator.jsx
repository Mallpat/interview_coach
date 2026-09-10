import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layers, ChevronLeft, ChevronRight, X, ExternalLink } from 'lucide-react';

export const SCREENS = [
  { id: 1, name: 'Get Started', path: '/get-started', category: 'Auth' },
  { id: 2, name: 'Signup + Resume', path: '/signup', category: 'Auth' },
  { id: 3, name: 'Login', path: '/login', category: 'Auth' },
  { id: 4, name: 'Forgot Password', path: '/forgot-password', category: 'Auth' },
  { id: 5, name: 'Profile Setup', path: '/profile-setup', category: 'Onboarding' },
  { id: 6, name: 'Home Dashboard', path: '/dashboard', category: 'Core' },
  { id: 7, name: 'Resume Analyzer Results', path: '/resume-results', category: 'Resume' },
  { id: 8, name: 'Job Description Analyzer', path: '/jd-analyzer', category: 'Resume' },
  { id: 9, name: 'Mock Interview Setup', path: '/interview-setup', category: 'Interview' },
  { id: 10, name: 'Voice Interview + Camera', path: '/voice-interview', category: 'Interview' },
  { id: 11, name: 'Coding Interview', path: '/coding', category: 'Coding' },
  { id: 12, name: 'Feedback Report', path: '/feedback-report', category: 'Interview' },
  { id: 13, name: 'Learning Plan', path: '/learning-plan', category: 'Career' },
  { id: 14, name: 'Interview History', path: '/history', category: 'Career' },
  { id: 15, name: 'Analytics Dashboard', path: '/analytics', category: 'Analytics' },
  { id: 16, name: 'AI Chat Assistant', path: '/mentor', category: 'AI Mentor' },
  { id: 17, name: 'Career Advisor', path: '/career-advisor', category: 'Career' },
  { id: 18, name: 'Company Database', path: '/companies', category: 'Practice' },
  { id: 19, name: 'Gamification', path: '/gamification', category: 'Progress' },
  { id: 20, name: 'Notifications', path: '/notifications', category: 'App' },
  { id: 21, name: 'Admin Panel', path: '/admin', category: 'Admin' },
  { id: 22, name: 'Candidate Profile', path: '/profile', category: 'Settings' }
];

export const ScreenNavigator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Find active screen index
  const currentPath = location.pathname === '/' ? '/dashboard' : location.pathname;
  const currentIndex = SCREENS.findIndex(s => s.path === currentPath || (s.path === '/dashboard' && location.pathname === '/'));
  const currentScreen = SCREENS[currentIndex !== -1 ? currentIndex : 0];

  const handlePrev = (e) => {
    e.stopPropagation();
    const prevIdx = (currentIndex - 1 + SCREENS.length) % SCREENS.length;
    const currentName = localStorage.getItem('candidate_name') || '';
    navigate(SCREENS[prevIdx].path, { state: { fullName: currentName } });
  };

  const handleNext = (e) => {
    e.stopPropagation();
    const nextIdx = (currentIndex + 1) % SCREENS.length;
    const currentName = localStorage.getItem('candidate_name') || '';
    navigate(SCREENS[nextIdx].path, { state: { fullName: currentName } });
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '12px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      maxWidth: '96vw',
      width: '420px'
    }}>
      {/* Expanded Screen Drawer */}
      {isOpen && (
        <div style={{
          background: 'rgba(9, 14, 26, 0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 245, 160, 0.4)',
          borderRadius: '20px',
          padding: '1rem',
          marginBottom: '8px',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 245, 160, 0.15)',
          maxHeight: '380px',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                background: 'rgba(0, 245, 160, 0.15)',
                color: '#00F5A0',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                fontSize: '0.7rem',
                fontWeight: 700
              }}>
                ALL 21 SCREENS
              </span>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Select any screen:</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))',
            gap: '6px'
          }}>
            {SCREENS.map((screen) => {
              const isActive = screen.id === currentScreen.id;
              return (
                <button
                  key={screen.id}
                  onClick={() => {
                    const currentName = localStorage.getItem('candidate_name') || '';
                    navigate(screen.path, { state: { fullName: currentName } });
                    setIsOpen(false);
                  }}
                  style={{
                    background: isActive ? 'linear-gradient(135deg, rgba(0, 245, 160, 0.25) 0%, rgba(0, 223, 143, 0.1) 100%)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${isActive ? '#00F5A0' : 'rgba(255, 255, 255, 0.06)'}`,
                    borderRadius: '10px',
                    padding: '0.45rem 0.5rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      color: isActive ? '#00F5A0' : '#64748B'
                    }}>
                      #{screen.id}
                    </span>
                    <span style={{
                      fontSize: '0.55rem',
                      color: isActive ? '#00F5A0' : '#475569',
                      textTransform: 'uppercase'
                    }}>
                      {screen.category}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: isActive ? '#FFFFFF' : '#CBD5E1',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {screen.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Pill Control */}
      <div style={{
        background: 'rgba(13, 19, 34, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(0, 245, 160, 0.35)',
        borderRadius: '9999px',
        padding: '0.35rem 0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6), 0 0 15px rgba(0, 245, 160, 0.2)'
      }}>
        <button
          onClick={handlePrev}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: 'none',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            cursor: 'pointer'
          }}
          title="Previous Screen"
        >
          <ChevronLeft size={16} />
        </button>

        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            padding: '0 0.5rem'
          }}
        >
          <span style={{
            background: '#00F5A0',
            color: '#050B14',
            borderRadius: '9999px',
            padding: '0.1rem 0.45rem',
            fontSize: '0.68rem',
            fontWeight: 800
          }}>
            {currentScreen.id}/{SCREENS.length}
          </span>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#FFFFFF'
          }}>
            {currentScreen.name}
          </span>
          <Layers size={14} color="#00F5A0" />
        </div>

        <button
          onClick={handleNext}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: 'none',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            cursor: 'pointer'
          }}
          title="Next Screen"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
