import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, Code, Sparkles, ArrowRight, TrendingUp, Code2, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  getActiveResumeAnalysis, 
  getStoredInterviewHistory, 
  analyzeResumeForInterviews, 
  saveResumeAnalysis 
} from '../../services/resumeAnalysisService';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, candidateName: authCandidateName } = useAuth();
  const location = useLocation();

  // Dynamic User Interview History State (Defaults to 0 for every new user!)
  const [interviewHistory, setInterviewHistory] = useState(() => getStoredInterviewHistory());
  
  // Real-time resume analysis state
  const [activeAnalysis, setActiveAnalysis] = useState(() => {
    let current = getActiveResumeAnalysis();
    if (!current) {
      const storedText = localStorage.getItem('candidate_resume_text');
      if (storedText && storedText.length > 20) {
        const role = localStorage.getItem('candidate_role') || 'Full Stack Engineer';
        const scanned = analyzeResumeForInterviews(storedText, localStorage.getItem('candidate_resume') || 'Resume.pdf', role);
        saveResumeAnalysis(scanned);
        current = scanned;
      }
    }
    return current;
  });

  useEffect(() => {
    const handleInterviewUpdate = (e) => {
      if (e?.detail) setInterviewHistory(e.detail);
      else setInterviewHistory(getStoredInterviewHistory());
    };
    const handleAnalysisUpdate = (e) => {
      if (e?.detail) setActiveAnalysis(e.detail);
      else setActiveAnalysis(getActiveResumeAnalysis());
    };

    window.addEventListener('interview_history_updated', handleInterviewUpdate);
    window.addEventListener('resume_analysis_updated', handleAnalysisUpdate);
    window.addEventListener('storage', handleInterviewUpdate);
    return () => {
      window.removeEventListener('interview_history_updated', handleInterviewUpdate);
      window.removeEventListener('resume_analysis_updated', handleAnalysisUpdate);
      window.removeEventListener('storage', handleInterviewUpdate);
    };
  }, []);

  const interviewCount = interviewHistory.length;
  const atsScore = activeAnalysis?.atsScore || (localStorage.getItem('candidate_ats_score') ? Number(localStorage.getItem('candidate_ats_score')) : null);
  
  // Calculate true confidence based on completed interviews, or 0% for new candidates
  const confidenceScore = interviewCount > 0
    ? Math.round(interviewHistory.reduce((sum, item) => sum + (Number(item.score) || 70), 0) / interviewCount)
    : 0;

  const getCandidateFirstName = () => {
    try {
      if (authCandidateName) {
        return authCandidateName.trim().split(' ')[0];
      }
      const fromStorage = localStorage.getItem('candidate_name');
      if (fromStorage) {
        return fromStorage.trim().split(' ')[0];
      }
      const fromState = location.state?.fullName;
      if (fromState) {
        return fromState.trim().split(' ')[0];
      }
      const fromUser = user?.name;
      if (fromUser) {
        return fromUser.trim().split(' ')[0];
      }
      const fromProfile = profile?.fullName;
      if (fromProfile) {
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
                color: atsScore ? '#FFFFFF' : '#94A3B8',
                letterSpacing: '-0.03em'
              }}>
                {atsScore !== null ? atsScore : '--'}
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
            background: atsScore ? 'rgba(0, 245, 160, 0.1)' : 'rgba(255, 255, 255, 0.05)',
            border: `2px solid ${atsScore ? (atsScore >= 75 ? '#00F5A0' : '#00F2FE') : '#64748B'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ 
              fontSize: '0.8rem', 
              fontWeight: 800, 
              color: atsScore ? (atsScore >= 75 ? '#00F5A0' : '#00F2FE') : '#94A3B8' 
            }}>
              {atsScore !== null ? `${atsScore}%` : '0%'}
            </span>
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
          <span>{atsScore ? 'Improve & Re-scan resume' : 'Scan resume with AI'}</span>
          <ArrowRight size={15} color="#00F5A0" />
        </button>
      </div>

      {/* Two Stats Row: Interviews & Confidence */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.85rem'
      }}>
        {/* Interviews Card - 0 for new candidates */}
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
            {interviewCount}
          </div>
        </div>

        {/* Confidence Card - 0% for new candidates with 0 completed interviews */}
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
            color: confidenceScore > 0 ? '#00F5A0' : '#94A3B8',
            marginTop: '0.2rem'
          }}>
            {confidenceScore > 0 ? `${confidenceScore}%` : '0%'}
          </div>
        </div>
      </div>

      {/* Resume Calibration Status (if active) */}
      {(() => {
        const activeResumeAnalysis = getActiveResumeAnalysis();
        if (!activeResumeAnalysis) return null;
        return (
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 245, 160, 0.08) 0%, rgba(13, 19, 34, 0.95) 100%)',
            border: '1px solid rgba(0, 245, 160, 0.28)',
            borderRadius: '16px',
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={13} color="#00F5A0" />
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#00F5A0', letterSpacing: '0.04em' }}>
                  RESUME CALIBRATED
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>
                {activeResumeAnalysis.role || 'Target Role'} ({activeResumeAnalysis.branch?.shortName || 'Engineering'})
              </span>
              <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                {activeResumeAnalysis.skills?.slice(0, 3).join(' • ') || 'Tailored Rounds Ready'}
              </span>
            </div>

            <button
              onClick={() => navigate('/voice-interview')}
              className="btn-teal-glow"
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '10px',
                fontSize: '0.72rem',
                flexShrink: 0
              }}
            >
              <span>Practice</span>
              <ArrowRight size={13} />
            </button>
          </div>
        );
      })()}

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
