import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Video, ShieldCheck, Search, Activity, ArrowRight, UserCheck } from 'lucide-react';

export const AdminPanel = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const users = [
    { id: 'user_042', role: 'Frontend Engineer', status: 'Active', interviews: 4, date: '2 mins ago' },
    { id: 'user_041', role: 'Full Stack Dev', status: 'Active', interviews: 8, date: '15 mins ago' },
    { id: 'user_040', role: 'Backend Engineer', status: 'Active', interviews: 2, date: '1 hour ago' },
    { id: 'user_039', role: 'DevOps Specialist', status: 'Active', interviews: 6, date: '3 hours ago' }
  ];

  const filteredUsers = users.filter(u =>
    u.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      padding: '0.75rem 0.25rem 1.5rem',
      textAlign: 'left'
    }}>
      {/* Title */}
      <h1 style={{
        fontSize: '1.6rem',
        fontWeight: 800,
        color: '#FFFFFF',
        letterSpacing: '-0.02em'
      }}>
        Admin overview
      </h1>

      {/* Top 2 Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.85rem'
      }}>
        {/* Users Card */}
        <div style={{
          background: '#0D1322',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '18px',
          padding: '1.15rem 1.25rem'
        }}>
          <span style={{
            fontSize: '0.8rem',
            color: '#94A3B8',
            fontWeight: 500,
            display: 'block',
            marginBottom: '0.25rem'
          }}>
            Users
          </span>
          <div style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '-0.02em'
          }}>
            1,204
          </div>
        </div>

        {/* Interviews Card */}
        <div style={{
          background: '#0D1322',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '18px',
          padding: '1.15rem 1.25rem'
        }}>
          <span style={{
            fontSize: '0.8rem',
            color: '#94A3B8',
            fontWeight: 500,
            display: 'block',
            marginBottom: '0.25rem'
          }}>
            Interviews
          </span>
          <div style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '-0.02em'
          }}>
            3,880
          </div>
        </div>
      </div>

      {/* User Records List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        marginTop: '0.25rem'
      }}>
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            onClick={() => navigate('/history')}
            style={{
              background: '#0D1322',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '1.1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 245, 160, 0.3)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <span style={{
              fontSize: '0.925rem',
              color: '#CBD5E1',
              fontWeight: 500,
              fontFamily: "'JetBrains Mono', monospace"
            }}>
              {user.id}
            </span>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{
                fontSize: '0.85rem',
                color: '#94A3B8',
                fontWeight: 500
              }}>
                {user.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Action: View Live Telemetry */}
      <button
        onClick={() => navigate('/analytics')}
        className="btn-teal-glow"
        style={{
          width: '100%',
          marginTop: 'auto',
          padding: '0.85rem',
          borderRadius: '14px'
        }}
      >
        <span>View Platform Analytics</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
};
