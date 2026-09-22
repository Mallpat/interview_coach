import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Edit2, Plus, FileText, Check, ArrowRight, Upload, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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

  const [fullName, setFullName] = useState(getActiveCandidateName);
  const [targetRole, setTargetRole] = useState(profile?.targetRole || 'Full Stack Engineer');
  const [skills, setSkills] = useState(profile?.skills || ['React', 'Node.js', 'System Design']);
  const [newSkill, setNewSkill] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);

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

  const handleResumeUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeDisplayName(file.name);
      try {
        localStorage.setItem('candidate_resume', file.name);
      } catch (err) {}
    }
  };

  const handleRemoveResume = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setResumeDisplayName(null);
    try {
      localStorage.removeItem('candidate_resume');
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
      maxWidth: '380px',
      margin: '0 auto'
    }}>
      {/* Centered Avatar with dynamic initial and Edit Pencil Badge */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '2rem'
      }}>
        <div style={{
          position: 'relative',
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(0, 245, 160, 0.15) 0%, #0D1322 80%)',
          border: '2px solid rgba(0, 245, 160, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 25px rgba(0, 245, 160, 0.2)'
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

        {/* Target role dropdown */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '0.4rem', fontWeight: 600 }}>
            Target Interview Role
          </label>
          <div style={{ position: 'relative' }}>
            <select
              className="dark-input"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              style={{
                appearance: 'none',
                cursor: 'pointer',
                color: '#FFFFFF'
              }}
            >
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Full Stack">Full Stack</option>
              <option value="Data Engineer">Data Engineer</option>
              <option value="DevOps">DevOps</option>
              <option value="System Architect">System Architect</option>
            </select>
            <span style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: '#94A3B8',
              fontSize: '0.75rem'
            }}>
              ▼
            </span>
          </div>
        </div>

        {/* Skills Section */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#94A3B8',
            marginBottom: '0.5rem'
          }}>
            Skills
          </label>

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
                  gap: '4px'
                }}
                title="Click to remove"
              >
                {skill}
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
                  onBlur={() => setIsAddingSkill(false)}
                  style={{
                    background: '#0F1626',
                    border: '1px solid #00F5A0',
                    color: '#FFF',
                    borderRadius: '9999px',
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.8rem',
                    outline: 'none',
                    width: '90px'
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
