import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';

export const FeedbackReportScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const score = location.state?.score || 82;

  const metrics = [
    { label: 'Communication', value: 85 },
    { label: 'Technical knowledge', value: 80 },
    { label: 'Confidence', value: 82 }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      padding: '0.75rem 0.25rem 1.5rem',
      textAlign: 'left'
    }}>
      {/* Circular Overall Score Meter (82) */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        margin: '0.5rem 0'
      }}>
        <div style={{ position: 'relative', width: '130px', height: '130px' }}>
          <svg width="130" height="130" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#131B2E"
              strokeWidth="7"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#00F5A0"
              strokeWidth="7"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (251.2 * score) / 100}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{ filter: 'drop-shadow(0 0 8px rgba(0, 245, 160, 0.6))' }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF' }}>
              {score}
            </span>
          </div>
        </div>
      </div>

      {/* Metric Breakdown Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {metrics.map((metric) => (
          <div key={metric.label}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.4rem'
            }}>
              <span style={{ fontSize: '0.825rem', color: '#94A3B8', fontWeight: 500 }}>
                {metric.label}
              </span>
            </div>
            <div style={{
              height: '6px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.08)',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${metric.value}%`,
                height: '100%',
                borderRadius: '9999px',
                background: '#00F5A0',
                boxShadow: '0 0 8px rgba(0, 245, 160, 0.5)'
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Strengths Card */}
      <div style={{
        background: '#0D1322',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '1.1rem 1.25rem',
        marginTop: '0.5rem'
      }}>
        <span style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          color: '#00F5A0',
          display: 'block',
          marginBottom: '0.35rem'
        }}>
          Strengths
        </span>
        <p style={{
          fontSize: '0.875rem',
          color: '#E2E8F0',
          lineHeight: 1.5
        }}>
          Clear structure, good pacing
        </p>
      </div>

      {/* Recommended Learning Action */}
      <button
        onClick={() => navigate('/learning-plan')}
        className="btn-teal-glow"
        style={{
          width: '100%',
          marginTop: '0.5rem',
          padding: '0.9rem',
          borderRadius: '14px'
        }}
      >
        <span>View Tailored Learning Plan</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
};
