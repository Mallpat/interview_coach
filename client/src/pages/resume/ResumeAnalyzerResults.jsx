import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export const ResumeAnalyzerResults = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Keywords');

  const findings = {
    Keywords: [
      { type: 'missing', label: 'Missing: "REST API"', dotColor: '#EF4444' },
      { type: 'weak', label: 'Weak verb: "helped"', dotColor: '#F59E0B' },
      { type: 'good', label: 'Good use of metrics', dotColor: '#00F5A0' }
    ],
    Grammar: [
      { type: 'weak', label: 'Passive voice in bullet 3', dotColor: '#F59E0B' },
      { type: 'good', label: 'No spelling errors detected', dotColor: '#00F5A0' },
      { type: 'good', label: 'Consistent past tense usage', dotColor: '#00F5A0' }
    ],
    Format: [
      { type: 'good', label: 'Single page PDF structure', dotColor: '#00F5A0' },
      { type: 'weak', label: 'Font size variance under 2pt', dotColor: '#F59E0B' },
      { type: 'good', label: 'Clean ATS parseable headings', dotColor: '#00F5A0' }
    ]
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      padding: '0.75rem 0.25rem 1.5rem',
      textAlign: 'center'
    }}>
      {/* Title */}
      <h1 style={{
        fontSize: '1.6rem',
        fontWeight: 800,
        color: '#FFFFFF'
      }}>
        Resume Analysis
      </h1>

      {/* Circular Progress Meter (Score: 78) */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        margin: '0.5rem 0'
      }}>
        <div style={{ position: 'relative', width: '130px', height: '130px' }}>
          <svg width="130" height="130" viewBox="0 0 100 100">
            {/* Background track */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#131B2E"
              strokeWidth="7"
            />
            {/* Teal Progress Arc */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#00F5A0"
              strokeWidth="7"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (251.2 * 78) / 100}
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
            <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#FFFFFF' }}>
              78
            </span>
          </div>
        </div>
      </div>

      {/* Tabs: Keywords | Grammar | Format */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1.25rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '0.6rem'
      }}>
        {['Keywords', 'Grammar', 'Format'].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.2rem 0.4rem',
                fontSize: '0.9rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#00F5A0' : '#94A3B8',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
            >
              {tab}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: '-0.65rem',
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: '#00F5A0',
                  boxShadow: '0 0 8px #00F5A0'
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Analysis Findings List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {findings[activeTab].map((item, idx) => (
          <div
            key={idx}
            style={{
              background: '#0D1322',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              textAlign: 'left'
            }}
          >
            {/* Color indicator dot */}
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: item.dotColor,
              boxShadow: `0 0 8px ${item.dotColor}`
            }} />
            <span style={{ fontSize: '0.9rem', color: '#E2E8F0', fontWeight: 500 }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Match with Job Description CTA */}
      <button
        onClick={() => navigate('/jd-analyzer')}
        className="btn-teal-glow"
        style={{
          width: '100%',
          marginTop: '0.5rem',
          padding: '0.85rem',
          borderRadius: '14px'
        }}
      >
        <span>Match Job Description</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
};
