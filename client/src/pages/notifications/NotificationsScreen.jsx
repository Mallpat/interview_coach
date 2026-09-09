import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, FileText, ArrowRight } from 'lucide-react';

export const NotificationsScreen = () => {
  const navigate = useNavigate();

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
        Notifications
      </h1>

      {/* Group: Today */}
      <div>
        <span style={{
          fontSize: '0.78rem',
          color: '#94A3B8',
          fontWeight: 600,
          display: 'block',
          marginBottom: '0.65rem'
        }}>
          Today
        </span>

        <div
          onClick={() => navigate('/interview-setup')}
          style={{
            background: '#0D1322',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '1.1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(0, 245, 160, 0.3)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(0, 245, 160, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00F5A0'
          }}>
            <Bell size={18} />
          </div>
          <span style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#E2E8F0'
          }}>
            Time for your daily mock interview
          </span>
        </div>
      </div>

      {/* Group: Earlier */}
      <div>
        <span style={{
          fontSize: '0.78rem',
          color: '#94A3B8',
          fontWeight: 600,
          display: 'block',
          marginBottom: '0.65rem'
        }}>
          Earlier
        </span>

        <div
          onClick={() => navigate('/feedback-report')}
          style={{
            background: '#0D1322',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '1.1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(0, 245, 160, 0.3)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94A3B8'
          }}>
            <FileText size={18} />
          </div>
          <span style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#E2E8F0'
          }}>
            Your weekly report is ready
          </span>
        </div>
      </div>
    </div>
  );
};
