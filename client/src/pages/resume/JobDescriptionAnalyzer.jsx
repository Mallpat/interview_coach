import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Check, AlertCircle } from 'lucide-react';

export const JobDescriptionAnalyzer = () => {
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState(
    'Seeking a Senior Full Stack Engineer with strong proficiency in Python, SQL, RESTful APIs, Docker containerization, and AWS Cloud deployments...'
  );
  const [matchScore, setMatchScore] = useState(64);

  const matchedSkills = ['Python', 'SQL'];
  const missingSkills = ['Docker', 'AWS'];

  const handleAnalyze = () => {
    // Quick recalculation simulation
    setMatchScore(Math.min(95, Math.max(50, Math.floor(Math.random() * 20) + 60)));
  };

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
        Match your resume
      </h1>

      {/* Paste Job Description Textarea */}
      <div style={{
        background: '#0D1322',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '0.85rem'
      }}>
        <textarea
          rows={4}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste job description here..."
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: '#CBD5E1',
            fontSize: '0.875rem',
            lineHeight: 1.5,
            outline: 'none',
            resize: 'none',
            fontFamily: 'inherit'
          }}
        />
      </div>

      {/* Circular Match Gauge (64%) */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        margin: '0.5rem 0'
      }}>
        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
          <svg width="120" height="120" viewBox="0 0 100 100">
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
              strokeDashoffset={251.2 - (251.2 * matchScore) / 100}
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
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF' }}>
              {matchScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Matched Section */}
      <div>
        <span style={{
          fontSize: '0.8rem',
          color: '#94A3B8',
          fontWeight: 600,
          display: 'block',
          marginBottom: '0.5rem'
        }}>
          Matched
        </span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {matchedSkills.map((skill) => (
            <span
              key={skill}
              style={{
                background: 'rgba(0, 245, 160, 0.12)',
                border: '1px solid rgba(0, 245, 160, 0.35)',
                color: '#00F5A0',
                padding: '0.35rem 0.8rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 700
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Missing Section */}
      <div>
        <span style={{
          fontSize: '0.8rem',
          color: '#94A3B8',
          fontWeight: 600,
          display: 'block',
          marginBottom: '0.5rem'
        }}>
          Missing
        </span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {missingSkills.map((skill) => (
            <span
              key={skill}
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#F87171',
                padding: '0.35rem 0.8rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 700
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Start Interview Prep CTA */}
      <button
        onClick={() => navigate('/interview-setup')}
        className="btn-teal-glow"
        style={{
          width: '100%',
          marginTop: '1rem',
          padding: '0.85rem',
          borderRadius: '14px'
        }}
      >
        <span>Practice Interview for this Role</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
};
