import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Server, Database, GitBranch, ArrowRight, Sparkles } from 'lucide-react';

export const MockInterviewSetup = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('Frontend');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');

  const roles = [
    { id: 'Frontend', name: 'Frontend', icon: Monitor },
    { id: 'Backend', name: 'Backend', icon: Server },
    { id: 'Data', name: 'Data', icon: Database },
    { id: 'DevOps', name: 'DevOps', icon: GitBranch }
  ];

  const difficulties = ['Medium', 'Hard', 'FAANG'];

  const handleStart = () => {
    navigate('/voice-interview', { state: { role: selectedRole, difficulty: selectedDifficulty } });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.75rem',
      padding: '1rem 0.25rem 1.5rem',
      textAlign: 'left'
    }}>
      <h1 style={{
        fontSize: '1.6rem',
        fontWeight: 800,
        color: '#FFFFFF'
      }}>
        Choose a role
      </h1>

      {/* 2x2 Role Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.9rem'
      }}>
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;
          return (
            <div
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              style={{
                background: '#0D1322',
                border: `1.5px solid ${isSelected ? '#00F5A0' : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: '16px',
                padding: '1.25rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.65rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 0 20px rgba(0, 245, 160, 0.15)' : 'none'
              }}
            >
              <Icon size={26} color={isSelected ? '#00F5A0' : '#94A3B8'} />
              <span style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: isSelected ? '#FFFFFF' : '#94A3B8'
              }}>
                {role.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Difficulty Selector */}
      <div>
        <span style={{
          fontSize: '0.8rem',
          color: '#94A3B8',
          fontWeight: 600,
          display: 'block',
          marginBottom: '0.65rem'
        }}>
          Difficulty
        </span>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          {difficulties.map((diff) => {
            const isActive = selectedDifficulty === diff;
            return (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                style={{
                  flex: 1,
                  background: isActive ? '#00F5A0' : '#0D1322',
                  color: isActive ? '#050B14' : '#94A3B8',
                  border: `1px solid ${isActive ? '#00F5A0' : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: '9999px',
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 0 15px rgba(0, 245, 160, 0.3)' : 'none'
                }}
              >
                {diff}
              </button>
            );
          })}
        </div>
      </div>

      {/* Start Interview Action */}
      <button
        onClick={handleStart}
        className="btn-teal-glow"
        style={{
          width: '100%',
          marginTop: 'auto',
          padding: '0.95rem',
          borderRadius: '16px',
          fontSize: '1rem'
        }}
      >
        <span>Start interview</span>
        <ArrowRight size={18} />
      </button>
    </div>
  );
};
