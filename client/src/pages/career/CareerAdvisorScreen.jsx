import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Sparkles } from 'lucide-react';

export const CareerAdvisorScreen = () => {
  const navigate = useNavigate();

  const [steps, setSteps] = useState([
    {
      id: 1,
      title: 'Learn system design',
      duration: '4 weeks',
      completed: false
    },
    {
      id: 2,
      title: 'Build 2 portfolio projects',
      duration: '6 weeks',
      completed: false
    },
    {
      id: 3,
      title: 'Apply to mid-level roles',
      duration: 'Ongoing',
      completed: false
    }
  ]);

  const toggleStep = (id) => {
    setSteps(steps.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      padding: '0.75rem 0.25rem 1.5rem',
      textAlign: 'left'
    }}>
      <h1 style={{
        fontSize: '1.6rem',
        fontWeight: 800,
        color: '#FFFFFF'
      }}>
        Your roadmap
      </h1>

      {/* Stepper Roadmap */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        paddingLeft: '0.5rem'
      }}>
        {steps.map((step) => {
          const isFirst = step.id === 1;
          return (
            <div
              key={step.id}
              onClick={() => toggleStep(step.id)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                cursor: 'pointer'
              }}
            >
              {/* Step Circle */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: isFirst || step.completed ? '#00F5A0' : '#0D1322',
                color: isFirst || step.completed ? '#050B14' : '#94A3B8',
                border: `1.5px solid ${isFirst || step.completed ? '#00F5A0' : 'rgba(255, 255, 255, 0.15)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: 800,
                flexShrink: 0,
                boxShadow: isFirst || step.completed ? '0 0 15px rgba(0, 245, 160, 0.4)' : 'none',
                transition: 'all 0.2s ease'
              }}>
                {step.completed ? <Check size={16} strokeWidth={3} /> : step.id}
              </div>

              {/* Step Info */}
              <div>
                <span style={{
                  fontSize: '0.925rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  display: 'block',
                  marginBottom: '0.2rem'
                }}>
                  {step.title}
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#94A3B8'
                }}>
                  {step.duration}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Explore Target Companies CTA */}
      <button
        onClick={() => navigate('/companies')}
        className="btn-teal-glow"
        style={{
          width: '100%',
          marginTop: 'auto',
          padding: '0.85rem',
          borderRadius: '14px'
        }}
      >
        <span>Explore Target Companies</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
};
