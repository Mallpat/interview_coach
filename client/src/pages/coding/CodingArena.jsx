import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Send, CheckCircle2, RefreshCw, ArrowRight } from 'lucide-react';

export const CodingArena = () => {
  const navigate = useNavigate();

  const [code, setCode] = useState(
`def two_sum(nums, t):
    seen = {}
    for i, n in enumerate(nums):
        complement = t - n
        if complement in seen:
            return [seen[complement], i]
        seen[n] = i
    return []`
  );

  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState({
    passed: 3,
    total: 3,
    status: 'success'
  });

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setTestResult({ passed: 3, total: 3, status: 'success' });
    }, 600);
  };

  const handleSubmit = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      navigate('/feedback-report', {
        state: {
          problem: 'Two Sum',
          score: 94,
          testResult: '3/3 passed'
        }
      });
    }, 800);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      padding: '0.5rem 0.25rem 1.25rem',
      textAlign: 'left'
    }}>
      {/* Title & Description */}
      <div>
        <h1 style={{
          fontSize: '1.6rem',
          fontWeight: 800,
          color: '#FFFFFF',
          marginBottom: '0.3rem'
        }}>
          Two Sum
        </h1>
        <p style={{
          fontSize: '0.85rem',
          color: '#94A3B8',
          lineHeight: 1.4
        }}>
          Return indices of two numbers that add to target.
        </p>
      </div>

      {/* Code Editor Window */}
      <div style={{
        background: '#0D1322',
        border: '1px solid rgba(0, 245, 160, 0.25)',
        borderRadius: '16px',
        padding: '0.85rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
      }}>
        <textarea
          rows={9}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: '#00F5A0',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.825rem',
            lineHeight: 1.5,
            outline: 'none',
            resize: 'none'
          }}
        />
      </div>

      {/* Action Buttons: Run & Submit */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <button
          onClick={handleRun}
          disabled={isRunning}
          style={{
            background: '#0D1322',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.9rem',
            padding: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          <Play size={16} color="#94A3B8" />
          <span>{isRunning ? 'Running...' : 'Run'}</span>
        </button>

        <button
          onClick={handleSubmit}
          disabled={isRunning}
          className="btn-teal-glow"
          style={{
            borderRadius: '12px',
            padding: '0.75rem',
            fontSize: '0.9rem'
          }}
        >
          <Send size={15} />
          <span>Submit</span>
        </button>
      </div>

      {/* Test Cases Results Card */}
      {testResult && (
        <div style={{
          background: '#0D1322',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '0.9rem 1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '0.25rem'
        }}>
          <CheckCircle2 size={18} color="#00F5A0" />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#E2E8F0' }}>
            {testResult.passed} / {testResult.total} test cases passed
          </span>
        </div>
      )}
    </div>
  );
};
