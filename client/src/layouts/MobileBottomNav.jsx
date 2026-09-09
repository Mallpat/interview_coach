import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  BarChart2, 
  MessageSquare, 
  User 
} from 'lucide-react';

export const MobileBottomNav = () => {
  const location = useLocation();

  // Hide bottom nav on full-focus screens
  const hideNavRoutes = [
    '/get-started', 
    '/signup', 
    '/login', 
    '/forgot-password', 
    '/profile-setup', 
    '/voice-interview'
  ];

  if (hideNavRoutes.includes(location.pathname)) {
    return null;
  }

  const tabs = [
    { to: '/dashboard', label: 'Home', icon: Home, aliases: ['/'] },
    { to: '/resume-results', label: 'Resume', icon: FileText, aliases: ['/jd-analyzer'] },
    { to: '/analytics', label: 'Analytics', icon: BarChart2, aliases: ['/history'] },
    { to: '/mentor', label: 'Mentor', icon: MessageSquare, aliases: [] },
    { to: '/profile', label: 'Profile', icon: User, aliases: ['/career-advisor', '/companies', '/gamification', '/notifications'] }
  ];

  return (
    <nav style={{
      position: 'relative',
      height: '62px',
      minHeight: '62px',
      background: 'rgba(9, 14, 26, 0.98)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '0 0.5rem',
      zIndex: 100,
      marginTop: 'auto'
    }}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.to || tab.aliases.includes(location.pathname);

        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              textDecoration: 'none',
              padding: '0.4rem 0.6rem',
              borderRadius: '10px',
              transition: 'all 0.2s ease',
              color: isActive ? '#00F5A0' : '#64748B'
            }}
          >
            <Icon
              size={22}
              color={isActive ? '#00F5A0' : '#64748B'}
              style={{
                filter: isActive ? 'drop-shadow(0 0 8px rgba(0, 245, 160, 0.6))' : 'none',
                transition: 'all 0.2s ease'
              }}
            />
          </NavLink>
        );
      })}
    </nav>
  );
};
