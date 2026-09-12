import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  EyeOff, 
  Save, 
  X, 
  Bot, 
  ShieldCheck,
  Zap,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';

export const AISettingsModal = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [persona, setPersona] = useState('Supportive Senior Mentor');
  const [customInstructions, setCustomInstructions] = useState('');
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key') || '';
    const storedPersona = localStorage.getItem('mentor_persona') || 'Supportive Senior Mentor';
    const storedInstructions = localStorage.getItem('mentor_instructions') || '';

    setApiKey(storedKey);
    setPersona(storedPersona);
    setCustomInstructions(storedInstructions);
    if (storedKey) {
      setValidationResult({ valid: true, message: 'Saved and Active' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleValidate = async () => {
    if (!apiKey.trim()) {
      setValidationResult({ valid: false, message: 'Please enter an API key.' });
      return;
    }

    setValidating(true);
    setValidationResult(null);
    try {
      const res = await api.validateGeminiKey(apiKey.trim());
      if (res.valid) {
        const lat = res.latencyMs ? ` in ${res.latencyMs}ms` : '';
        const modelName = res.model || 'gemini-2.5-flash';
        setValidationResult({ 
          valid: true, 
          message: `Connected to Google Gemini (${modelName})${lat}! All AI modules are active.` 
        });
      } else {
        setValidationResult({ valid: false, message: res.error || 'Invalid API key or network error.' });
      }
    } catch (err) {
      setValidationResult({ valid: false, message: err.message || 'Validation request failed.' });
    } finally {
      setValidating(false);
    }
  };

  const handleSave = () => {
    localStorage.setItem('gemini_api_key', apiKey.trim());
    localStorage.setItem('mentor_persona', persona);
    localStorage.setItem('mentor_instructions', customInstructions.trim());

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setValidationResult(null);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '520px',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: '#0D1322',
        border: '1px solid rgba(0, 242, 254, 0.3)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 242, 254, 0.15)',
        borderRadius: '20px',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00F2FE 0%, #6366F1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Key size={18} color="#050B14" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFF' }}>
                AI Coach & Gemini API Settings
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Connect your personal API key for custom quota & personality
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Quick Instructions Banner */}
        <div style={{
          background: 'rgba(0, 242, 254, 0.05)',
          border: '1px solid rgba(0, 242, 254, 0.2)',
          borderRadius: '12px',
          padding: '0.75rem 0.9rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          fontSize: '0.75rem',
          color: '#CBD5E1'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00F2FE', fontWeight: 700 }}>
            <Sparkles size={14} />
            <span>How to get your free Gemini API Key (takes 30 seconds):</span>
          </div>
          <ol style={{ paddingLeft: '1.2rem', margin: '0.25rem 0 0 0', lineHeight: 1.5, color: '#94A3B8' }}>
            <li>Open <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: '#00F2FE', textDecoration: 'underline' }}>Google AI Studio (aistudio.google.com)</a>.</li>
            <li>Click <strong>"Create API Key"</strong> and copy the generated key.</li>
            <li>Paste the key below and click <strong>"Test & Validate Key"</strong>.</li>
          </ol>
        </div>

        {/* API Key Input */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#E2E8F0' }}>
              Google Gemini API Key
            </label>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.725rem',
                color: '#00F2FE',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              Get Free Key <ExternalLink size={10} />
            </a>
          </div>

          <div style={{ position: 'relative' }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setValidationResult(null); }}
              placeholder="AQ... or AIzaSy..."
              style={{
                width: '100%',
                padding: '0.65rem 2.25rem 0.65rem 0.85rem',
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                color: '#FFF',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                outline: 'none'
              }}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer'
              }}
            >
              {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Key Validation Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.6rem' }}>
            <button
              type="button"
              onClick={handleValidate}
              disabled={validating || !apiKey.trim()}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
            >
              <Zap size={13} color="#00F2FE" />
              {validating ? 'Testing API...' : 'Test & Validate Key'}
            </button>

            {apiKey && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Clear Key
              </button>
            )}
          </div>

          {/* Validation Feedback Status */}
          {validationResult && (
            <div style={{
              marginTop: '0.5rem',
              padding: '0.55rem 0.75rem',
              borderRadius: '8px',
              background: validationResult.valid ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
              border: validationResult.valid ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)',
              color: validationResult.valid ? '#6EE7B7' : '#FDA4AF',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {validationResult.valid ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
              <span>{validationResult.message}</span>
            </div>
          )}
        </div>

        {/* Coach Personality Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '0.4rem' }}>
            AI Coach & Mentor Persona
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {[
              { title: 'Supportive Senior Mentor', desc: 'Empathy, structured STAR feedback' },
              { title: 'FAANG Staff Bar Raiser', desc: 'Rigor, deep distributed system drills' },
              { title: 'Startup CTO', desc: 'Velocity, practical trade-offs, YAGNI' },
              { title: 'Executive Leadership Coach', desc: 'Communication & stakeholder influence' }
            ].map((p) => (
              <div
                key={p.title}
                onClick={() => setPersona(p.title)}
                style={{
                  padding: '0.65rem 0.75rem',
                  borderRadius: '10px',
                  background: persona === p.title ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: persona === p.title ? '1px solid #00F2FE' : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: persona === p.title ? '#00F2FE' : '#E2E8F0',
                  display: 'block'
                }}>
                  {p.title}
                </span>
                <span style={{ fontSize: '0.65rem', color: '#64748B' }}>
                  {p.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Instructions */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '0.4rem' }}>
            Custom Interview Instructions (Optional)
          </label>
          <textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="e.g. 'I am interviewing at Stripe next week. Emphasize idempotency, payment consistency, and latency benchmarks.'"
            rows={2}
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem',
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#FFF',
              fontSize: '0.8rem',
              resize: 'none',
              outline: 'none'
            }}
          />
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          {savedSuccess ? (
            <span style={{ color: '#10B981', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <CheckCircle2 size={14} /> AI Persona & Key Saved!
            </span>
          ) : <span />}

          <button
            type="button"
            onClick={handleSave}
            className="btn-primary"
            style={{ padding: '0.65rem 1.4rem', fontSize: '0.85rem' }}
          >
            <Save size={15} /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
