import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Mic, Code2, RefreshCw, FileText, CheckCircle2, AlertCircle, BarChart3, Edit3, X } from 'lucide-react';
import {
  getActiveResumeAnalysis,
  analyzeResumeForInterviews,
  saveResumeAnalysis,
  calculateATSScoreAndFindings
} from '../../services/resumeAnalysisService';

export const ResumeAnalyzerResults = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Keywords');
  const [analysis, setAnalysis] = useState(() => getActiveResumeAnalysis());
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [resumeTextInput, setResumeTextInput] = useState('');

  // Synchronize and ensure dynamic score and findings are computed
  useEffect(() => {
    const current = getActiveResumeAnalysis();
    if (current) {
      if (!current.atsScore || !current.findings) {
        const { score, breakdown, findings } = calculateATSScoreAndFindings(
          current.rawText || '',
          current.role || 'Software Engineer',
          current.skills || [],
          current.branch || 'computer-science'
        );
        const enriched = { ...current, atsScore: score, scoreBreakdown: breakdown, findings };
        saveResumeAnalysis(enriched);
        setAnalysis(enriched);
      } else {
        setAnalysis(current);
      }
      setResumeTextInput(current.rawText || '');
    }
  }, []);

  // Listen for real-time storage updates
  useEffect(() => {
    const handleUpdate = () => {
      setAnalysis(getActiveResumeAnalysis());
    };
    window.addEventListener('resume_analysis_updated', handleUpdate);
    return () => window.removeEventListener('resume_analysis_updated', handleUpdate);
  }, []);

  // Perform manual dynamic AI scan
  const handleManualScan = async (customText = null) => {
    setIsScanning(true);
    const textToScan = customText !== null ? customText : (analysis?.rawText || resumeTextInput || 'Experienced Software Engineer skilled in React, Node.js, and TypeScript.');
    const roleToScan = analysis?.role || 'Full Stack Engineer';

    try {
      setScanStatus('Tokenizing candidate resume text...');
      await new Promise((r) => setTimeout(r, 400));

      setScanStatus('Extracting tech stack, hard skills & domain keywords...');
      await new Promise((r) => setTimeout(r, 500));

      setScanStatus('Auditing action verbs & quantifiable metric impact...');
      await new Promise((r) => setTimeout(r, 450));

      setScanStatus('Validating standard ATS sections & formatting parseability...');
      await new Promise((r) => setTimeout(r, 400));

      setScanStatus('Synthesizing dynamic AI score & diagnostic findings...');
      await new Promise((r) => setTimeout(r, 350));

      const newAnalysis = analyzeResumeForInterviews(
        textToScan,
        analysis?.fileName || 'Candidate_Resume.pdf',
        roleToScan
      );

      saveResumeAnalysis(newAnalysis);
      setAnalysis(newAnalysis);
      setShowEditModal(false);
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
      setScanStatus('');
    }
  };

  const atsScore = analysis?.atsScore ?? 0;
  const breakdown = analysis?.scoreBreakdown || {
    keywords: 0,
    impact: 0,
    verbs: 0,
    structure: 0,
    readability: 0
  };

  const rawFindings = analysis?.findings || {
    Keywords: [
      { type: 'missing', label: 'No resume text analyzed yet. Run an AI scan.', dotColor: '#EF4444' }
    ],
    Grammar: [
      { type: 'weak', label: 'Upload or paste resume to check grammatical impact.', dotColor: '#F59E0B' }
    ],
    Format: [
      { type: 'weak', label: 'Structure evaluation pending manual scan.', dotColor: '#F59E0B' }
    ]
  };

  const scoreColor = atsScore >= 80 ? '#00F5A0' : atsScore >= 65 ? '#00F2FE' : atsScore >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.4rem',
      padding: '0.75rem 0.25rem 2rem',
      textAlign: 'center'
    }}>
      {/* Title & Status */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
          <Sparkles size={18} color="#00F5A0" />
          <h1 style={{
            fontSize: '1.6rem',
            fontWeight: 800,
            color: '#FFFFFF',
            margin: 0
          }}>
            AI Resume Scanner
          </h1>
        </div>
        <p style={{ fontSize: '0.825rem', color: '#94A3B8', margin: 0 }}>
          {analysis
            ? `Analyzed for: ${analysis.role || 'Software Engineer'} • ${analysis.fileName || 'Active Resume'}`
            : 'No resume scanned yet. Scan manually with AI below.'}
        </p>
      </div>

      {/* Circular Progress Meter with Dynamic AI Score */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.65rem'
      }}>
        <div style={{ position: 'relative', width: '135px', height: '135px' }}>
          <svg width="135" height="135" viewBox="0 0 100 100">
            {/* Background track */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#131B2E"
              strokeWidth="7"
            />
            {/* Dynamic AI Score Arc */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={scoreColor}
              strokeWidth="7"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (251.2 * (atsScore || 0)) / 100}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{
                filter: `drop-shadow(0 0 8px ${scoreColor}88)`,
                transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease'
              }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>
              {isScanning ? '--' : atsScore}
            </span>
            <span style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600, marginTop: '2px' }}>
              ATS RATING
            </span>
          </div>
        </div>

        {/* Live scanning progress message */}
        {isScanning && (
          <div style={{
            background: 'rgba(0, 245, 160, 0.1)',
            border: '1px solid rgba(0, 245, 160, 0.3)',
            borderRadius: '10px',
            padding: '0.4rem 0.8rem',
            fontSize: '0.775rem',
            color: '#00F5A0',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <RefreshCw size={13} className="spin-fast" style={{ animation: 'spin 1s linear infinite' }} />
            <span>{scanStatus}</span>
          </div>
        )}
      </div>

      {/* Manual AI Scan & Edit Action Bar */}
      <div style={{
        display: 'flex',
        gap: '0.65rem',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => handleManualScan()}
          disabled={isScanning}
          style={{
            flex: 1,
            background: 'rgba(0, 245, 160, 0.12)',
            border: '1px solid rgba(0, 245, 160, 0.35)',
            color: '#00F5A0',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            fontSize: '0.825rem',
            fontWeight: 700,
            cursor: isScanning ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <RefreshCw size={15} style={isScanning ? { animation: 'spin 1s linear infinite' } : {}} />
          <span>{isScanning ? 'Scanning...' : 'Manual AI Re-Scan'}</span>
        </button>

        <button
          onClick={() => setShowEditModal(true)}
          style={{
            background: '#0D1322',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#E2E8F0',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            fontSize: '0.825rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Edit3 size={15} color="#00F2FE" />
          <span>Edit Text</span>
        </button>
      </div>

      {/* Tabs: Keywords | Grammar | Format | Breakdown */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.9rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '0.6rem',
        overflowX: 'auto'
      }}>
        {['Keywords', 'Grammar', 'Format', 'Breakdown'].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.2rem 0.4rem',
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#00F5A0' : '#94A3B8',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
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

      {/* Tab Content: Breakdown vs Findings */}
      {activeTab === 'Breakdown' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', textAlign: 'left' }}>
          {[
            { label: 'Keyword Alignment & Stack Coverage', score: breakdown.keywords, max: 30, color: '#00F5A0' },
            { label: 'Quantifiable Impact & Metrics', score: breakdown.impact, max: 25, color: '#00F2FE' },
            { label: 'Action Verbs vs Passive Voice', score: breakdown.verbs, max: 20, color: '#A78BFA' },
            { label: 'Structural Completeness & Sections', score: breakdown.structure, max: 15, color: '#38BDF8' },
            { label: 'Word Count & ATS Readability', score: breakdown.readability, max: 10, color: '#F59E0B' }
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#0D1322',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '0.85rem 1rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.825rem', color: '#E2E8F0', fontWeight: 600 }}>{item.label}</span>
                <span style={{ fontSize: '0.825rem', color: item.color, fontWeight: 700 }}>
                  {item.score} / {item.max}
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, (item.score / item.max) * 100)}%`,
                    height: '100%',
                    background: item.color,
                    borderRadius: '3px',
                    transition: 'width 0.5s ease'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Findings List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {(rawFindings[activeTab] || []).map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#0D1322',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '0.9rem 1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                textAlign: 'left'
              }}
            >
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: item.dotColor || '#00F5A0',
                boxShadow: `0 0 8px ${item.dotColor || '#00F5A0'}`,
                flexShrink: 0
              }} />
              <span style={{ fontSize: '0.85rem', color: '#E2E8F0', fontWeight: 500, lineHeight: 1.4 }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Resume-Tailored Action Launchers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginTop: '0.25rem' }}>
        <button
          onClick={() => navigate('/voice-interview')}
          style={{
            background: 'rgba(0, 245, 160, 0.12)',
            border: '1px solid rgba(0, 245, 160, 0.35)',
            color: '#00F5A0',
            padding: '0.8rem',
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Mic size={15} />
          <span>Tailored Voice Q&A</span>
        </button>

        <button
          onClick={() => navigate('/coding')}
          style={{
            background: 'rgba(0, 242, 254, 0.12)',
            border: '1px solid rgba(0, 242, 254, 0.35)',
            color: '#00F2FE',
            padding: '0.8rem',
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Code2 size={15} />
          <span>Tailored Coding Round</span>
        </button>
      </div>

      {/* Match with Job Description CTA */}
      <button
        onClick={() => navigate('/jd-analyzer')}
        className="btn-teal-glow"
        style={{
          width: '100%',
          padding: '0.85rem',
          borderRadius: '14px'
        }}
      >
        <span>Match Job Description</span>
        <ArrowRight size={16} />
      </button>

      {/* Edit / Paste Resume Text Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 11, 20, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#0D1322',
            border: '1px solid rgba(0, 245, 160, 0.3)',
            borderRadius: '20px',
            padding: '1.25rem',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="#00F5A0" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#FFFFFF', fontWeight: 700 }}>
                  Scan Custom Resume Text
                </h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.785rem', color: '#94A3B8' }}>
              Paste or edit your resume text. The AI scanner will analyze keywords, metrics, verbs, and ATS formatting in real time.
            </p>

            <textarea
              value={resumeTextInput}
              onChange={(e) => setResumeTextInput(e.target.value)}
              placeholder="Paste your resume contents here (Experience, Education, Skills, Projects)..."
              rows={12}
              style={{
                width: '100%',
                background: '#050B14',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '0.85rem',
                color: '#E2E8F0',
                fontSize: '0.825rem',
                fontFamily: 'monospace',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#94A3B8',
                  borderRadius: '10px',
                  padding: '0.6rem 1rem',
                  fontSize: '0.825rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleManualScan(resumeTextInput)}
                disabled={!resumeTextInput.trim() || isScanning}
                className="btn-teal-glow"
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '10px',
                  fontSize: '0.825rem',
                  cursor: !resumeTextInput.trim() || isScanning ? 'not-allowed' : 'pointer'
                }}
              >
                <span>Run AI Scan Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

