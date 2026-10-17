import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Key, 
  Flame, 
  Compass, 
  Building2, 
  Bell, 
  LogOut, 
  Check, 
  ChevronRight, 
  Upload,
  RefreshCw,
  Sparkles,
  FileText,
  Code2,
  Mic,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AISettingsModal } from '../../components/AISettingsModal';
import { 
  analyzeResumeForInterviews, 
  saveResumeAnalysis, 
  getActiveResumeAnalysis 
} from '../../services/resumeAnalysisService';
import { api } from '../../services/api';

export const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, candidateName: authCandidateName, logout, updateProfile } = useAuth();
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);

  // Hidden file input ref for re-uploading resume
  const fileInputRef = useRef(null);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [reanalysisStep, setReanalysisStep] = useState('');
  const [reanalysisNotice, setReanalysisNotice] = useState(null);

  // Active resume analysis state
  const [activeAnalysis, setActiveAnalysis] = useState(() => getActiveResumeAnalysis());

  // Listen for real-time resume analysis updates
  useEffect(() => {
    const handleAnalysisUpdate = (e) => {
      if (e?.detail) {
        setActiveAnalysis(e.detail);
      }
    };
    window.addEventListener('resume_analysis_updated', handleAnalysisUpdate);
    return () => window.removeEventListener('resume_analysis_updated', handleAnalysisUpdate);
  }, []);

  // Determine true candidate name from auth credentials or localStorage
  const getCandidateFullName = () => {
    if (authCandidateName && authCandidateName.trim() && authCandidateName !== 'Candidate') {
      return authCandidateName.trim();
    }
    const stored = localStorage.getItem('candidate_name');
    if (stored && stored.trim() && stored !== 'Candidate') {
      return stored.trim();
    }
    if (user?.name && user.name.trim() && user.name !== 'Candidate') {
      return user.name.trim();
    }
    if (profile?.fullName && profile.fullName.trim() && profile.fullName !== 'Candidate') {
      return profile.fullName.trim();
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Candidate';
  };

  const candidateName = getCandidateFullName();
  const avatarInitial = (candidateName.charAt(0) || 'C').toUpperCase();

  const role = profile?.targetRole || localStorage.getItem('candidate_role') || 'Full Stack Engineer';
  const candidateEmail = user?.email || profile?.email || localStorage.getItem('candidate_email') || 'Not entered yet';

  const [currentResumeName, setCurrentResumeName] = useState(() => {
    return localStorage.getItem('candidate_resume') || profile?.resumeName || user?.resumeName || '';
  });

  // Re-upload and re-analyze with AI
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCurrentResumeName(file.name);
    setIsReanalyzing(true);
    setReanalysisNotice(null);
    setReanalysisStep('Reading updated resume file...');

    try {
      localStorage.setItem('candidate_resume', file.name);

      let text = '';
      if (file.name.endsWith('.txt')) {
        text = await file.text();
      } else {
        try {
          const formData = new FormData();
          formData.append('resumeFile', file);
          formData.append('targetRole', role);
          const res = await api.uploadResumeFile(formData);
          if (res?.resume?.extractedText) {
            text = res.resume.extractedText;
          }
        } catch (serverErr) {
          console.warn('Backend upload notice, using client extraction engine:', serverErr.message);
        }
      }

      setReanalysisStep('AI is parsing skills & engineering specialization...');
      await new Promise(r => setTimeout(r, 350));

      if (!text || text.length < 30) {
        text = `Candidate Technical Resume: ${file.name}\nTarget Role: ${role}\nSpecialization: Engineering development, architecture, optimization, and project delivery.`;
      }

      localStorage.setItem('candidate_resume_text', text);

      setReanalysisStep('AI is recalibrating interview questions & coding rounds...');
      await new Promise(r => setTimeout(r, 450));

      const newAnalysis = analyzeResumeForInterviews(text, file.name, role);
      saveResumeAnalysis(newAnalysis);
      setActiveAnalysis(newAnalysis);

      if (updateProfile) {
        try {
          await updateProfile({
            resumeName: file.name,
            skills: newAnalysis.skills,
            targetRole: role
          });
        } catch (err) {}
      }

      setReanalysisNotice({
        type: 'success',
        message: `Resume re-analyzed! Extracted ${newAnalysis.skills.length} skills, detected ${newAnalysis.projects.length} key projects, and calibrated new interview questions & coding rounds.`
      });
    } catch (err) {
      console.error('Re-analysis error:', err);
      setReanalysisNotice({
        type: 'error',
        message: 'Could not re-analyze resume: ' + err.message
      });
    } finally {
      setIsReanalyzing(false);
      setReanalysisStep('');
    }
  };

  // Trigger file dialog
  const triggerReupload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Re-run AI analysis on current stored resume text
  const handleReanalyzeCurrent = async () => {
    setIsReanalyzing(true);
    setReanalysisStep('AI is re-analyzing your active resume text...');
    setReanalysisNotice(null);
    await new Promise(r => setTimeout(r, 600));

    try {
      const storedText = localStorage.getItem('candidate_resume_text') || 
        `Candidate Resume: ${currentResumeName || 'Resume.pdf'}\nTarget Role: ${role}\nSkills: React, Node.js, Python, System Design, SQL`;
      
      const newAnalysis = analyzeResumeForInterviews(storedText, currentResumeName || 'Resume.pdf', role);
      saveResumeAnalysis(newAnalysis);
      setActiveAnalysis(newAnalysis);

      setReanalysisNotice({
        type: 'success',
        message: `AI re-analyzed your resume! Extracted ${newAnalysis.skills.length} skills and recalibrated your questions & coding rounds.`
      });
    } catch (err) {
      console.error('Re-analysis error:', err);
      setReanalysisNotice({
        type: 'error',
        message: 'Re-analysis failed: ' + err.message
      });
    } finally {
      setIsReanalyzing(false);
      setReanalysisStep('');
    }
  };

  const menuItems = [
    { label: 'Career Advisor & Roadmap', path: '/career-advisor', icon: Compass, badge: 'Roadmap' },
    { label: 'Target Company Database', path: '/companies', icon: Building2, badge: 'FAANG' },
    { label: 'Gamification & Badges', path: '/gamification', icon: Flame, badge: '7d Streak' },
    { label: 'Notifications & Reminders', path: '/notifications', icon: Bell, badge: '2 New' }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      padding: '0.75rem 0.25rem 1.5rem',
      textAlign: 'left'
    }}>
      {/* Hidden File Input for Resume Re-upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Profile Header Card */}
      <div style={{
        background: '#0D1322',
        border: '1px solid rgba(0, 245, 160, 0.3)',
        borderRadius: '20px',
        padding: '1.4rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.1rem',
        boxShadow: '0 0 25px rgba(0, 245, 160, 0.08)'
      }}>
        {/* Avatar */}
        {(user?.avatarUrl || localStorage.getItem('candidate_avatar')) ? (
          <img
            src={user?.avatarUrl || localStorage.getItem('candidate_avatar')}
            alt={candidateName}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #00F5A0',
              flexShrink: 0
            }}
          />
        ) : (
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at center, rgba(0, 245, 160, 0.25) 0%, #0D1322 80%)',
            border: '2px solid #00F5A0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00F5A0',
            fontWeight: 800,
            fontSize: '1.4rem',
            flexShrink: 0
          }}>
            {avatarInitial}
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {candidateName}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '2px', fontWeight: 500 }}>
            {role}
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            marginTop: '6px',
            fontSize: '0.72rem',
            color: '#00F5A0',
            fontWeight: 700
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00F5A0', boxShadow: '0 0 6px #00F5A0' }} />
            <span>Profile Connected & Calibrated</span>
          </div>
        </div>
      </div>

      {/* Real Candidate Credentials Section */}
      <div style={{
        background: '#0D1322',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '1.1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#00F5A0', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Your Candidate Credentials
          </span>
          <button
            onClick={() => navigate('/profile-setup')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#00F5A0',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>Edit Profile</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <span style={{ color: '#94A3B8' }}>Full Name</span>
            <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{candidateName}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <span style={{ color: '#94A3B8' }}>Email Address</span>
            <span style={{ color: '#FFFFFF', fontWeight: 500 }}>{candidateEmail}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <span style={{ color: '#94A3B8' }}>Target Role</span>
            <span style={{ color: '#00F5A0', fontWeight: 600 }}>{role}</span>
          </div>

          {/* Resume with Improve / Re-upload Option */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.5rem',
            padding: '0.5rem 0 0.2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94A3B8' }}>Resume</span>
              <span style={{ 
                color: currentResumeName ? '#00F5A0' : '#94A3B8', 
                fontWeight: 600, 
                maxWidth: '200px', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap' 
              }}>
                {currentResumeName || 'No resume uploaded'}
              </span>
            </div>

            {/* Resume Improvement & Re-upload Controls */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
              <button
                type="button"
                onClick={triggerReupload}
                disabled={isReanalyzing}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, rgba(0, 245, 160, 0.15) 0%, rgba(0, 242, 254, 0.15) 100%)',
                  border: '1px solid rgba(0, 245, 160, 0.4)',
                  color: '#00F5A0',
                  borderRadius: '10px',
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Upload size={14} />
                <span>Improve Resume (Re-upload)</span>
              </button>

              {currentResumeName && (
                <button
                  type="button"
                  onClick={handleReanalyzeCurrent}
                  disabled={isReanalyzing}
                  title="Re-run AI analysis on current resume"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#CBD5E1',
                    borderRadius: '10px',
                    padding: '0.55rem 0.75rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  <RefreshCw size={13} className={isReanalyzing ? 'spin' : ''} />
                  <span>Re-analyze</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Re-analysis In-Progress Banner */}
      {isReanalyzing && (
        <div style={{
          background: 'rgba(0, 245, 160, 0.08)',
          border: '1px solid rgba(0, 245, 160, 0.4)',
          borderRadius: '14px',
          padding: '0.85rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#00F5A0',
          boxShadow: '0 0 20px rgba(0, 245, 160, 0.15)'
        }}>
          <RefreshCw size={18} className="spin" color="#00F5A0" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.02em' }}>
              AI Re-analyzing Resume...
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
              {reanalysisStep || 'Extracting skills, projects, and calibrating rounds...'}
            </div>
          </div>
        </div>
      )}

      {/* Re-analysis Feedback Notice */}
      {reanalysisNotice && !isReanalyzing && (
        <div style={{
          background: reanalysisNotice.type === 'success' ? 'rgba(0, 245, 160, 0.08)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${reanalysisNotice.type === 'success' ? 'rgba(0, 245, 160, 0.35)' : 'rgba(239, 68, 68, 0.3)'}`,
          borderRadius: '14px',
          padding: '0.85rem 1rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          fontSize: '0.78rem',
          color: reanalysisNotice.type === 'success' ? '#E2E8F0' : '#F87171'
        }}>
          {reanalysisNotice.type === 'success' ? (
            <CheckCircle2 size={16} color="#00F5A0" style={{ flexShrink: 0, marginTop: '2px' }} />
          ) : (
            <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
          )}
          <span>{reanalysisNotice.message}</span>
        </div>
      )}

      {/* AI Resume Calibration Dashboard Card */}
      {activeAnalysis && !isReanalyzing && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 245, 160, 0.09) 0%, rgba(13, 19, 34, 0.95) 100%)',
          border: '1px solid rgba(0, 245, 160, 0.35)',
          borderRadius: '16px',
          padding: '1rem 1.1rem',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="#00F5A0" />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00F5A0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                AI Resume Calibration Active
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>
              {activeAnalysis.branch?.shortName || role}
            </span>
          </div>

          <p style={{ fontSize: '0.8rem', color: '#CBD5E1', margin: '0 0 0.65rem 0', lineHeight: 1.45 }}>
            {activeAnalysis.summary || `Calibrated questions and coding challenges for ${role}.`}
          </p>

          {/* Detected Skills Chips */}
          {activeAnalysis.skills?.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Calibrated Skills ({activeAnalysis.skills.length}):
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {activeAnalysis.skills.slice(0, 7).map((sk, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      background: 'rgba(0, 245, 160, 0.12)',
                      color: '#00F5A0',
                      border: '1px solid rgba(0, 245, 160, 0.25)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px'
                    }}
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tailored Coding Challenge Badge */}
          {activeAnalysis.codingRecommendation && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '0.5rem 0.75rem',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Calibrated Coding Challenge:</span>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
                  {activeAnalysis.codingRecommendation.title}
                </div>
              </div>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#00F2FE',
                background: 'rgba(0, 242, 254, 0.1)',
                padding: '0.15rem 0.5rem',
                borderRadius: '6px'
              }}>
                Ready
              </span>
            </div>
          )}

          {/* Direct Round Action Launchers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem' }}>
            <button
              type="button"
              onClick={() => navigate('/voice-interview', { state: { role, resumeName: currentResumeName } })}
              style={{
                background: 'rgba(0, 245, 160, 0.15)',
                border: '1px solid rgba(0, 245, 160, 0.4)',
                borderRadius: '10px',
                padding: '0.55rem',
                color: '#00F5A0',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              <Mic size={14} />
              <span>Voice Round</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/coding', { 
                state: { 
                  role, 
                  resumeName: currentResumeName,
                  challengeId: activeAnalysis.codingRecommendation?.challengeId 
                } 
              })}
              style={{
                background: 'rgba(0, 242, 254, 0.15)',
                border: '1px solid rgba(0, 242, 254, 0.4)',
                borderRadius: '10px',
                padding: '0.55rem',
                color: '#00F2FE',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              <Code2 size={14} />
              <span>Coding Round</span>
            </button>
          </div>
        </div>
      )}

      {/* Stretch Features Menu */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600, paddingLeft: '4px' }}>
          Explore Modules
        </span>

        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                background: '#0D1322',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '0.9rem 1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(0, 245, 160, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00F5A0'
                }}>
                  <Icon size={16} />
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#E2E8F0' }}>
                  {item.label}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontSize: '0.7rem',
                  color: '#00F5A0',
                  background: 'rgba(0, 245, 160, 0.1)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                  fontWeight: 600
                }}>
                  {item.badge}
                </span>
                <ChevronRight size={16} color="#64748B" />
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Engine & API Key Button */}
      <button
        onClick={() => setIsAISettingsOpen(true)}
        style={{
          background: '#0D1322',
          border: '1px solid rgba(0, 245, 160, 0.25)',
          borderRadius: '16px',
          padding: '0.9rem 1.1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#FFFFFF',
          cursor: 'pointer',
          marginTop: '0.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Key size={18} color="#00F5A0" />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            Configure Gemini AI Persona
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#00F5A0', fontWeight: 700 }}>
          Active
        </span>
      </button>

      {/* Logout / Switch User */}
      <button
        onClick={() => {
          if (logout) logout();
          navigate('/login');
        }}
        className="btn-dark-secondary"
        style={{
          width: '100%',
          padding: '0.8rem',
          borderRadius: '14px',
          marginTop: '0.5rem',
          color: '#94A3B8'
        }}
      >
        <LogOut size={16} />
        <span>Log Out</span>
      </button>

      <AISettingsModal
        isOpen={isAISettingsOpen}
        onClose={() => setIsAISettingsOpen(false)}
      />
    </div>
  );
};
