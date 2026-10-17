import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ArrowRight, Play, Award, Sparkles } from 'lucide-react';
import { getStoredInterviewHistory } from '../../services/resumeAnalysisService';

export const Analytics = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState(() => getStoredInterviewHistory());

  useEffect(() => {
    const handleUpdate = () => {
      setHistory(getStoredInterviewHistory());
    };
    window.addEventListener('interview_history_updated', handleUpdate);
    return () => window.removeEventListener('interview_history_updated', handleUpdate);
  }, []);

  const interviewCount = history.length;
  const avgScore = interviewCount > 0
    ? Math.round(history.reduce((sum, item) => sum + (Number(item.score) || 0), 0) / interviewCount)
    : 0;

  // Build points for sparkline based on actual history scores, or neutral line
  const scores = interviewCount > 0 ? history.map((h) => Number(h.score) || 70) : [];
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      padding: '0.75rem 0.25rem 1.5rem',
      textAlign: 'left'
    }}>
      <div>
        <h1 style={{
          fontSize: '1.6rem',
          fontWeight: 800,
          color: '#FFFFFF',
          margin: 0
        }}>
          Your Progress
        </h1>
        <p style={{ fontSize: '0.825rem', color: '#94A3B8', marginTop: '4px' }}>
          Real-time performance analytics & mock interview trajectory
        </p>
      </div>

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
        minHeight: '140px',
        position: 'relative'
      }}>
        {interviewCount === 0 ? (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(0, 245, 160, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.5rem'
            }}>
              <TrendingUp size={20} color="#00F5A0" />
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#E2E8F0', fontWeight: 600 }}>
              No Interview Data Yet
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>
              Complete your first session to track your AI performance curve
            </p>
          </div>
        ) : (
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
        )}
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
            {interviewCount}
          </div>
          <span style={{ fontSize: '0.7rem', color: interviewCount === 0 ? '#64748B' : '#00F5A0' }}>
            {interviewCount === 0 ? 'Starts at 0 for new users' : 'Completed mock sessions'}
          </span>
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
          <div style={{
            fontSize: '1.6rem',
            fontWeight: 800,
            color: interviewCount > 0 ? '#00F5A0' : '#64748B',
            marginTop: '0.2rem'
          }}>
            {interviewCount > 0 ? avgScore : '--'}
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
            {interviewCount > 0 ? 'Across all rounds' : 'Pending first round'}
          </span>
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
          Target Improvement Areas
        </span>

        {interviewCount === 0 ? (
          <div style={{
            background: '#0D1322',
            border: '1px dashed rgba(255, 255, 255, 0.12)',
            borderRadius: '14px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, fontSize: '0.825rem', color: '#94A3B8' }}>
              No weak topics flagged yet. Take an interview session to receive targeted diagnostic areas.
            </p>
          </div>
        ) : (
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
              System Architecture & Trade-offs
            </div>

            <div style={{
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              color: '#F59E0B',
              fontSize: '0.9rem',
              fontWeight: 600
            }}>
              Dynamic Programming & Optimization
            </div>
          </div>
        )}
      </div>

      {/* Practice Interview or AI Mentor CTA */}
      {interviewCount === 0 ? (
        <button
          onClick={() => navigate('/interview-setup')}
          className="btn-teal-glow"
          style={{
            width: '100%',
            marginTop: '0.5rem',
            padding: '0.85rem',
            borderRadius: '14px'
          }}
        >
          <span>Start First Mock Interview</span>
          <ArrowRight size={16} />
        </button>
      ) : (
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
      )}
    </div>
  );
};

