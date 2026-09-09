import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Sparkles, Key, Smartphone, Monitor } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AISettingsModal } from '../components/AISettingsModal';

export const MobileTopBar = ({ isSimulator, setIsSimulator }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);

  const isHome = location.pathname === '/' || location.pathname === '/dashboard';
  const isGetStarted = location.pathname === '/get-started';

  const getTitle = () => {
    switch (location.pathname) {
      case '/':
      case '/dashboard': return 'Dashboard';
      case '/get-started': return 'Welcome';
      case '/signup': return 'Create Account';
      case '/login': return 'Sign In';
      case '/forgot-password': return 'Reset Password';
      case '/profile-setup': return 'Profile Setup';
      case '/resume-results': return 'Resume Analysis';
      case '/jd-analyzer': return 'JD Matcher';
      case '/interview-setup': return 'Interview Setup';
      case '/voice-interview': return 'Live Interview';
      case '/coding': return 'Coding Interview';
      case '/feedback-report': return 'Feedback Report';
      case '/learning-plan': return 'Learning Plan';
      case '/history': return 'Interview History';
      case '/analytics': return 'Analytics';
      case '/mentor': return 'AI Chat';
      case '/career-advisor': return 'Career Roadmap';
      case '/companies': return 'Companies';
      case '/gamification': return 'Streak & Badges';
      case '/notifications': return 'Notifications';
      case '/admin': return 'Admin Overview';
      case '/profile': return 'Profile & Settings';
      default: return 'AI Interview Coach';
    }
  };

  const hasApiKey = Boolean(localStorage.getItem('gemini_api_key'));

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 90,
        height: '52px',
        background: '#080C14',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 0.85rem'
      }}>
        {/* Left: Back button or Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {!isHome && !isGetStarted ? (
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                cursor: 'pointer'
              }}
              title="Go Back"
            >
              <ArrowLeft size={16} />
            </button>
          ) : (
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#00F5A0',
              boxShadow: '0 0 8px #00F5A0'
            }} />
          )}

          <div>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFF' }}>
              {getTitle()}
            </span>
          </div>
        </div>

        {/* Right: AI Key & Simulator Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={() => setIsAISettingsOpen(true)}
            style={{
              background: 'rgba(0, 245, 160, 0.08)',
              border: '1px solid rgba(0, 245, 160, 0.3)',
              borderRadius: '8px',
              padding: '0.25rem 0.5rem',
              color: '#00F5A0',
              fontSize: '0.68rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
            title="Configure Gemini AI Persona & API Key"
          >
            <Key size={12} />
            <span>AI Key</span>
          </button>

          <button
            onClick={() => setIsSimulator(!isSimulator)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '0.25rem 0.45rem',
              color: '#94A3B8',
              fontSize: '0.68rem',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}
            title={isSimulator ? "Switch to Fullscreen" : "Switch to Device Frame"}
          >
            {isSimulator ? <Monitor size={13} /> : <Smartphone size={13} />}
          </button>
        </div>
      </header>

      <AISettingsModal
        isOpen={isAISettingsOpen}
        onClose={() => setIsAISettingsOpen(false)}
      />
    </>
  );
};
