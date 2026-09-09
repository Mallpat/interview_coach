import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';

export const CompanyDatabaseScreen = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const companies = [
    {
      id: 'google',
      name: 'Google',
      initial: 'G',
      roleDifficulty: 'SWE • Hard',
      color: '#EA4335'
    },
    {
      id: 'microsoft',
      name: 'Microsoft',
      initial: 'M',
      roleDifficulty: 'SDE • Medium',
      color: '#00A4EF'
    },
    {
      id: 'amazon',
      name: 'Amazon',
      initial: 'A',
      roleDifficulty: 'SDE1 • Hard',
      color: '#FF9900'
    },
    {
      id: 'meta',
      name: 'Meta',
      initial: 'M',
      roleDifficulty: 'Full Stack • FAANG',
      color: '#0668E1'
    }
  ];

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.roleDifficulty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      padding: '0.75rem 0.25rem 1.5rem',
      textAlign: 'left'
    }}>
      {/* Search Companies Bar */}
      <div style={{
        background: '#0D1322',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        padding: '0.65rem 0.9rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Search size={16} color="#64748B" />
        <input
          type="text"
          placeholder="Search companies"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '0.875rem',
            outline: 'none',
            fontFamily: 'inherit'
          }}
        />
      </div>

      {/* Company List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filtered.map((comp) => (
          <div
            key={comp.id}
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
            {/* Company Initial Circle */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '1rem'
            }}>
              {comp.initial}
            </div>

            <div>
              <span style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#FFFFFF',
                display: 'block',
                marginBottom: '0.2rem'
              }}>
                {comp.name}
              </span>
              <span style={{
                fontSize: '0.75rem',
                color: '#94A3B8'
              }}>
                {comp.roleDifficulty}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
