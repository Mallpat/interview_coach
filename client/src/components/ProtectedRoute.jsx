import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, isInvalidName } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { user, profile, candidateName, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '1rem',
        color: '#94A3B8'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          border: '3px solid rgba(0, 245, 160, 0.2)',
          borderTopColor: '#00F5A0',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94A3B8' }}>
          Verifying session...
        </span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/get-started" state={{ from: location }} replace />;
  }

  // Profile completeness check: requires completed flag and valid full name
  const rawName = candidateName || profile?.fullName || localStorage.getItem('candidate_name');
  const hasValidName = rawName && typeof rawName === 'string' && rawName.trim().length >= 2 && !isInvalidName(rawName);
  const isProfileComplete = Boolean(
    (profile?.profileCompleted || localStorage.getItem('candidate_profile_completed') === 'true') &&
    hasValidName
  );

  // If user is trying to access any protected screen without completing profile setup, force setup first
  if (location.pathname !== '/profile-setup' && !isProfileComplete) {
    return <Navigate to="/profile-setup" replace />;
  }

  return children;
};

export default ProtectedRoute;
