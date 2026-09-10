import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, Code, Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import { useAuth, getSavedCandidateName, isInvalidOrAnanya } from '../../context/AuthContext';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, candidateName: authCandidateName } = useAuth();

  const location = useLocation();

  // Clean any legacy mock names from browser localStorage
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('candidate_name');
      if (stored && isInvalidOrAnanya(stored)) {
        localStorage.removeItem('candidate_name');
      }
    } catch (e) {}
  }, []);

  const getCandidateFirstName = () => {
    try {
      if (authCandidateName && !isInvalidOrAnanya(authCandidateName)) {
        return authCandidateName.trim().split(' ')[0];
      }
      const fromStorage = localStorage.getItem('candidate_name');
      if (fromStorage && !isInvalidOrAnanya(fromStorage)) {
        return fromStorage.trim().split(' ')[0];
      }
      const fromState = location.state?.fullName;
      if (fromState && !isInvalidOrAnanya(fromState)) {
        return fromState.trim().split(' ')[0];
      }
      const fromUser = user?.name;
      if (fromUser && !isInvalidOrAnanya(fromUser)) {
        return fromUser.trim().split(' ')[0];
      }
      const fromProfile = profile?.fullName;
      if (fromProfile && !isInvalidOrAnanya(fromProfile)) {
        return fromProfile.trim().split(' ')[0];
      }
    } catch (e) {}
    return '';
  };

  const candidateFirstName = getCandidateFirstName();
  const candidateName = candidateFirstName || 'Candidate';
  const avatarInitial = (candidateName.charAt(0) || 'C').toUpperCase();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      padding: '0.5rem 0.25rem 1rem'
    }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '0.25rem'
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 500 }}>
            Good morning
          </span>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.2
          }}>
            {candidateName}
          </h1>
        </div>

        {/* Avatar Circle */}
        <div
          onClick={() => navigate('/profile')}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at center, rgba(0, 245, 160, 0.25) 0%, #0D1322 80%)',
            border: '1.5px solid rgba(0, 245, 160, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00F5A0',
            fontWeight: 800,
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 0 15px rgba(0, 245, 160, 0.2)',
            overflow: 'hidden',
            flexShrink: 0
          }}
        >
          {(user?.avatarUrl || localStorage.getItem('candidate_avatar')) ? (
            <img
              src={user?.avatarUrl || localStorage.getItem('candidate_avatar')}
              alt={candidateName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            avatarInitial
          )}
        </div>
      </div>

      {/* Resume ATS Score Card */}
      <div style={{
        background: '#0D1322',
        border: '1px solid rgba(0, 245, 160, 0.35)',
        borderRadius: '20px',
        padding: '1.4rem',
        boxShadow: '0 0 25px rgba(0, 245, 160, 0.08)',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '0.8rem'
        }}>
          <div>
            <span style={{
              fontSize: '0.78rem',
              color: '#94A3B8',
              fontWeight: 600,
              display: 'block',
              marginBottom: '0.2rem'
            }}>
              Resume ATS score
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
              <span style={{
                fontSize: '2.1rem',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.03em'
              }}>
                78
              </span>
              <span style={{ fontSize: '1.1rem', color: '#94A3B8', fontWeight: 600 }}>
                /100
              </span>
            </div>
          </div>

          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'rgba(0, 245, 160, 0.1)',
            border: '2px solid #00F5A0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#00F5A0' }}>78%</span>
          </div>
        </div>

        {/* Improve Resume Action */}
        <button
          onClick={() => navigate('/resume-results')}
          style={{
            width: '100%',
            background: 'transparent',
            border: '1px solid rgba(0, 245, 160, 0.35)',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '0.875rem',
            padding: '0.7rem',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 245, 160, 0.1)';
            e.currentTarget.style.borderColor = '#00F5A0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(0, 245, 160, 0.35)';
          }}
        >
          <span>Improve resume</span>
          <ArrowRight size={15} color="#00F5A0" />
        </button>
      </div>

      {/* Two Stats Row: Interviews & Confidence */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.85rem'
      }}>
        {/* Interviews Card */}
        <div
          onClick={() => navigate('/history')}
          style={{
            background: '#0D1322',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            padding: '1.1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500, display: 'block' }}>
            Interviews
          </span>
          <div style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#FFFFFF',
            marginTop: '0.2rem'
          }}>
            12
          </div>
        </div>

        {/* Confidence Card */}
        <div
          onClick={() => navigate('/analytics')}
          style={{
            background: '#0D1322',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            padding: '1.1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500, display: 'block' }}>
            Confidence
          </span>
          <div style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#00F5A0',
            marginTop: '0.2rem'
          }}>
            82%
          </div>
        </div>
      </div>

      {/* Main Action Buttons (Voice mock interview & Coding round) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.25rem' }}>
        {/* Voice mock interview */}
        <button
          onClick={() => navigate('/interview-setup')}
          style={{
            background: '#0D1322',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            color: '#FFFFFF',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textAlign: 'left'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0, 245, 160, 0.4)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 245, 160, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(0, 245, 160, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00F5A0'
          }}>
            <Mic size={20} />
          </div>
          <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>
            Voice mock interview
          </span>
        </button>

        {/* Coding round */}
        <button
          onClick={() => navigate('/coding')}
          style={{
            background: '#0D1322',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            color: '#FFFFFF',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textAlign: 'left'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0, 245, 160, 0.4)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 245, 160, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <Code size={20} />
          </div>
          <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>
            Coding round
          </span>
        </button>
      </div>
    </div>
  );
};
