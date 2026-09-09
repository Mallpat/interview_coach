import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react';

export const LearningPlanScreen = () => {
  const navigate = useNavigate();

  const focusAreas = [
    {
      id: 'trees-graphs',
      title: 'Trees & Graphs',
      progress: 40,
      isPrimary: true
    },
    {
      id: 'dp',
      title: 'Dynamic Programming',
      progress: 15,
      isPrimary: false
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
        Focus areas for you
      </h1>

      {/* Focus Area Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {focusAreas.map((area) => (
          <div
            key={area.id}
            style={{
              background: '#0D1322',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '18px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>
                {area.title}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>
                {area.progress}%
              </span>
            </div>

            {/* Progress Bar */}
            <div style={{
              height: '6px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.08)',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${area.progress}%`,
                height: '100%',
                borderRadius: '9999px',
                background: '#00F5A0',
                boxShadow: '0 0 8px rgba(0, 245, 160, 0.4)'
              }} />
            </div>

            {/* Start Button */}
            <button
              onClick={() => navigate('/coding')}
              className={area.isPrimary ? 'btn-teal-glow' : 'btn-dark-secondary'}
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: '12px',
                fontSize: '0.875rem',
                marginTop: '0.2rem'
              }}
            >
              <span>Start</span>
            </button>
          </div>
        ))}
      </div>

      {/* Bottom link to Interview History */}
      <button
        onClick={() => navigate('/history')}
        style={{
          background: 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#94A3B8',
          padding: '0.8rem',
          borderRadius: '14px',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
          marginTop: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}
      >
        <span>View Interview History</span>
        <ArrowRight size={15} />
      </button>
    </div>
  );
};
