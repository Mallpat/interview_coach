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
  Check,
  Clock,
  Mic,
  Activity,
  Info,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { useAuth, isInvalidName } from '../../context/AuthContext';

export const InterviewReport = ({ feedback, session, onRestart }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showFillerSnippets, setShowFillerSnippets] = useState(false);

  const rawStored = localStorage.getItem('candidate_name');
  const candidateName = (rawStored && !isInvalidName(rawStored))
    ? rawStored.trim()
    : (user?.name || user?.displayName || (user?.email ? user.email.split('@')[0] : 'Engineer'));
  const verificationId = `AIC-${Math.abs(((session?.role?.length || 7) * 4927 + (feedback.overallScore || feedback.finalScore || 88) * 19) % 89999 + 10000)}`;
  const verifiedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  // Safe parsing of rubric, speechAnalytics, detailedFeedback
  const rubric = typeof feedback.rubric === 'string'
    ? JSON.parse(feedback.rubric)
    : (feedback.rubric || {
        technicalAccuracy: { score: Math.round(((feedback.technical || 85) * 30) / 100), maxScore: 30 },
        communicationClarity: { score: Math.round(((feedback.communication || 80) * 25) / 100), maxScore: 25 },
        problemSolving: { score: Math.round(((feedback.problemSolving || feedback.technical || 80) * 25) / 100), maxScore: 25 },
        deliveryConfidence: { score: Math.round(((feedback.confidence || 80) * 20) / 100), maxScore: 20, isEstimated: true }
      });

  const speechAnalytics = typeof feedback.speechAnalytics === 'string'
    ? JSON.parse(feedback.speechAnalytics)
    : (feedback.speechAnalytics || {
        wordsPerMinute: 135,
        totalWords: 180,
        durationSeconds: 90,
        totalFillerCount: 0
      });

  const detailedFeedback = typeof feedback.detailedFeedback === 'string'
    ? JSON.parse(feedback.detailedFeedback)
    : (feedback.detailedFeedback || null);

  const questionEvaluations = typeof feedback.questionDetail === 'string'
    ? JSON.parse(feedback.questionDetail)
    : (Array.isArray(feedback.questionDetail) ? feedback.questionDetail : []);

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

  // Extract all filler occurrences and map
  const allFillerOccurrences = questionEvaluations.flatMap(q => q.fillerAnalysis?.occurrences || []);
  const fillerBreakdownMap = questionEvaluations.reduce((acc, q) => {
    const bd = q.fillerAnalysis?.fillerBreakdown || {};
    for (const [k, v] of Object.entries(bd)) {
      acc[k] = (acc[k] || 0) + v;
    }
    return acc;
  }, {});

  // Deterministic scores
  const techScore = Number(rubric.technicalAccuracy?.score ?? Math.round(((feedback.technical || 80) * 30) / 100));
  const commScore = Number(rubric.communicationClarity?.score ?? Math.round(((feedback.communication || 80) * 25) / 100));
  const probScore = Number(rubric.problemSolving?.score ?? Math.round(((feedback.problemSolving || feedback.technical || 80) * 25) / 100));
  const deliveryScore = Number(rubric.deliveryConfidence?.score ?? Math.round(((feedback.confidence || 80) * 20) / 100));

  const rawScore = feedback.rawScore !== undefined 
    ? feedback.rawScore 
    : Math.min(100, Math.round(techScore + commScore + probScore + deliveryScore));

  const totalFillerWords = speechAnalytics.totalFillerCount !== undefined 
    ? speechAnalytics.totalFillerCount 
    : (questionEvaluations.reduce((s, q) => s + (q.fillerAnalysis?.totalFillerCount || 0), 0));

  const fillerPenalty = feedback.fillerPenalty !== undefined
    ? feedback.fillerPenalty
    : Math.min(15, Number((totalFillerWords * 1.5).toFixed(1)));

  const finalScore = feedback.finalScore !== undefined
    ? feedback.finalScore
    : (feedback.overallScore !== undefined ? feedback.overallScore : Math.max(0, Math.round(rawScore - fillerPenalty)));

  // WPM Target status
  const wpm = speechAnalytics.wordsPerMinute || 0;
  const isPaceOptimal = wpm >= 120 && wpm <= 160;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const text = `🎯 Just completed an AI Mock Interview for ${session?.role || 'Software Engineer'} on AI Interview Coach!\n\n` +
      `🏆 Final Score: ${finalScore}/100 (Raw: ${rawScore}/100, Filler Penalty: -${fillerPenalty} pts)\n` +
      `💡 Technical Accuracy: ${techScore}/30 pts\n` +
      `🗣️ Communication Clarity: ${commScore}/25 pts\n` +
      `🧩 Problem Solving: ${probScore}/25 pts\n` +
      `🎙️ Delivery & Pacing: ${deliveryScore}/20 pts (${wpm} WPM)\n` +
      `🏅 Verification ID: ${verificationId}\n\n` +
      `#InterviewPrep #TechInterviews #SoftwareEngineering`;
    
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (e) {}
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
              <Award size={14} /> Official Interview Evaluation Report
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
            {session?.role || 'Full Stack Engineer'} Evaluation
          </h1>
          <p style={{ color: '#94A3B8', marginTop: '0.4rem', fontSize: '0.95rem' }}>
            Candidate: <strong style={{ color: '#FFFFFF' }}>{candidateName}</strong> • {session?.difficulty || 'Senior'} Level • {verifiedDate}
          </p>
        </div>

        {/* Final Score and Math Breakdown */}
        <div style={{
          display: 'flex',
          gap: '1.25rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Main Final Score */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem 2rem',
            background: 'rgba(0, 0, 0, 0.45)',
            borderRadius: '20px',
            border: '2px solid rgba(0, 242, 254, 0.4)'
          }}>
            <span style={{ fontSize: '3.2rem', fontWeight: 800, color: '#00F2FE', lineHeight: 1 }}>
              {finalScore}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#94A3B8', letterSpacing: '0.05em', marginTop: '4px' }}>
              Final Score (/100)
            </span>
          </div>

          {/* Raw Score & Deduction Box */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            padding: '1rem 1.25rem',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem', fontSize: '0.85rem' }}>
              <span style={{ color: '#94A3B8' }}>Raw Rubric:</span>
              <strong style={{ color: '#FFFFFF' }}>{rawScore} / 100</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem', fontSize: '0.85rem' }}>
              <span style={{ color: '#F87171' }}>Filler Penalty:</span>
              <strong style={{ color: '#F87171' }}>-{fillerPenalty} pts</strong>
            </div>
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0.4rem', fontSize: '0.75rem', color: '#64748B' }}>
              Formula: max(0, Raw - Penalty)
            </div>
          </div>
        </div>
      </div>

      {/* 4 Score Pillar Cards */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="#00F2FE" /> Official 4-Category Rubric Breakdown
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {/* 1. Technical Accuracy */}
          <div className="glass-panel" style={{ padding: '1.25rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Technical Accuracy</span>
              <span style={{ fontSize: '0.7rem', color: '#00F2FE', background: 'rgba(0, 242, 254, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>Max: 30</span>
            </div>
            <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#00F2FE', marginTop: '0.3rem' }}>
              {techScore} <span style={{ fontSize: '1rem', color: '#64748B' }}>/ 30</span>
            </p>
            <p style={{ fontSize: '0.75rem', color: '#6EE7B7', marginTop: '0.2rem' }}>
              {techScore >= 24 ? 'Comprehensive domain depth' : (techScore >= 16 ? 'Solid conceptual understanding' : 'Needs technical elaboration')}
            </p>
          </div>

          {/* 2. Communication Clarity */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Communication Clarity</span>
              <span style={{ fontSize: '0.7rem', color: '#C4B5FD', background: 'rgba(196, 181, 253, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>Max: 25</span>
            </div>
            <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#C4B5FD', marginTop: '0.3rem' }}>
              {commScore} <span style={{ fontSize: '1rem', color: '#64748B' }}>/ 25</span>
            </p>
            <p style={{ fontSize: '0.75rem', color: '#A5B4FC', marginTop: '0.2rem' }}>
              {commScore >= 20 ? 'Concise & structured delivery' : (commScore >= 14 ? 'Understandable phrasing' : 'Unstructured thoughts')}
            </p>
          </div>

          {/* 3. Problem Solving & Logic */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Problem Solving & Logic</span>
              <span style={{ fontSize: '0.7rem', color: '#6EE7B7', background: 'rgba(110, 231, 183, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>Max: 25</span>
            </div>
            <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#6EE7B7', marginTop: '0.3rem' }}>
              {probScore} <span style={{ fontSize: '1rem', color: '#64748B' }}>/ 25</span>
            </p>
            <p style={{ fontSize: '0.75rem', color: '#6EE7B7', marginTop: '0.2rem' }}>
              {probScore >= 20 ? 'Systematic trade-off analysis' : (probScore >= 14 ? 'Logical solution path' : 'Lacks systematic edge-case handling')}
            </p>
          </div>

          {/* 4. Delivery & Vocal Confidence */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Delivery & Confidence</span>
                <span title="Estimated from textual transcript fluency and pace telemetry (no direct audio acoustic modeling)" style={{ cursor: 'help' }}>
                  <Info size={12} color="#FCD34D" />
                </span>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#FCD34D', background: 'rgba(252, 211, 77, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>Max: 20</span>
            </div>
            <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FCD34D', marginTop: '0.3rem' }}>
              {deliveryScore} <span style={{ fontSize: '1rem', color: '#64748B' }}>/ 20</span>
            </p>
            <p style={{ fontSize: '0.75rem', color: '#FCD34D', marginTop: '0.2rem' }}>
              Estimated • {wpm} WPM ({isPaceOptimal ? 'Target Range' : 'Adjust Cadence'})
            </p>
          </div>
        </div>
      </div>

      {/* Speech Analytics & Filler Word Detection Panel */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Activity size={20} color="#00F2FE" />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Speech Analytics & Filler Detection</h3>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: 0 }}>Word-boundary contextual detection (um, uh, like, you know, basically, actually)</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className={`badge ${isPaceOptimal ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.75rem' }}>
              {wpm} WPM • {isPaceOptimal ? 'Target Range (120–160 WPM)' : (wpm < 120 ? 'Slow Pacing (<120 WPM)' : 'Fast Pacing (>160 WPM)')}
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.9rem', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Speaking Speed</span>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#00F2FE', marginTop: '0.2rem' }}>
              {wpm} <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>WPM</span>
            </p>
            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Target: 120–160 WPM</span>
          </div>

          <div style={{ padding: '0.9rem', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Filler Word Count</span>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: totalFillerWords > 4 ? '#F87171' : '#6EE7B7', marginTop: '0.2rem' }}>
              {totalFillerWords} <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>words</span>
            </p>
            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Penalty: -{fillerPenalty} pts</span>
          </div>

          <div style={{ padding: '0.9rem', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Total Words Spoken</span>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#C4B5FD', marginTop: '0.2rem' }}>
              {speechAnalytics.totalWords || 0}
            </p>
            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Estimated Duration: {Math.round(speechAnalytics.durationSeconds || 60)}s</span>
          </div>

          <div style={{ padding: '0.9rem', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Filler Ratio</span>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FCD34D', marginTop: '0.2rem' }}>
              {speechAnalytics.totalWords > 0 ? ((totalFillerWords / speechAnalytics.totalWords) * 100).toFixed(1) : 0}%
            </p>
            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Target: &lt; 2.5%</span>
          </div>
        </div>

        {/* Filler Breakdown Pills */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#CBD5E1', display: 'block', marginBottom: '0.5rem' }}>
            Detected Filler Frequency Breakdown:
          </span>

          {Object.keys(fillerBreakdownMap).length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: '#6EE7B7' }}>
              🎉 Outstanding! Zero verbal hesitation filler words detected during this session.
            </p>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {Object.entries(fillerBreakdownMap).map(([phrase, count]) => (
                <span
                  key={phrase}
                  style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#FCA5A5',
                    fontSize: '0.78rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '8px',
                    fontWeight: 600
                  }}
                >
                  "{phrase}": {count}×
                </span>
              ))}

              {allFillerOccurrences.length > 0 && (
                <button
                  onClick={() => setShowFillerSnippets(!showFillerSnippets)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#00F2FE',
                    fontSize: '0.75rem',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    marginLeft: '0.5rem'
                  }}
                >
                  {showFillerSnippets ? 'Hide transcript snippets' : `View ${allFillerOccurrences.length} context occurrences`}
                </button>
              )}
            </div>
          )}

          {/* Context Snippets Expandable */}
          {showFillerSnippets && allFillerOccurrences.length > 0 && (
            <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: '10px', background: 'rgba(0, 0, 0, 0.4)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Filler In-Context Occurrences:</span>
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {allFillerOccurrences.map((occ, idx) => (
                  <div key={idx} style={{ fontSize: '0.8rem', color: '#E2E8F0', padding: '0.3rem 0.5rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px' }}>
                    <span style={{ color: '#F87171', fontWeight: 700 }}>"{occ.phrase}"</span> in: <em style={{ color: '#94A3B8' }}>{occ.snippet}</em>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Granular Feedback Card */}
      {detailedFeedback && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <MessageSquare size={20} color="#00F2FE" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Granular Answer Assessment</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* Answered Correctly */}
            <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6EE7B7', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.4rem' }}>
                <CheckCircle2 size={14} /> What You Answered Correctly
              </span>
              <p style={{ fontSize: '0.88rem', color: '#E2E8F0', lineHeight: 1.5 }}>
                {detailedFeedback.whatAnsweredCorrectly || 'Articulated core engineering concepts.'}
              </p>
            </div>

            {/* Technically Incorrect / Flawed */}
            <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F87171', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.4rem' }}>
                <XCircle size={14} /> What Was Technically Incomplete or Incorrect
              </span>
              <p style={{ fontSize: '0.88rem', color: '#E2E8F0', lineHeight: 1.5 }}>
                {detailedFeedback.whatWasIncorrect || 'No major technical fallacies identified.'}
              </p>
            </div>
          </div>

          {/* Missing Points & Ideal Example */}
          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {detailedFeedback.missingPoints && detailedFeedback.missingPoints.length > 0 && (
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FCD34D', display: 'block', marginBottom: '0.4rem' }}>
                  Important Points Missing from Response:
                </span>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {detailedFeedback.missingPoints.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            )}

            {detailedFeedback.idealExampleAnswer && (
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0, 242, 254, 0.05)', border: '1px solid rgba(0, 242, 254, 0.2)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#00F2FE', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                  💡 Exemplar 10/10 Answer Structure
                </span>
                <p style={{ fontSize: '0.85rem', color: '#E2E8F0', lineHeight: 1.6, fontStyle: 'italic' }}>
                  "{detailedFeedback.idealExampleAnswer}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}

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

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0 }}>
            {strengths.map((st, i) => (
              <li key={i} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.875rem', color: '#E2E8F0', lineHeight: 1.5 }}>
                <span style={{ color: '#10B981', fontWeight: 800 }}>✓</span>
                <span>{st}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Concrete Recommendations */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <AlertTriangle size={18} color="#F59E0B" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FCD34D' }}>Concrete Recommendations</h3>
          </div>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0 }}>
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
