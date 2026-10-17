import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Edit2, Plus, FileText, Check, ArrowRight, Upload, X, RotateCcw, Sparkles, Briefcase, Code2, Mic, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
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
import { api } from '../../services/api';

export const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, updateProfile, candidateName, setCandidateName } = useAuth();

  // Pick up name passed from SignupPage, localStorage, AuthContext, or location state
  const getActiveCandidateName = () => {
    try {
      const isExcluded = (n) => !n || /ananya/i.test(n) || /mallhar/i.test(n) || /mallpat/i.test(n);

      // 1. Direct state passed from the previous page (SignupPage)
      const fromState = location.state?.fullName;
      if (fromState && typeof fromState === 'string' && fromState.trim() && !isExcluded(fromState)) {
        return fromState.trim();
      }
      // 2. Candidate name saved in localStorage
      const fromStorage = localStorage.getItem('candidate_name');
      if (fromStorage && typeof fromStorage === 'string' && fromStorage.trim() && !isExcluded(fromStorage)) {
        return fromStorage.trim();
      }
      // 3. Candidate name from AuthContext
      if (candidateName && typeof candidateName === 'string' && candidateName.trim() && !isExcluded(candidateName)) {
        return candidateName.trim();
      }
      // 4. Authenticated user object name
      const userName = user?.name || user?.displayName;
      if (userName && typeof userName === 'string' && userName.trim() && !isExcluded(userName)) {
        return userName.trim();
      }
      return '';
    } catch (e) {
      return '';
    }
  };

  const initialRole = profile?.targetRole || 'Full Stack Engineer';
  const [fullName, setFullName] = useState(getActiveCandidateName);
  const [targetRole, setTargetRole] = useState(initialRole);
  
  // Engineering branch filter: 'all' or branch ID ('cs', 'it', 'ai_ml', 'mechanical', etc.)
  const [selectedBranch, setSelectedBranch] = useState(() => {
    const branch = getBranchForRole(initialRole);
    return branch ? branch.id : 'all';
  });

  // Role-calibrated skills
  const [skills, setSkills] = useState(() => {
    if (profile?.skills && Array.isArray(profile.skills) && profile.skills.length > 0) {
      return profile.skills;
    }
    return getDefaultSkillsForRole(initialRole);
  });
  const [newSkill, setNewSkill] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState(() => getActiveResumeAnalysis());

  // Sync state if candidate name arrives or updates in real time
  useEffect(() => {
    const handleUpdate = () => {
      const current = getActiveCandidateName();
      if (current && current !== fullName) {
        setFullName(current);
      }
    };
    window.addEventListener('candidate_name_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('candidate_name_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [fullName]);

  // When role changes, automatically calibrate and set the recommended skills for that engineering role
  const handleRoleChange = (newRole) => {
    setTargetRole(newRole);
    const newDefaultSkills = getDefaultSkillsForRole(newRole);
    setSkills(newDefaultSkills);

    // Keep active branch synchronized
    const branch = getBranchForRole(newRole);
    if (branch && selectedBranch !== 'all' && selectedBranch !== branch.id) {
      setSelectedBranch(branch.id);
    }
  };

  // When user switches engineering discipline branch filter
  const handleBranchSelect = (branchId) => {
    setSelectedBranch(branchId);
    if (branchId !== 'all') {
      const branch = ENGINEERING_BRANCHES.find(b => b.id === branchId);
      if (branch && branch.roles.length > 0) {
        // If current role is already in this branch, keep it; otherwise switch to the first role of this branch
        const isCurrentInBranch = branch.roles.some(r => r.id === targetRole);
        if (!isCurrentInBranch) {
          const firstRole = branch.roles[0].id;
          setTargetRole(firstRole);
          setSkills(getDefaultSkillsForRole(firstRole));
        }
      }
    }
  };

  // Re-populate default skills for currently selected role
  const handleResetSkills = () => {
    setSkills(getDefaultSkillsForRole(targetRole));
  };

  const currentRoleObj = ALL_ROLES.find(r => r.id === targetRole);
  const currentBranchObj = getBranchForRole(targetRole);

  const avatarInitial = (
    fullName?.trim()?.charAt(0) || 
    location.state?.fullName?.trim()?.charAt(0) || 
    candidateName?.trim()?.charAt(0) || 
    user?.name?.trim()?.charAt(0) || 
    'U'
  ).toUpperCase();

  const [resumeDisplayName, setResumeDisplayName] = useState(() => {
    const fromLoc = location.state?.resumeName;
    if (fromLoc && !/resume_final/i.test(fromLoc)) return fromLoc;
    const fromUser = user?.resumeName;
    if (fromUser && !/resume_final/i.test(fromUser)) return fromUser;
    const fromStorage = localStorage.getItem('candidate_resume');
    if (fromStorage && !/resume_final/i.test(fromStorage)) return fromStorage;
    return null;
  });

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeDisplayName(file.name);
    setIsAnalyzingResume(true);

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

      // If text not directly available from binary pdf, build contextual domain text
      if (!text || text.length < 30) {
        text = `Candidate Technical Resume: ${file.name}\nTarget Role: ${targetRole}\nSpecialization: Engineering architecture, technical problem solving, development, and implementation.`;
      }

      localStorage.setItem('candidate_resume_text', text);
      const analysis = analyzeResumeForInterviews(text, file.name, targetRole);
      saveResumeAnalysis(analysis);
      setResumeAnalysis(analysis);

      // Auto-populate detected skills
      if (analysis.skills && analysis.skills.length > 0) {
        setSkills(prev => Array.from(new Set([...analysis.skills, ...prev])).slice(0, 10));
      }

      // If branch detected matches one of our engineering branches, align branch selector
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

  const handleContinue = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const finalName = (fullName || '').trim() || user?.name || candidateName?.trim() || 'Candidate';
      if (setCandidateName) {
        try { setCandidateName(finalName); } catch (err) {}
      }
      try {
        localStorage.setItem('candidate_name', finalName);
        localStorage.setItem('candidate_role', targetRole);
        localStorage.setItem('candidate_skills', JSON.stringify(skills));
      } catch (e) {}
      if (updateProfile) {
        try {
          updateProfile({ fullName: finalName, targetRole, skills });
        } catch (err) {}
      }
      navigate('/dashboard', { state: { fullName: finalName, role: targetRole }, replace: true });
    } catch (err) {
      console.error('Continue navigation error:', err);
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      justifyContent: 'center',
      padding: '1.5rem 1.25rem',
      maxWidth: '430px',
      margin: '0 auto',
      width: '100%'
    }}>
      {/* Centered Avatar with dynamic initial and Edit Pencil Badge */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '1.75rem'
      }}>
        <div style={{
          position: 'relative',
          width: '88px',
          height: '88px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(0, 245, 160, 0.18) 0%, #0D1322 80%)',
          border: '2px solid rgba(0, 245, 160, 0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 25px rgba(0, 245, 160, 0.22)'
        }}>
          <span style={{
            fontSize: '2.2rem',
            fontWeight: 800,
            color: '#00F5A0'
          }}>
            {avatarInitial}
          </span>

          {/* Pencil Edit Badge */}
          <div style={{
            position: 'absolute',
            bottom: '2px',
            right: '2px',
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: '#00F5A0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
            cursor: 'pointer'
          }}>
            <Edit2 size={13} color="#050A11" />
          </div>
        </div>
      </div>

      {/* Inputs Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '0.4rem', fontWeight: 600 }}>
            Candidate Name
          </label>
          <input
            type="text"
            className="dark-input"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => {
              const val = e.target.value;
              setFullName(val);
              if (setCandidateName) setCandidateName(val);
              try {
                localStorage.setItem('candidate_name', val);
                window.dispatchEvent(new CustomEvent('candidate_name_updated', { detail: val }));
              } catch (err) {}
            }}
          />
        </div>

        {/* Engineering Branch & Target Interview Role */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>
              Target Interview Role
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
            marginBottom: '0.65rem',
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

        {/* Skills Section with Auto-Calibration & Reset */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#94A3B8'
              }}>
                Skills
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
              <span>Reset defaults</span>
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
                  fontSize: '0.8rem',
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
                    fontSize: '0.8rem',
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
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <Plus size={13} />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>

        {/* Uploaded Resume or File Picker */}
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
                uploaded
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
                <span>Analyzing resume & calibrating questions & coding rounds...</span>
              </div>
            )}

            {/* Calibrated Resume Interview & Coding Package Card */}
            {resumeAnalysis && !isAnalyzingResume && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(0, 245, 160, 0.08) 0%, rgba(13, 19, 34, 0.95) 100%)',
                border: '1px solid rgba(0, 245, 160, 0.3)',
                borderRadius: '14px',
                padding: '0.85rem 1rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} color="#00F5A0" />
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#00F5A0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Resume Analyzed & Calibrated
                    </span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 600 }}>
                    {resumeAnalysis.branch?.shortName || selectedBranch}
                  </span>
                </div>

                <p style={{ fontSize: '0.76rem', color: '#CBD5E1', margin: '0 0 0.5rem 0', lineHeight: 1.4 }}>
                  {resumeAnalysis.summary || `Extracted skills and tailored questions for ${targetRole}.`}
                </p>

                {/* Recommended Coding Round */}
                {resumeAnalysis.codingRecommendation && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '0.45rem 0.65rem',
                    marginBottom: '0.65rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                      <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Tailored Coding Round:</span>
                      <span style={{ fontSize: '0.65rem', color: '#00F5A0', fontWeight: 700 }}>Ready</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFFFFF' }}>
                      {resumeAnalysis.codingRecommendation.title}
                    </div>
                  </div>
                )}

                {/* Quick Launch Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      saveResumeAnalysis(resumeAnalysis);
                      navigate('/voice-interview', { state: { role: targetRole, resumeName: resumeDisplayName } });
                    }}
                    style={{
                      background: 'rgba(0, 245, 160, 0.12)',
                      border: '1px solid rgba(0, 245, 160, 0.35)',
                      borderRadius: '10px',
                      padding: '0.45rem',
                      color: '#00F5A0',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Mic size={12} />
                    <span>Voice Round</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      saveResumeAnalysis(resumeAnalysis);
                      navigate('/coding', { state: { role: targetRole, resumeName: resumeDisplayName, challengeId: resumeAnalysis.codingRecommendation?.challengeId } });
                    }}
                    style={{
                      background: 'rgba(0, 242, 254, 0.12)',
                      border: '1px solid rgba(0, 242, 254, 0.35)',
                      borderRadius: '10px',
                      padding: '0.45rem',
                      color: '#00F2FE',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Code2 size={12} />
                    <span>Coding Round</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1.5px dashed rgba(255, 255, 255, 0.18)',
            fontSize: '0.8rem',
            color: '#94A3B8',
            cursor: 'pointer',
            transition: 'border-color 0.2s'
          }}>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleResumeUpload}
              style={{ display: 'none' }}
            />
            <Upload size={16} color="#00F5A0" style={{ flexShrink: 0 }} />
            <span>Attach resume (optional .pdf, .docx)</span>
          </label>
        )}

        {/* Continue Button */}
        <button
          type="button"
          onClick={handleContinue}
          className="btn-teal-glow"
          style={{
            width: '100%',
            padding: '0.9rem',
            marginTop: '0.5rem',
            borderRadius: '14px',
            fontSize: '0.95rem',
            cursor: 'pointer',
            position: 'relative',
            zIndex: 10
          }}
        >
          <span>Continue</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
