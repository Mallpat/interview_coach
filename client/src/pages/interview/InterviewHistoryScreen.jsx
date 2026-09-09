import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export const InterviewHistoryScreen = () => {
  const navigate = useNavigate();

  const history = [
    {
      role: 'Frontend • Medium',
      date: 'Jul 10',
      score: 84,
      color: '#00F5A0',
      bg: 'rgba(0, 245, 160, 0.12)'
    },
    {
      role: 'System Design',
      date: 'Jul 8',
      score: 61,
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.12)'
    },
    {
      role: 'DSA Coding',
      date: 'Jul 2',
      score: 77,
      color: '#00F5A0',
      bg: 'rgba(0, 245, 160, 0.12)'
    }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      padding: '0.75rem 0.25rem 1.5rem',
      textAlign: 'left'
    }}>
      <h1 style={{
        fontSize: '1.6rem',
        fontWeight: 800,
        color: '#FFFFFF'
      }}>
        Your Interviews
      </h1>

      {/* History Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {history.map((item, idx) => (
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
                {item.role}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                {item.date}
              </span>
            </div>

            {/* Score Badge */}
            <div style={{
              background: item.bg,
              color: item.color,
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
        ))}
      </div>

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
