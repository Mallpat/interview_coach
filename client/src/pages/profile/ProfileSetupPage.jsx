import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Edit2, Plus, FileText, Check, ArrowRight } from 'lucide-react';
import { useAuth, getSavedCandidateName, isInvalidOrAnanya } from '../../context/AuthContext';

export const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, updateProfile, candidateName, setCandidateName } = useAuth();

  // Pick up name passed from SignupPage, localStorage, AuthContext, or location state
  const getActiveCandidateName = () => {
    try {
      // 1. Direct state passed from the previous page (SignupPage)
      const fromState = location.state?.fullName;
      if (fromState && typeof fromState === 'string' && fromState.trim() && !isInvalidOrAnanya(fromState)) {
        return fromState.trim();
      }
      // 2. Candidate name saved in localStorage
      const fromStorage = localStorage.getItem('candidate_name');
      if (fromStorage && typeof fromStorage === 'string' && fromStorage.trim() && !isInvalidOrAnanya(fromStorage)) {
        return fromStorage.trim();
      }
      // 3. AuthContext state
      if (candidateName && typeof candidateName === 'string' && candidateName.trim() && !isInvalidOrAnanya(candidateName)) {
        return candidateName.trim();
      }
      // 4. Authenticated user profile
      const fromUser = user?.name;
      if (fromUser && typeof fromUser === 'string' && fromUser.trim() && !isInvalidOrAnanya(fromUser)) {
        return fromUser.trim();
      }
      const fromProfile = profile?.fullName;
      if (fromProfile && typeof fromProfile === 'string' && fromProfile.trim() && !isInvalidOrAnanya(fromProfile)) {
        return fromProfile.trim();
      }
    } catch (e) {}
    return '';
  };

  const [fullName, setFullName] = useState(getActiveCandidateName);
  const [targetRole, setTargetRole] = useState(profile?.targetRole || 'Frontend');
  const [skills, setSkills] = useState(profile?.skills || ['React', 'Node.js']);
  const [newSkill, setNewSkill] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  // Clear any legacy cached mock names on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('candidate_name');
      if (stored && isInvalidOrAnanya(stored)) {
        localStorage.removeItem('candidate_name');
      }
    } catch (e) {}
  }, []);

  // Reactively sync state whenever location state, user, or storage updates
  useEffect(() => {
    const fromPreviousPage = location.state?.fullName;
    if (fromPreviousPage && typeof fromPreviousPage === 'string' && fromPreviousPage.trim() && !isInvalidOrAnanya(fromPreviousPage)) {
      const validName = fromPreviousPage.trim();
      setFullName(validName);
      if (setCandidateName) setCandidateName(validName);
      try {
        localStorage.setItem('candidate_name', validName);
      } catch (e) {}
    } else {
      const currentName = getActiveCandidateName();
      if (currentName && fullName !== currentName) {
        setFullName(currentName);
      }
    }
  }, [location.state, user, profile, candidateName]);

  // Real-time synchronization across screens
  useEffect(() => {
    const handleUpdate = (e) => {
      const newName = e?.detail || localStorage.getItem('candidate_name');
      if (newName && !isInvalidOrAnanya(newName) && fullName !== newName) {
        setFullName(newName);
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
  const resumeDisplayName = location.state?.resumeName || user?.resumeName || 'resume_final.pdf';

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

  const handleContinue = () => {
    const finalName = fullName.trim() || user?.name || candidateName?.trim() || 'Candidate';
    if (setCandidateName) setCandidateName(finalName);
    try {
      localStorage.setItem('candidate_name', finalName);
    } catch (e) {}
    if (updateProfile) {
      updateProfile({ fullName: finalName, targetRole, skills });
    }
    navigate('/dashboard', { state: { fullName: finalName, role: targetRole } });
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

        {/* Uploaded File Pill */}
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
          <FileText size={16} color="#00F5A0" />
          <span style={{ fontWeight: 600 }}>{resumeDisplayName}</span>
          <span style={{ color: '#00F5A0', marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 600 }}>
            uploaded
          </span>
        </div>

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
            fontSize: '0.95rem'
          }}
        >
          <span>Continue</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
