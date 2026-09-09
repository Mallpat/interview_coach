import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, ShieldCheck, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Header = ({ title = 'Dashboard', subtitle }) => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: '1.75rem',
      marginBottom: '1.75rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
    }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF' }}>{title}</h1>
        <p style={{ fontSize: '0.875rem', color: '#94A3B8', marginTop: '0.2rem' }}>
          {subtitle || `Targeting ${profile?.targetRole || 'Full Stack Engineer'} • ${profile?.experience || 'Senior Level'}`}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Readiness Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 0.85rem',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '9999px'
        }}>
          <ShieldCheck size={16} color="#10B981" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6EE7B7' }}>
            Readiness: 88%
          </span>
        </div>

        {/* Quick Start CTA */}
        <button
          onClick={() => navigate('/interview')}
          className="btn-primary"
          style={{ fontSize: '0.85rem', padding: '0.55rem 1.15rem' }}
        >
          <Video size={16} />
          Start Mock Round
        </button>
      </div>
    </header>
  );
};
