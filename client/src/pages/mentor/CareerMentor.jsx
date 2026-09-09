import React, { useState } from 'react';
import { Mic, Send, Sparkles } from 'lucide-react';

export const CareerMentor = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'user',
      text: 'Explain OOP in simple terms.'
    },
    {
      sender: 'ai',
      text: 'OOP organizes code around objects that bundle data and behavior together, making complex systems modular and reusable.'
    }
  ]);
  const [input, setInput] = useState('');

  const quickPrompts = ['DBMS basics', 'Resume tips', 'System design'];

  const handleSend = (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const newMsgs = [...messages, { sender: 'user', text }];
    setMessages(newMsgs);
    setInput('');

    setTimeout(() => {
      let reply = "Focus on clearly explaining time and space complexity first, then outline your edge cases before writing code.";
      if (text.toLowerCase().includes('dbms')) {
        reply = "In DBMS, ACID properties guarantee that database transactions are processed reliably: Atomicity, Consistency, Isolation, and Durability.";
      } else if (text.toLowerCase().includes('resume')) {
        reply = "Quantify your achievements using the XYZ formula: Accomplished [X] as measured by [Y], by doing [Z].";
      }
      setMessages([...newMsgs, { sender: 'ai', text: reply }]);
    }, 600);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '480px',
      justifyContent: 'space-between',
      padding: '0.75rem 0.25rem 0.5rem',
      textAlign: 'left'
    }}>
      {/* Title */}
      <h1 style={{
        fontSize: '1.6rem',
        fontWeight: 800,
        color: '#FFFFFF',
        marginBottom: '1rem'
      }}>
        Ask your mentor
      </h1>

      {/* Message List */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        overflowY: 'auto',
        paddingBottom: '1rem'
      }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              maxWidth: '82%',
              padding: '0.85rem 1.1rem',
              borderRadius: '16px',
              fontSize: '0.875rem',
              lineHeight: 1.5,
              background: m.sender === 'user' ? '#0D1322' : '#0D172A',
              color: '#FFFFFF',
              border: m.sender === 'ai' ? '1px solid rgba(0, 245, 160, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: m.sender === 'ai' ? '0 0 15px rgba(0, 245, 160, 0.1)' : 'none'
            }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Controls: Quick Chips + Input */}
      <div>
        {/* Quick Chips */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '0.85rem',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}>
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              style={{
                background: '#0D1322',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#CBD5E1',
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#00F5A0';
                e.currentTarget.style.color = '#00F5A0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#CBD5E1';
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div style={{
          background: '#0D1322',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '9999px',
          padding: '0.35rem 0.5rem 0.35rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <input
            type="text"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '0.875rem',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />

          <button
            onClick={() => handleSend()}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: input.trim() ? '#00F5A0' : 'rgba(0, 245, 160, 0.15)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: input.trim() ? '#050B14' : '#00F5A0',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {input.trim() ? <Send size={15} /> : <Mic size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
};
