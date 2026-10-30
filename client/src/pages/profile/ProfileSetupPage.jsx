import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Briefcase, 
  FileText, 
  Check, 
  ArrowRight, 
  Upload, 
  X, 
  RotateCcw, 
  Sparkles, 
  Code2, 
  Mic, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';
import { useAuth, isInvalidName } from '../../context/AuthContext';
import { 
  ENGINEERING_BRANCHES, 
  ALL_ROLES, 
  getDefaultSkillsForRole, 
  getBranchForRole 
} from '../../data/engineeringRoles';
import {
  analyzeResumeForInterviews,
  saveResumeAnalysis,
  getActiveResumeAnalysis
} from '../../services/resumeAnalysisService';
import { saveUserToFirestore } from '../../services/firebase';
import { api } from '../../services/api';

export const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, updateProfile, candidateName, setCandidateName } = useAuth();

  // Resolve initial candidate name from previous page state, user auth, profile, or localStorage
  const getActiveCandidateName = () => {
    try {
      const fromState = location.state?.fullName;
      if (fromState && typeof fromState === 'string' && fromState.trim() && !isInvalidName(fromState)) {
        return fromState.trim();
      }
      const fromUser = user?.displayName || user?.name;
      if (fromUser && typeof fromUser === 'string' && fromUser.trim() && !isInvalidName(fromUser)) {
        return fromUser.trim();
      }
      const fromProfile = profile?.fullName;
      if (fromProfile && typeof fromProfile === 'string' && fromProfile.trim() && !isInvalidName(fromProfile)) {
        return fromProfile.trim();
      }
      const fromStorage = localStorage.getItem('candidate_name');
      if (fromStorage && typeof fromStorage === 'string' && fromStorage.trim() && !isInvalidName(fromStorage)) {
        return fromStorage.trim();
      }
      if (candidateName && typeof candidateName === 'string' && candidateName.trim() && !isInvalidName(candidateName)) {
        return candidateName.trim();
      }
      return '';
    } catch (e) {
      return '';
    }
  };

  // Resolve initial email
  const getActiveEmail = () => {
    try {
      const fromState = location.state?.email;
      if (fromState && typeof fromState === 'string' && fromState.trim()) {
        return fromState.trim();
      }
      const fromUser = user?.email;
      if (fromUser && typeof fromUser === 'string' && fromUser.trim()) {
        return fromUser.trim();
      }
      const fromProfile = profile?.email;
      if (fromProfile && typeof fromProfile === 'string' && fromProfile.trim()) {
        return fromProfile.trim();
      }
      const fromStorage = localStorage.getItem('candidate_email');
      if (fromStorage && typeof fromStorage === 'string' && fromStorage.trim()) {
        return fromStorage.trim();
      }
      return '';
    } catch (e) {
      return '';
    }
  };

  const initialRole = profile?.targetRole || localStorage.getItem('candidate_role') || 'Full Stack Engineer';
  const [fullName, setFullName] = useState(getActiveCandidateName);
  const [email, setEmail] = useState(getActiveEmail);
  const [targetRole, setTargetRole] = useState(initialRole);
  const [experience, setExperience] = useState(() => {
    return profile?.experience || localStorage.getItem('candidate_experience') || 'Mid-Level (3-5 yrs)';
  });

  // Engineering branch filter
  const [selectedBranch, setSelectedBranch] = useState(() => {
    const branch = getBranchForRole(initialRole);
    return branch ? branch.id : 'all';
  });

  // Skills state
  const [skills, setSkills] = useState(() => {
    if (profile?.skills && Array.isArray(profile.skills) && profile.skills.length > 0) {
      return profile.skills;
    }
    const fromStorage = localStorage.getItem('candidate_skills');
    if (fromStorage) {
      try {
        const parsed = JSON.parse(fromStorage);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return getDefaultSkillsForRole(initialRole);
  });

  const [newSkill, setNewSkill] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState(() => getActiveResumeAnalysis());
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resume state
  const [resumeDisplayName, setResumeDisplayName] = useState(() => {
    const fromLoc = location.state?.resumeName;
    if (fromLoc && !/resume_final/i.test(fromLoc)) return fromLoc;
    const fromUser = user?.resumeName;
    if (fromUser && !/resume_final/i.test(fromUser)) return fromUser;
    const fromStorage = localStorage.getItem('candidate_resume');
    if (fromStorage && !/resume_final/i.test(fromStorage)) return fromStorage;
    return null;
  });

  const fileInputRef = useRef(null);

  // Dynamic Avatar Initial from Full Name
  const avatarInitial = (
    fullName?.trim()?.charAt(0) || 
    'U'
  ).toUpperCase();

  const currentRoleObj = ALL_ROLES.find(r => r.id === targetRole);
  const currentBranchObj = getBranchForRole(targetRole);

  // Role change handler
  const handleRoleChange = (newRole) => {
    setTargetRole(newRole);
    const newDefaultSkills = getDefaultSkillsForRole(newRole);
    setSkills(newDefaultSkills);

    const branch = getBranchForRole(newRole);
    if (branch && selectedBranch !== 'all' && selectedBranch !== branch.id) {
      setSelectedBranch(branch.id);
    }
  };

  // Branch selector handler
  const handleBranchSelect = (branchId) => {
    setSelectedBranch(branchId);
    if (branchId !== 'all') {
      const branch = ENGINEERING_BRANCHES.find(b => b.id === branchId);
      if (branch && branch.roles.length > 0) {
        const isCurrentInBranch = branch.roles.some(r => r.id === targetRole);
        if (!isCurrentInBranch) {
          const firstRole = branch.roles[0].id;
          setTargetRole(firstRole);
          setSkills(getDefaultSkillsForRole(firstRole));
        }
      }
    }
  };

  // Reset skills to role defaults
  const handleResetSkills = () => {
    setSkills(getDefaultSkillsForRole(targetRole));
  };

  // Resume upload and live ATS scan
  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeDisplayName(file.name);
    setIsAnalyzingResume(true);
    setError('');

    try {
      localStorage.setItem('candidate_resume', file.name);

      let text = '';
      if (file.name.endsWith('.txt')) {
        text = await file.text();
      } else {
        try {
          const formData = new FormData();
          formData.append('resumeFile', file);
          formData.append('targetRole', targetRole);
          const res = await api.uploadResumeFile(formData);
          if (res?.resume?.extractedText) {
            text = res.resume.extractedText;
          }
        } catch (serverErr) {
          console.warn('Server upload notice, extracting via client engine:', serverErr.message);
        }
      }

      if (!text || text.length < 30) {
        text = `Candidate Technical Resume: ${file.name}\nTarget Role: ${targetRole}\nSpecialization: Engineering architecture, systems, technical problem solving, development, and implementation.`;
      }

      localStorage.setItem('candidate_resume_text', text);
      const analysis = analyzeResumeForInterviews(text, file.name, targetRole);
      saveResumeAnalysis(analysis);
      setResumeAnalysis(analysis);

      if (analysis.skills && analysis.skills.length > 0) {
        setSkills(prev => Array.from(new Set([...analysis.skills, ...prev])).slice(0, 12));
      }

      if (analysis.branch?.branchId) {
        setSelectedBranch(analysis.branch.branchId);
      }
    } catch (err) {
      console.error('Resume processing error:', err);
    } finally {
      setIsAnalyzingResume(false);
    }
  };

  const handleRemoveResume = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setResumeDisplayName(null);
    setResumeAnalysis(null);
    try {
      localStorage.removeItem('candidate_resume');
      localStorage.removeItem('candidate_resume_analysis');
      localStorage.removeItem('candidate_resume_text');
      localStorage.removeItem('candidate_ats_score');
    } catch (err) {}
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
      setIsAddingSkill(false);
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // Form Submission & Final Validation
  const handleContinue = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setError('');

    const cleanFullName = (fullName || '').trim();
    if (!cleanFullName || cleanFullName.length < 2 || isInvalidName(cleanFullName)) {
      setError('Please enter your full name (minimum 2 characters).');
      return;
    }

    const cleanEmail = (email || '').trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!targetRole) {
      setError('Please select your target interview role.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Update AuthContext candidate name
      if (setCandidateName) {
        try { setCandidateName(cleanFullName); } catch (err) {}
      }

      // 2. Persist locally to storage
      try {
        localStorage.setItem('candidate_name', cleanFullName);
        localStorage.setItem('candidate_email', cleanEmail);
        localStorage.setItem('candidate_role', targetRole);
        localStorage.setItem('candidate_experience', experience);
        localStorage.setItem('candidate_skills', JSON.stringify(skills));
        localStorage.setItem('candidate_profile_completed', 'true');
        window.dispatchEvent(new CustomEvent('candidate_name_updated', { detail: cleanFullName }));
      } catch (e) {}

      // 3. Update AuthContext profile state
      const profilePayload = {
        fullName: cleanFullName,
        email: cleanEmail,
        targetRole,
        experience,
        skills,
        resumeName: resumeDisplayName || null,
        profileCompleted: true
      };

      if (updateProfile) {
        try {
          await updateProfile(profilePayload);
        } catch (err) {}
      }

      // 4. Save to Firestore for permanent persistence
      if (user?.uid) {
        try {
          await saveUserToFirestore(user.uid, {
            fullName: cleanFullName,
            email: cleanEmail,
            targetRole,
            experience,
            skills,
            resumeName: resumeDisplayName || null,
            profileCompleted: true,
            profile: profilePayload
          });
        } catch (fsErr) {
          console.warn('Firestore profile setup save warning:', fsErr);
        }
      }

      // 5. Navigate to Dashboard with confirmed full profile state
      navigate('/dashboard', { 
        state: { 
          fullName: cleanFullName, 
          role: targetRole,
          email: cleanEmail 
        }, 
        replace: true 
      });
    } catch (err) {
      console.error('Continue profile setup error:', err);
      navigate('/dashboard', { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      padding: '1.25rem 1rem 2.5rem',
      maxWidth: '430px',
      margin: '0 auto',
      width: '100%'
    }}>
      {/* Header Pill & Title */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0.35rem 0.8rem',
          borderRadius: '9999px',
          background: 'rgba(0, 245, 160, 0.08)',
          border: '1px solid rgba(0, 245, 160, 0.25)',
          color: '#00F5A0',
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          marginBottom: '0.75rem'
        }}>
          <Sparkles size={12} />
          <span>COMPLETE YOUR PROFILE</span>
        </div>

        <h1 style={{
          fontSize: '1.55rem',
          fontWeight: 800,
          color: '#FFFFFF',
          lineHeight: 1.25,
          marginBottom: '0.4rem'
        }}>
          Candidate Details
        </h1>
        <p style={{
          fontSize: '0.82rem',
          color: '#94A3B8',
          lineHeight: 1.45,
          maxWidth: '360px',
          margin: '0 auto'
        }}>
          Set your full name, target engineering role, and resume so all AI mock interviews and evaluations calibrate to your exact career goals.
        </p>
      </div>

      {/* Centered Avatar with dynamic Initial */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          position: 'relative',
          width: '82px',
          height: '82px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(0, 245, 160, 0.22) 0%, #0D1322 80%)',
          border: '2px solid rgba(0, 245, 160, 0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 25px rgba(0, 245, 160, 0.25)'
        }}>
          <span style={{
            fontSize: '2.1rem',
            fontWeight: 800,
            color: '#00F5A0'
          }}>
            {avatarInitial}
          </span>
        </div>

        {fullName?.trim() && (
          <span style={{
            marginTop: '0.6rem',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: '#FFFFFF'
          }}>
            {fullName.trim()}
          </span>
        )}
      </div>

      {/* Validation Error Alert */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          color: '#FCA5A5',
          borderRadius: '12px',
          padding: '0.75rem 0.9rem',
          fontSize: '0.8rem',
          marginBottom: '1rem',
          textAlign: 'left'
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Form Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
        
        {/* Field 1: Full Name */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '0.4rem', fontWeight: 600 }}>
            <User size={13} color="#00F5A0" />
            <span>Full Name</span>
            <span style={{ color: '#00F5A0' }}>*</span>
          </label>
          <input
            type="text"
            className="dark-input"
            placeholder="e.g. Mallhar Pathak"
            value={fullName}
            onChange={(e) => {
              const val = e.target.value;
              setFullName(val);
              setError('');
            }}
            style={{ fontSize: '0.9rem' }}
          />
          <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', marginTop: '0.25rem', paddingLeft: '0.2rem' }}>
            Your real full name will appear on interview reports, scorecards, and certificates.
          </span>
        </div>

        {/* Field 2: Email Address */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '0.4rem', fontWeight: 600 }}>
            <Mail size={13} color="#00F5A0" />
            <span>Email Address</span>
            <span style={{ color: '#00F5A0' }}>*</span>
          </label>
          <input
            type="email"
            className="dark-input"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            style={{ fontSize: '0.9rem' }}
          />
        </div>

        {/* Field 3: Target Role & Engineering Branch */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>
              <Briefcase size={13} color="#00F5A0" />
              <span>Target Engineering Role</span>
              <span style={{ color: '#00F5A0' }}>*</span>
            </label>
            <span style={{ fontSize: '0.7rem', color: '#00F5A0', fontWeight: 600 }}>
              {currentBranchObj?.shortName || 'Engineering Branch'}
            </span>
          </div>

          {/* Quick Engineering Branch Filter Pills */}
          <div style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '6px',
            marginBottom: '0.55rem',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            <button
              type="button"
              onClick={() => handleBranchSelect('all')}
              style={{
                flexShrink: 0,
                fontSize: '0.7rem',
                fontWeight: selectedBranch === 'all' ? 700 : 500,
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                border: selectedBranch === 'all' ? '1px solid #00F5A0' : '1px solid rgba(255, 255, 255, 0.08)',
                background: selectedBranch === 'all' ? 'rgba(0, 245, 160, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: selectedBranch === 'all' ? '#00F5A0' : '#94A3B8',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              All Branches
            </button>
            {ENGINEERING_BRANCHES.map(branch => {
              const isSelected = selectedBranch === branch.id;
              return (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => handleBranchSelect(branch.id)}
                  style={{
                    flexShrink: 0,
                    fontSize: '0.7rem',
                    fontWeight: isSelected ? 700 : 500,
                    padding: '0.25rem 0.65rem',
                    borderRadius: '9999px',
                    border: isSelected ? '1px solid #00F5A0' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: isSelected ? 'rgba(0, 245, 160, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    color: isSelected ? '#00F5A0' : '#94A3B8',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {branch.shortName}
                </button>
              );
            })}
          </div>

          {/* Role Dropdown */}
          <div style={{ position: 'relative' }}>
            <select
              className="dark-input"
              value={targetRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              style={{
                appearance: 'none',
                cursor: 'pointer',
                color: '#FFFFFF',
                paddingRight: '2.2rem',
                fontSize: '0.85rem'
              }}
            >
              {selectedBranch === 'all' ? (
                ENGINEERING_BRANCHES.map(branch => (
                  <optgroup
                    key={branch.id}
                    label={`─── ${branch.name} ───`}
                    style={{ background: '#0D1322', color: '#00F5A0', fontWeight: 700 }}
                  >
                    {branch.roles.map(r => (
                      <option
                        key={r.id}
                        value={r.id}
                        style={{ background: '#0F1626', color: '#FFFFFF', fontWeight: 500 }}
                      >
                        {r.name}
                      </option>
                    ))}
                  </optgroup>
                ))
              ) : (
                (() => {
                  const branch = ENGINEERING_BRANCHES.find(b => b.id === selectedBranch) || ENGINEERING_BRANCHES[0];
                  return (
                    <optgroup
                      label={`─── ${branch.name} ───`}
                      style={{ background: '#0D1322', color: '#00F5A0', fontWeight: 700 }}
                    >
                      {branch.roles.map(r => (
                        <option
                          key={r.id}
                          value={r.id}
                          style={{ background: '#0F1626', color: '#FFFFFF', fontWeight: 500 }}
                        >
                          {r.name}
                        </option>
                      ))}
                    </optgroup>
                  );
                })()
              )}
            </select>
            <span style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: '#00F5A0',
              fontSize: '0.75rem'
            }}>
              ▼
            </span>
          </div>

          {/* Role description preview */}
          {currentRoleObj?.description && (
            <p style={{
              fontSize: '0.72rem',
              color: '#64748B',
              marginTop: '0.35rem',
              paddingLeft: '0.2rem',
              lineHeight: 1.35
            }}>
              {currentRoleObj.description}
            </p>
          )}
        </div>

        {/* Field 4: Target Experience Level */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '0.4rem', fontWeight: 600 }}>
            Experience Level
          </label>
          <div style={{ position: 'relative' }}>
            <select
              className="dark-input"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              style={{
                appearance: 'none',
                cursor: 'pointer',
                color: '#FFFFFF',
                paddingRight: '2.2rem',
                fontSize: '0.85rem'
              }}
            >
              <option value="Entry Level (0-1 yrs)">Entry Level / Fresher (0-1 yrs)</option>
              <option value="Junior (1-3 yrs)">Junior Engineer (1-3 yrs)</option>
              <option value="Mid-Level (3-5 yrs)">Mid-Level Engineer (3-5 yrs)</option>
              <option value="Senior (5+ yrs)">Senior Engineer (5+ yrs)</option>
              <option value="Lead / Staff (8+ yrs)">Lead / Staff / Principal (8+ yrs)</option>
            </select>
            <span style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: '#00F5A0',
              fontSize: '0.75rem'
            }}>
              ▼
            </span>
          </div>
        </div>

        {/* Field 5: Resume Upload & Live ATS Scanner */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '0.4rem', fontWeight: 600 }}>
            Resume (PDF, DOCX, or TXT)
          </label>

          {resumeDisplayName ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: 'rgba(0, 245, 160, 0.06)',
                border: '1px solid rgba(0, 245, 160, 0.25)',
                fontSize: '0.8rem',
                color: '#E2E8F0'
              }}>
                <FileText size={16} color="#00F5A0" style={{ flexShrink: 0 }} />
                <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {resumeDisplayName}
                </span>
                <span style={{ color: '#00F5A0', fontSize: '0.72rem', fontWeight: 600, flexShrink: 0 }}>
                  Attached
                </span>
                <button
                  type="button"
                  onClick={handleRemoveResume}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0
                  }}
                  title="Remove resume"
                >
                  <X size={15} />
                </button>
              </div>

              {/* In-progress analysis indicator */}
              {isAnalyzingResume && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  background: 'rgba(0, 245, 160, 0.05)',
                  border: '1px dashed rgba(0, 245, 160, 0.3)',
                  fontSize: '0.75rem',
                  color: '#00F5A0'
                }}>
                  <RefreshCw size={14} className="spin" />
                  <span>Scanning resume & calibrating interview questions...</span>
                </div>
              )}

              {/* Calibrated Resume Card */}
              {resumeAnalysis && !isAnalyzingResume && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0, 245, 160, 0.08) 0%, rgba(13, 19, 34, 0.95) 100%)',
                  border: '1px solid rgba(0, 245, 160, 0.3)',
                  borderRadius: '14px',
                  padding: '0.85rem 1rem',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={14} color="#00F5A0" />
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#00F5A0', letterSpacing: '0.04em' }}>
                        ATS CALIBRATED • {resumeAnalysis.atsScore || 78}/100
                      </span>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 600 }}>
                      {resumeAnalysis.branch?.shortName || selectedBranch}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.76rem', color: '#CBD5E1', margin: '0', lineHeight: 1.4 }}>
                    {resumeAnalysis.summary || `Extracted technical skills and tailored mock rounds for ${targetRole}.`}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleResumeUpload}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1.5px dashed rgba(255, 255, 255, 0.18)',
                  fontSize: '0.82rem',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#00F5A0';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
                  e.currentTarget.style.color = '#94A3B8';
                }}
              >
                <Upload size={16} color="#00F5A0" />
                <span>Upload Technical Resume (optional .pdf, .docx)</span>
              </button>
            </div>
          )}
        </div>

        {/* Field 6: Technical Skills */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#94A3B8'
              }}>
                Key Technical Skills
              </label>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '0.65rem',
                fontWeight: 600,
                color: '#00F5A0',
                background: 'rgba(0, 245, 160, 0.08)',
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                border: '1px solid rgba(0, 245, 160, 0.2)'
              }}>
                <Sparkles size={10} /> Auto-calibrated
              </span>
            </div>

            <button
              type="button"
              onClick={handleResetSkills}
              title="Reset skills to role defaults"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                fontSize: '0.7rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#00F5A0'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}
            >
              <RotateCcw size={11} />
              <span>Reset</span>
            </button>
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '8px'
          }}>
            {skills.map((skill) => (
              <span
                key={skill}
                onClick={() => handleRemoveSkill(skill)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                  e.currentTarget.style.color = '#FCA5A5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                title="Click to remove skill"
              >
                <span>{skill}</span>
                <X size={11} style={{ opacity: 0.6 }} />
              </span>
            ))}

            {isAddingSkill ? (
              <form onSubmit={handleAddSkill} style={{ display: 'inline-flex' }}>
                <input
                  type="text"
                  autoFocus
                  placeholder="Skill name"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onBlur={() => {
                    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
                      setSkills([...skills, newSkill.trim()]);
                      setNewSkill('');
                    }
                    setIsAddingSkill(false);
                  }}
                  style={{
                    background: '#0F1626',
                    border: '1px solid #00F5A0',
                    color: '#FFF',
                    borderRadius: '9999px',
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.78rem',
                    outline: 'none',
                    width: '105px'
                  }}
                />
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingSkill(true)}
                style={{
                  background: 'transparent',
                  border: '1px dashed rgba(0, 245, 160, 0.4)',
                  color: '#00F5A0',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <Plus size={12} />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={isSubmitting}
          className="btn-teal-glow"
          style={{
            width: '100%',
            padding: '0.95rem',
            marginTop: '0.8rem',
            borderRadius: '14px',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {isSubmitting ? (
            <span>Saving Profile...</span>
          ) : (
            <>
              <span>Complete Setup & Enter Dashboard</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

      </div>
    </div>
  );
};

export default ProfileSetupPage;
