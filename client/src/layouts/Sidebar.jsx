import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Video, 
  Code2, 
  FileText, 
  Bot, 
  BarChart3, 
  UserCircle,
  Sparkles,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { user, profile, candidateName } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/interview', label: 'Mock Interview', icon: Video, badge: 'Live AI' },
    { to: '/coding', label: 'Coding Arena', icon: Code2, badge: 'Sandbox' },
    { to: '/resume', label: 'Resume ATS & JD', icon: FileText },
    { to: '/mentor', label: 'Career Mentor', icon: Bot, badge: '24/7' },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/profile', label: 'Profile Settings', icon: UserCircle }
  ];

  return (
    <aside style={{
      width: '260px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      background: '#090E1A',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      boxShadow: '4px 0 24px rgba(0, 0, 0, 0.4)'
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '1.5rem 1.25rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #00F2FE 0%, #6366F1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(0, 242, 254, 0.4)'
        }}>
          <Sparkles size={20} color="#050B14" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#FFF' }}>
              Interview<span style={{ color: '#00F2FE' }}>AI</span>
            </span>
            <span className="badge badge-cyan" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
              Pro
            </span>
          </div>
          <p style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: 500 }}>Career Prep Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '1.25rem 0.75rem', overflowY: 'auto' }}>
        <p style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          color: '#475569',
          letterSpacing: '0.08em',
          padding: '0 0.75rem 0.65rem'
        }}>
          Core Modules
        </p>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#00F2FE' : '#94A3B8',
                    background: isActive ? 'rgba(0, 242, 254, 0.08)' : 'transparent',
                    border: isActive ? '1px solid rgba(0, 242, 254, 0.2)' : '1px solid transparent',
                    transition: 'all 0.2s ease'
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span style={{
                      fontSize: '0.65rem',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '9999px',
                      background: 'rgba(99, 102, 241, 0.2)',
                      color: '#A5B4FC',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      fontWeight: 700
                    }}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Target Role & Readiness Box */}
      <div style={{ padding: '0.75rem 1rem' }}>
        <div style={{
          background: 'rgba(0, 242, 254, 0.04)',
          border: '1px solid rgba(0, 242, 254, 0.15)',
          borderRadius: '12px',
          padding: '0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Target Role</span>
            <Zap size={14} color="#00F2FE" />
          </div>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {profile?.targetRole || 'Full Stack Engineer'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
            <span style={{ fontSize: '0.7rem', color: '#6EE7B7', fontWeight: 600 }}>Senior Track</span>
          </div>
        </div>
      </div>

      {/* User Footer */}
      {(() => {
        const effectiveName = user?.name || candidateName || profile?.fullName || 'Candidate';
        const avatarInitial = (effectiveName.charAt(0) || 'C').toUpperCase();
        const displayEmail = user?.email || localStorage.getItem('candidate_email') || '';

        return (
          <div style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: '#070B14'
          }}>
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={effectiveName}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid rgba(0, 245, 160, 0.7)',
                  flexShrink: 0
                }}
              />
            ) : (
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at center, rgba(0, 245, 160, 0.25) 0%, #0D1322 80%)',
                border: '1.5px solid rgba(0, 245, 160, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00F5A0',
                fontWeight: 800,
                fontSize: '0.95rem',
                flexShrink: 0
              }}>
                {avatarInitial}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {effectiveName}
              </p>
              <p style={{ fontSize: '0.725rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {displayEmail}
              </p>
            </div>
          </div>
        );
      })()}
    </aside>
  );
};
