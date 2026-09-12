import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, Sparkles, Bot, Trash2, Key } from 'lucide-react';
import { api } from '../../services/api';
import { AISettingsModal } from '../../components/AISettingsModal';

export const CareerMentor = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "👋 Hi there! I'm your AI Career Coach & Tech Mentor powered by Google Gemini. Ask me about system design trade-offs, behavioral STAR stories, resume optimization, or salary negotiation!"
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
      const res = await api.sendMentorMessage(text, activePersona);
      const reply = res.assistantMessage?.content || res.reply || "I'm analyzing your request. Keep refining your approach!";
      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    } catch (err) {
      console.error('Error sending mentor message:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `⚠️ ${err.message || 'Could not reach mentor server.'} (Make sure your Gemini API key is configured or backend is running.)`
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
            onClick={() => setIsAISettingsOpen(true)}
            style={{
              background: 'rgba(0, 245, 160, 0.08)',
              border: '1px solid rgba(0, 245, 160, 0.25)',
              borderRadius: '8px',
              padding: '0.35rem 0.6rem',
              color: '#00F5A0',
              fontSize: '0.7rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
            title="Configure Gemini API Key & Persona"
          >
            <Key size={12} />
            <span>API Key</span>
          </button>

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
              {m.text}
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
              <span>Gemini is formulating expert guidance...</span>
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
            placeholder="Ask your Gemini career mentor anything..."
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

