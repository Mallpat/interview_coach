import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ArrowRight } from 'lucide-react';

export const Analytics = () => {
  const navigate = useNavigate();

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
        Your progress
      </h1>

      {/* Sparkline Progress Line Chart Card */}
      <div style={{
        background: '#0D1322',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '18px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '140px'
      }}>
        <svg width="100%" height="80" viewBox="0 0 300 80" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="tealLineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00F5A0" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#00F5A0" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Subtle area fill */}
          <path
            d="M 20 60 Q 70 50 120 40 T 200 25 T 280 15 L 280 80 L 20 80 Z"
            fill="url(#tealLineGrad)"
          />
          {/* Glowing teal line */}
          <path
            d="M 20 60 Q 70 50 120 40 T 200 25 T 280 15"
            fill="none"
            stroke="#00F5A0"
            strokeWidth="3.5"
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 8px rgba(0, 245, 160, 0.6))' }}
          />
          {/* End point dot */}
          <circle
            cx="280"
            cy="15"
            r="4.5"
            fill="#00F5A0"
            stroke="#050B14"
            strokeWidth="2"
            style={{ filter: 'drop-shadow(0 0 6px #00F5A0)' }}
          />
        </svg>
      </div>

      {/* Stats Row: Interviews & Avg Score */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.85rem'
      }}>
        <div style={{
          background: '#0D1322',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1rem'
        }}>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500, display: 'block' }}>
            Interviews
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.2rem' }}>
            12
          </div>
        </div>

        <div style={{
          background: '#0D1322',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1rem'
        }}>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500, display: 'block' }}>
            Avg score
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#00F5A0', marginTop: '0.2rem' }}>
            76
          </div>
        </div>
      </div>

      {/* Weak Topics Section */}
      <div>
        <span style={{
          fontSize: '0.825rem',
          color: '#94A3B8',
          fontWeight: 600,
          display: 'block',
          marginBottom: '0.65rem'
        }}>
          Weak topics
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            color: '#F87171',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            Graphs
          </div>

          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            color: '#F87171',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            DP
          </div>
        </div>
      </div>

      {/* Ask AI Mentor Advice Button */}
      <button
        onClick={() => navigate('/mentor')}
        className="btn-teal-glow"
        style={{
          width: '100%',
          marginTop: '0.5rem',
          padding: '0.85rem',
          borderRadius: '14px'
        }}
      >
        <span>Ask AI Mentor for Improvement Tips</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
};
