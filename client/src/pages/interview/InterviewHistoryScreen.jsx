import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Mic, Calendar, RotateCcw } from 'lucide-react';
import { getStoredInterviewHistory } from '../../services/resumeAnalysisService';

export const InterviewHistoryScreen = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState(() => getStoredInterviewHistory());

  useEffect(() => {
    const handleUpdate = () => {
      setHistory(getStoredInterviewHistory());
    };
    window.addEventListener('interview_history_updated', handleUpdate);
    return () => window.removeEventListener('interview_history_updated', handleUpdate);
  }, []);

  const handleClearHistory = () => {
    if (window.confirm('Reset all interview records to 0? This will give you a fresh new-user profile.')) {
      localStorage.removeItem('interview_coach_history');
      window.dispatchEvent(new Event('interview_history_updated'));
      setHistory([]);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      padding: '0.75rem 0.25rem 1.5rem',
      textAlign: 'left'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{
            fontSize: '1.6rem',
            fontWeight: 800,
            color: '#FFFFFF',
            margin: 0
          }}>
            Your Interviews
          </h1>
          <p style={{ fontSize: '0.825rem', color: '#94A3B8', marginTop: '4px' }}>
            {history.length} completed session{history.length === 1 ? '' : 's'}
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            style={{
              background: 'none',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#94A3B8',
              borderRadius: '8px',
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* History Cards or Empty State */}
      {history.length === 0 ? (
        <div style={{
          background: '#0D1322',
          border: '1px dashed rgba(255, 255, 255, 0.12)',
          borderRadius: '18px',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: 'rgba(0, 245, 160, 0.12)',
            border: '1px solid rgba(0, 245, 160, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 245, 160, 0.2)'
          }}>
            <Calendar size={24} color="#00F5A0" />
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 0.35rem' }}>
              No Mock Interviews Yet
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#94A3B8', margin: 0, lineHeight: 1.5, maxWidth: '320px' }}>
              Your interview count starts strictly at 0. As you complete voice and technical rounds, your session recordings, scores, and AI feedback reports will appear here.
            </p>
          </div>

          <button
            onClick={() => navigate('/interview-setup')}
            className="btn-teal-glow"
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              fontSize: '0.85rem'
            }}
          >
            <Mic size={15} />
            <span>Start First Mock Interview</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {history.map((item, idx) => {
            const scoreNum = Number(item.score) || 75;
            const scoreColor = scoreNum >= 80 ? '#00F5A0' : scoreNum >= 65 ? '#00F2FE' : '#F59E0B';
            const scoreBg = scoreNum >= 80 ? 'rgba(0, 245, 160, 0.12)' : scoreNum >= 65 ? 'rgba(0, 242, 254, 0.12)' : 'rgba(245, 158, 11, 0.12)';

            return (
              <div
                key={idx}
                onClick={() => navigate('/feedback-report', { state: { score: item.score, role: item.role } })}
                style={{
                  background: '#0D1322',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '1.1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(0, 245, 160, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
              >
                <div>
                  <span style={{
                    fontSize: '0.925rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    display: 'block',
                    marginBottom: '0.2rem'
                  }}>
                    {item.role || 'Technical Mock Interview'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                    {item.date || 'Recent'} {item.duration ? `• ${item.duration}` : ''}
                  </span>
                </div>

                {/* Score Badge */}
                <div style={{
                  background: scoreBg,
                  color: scoreColor,
                  padding: '0.35rem 0.75rem',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  minWidth: '40px',
                  textAlign: 'center'
                }}>
                  {item.score}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Progress Analytics CTA */}
      <button
        onClick={() => navigate('/analytics')}
        className="btn-teal-glow"
        style={{
          width: '100%',
          marginTop: '0.5rem',
          padding: '0.85rem',
          borderRadius: '14px'
        }}
      >
        <span>View Detailed Analytics</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
};

