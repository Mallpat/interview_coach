import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  RotateCcw, 
  BarChart3,
  Video,
  Layers,
  MessageSquare
} from 'lucide-react';

export const InterviewReport = ({ feedback, session, onRestart }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Celebration confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const strengths = typeof feedback.strengths === 'string' 
    ? JSON.parse(feedback.strengths) 
    : (feedback.strengths || []);

  const weaknesses = typeof feedback.weaknesses === 'string'
    ? JSON.parse(feedback.weaknesses)
    : (feedback.weaknesses || []);

  const improvements = typeof feedback.improvements === 'string'
    ? JSON.parse(feedback.improvements)
    : (feedback.improvements || []);

  const starAnalysis = typeof feedback.starAnalysis === 'string'
    ? JSON.parse(feedback.starAnalysis)
    : (feedback.starAnalysis || {
        situation: 'Context and business scale defined well.',
        task: 'Engineering objectives and trade-offs stated clearly.',
        action: 'Solid discussion of architectural patterns and microservices.',
        result: 'Consider mentioning specific P99 latency and error rate percentages.'
      });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div className="glass-panel-glow" style={{
        padding: '2.5rem',
        background: 'linear-gradient(135deg, rgba(13, 19, 34, 0.95) 0%, rgba(20, 30, 55, 0.8) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '2rem'
      }}>
        <div>
          <span className="badge badge-emerald" style={{ marginBottom: '0.75rem' }}>
            <Award size={14} /> Round Complete • Evaluation Ready
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFF' }}>
            {session?.role || 'Full Stack Engineer'} Evaluation Report
          </h1>
          <p style={{ color: '#94A3B8', marginTop: '0.4rem', fontSize: '0.95rem' }}>
            {session?.difficulty || 'Senior'} Level • {session?.type || 'Technical & Behavioral'} Round
          </p>
        </div>

        {/* Big Overall Score Ring */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.25rem 2rem',
          background: 'rgba(0, 0, 0, 0.35)',
          borderRadius: '20px',
          border: '1px solid rgba(0, 242, 254, 0.3)'
        }}>
          <span style={{ fontSize: '3rem', fontWeight: 800, color: '#00F2FE', lineHeight: 1 }}>
            {feedback.overallScore || 88}%
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#94A3B8', letterSpacing: '0.05em', marginTop: '4px' }}>
            Overall Performance
          </span>
        </div>
      </div>

      {/* 4 Score Pillar Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Technical Knowledge</span>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#00F2FE', marginTop: '0.2rem' }}>
            {feedback.technical || 90}%
          </p>
          <p style={{ fontSize: '0.75rem', color: '#6EE7B7' }}>Strong conceptual depth</p>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Communication & Flow</span>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#C4B5FD', marginTop: '0.2rem' }}>
            {feedback.communication || 85}%
          </p>
          <p style={{ fontSize: '0.75rem', color: '#A5B4FC' }}>Concise articulation</p>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Non-Verbal & Gaze</span>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#6EE7B7', marginTop: '0.2rem' }}>
            {feedback.nonVerbalScore || 88}%
          </p>
          <p style={{ fontSize: '0.75rem', color: '#6EE7B7' }}>Consistent eye-contact</p>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Confidence & Delivery</span>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FCD34D', marginTop: '0.2rem' }}>
            {feedback.confidence || 86}%
          </p>
          <p style={{ fontSize: '0.75rem', color: '#FCD34D' }}>Steady pacing</p>
        </div>
      </div>

      {/* STAR Framework Analysis */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Layers size={20} color="#00F2FE" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>STAR Methodology Breakdown</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <span className="badge badge-cyan" style={{ fontSize: '0.65rem', marginBottom: '0.5rem' }}>S - Situation</span>
            <p style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: 1.5 }}>{starAnalysis.situation}</p>
          </div>

          <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <span className="badge badge-purple" style={{ fontSize: '0.65rem', marginBottom: '0.5rem' }}>T - Task</span>
            <p style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: 1.5 }}>{starAnalysis.task}</p>
          </div>

          <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <span className="badge badge-emerald" style={{ fontSize: '0.65rem', marginBottom: '0.5rem' }}>A - Action</span>
            <p style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: 1.5 }}>{starAnalysis.action}</p>
          </div>

          <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <span className="badge badge-amber" style={{ fontSize: '0.65rem', marginBottom: '0.5rem' }}>R - Result</span>
            <p style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: 1.5 }}>{starAnalysis.result}</p>
          </div>
        </div>
      </div>

      {/* Strengths & Actionable Improvements */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Key Strengths */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <CheckCircle2 size={18} color="#10B981" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#6EE7B7' }}>Key Strengths Identified</h3>
          </div>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {strengths.map((st, i) => (
              <li key={i} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.875rem', color: '#E2E8F0', lineHeight: 1.5 }}>
                <span style={{ color: '#10B981', fontWeight: 800 }}>✓</span>
                <span>{st}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <AlertTriangle size={18} color="#F59E0B" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FCD34D' }}>Concrete Recommendations</h3>
          </div>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {improvements.map((im, i) => (
              <li key={i} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.875rem', color: '#E2E8F0', lineHeight: 1.5 }}>
                <span style={{ color: '#F59E0B', fontWeight: 800 }}>→</span>
                <span>{im}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
        <button
          onClick={onRestart}
          className="btn-secondary"
          style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
        >
          <RotateCcw size={16} /> Practice Another Round
        </button>

        <button
          onClick={() => navigate('/analytics')}
          className="btn-primary"
          style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}
        >
          <BarChart3 size={16} /> View Performance Analytics
        </button>
      </div>
    </div>
  );
};
