import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, Sparkles, Bot, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { AISettingsModal } from '../../components/AISettingsModal';

// ---------------------------------------------------------------------------
// Lightweight inline Markdown renderer — no external deps needed
// Handles: # headings, **bold**, `code`, bullet lists, numbered lists,
//          horizontal rules, and code fences.
// ---------------------------------------------------------------------------
const MarkdownRenderer = ({ text }) => {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  const parseInline = (str) => {
    // Bold **text** and `code`
    const parts = str.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} style={{ color: '#00F5A0', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} style={{
            background: 'rgba(0,245,160,0.12)',
            color: '#00F5A0',
            borderRadius: '4px',
            padding: '0 4px',
            fontFamily: 'monospace',
            fontSize: '0.82em'
          }}>{part.slice(1, -1)}</code>
        );
      }
      return part;
    });
  };

  while (i < lines.length) {
    const line = lines[i];

    // Code fence block
    if (line.trim().startsWith('```')) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={i} style={{
          background: 'rgba(0,0,0,0.35)',
          border: '1px solid rgba(0,245,160,0.2)',
          borderRadius: '8px',
          padding: '0.65rem 0.85rem',
          overflowX: 'auto',
          fontSize: '0.78rem',
          color: '#A3E4D7',
          fontFamily: 'monospace',
          margin: '0.5rem 0',
          whiteSpace: 'pre'
        }}>{codeLines.join('\n')}</pre>
      );
      i++;
      continue;
    }

    // Headings
    const h3 = line.match(/^###\s+(.*)/);
    const h2 = line.match(/^##\s+(.*)/);
    const h1 = line.match(/^#\s+(.*)/);
    if (h1) {
      elements.push(<p key={i} style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', margin: '0.6rem 0 0.2rem' }}>{parseInline(h1[1])}</p>);
      i++; continue;
    }
    if (h2) {
      elements.push(<p key={i} style={{ fontWeight: 700, fontSize: '0.92rem', color: '#E2E8F0', margin: '0.5rem 0 0.15rem' }}>{parseInline(h2[1])}</p>);
      i++; continue;
    }
    if (h3) {
      elements.push(<p key={i} style={{ fontWeight: 600, fontSize: '0.87rem', color: '#CBD5E1', margin: '0.4rem 0 0.1rem' }}>{parseInline(h3[1])}</p>);
      i++; continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={i} style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '0.5rem 0' }} />);
      i++; continue;
    }

    // Bullet list
    if (/^[\*\-]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[\*\-]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[\*\-]\s/, ''));
        i++;
      }
      elements.push(
        <ul key={i} style={{ paddingLeft: '1.1rem', margin: '0.3rem 0', listStyle: 'none' }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ display: 'flex', gap: '6px', marginBottom: '3px' }}>
              <span style={{ color: '#00F5A0', flexShrink: 0, marginTop: '2px' }}>›</span>
              <span>{parseInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      elements.push(
        <ol key={i} style={{ paddingLeft: '1.3rem', margin: '0.3rem 0' }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '3px', color: '#E2E8F0' }}>
              {parseInline(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Empty line → spacer
    if (line.trim() === '') {
      elements.push(<div key={i} style={{ height: '4px' }} />);
      i++; continue;
    }

    // Normal paragraph line
    elements.push(
      <p key={i} style={{ margin: 0, lineHeight: 1.6 }}>{parseInline(line)}</p>
    );
    i++;
  }

  return <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>{elements}</div>;
};
// ---------------------------------------------------------------------------

export const CareerMentor = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "👋 Hi there! I'm your AI Career Coach & Tech Mentor. Ask me about system design trade-offs, behavioral STAR stories, resume optimization, or salary negotiation!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [persona, setPersona] = useState('Supportive Senior Mentor');
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedPersona = localStorage.getItem('mentor_persona') || 'Supportive Senior Mentor';
    setPersona(savedPersona);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickPrompts = [
    'Mastering STAR Framework',
    'Salary Negotiation Strategy',
    'Distributed Caching Trade-offs',
    'How to frame weaknesses'
  ];

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const activePersona = localStorage.getItem('mentor_persona') || persona;
      const res = await api.sendMentorMessage(text, activePersona, messages);
      const reply = res.assistantMessage?.content || res.reply || "I'm analyzing your request. Keep refining your approach!";
      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    } catch (err) {
      console.error('Error sending mentor message:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `⚠️ ${err.message || 'Could not reach mentor server.'} (Please check your internet connection or try again in a moment.)`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        sender: 'ai',
        text: `Fresh session started with ${persona}. What would you like to prepare for today?`
      }
    ]);
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
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.8rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.2
          }}>
            AI Career Mentor
          </h1>
          <button
            onClick={() => setIsAISettingsOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.72rem',
              color: '#00F5A0',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '2px'
            }}
          >
            <Sparkles size={11} />
            <span>Persona: {persona}</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={clearChat}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '0.35rem',
              color: '#94A3B8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Reset Chat"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Message List */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        overflowY: 'auto',
        paddingBottom: '0.75rem',
        paddingRight: '4px'
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
              maxWidth: '85%',
              padding: '0.85rem 1.05rem',
              borderRadius: '16px',
              fontSize: '0.85rem',
              lineHeight: 1.55,
              background: m.sender === 'user' ? '#0D1322' : '#0D172A',
              color: '#FFFFFF',
              border: m.sender === 'ai' ? '1px solid rgba(0, 245, 160, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: m.sender === 'ai' ? '0 0 15px rgba(0, 245, 160, 0.1)' : 'none',
              whiteSpace: 'pre-line'
            }}>
              {m.sender === 'ai' ? <MarkdownRenderer text={m.text} /> : m.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '16px',
              background: '#0D172A',
              border: '1px solid rgba(0, 245, 160, 0.3)',
              color: '#00F5A0',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Sparkles size={14} className="animate-spin" />
              <span>Your coach is formulating expert guidance...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Controls: Quick Chips + Input */}
      <div>
        {/* Quick Chips */}
        <div style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '0.75rem',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}>
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              style={{
                background: '#0D1322',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#CBD5E1',
                padding: '0.35rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                opacity: isLoading ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.borderColor = '#00F5A0';
                  e.currentTarget.style.color = '#00F5A0';
                }
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
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '9999px',
          padding: '0.35rem 0.5rem 0.35rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <input
            type="text"
            placeholder="Ask your coach anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />

          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: input.trim() && !isLoading ? '#00F5A0' : 'rgba(0, 245, 160, 0.15)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: input.trim() && !isLoading ? '#050B14' : '#00F5A0',
              cursor: input.trim() && !isLoading ? 'pointer' : 'default',
              transition: 'all 0.2s ease'
            }}
          >
            <Send size={15} />
          </button>
        </div>
      </div>

      <AISettingsModal
        isOpen={isAISettingsOpen}
        onClose={() => {
          setIsAISettingsOpen(false);
          setPersona(localStorage.getItem('mentor_persona') || 'Supportive Senior Mentor');
        }}
      />
    </div>
  );
};

