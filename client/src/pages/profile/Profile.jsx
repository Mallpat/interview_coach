import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Key, Flame, Compass, Building2, Bell, LogOut, Check, ChevronRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AISettingsModal } from '../../components/AISettingsModal';

export const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);

  const candidateName = user?.name || profile?.fullName || 'Candidate';
  const role = profile?.targetRole || 'Full Stack Engineer';

  const menuItems = [
    { label: 'Admin Panel Overview', path: '/admin', icon: ShieldCheck, badge: 'Web' },
    { label: 'Career Advisor & Roadmap', path: '/career-advisor', icon: Compass, badge: 'Roadmap' },
    { label: 'Target Company Database', path: '/companies', icon: Building2, badge: 'FAANG' },
    { label: 'Gamification & Badges', path: '/gamification', icon: Flame, badge: '7d Streak' },
    { label: 'Notifications & Reminders', path: '/notifications', icon: Bell, badge: '2 New' }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      padding: '0.75rem 0.25rem 1.5rem',
      textAlign: 'left'
    }}>
      {/* Profile Header Card */}
      <div style={{
        background: '#0D1322',
        border: '1px solid rgba(0, 245, 160, 0.3)',
        borderRadius: '20px',
        padding: '1.4rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.1rem',
        boxShadow: '0 0 25px rgba(0, 245, 160, 0.08)'
      }}>
        {/* Avatar */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(0, 245, 160, 0.25) 0%, #0D1322 80%)',
          border: '2px solid #00F5A0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#00F5A0',
          fontWeight: 800,
          fontSize: '1.4rem',
          flexShrink: 0
        }}>
          {candidateName.charAt(0)}
        </div>

        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>
            {candidateName}
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>
            {role}
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            marginTop: '6px',
            fontSize: '0.7rem',
            color: '#00F5A0',
            fontWeight: 700
          }}>
            <span>● Profile Calibrated</span>
          </div>
        </div>
      </div>

      {/* Stretch Features Menu */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600, paddingLeft: '4px' }}>
          Explore Modules
        </span>

        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                background: '#0D1322',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '0.9rem 1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(0, 245, 160, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00F5A0'
                }}>
                  <Icon size={16} />
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#E2E8F0' }}>
                  {item.label}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontSize: '0.7rem',
                  color: '#00F5A0',
                  background: 'rgba(0, 245, 160, 0.1)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                  fontWeight: 600
                }}>
                  {item.badge}
                </span>
                <ChevronRight size={16} color="#64748B" />
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Engine & API Key Button */}
      <button
        onClick={() => setIsAISettingsOpen(true)}
        style={{
          background: '#0D1322',
          border: '1px solid rgba(0, 245, 160, 0.25)',
          borderRadius: '16px',
          padding: '0.9rem 1.1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#FFFFFF',
          cursor: 'pointer',
          marginTop: '0.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Key size={18} color="#00F5A0" />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            Configure Gemini AI Persona
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#00F5A0', fontWeight: 700 }}>
          Active
        </span>
      </button>

      {/* Logout / Switch User */}
      <button
        onClick={() => {
          if (logout) logout();
          navigate('/login');
        }}
        className="btn-dark-secondary"
        style={{
          width: '100%',
          padding: '0.8rem',
          borderRadius: '14px',
          marginTop: '0.5rem',
          color: '#94A3B8'
        }}
      >
        <LogOut size={16} />
        <span>Log Out</span>
      </button>

      <AISettingsModal
        isOpen={isAISettingsOpen}
        onClose={() => setIsAISettingsOpen(false)}
      />
    </div>
  );
};
