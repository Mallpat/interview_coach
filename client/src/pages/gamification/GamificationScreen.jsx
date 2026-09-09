import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Star, Trophy, Award, Sparkles, ArrowRight } from 'lucide-react';

export const GamificationScreen = () => {
  const navigate = useNavigate();

  const badges = [
    { id: 'streak', name: 'Consistency', icon: Award, unlocked: true },
    { id: 'star', name: 'Top Scorer', icon: Star, unlocked: true },
    { id: 'trophy', name: 'Champion', icon: Trophy, unlocked: false }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.75rem',
      padding: '0.75rem 0.25rem 1.5rem',
      textAlign: 'left'
    }}>
      {/* 7 Day Streak Hero Card */}
      <div style={{
        background: '#0D1322',
        border: '1.5px solid rgba(0, 245, 160, 0.45)',
        borderRadius: '20px',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        boxShadow: '0 0 30px rgba(0, 245, 160, 0.12)'
      }}>
        <Flame size={28} color="#00F5A0" />
        <span style={{
          fontSize: '1.3rem',
          fontWeight: 800,
          color: '#FFFFFF'
        }}>
          7 day streak
        </span>
      </div>

      {/* Badges Section */}
      <div>
        <span style={{
          fontSize: '0.85rem',
          color: '#94A3B8',
          fontWeight: 600,
          display: 'block',
          marginBottom: '0.85rem'
        }}>
          Badges
        </span>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem'
        }}>
          {badges.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.id}
                style={{
                  background: '#0D1322',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '1.25rem 0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  opacity: b.unlocked ? 1 : 0.4
                }}
              >
                <Icon size={24} color={b.unlocked ? '#00F5A0' : '#64748B'} />
                <span style={{
                  fontSize: '0.7rem',
                  color: b.unlocked ? '#E2E8F0' : '#64748B',
                  fontWeight: 600
                }}>
                  {b.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Practice Streak CTA */}
      <button
        onClick={() => navigate('/interview-setup')}
        className="btn-teal-glow"
        style={{
          width: '100%',
          marginTop: 'auto',
          padding: '0.85rem',
          borderRadius: '14px'
        }}
      >
        <span>Keep Your Streak Active</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
};
