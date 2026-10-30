import React, { useEffect, useState } from 'react';
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
  MessageSquare,
  Printer,
  Share2,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useAuth, isInvalidName } from '../../context/AuthContext';

export const InterviewReport = ({ feedback, session, onRestart }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const rawStored = localStorage.getItem('candidate_name');
  const candidateName = (rawStored && !isInvalidName(rawStored))
    ? rawStored.trim()
    : (user?.name || user?.displayName || (user?.email ? user.email.split('@')[0] : 'Engineer'));
  const verificationId = `AIC-${Math.abs(((session?.role?.length || 7) * 4927 + (feedback.overallScore || 88) * 19) % 89999 + 10000)}`;
  const verifiedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

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

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const text = `🎯 Just completed an AI Mock Interview for ${session?.role || 'Software Engineer'} on AI Interview Coach!\n\n` +
      `🏆 Overall Score: ${feedback.overallScore || 88}%\n` +
      `💡 Technical Knowledge: ${feedback.technical || 90}%\n` +
      `🗣️ Communication: ${feedback.communication || 85}%\n` +
      `🏅 Verification ID: ${verificationId}\n\n` +
      `Practicing with real-time speech AI, gaze calibration, and automated STAR evaluations. #InterviewPrep #TechInterviews`;
    
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (e) {
      // fallback
    }
  };

  return (
    <div className="printable-scorecard" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <style>{`
        @media print {
          body {
            background: #FFFFFF !important;
            color: #000000 !important;
          }
          nav, footer, button, .no-print {
            display: none !important;
          }
          .printable-scorecard {
            max-width: 100% !important;
            padding: 20px !important;
            color: #0F172A !important;
          }
          .glass-panel, .glass-panel-glow {
            background: #F8FAFC !important;
            border: 1px solid #CBD5E1 !important;
            box-shadow: none !important;
            color: #0F172A !important;
          }
          h1, h2, h3, p, span {
            color: #0F172A !important;
          }
          .badge {
            border: 1px solid #000 !important;
          }
        }
      `}</style>

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span className="badge badge-emerald">
              <Award size={14} /> Official Evaluation Scorecard
            </span>
            <span style={{
              fontSize: '0.75rem',
              color: '#00F2FE',
              background: 'rgba(0, 242, 254, 0.1)',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              border: '1px solid rgba(0, 242, 254, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 700
            }}>
              <ShieldCheck size={12} /> {verificationId}
            </span>
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFF' }}>
            {session?.role || 'Full Stack Engineer'} Evaluation Report
          </h1>
          <p style={{ color: '#94A3B8', marginTop: '0.4rem', fontSize: '0.95rem' }}>
            Candidate: <strong style={{ color: '#FFFFFF' }}>{candidateName}</strong> • {session?.difficulty || 'Senior'} Level • {verifiedDate}
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

      {/* Action Buttons: Practice, Print PDF, Share & Analytics */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={onRestart}
          className="btn-secondary"
          style={{ padding: '0.75rem 1.25rem', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <RotateCcw size={16} /> Practice Another Round
        </button>

        <button
          onClick={handlePrint}
          style={{
            background: 'rgba(0, 242, 254, 0.12)',
            border: '1px solid rgba(0, 242, 254, 0.35)',
            color: '#00F2FE',
            padding: '0.75rem 1.25rem',
            fontSize: '0.88rem',
            borderRadius: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Printer size={16} /> Download Scorecard PDF
        </button>

        <button
          onClick={handleShare}
          style={{
            background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
            border: `1px solid ${copied ? '#10B981' : 'rgba(255, 255, 255, 0.18)'}`,
            color: copied ? '#10B981' : '#FFFFFF',
            padding: '0.75rem 1.25rem',
            fontSize: '0.88rem',
            borderRadius: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {copied ? <Check size={16} /> : <Share2 size={16} />}
          <span>{copied ? 'Summary Copied!' : 'Share to LinkedIn'}</span>
        </button>

        <button
          onClick={() => navigate('/analytics')}
          className="btn-primary"
          style={{ padding: '0.75rem 1.5rem', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <BarChart3 size={16} /> View Analytics
        </button>
      </div>
    </div>
  );
};
