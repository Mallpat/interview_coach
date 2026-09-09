import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Video, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Camera, 
  CameraOff, 
  Sparkles, 
  Send, 
  Clock, 
  AlertCircle, 
  HelpCircle, 
  CheckCircle2,
  ChevronRight,
  Eye,
  Activity,
  Layers
} from 'lucide-react';
import { api } from '../../services/api';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { useCameraVision } from '../../hooks/useCameraVision';
import { InterviewReport } from './InterviewReport';
import { io } from 'socket.io-client';

export const LiveInterview = () => {
  const navigate = useNavigate();

  // Setup state
  const [inSession, setInSession] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Full Stack Engineer');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Senior');
  const [selectedType, setSelectedType] = useState('Technical & Behavioral');
  const [questionCount, setQuestionCount] = useState(3);
  const [enableCamera, setEnableCamera] = useState(true);
  const [enableVoice, setEnableVoice] = useState(true);

  // Session state
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [showCoachTip, setShowCoachTip] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [finalReport, setFinalReport] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [coachNudge, setCoachNudge] = useState(null);

  // Hooks
  const speech = useSpeechRecognition();
  const tts = useSpeechSynthesis();
  const vision = useCameraVision(inSession && enableCamera);
  const socketRef = useRef(null);

  // Timer
  useEffect(() => {
    let timer;
    if (inSession && !finalReport) {
      timer = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [inSession, finalReport]);

  // Socket.io for live telemetry
  useEffect(() => {
    if (inSession && session) {
      const socketServerUrl = import.meta.env.VITE_SERVER_URL || undefined;
      socketRef.current = io(socketServerUrl, { transports: ['websocket', 'polling'] });
      socketRef.current.emit('join_session', { sessionId: session.id, role: session.role });

      socketRef.current.on('coach_nudge', (data) => {
        setCoachNudge(data.message);
        setTimeout(() => setCoachNudge(null), 7000);
      });

      return () => {
        if (socketRef.current) socketRef.current.disconnect();
      };
    }
  }, [inSession, session]);

  // Read question aloud when new question arrives
  useEffect(() => {
    if (currentQuestion && enableVoice) {
      tts.speak(currentQuestion.question);
    }
    return () => tts.cancel();
  }, [currentQuestion, enableVoice]);

  const handleStartInterview = async () => {
    setSubmitting(true);
    try {
      const res = await api.createInterviewSession({
        role: selectedRole,
        difficulty: selectedDifficulty,
        type: selectedType,
        totalQuestions: questionCount
      });

      setSession(res.session);
      setCurrentQuestion(res.currentQuestion);
      setQuestionIndex(1);
      setInSession(true);
      setElapsedSeconds(0);
      speech.resetTranscript();
    } catch (err) {
      console.error('Failed to start interview:', err);
      alert('Error starting session: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!speech.transcript && !speech.interimText) {
      alert('Please speak or type an answer before submitting.');
      return;
    }

    setSubmitting(true);
    tts.cancel();
    speech.stopListening();

    try {
      const payload = {
        questionId: currentQuestion.id,
        transcript: speech.transcript || speech.interimText,
        durationSeconds: elapsedSeconds,
        fillerWordCount: speech.fillerWordCount,
        videoMetrics: {
          facePresent: vision.facePresent,
          eyeContactScore: vision.eyeContactScore,
          posture: vision.postureStatus
        }
      };

      const res = await api.submitAnswer(session.id, payload);

      if (res.completed) {
        setFinalReport(res.feedback);
      } else {
        setCurrentQuestion(res.nextQuestion);
        setQuestionIndex(res.currentOrder);
        speech.resetTranscript();
        setShowCoachTip(false);
        setElapsedSeconds(0);
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
      alert('Error submitting answer: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  // Render Post-Interview Report if completed
  if (finalReport) {
    return (
      <InterviewReport
        feedback={finalReport}
        session={session}
        onRestart={() => {
          setFinalReport(null);
          setInSession(false);
        }}
      />
    );
  }

  // Render Setup Screen
  if (!inSession) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>AI Mock Interview Setup</h1>
          <p style={{ color: '#94A3B8', marginTop: '0.4rem' }}>
            Customize your live interview round with real-time speech transcription, AI coach voice questions, and non-verbal posture feedback.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Role Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '0.75rem' }}>
              Target Job Role
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '0.75rem' }}>
              {['Full Stack Engineer', 'Frontend Engineer', 'Backend Engineer', 'AI / ML Engineer', 'DevOps Engineer', 'System Architect'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '12px',
                    textAlign: 'left',
                    background: selectedRole === role ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: selectedRole === role ? '1px solid #00F2FE' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: selectedRole === role ? '#00F2FE' : '#94A3B8',
                    fontWeight: selectedRole === role ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty & Round Type */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '0.75rem' }}>
                Seniority Level
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['Junior', 'Mid-Level', 'Senior', 'Lead'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff)}
                    style={{
                      flex: 1,
                      padding: '0.65rem 0.5rem',
                      borderRadius: '10px',
                      background: selectedDifficulty === diff ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: selectedDifficulty === diff ? '1px solid #8B5CF6' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: selectedDifficulty === diff ? '#C4B5FD' : '#94A3B8',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '0.75rem' }}>
                Round Format
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['Technical & Behavioral', 'Pure Technical', 'STAR Behavioral'].map((format) => (
                  <button
                    key={format}
                    type="button"
                    onClick={() => setSelectedType(format)}
                    style={{
                      flex: 1,
                      padding: '0.65rem 0.5rem',
                      borderRadius: '10px',
                      background: selectedType === format ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      border: selectedType === format ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: selectedType === format ? '#6EE7B7' : '#94A3B8',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hardware & Sensor Toggles */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  checked={enableCamera}
                  onChange={(e) => setEnableCamera(e.target.checked)}
                  style={{ accentColor: '#00F2FE' }}
                />
                <Camera size={16} color={enableCamera ? '#00F2FE' : '#64748B'} />
                <span>Webcam Non-Verbal Analysis</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  checked={enableVoice}
                  onChange={(e) => setEnableVoice(e.target.checked)}
                  style={{ accentColor: '#00F2FE' }}
                />
                <Volume2 size={16} color={enableVoice ? '#00F2FE' : '#64748B'} />
                <span>AI Coach Speech (TTS)</span>
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Questions:</span>
              {[3, 5].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setQuestionCount(cnt)}
                  style={{
                    padding: '0.3rem 0.75rem',
                    borderRadius: '6px',
                    background: questionCount === cnt ? '#00F2FE' : 'rgba(255, 255, 255, 0.05)',
                    color: questionCount === cnt ? '#000' : '#FFF',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>

          {/* Launch Button */}
          <button
            onClick={handleStartInterview}
            disabled={submitting}
            className="btn-primary"
            style={{
              padding: '0.9rem',
              fontSize: '1.05rem',
              justifyContent: 'center',
              width: '100%'
            }}
          >
            <Sparkles size={20} />
            {submitting ? 'Calibrating AI Interviewer...' : 'Enter Live Interview Room'}
          </button>
        </div>
      </div>
    );
  }

  // Render Live Interview Room
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'calc(100vh - 120px)' }}>
      {/* Session Top Bar */}
      <div className="glass-panel" style={{
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="badge badge-cyan">
            Question {questionIndex} of {session?.totalQuestions || questionCount}
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFF' }}>
            {session?.role} • {session?.difficulty}
          </span>
          <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
            {currentQuestion?.category || 'Technical'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94A3B8', fontSize: '0.9rem', fontWeight: 600 }}>
            <Clock size={16} color="#00F2FE" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          <button
            onClick={() => setInSession(false)}
            style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#FDA4AF',
              padding: '0.35rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Exit Round
          </button>
        </div>
      </div>

      {/* Pacing Nudge Notification if active */}
      {coachNudge && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          color: '#FCD34D',
          padding: '0.65rem 1.25rem',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          animation: 'hudPulse 2s infinite'
        }}>
          <AlertCircle size={18} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{coachNudge}</span>
        </div>
      )}

      {/* Main Grid: AI Coach Question + Camera HUD */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem', flex: 1, minHeight: 0 }}>
        {/* Left: AI Question Card */}
        <div className="glass-panel" style={{
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflowY: 'auto'
        }}>
          <div>
            {/* AI Coach Status & Voice Equalizer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00F2FE 0%, #6366F1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Sparkles size={18} color="#050B14" />
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF' }}>AI Interview Coach</span>
                  <p style={{ fontSize: '0.7rem', color: tts.isSpeaking ? '#00F2FE' : '#64748B' }}>
                    {tts.isSpeaking ? 'Speaking Question...' : 'Listening to your response...'}
                  </p>
                </div>
              </div>

              {/* Audio Wave Visualizer */}
              {tts.isSpeaking && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '24px' }}>
                  <span className="audio-bar" style={{ animationDelay: '0.1s' }}></span>
                  <span className="audio-bar" style={{ animationDelay: '0.3s' }}></span>
                  <span className="audio-bar" style={{ animationDelay: '0.5s' }}></span>
                  <span className="audio-bar" style={{ animationDelay: '0.2s' }}></span>
                </div>
              )}
            </div>

            {/* Question Text */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '1rem'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFF', lineHeight: 1.5 }}>
                "{currentQuestion?.question}"
              </h2>
            </div>

            {/* Coach Tip Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowCoachTip(!showCoachTip)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#A5B4FC',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <HelpCircle size={15} />
                {showCoachTip ? 'Hide Coach Hint' : 'View Interviewer Expectations'}
              </button>

              {showCoachTip && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '1rem',
                  borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  fontSize: '0.825rem',
                  color: '#C7D2FE',
                  lineHeight: 1.5
                }}>
                  <strong>Tip:</strong> {currentQuestion?.coachTip || 'Structure your answer using STAR or state high-level architecture before diving into code.'}
                </div>
              )}
            </div>
          </div>

          {/* Quick Speak Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              onClick={() => tts.speak(currentQuestion?.question)}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
            >
              <Volume2 size={14} /> Repeat Question
            </button>
          </div>
        </div>

        {/* Right: Camera Non-Verbal HUD */}
        <div className="glass-panel" style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            flex: 1,
            borderRadius: '12px',
            background: '#050811',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {enableCamera ? (
              <>
                <video
                  ref={vision.videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)' // Mirror view
                  }}
                />

                {/* Computer Vision Overlay Box */}
                <div style={{
                  position: 'absolute',
                  width: '65%',
                  height: '70%',
                  border: '2px solid #00F2FE',
                  borderRadius: '16px',
                  boxShadow: '0 0 15px rgba(0, 242, 254, 0.3)',
                  pointerEvents: 'none'
                }}>
                  <span style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '12px',
                    background: '#00F2FE',
                    color: '#050B14',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px'
                  }}>
                    FACE DETECTED
                  </span>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#64748B' }}>
                <CameraOff size={40} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.85rem' }}>Camera disabled</p>
              </div>
            )}

            {/* Non-Verbal Telemetry Overlay HUD */}
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              right: '10px',
              background: 'rgba(9, 14, 26, 0.85)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '0.65rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.65rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Eye size={12} color="#00F2FE" /> Eye Contact Score
                </span>
                <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFF' }}>
                  {vision.eyeContactScore}% <span style={{ fontSize: '0.65rem', color: '#6EE7B7', fontWeight: 600 }}>Stable</span>
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.65rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Activity size={12} color="#10B981" /> Posture Alignment
                </span>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6EE7B7' }}>
                  {vision.postureStatus}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Candidate Response Transcript & Controls */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF' }}>
              Your Spoken Response
            </span>

            {/* Recording Indicator */}
            {speech.isListening && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.75rem',
                color: '#F43F5E',
                fontWeight: 700
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F43F5E', animation: 'hudPulse 1s infinite' }}></span>
                Recording Voice...
              </span>
            )}

            {/* Filler words detector badge */}
            <span className={speech.fillerWordCount > 2 ? 'badge badge-amber' : 'badge badge-emerald'} style={{ fontSize: '0.65rem' }}>
              Fillers: {speech.fillerWordCount} {speech.detectedFillers.length > 0 && `(${speech.detectedFillers.join(', ')})`}
            </span>
          </div>

          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
            {speech.transcript.split(/\s+/).filter(Boolean).length} words
          </span>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          {/* Transcript input/display */}
          <textarea
            value={speech.transcript + (speech.interimText ? ' ' + speech.interimText : '')}
            onChange={(e) => speech.setTranscript(e.target.value)}
            placeholder="Click 'Start Speaking' and articulate your answer clearly, or type your response here..."
            style={{
              flex: 1,
              height: '75px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '0.75rem',
              color: '#F8FAFC',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              resize: 'none',
              outline: 'none'
            }}
          />

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '200px' }}>
            <button
              type="button"
              onClick={speech.isListening ? speech.stopListening : speech.startListening}
              style={{
                background: speech.isListening ? 'rgba(244, 63, 94, 0.2)' : 'rgba(0, 242, 254, 0.12)',
                border: speech.isListening ? '1px solid #F43F5E' : '1px solid #00F2FE',
                color: speech.isListening ? '#FDA4AF' : '#00F2FE',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '0.55rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {speech.isListening ? <MicOff size={16} /> : <Mic size={16} />}
              {speech.isListening ? 'Stop Speaking' : 'Start Speaking'}
            </button>

            <button
              type="button"
              onClick={handleSubmitAnswer}
              disabled={submitting}
              className="btn-primary"
              style={{
                fontSize: '0.85rem',
                padding: '0.55rem',
                justifyContent: 'center'
              }}
            >
              <Send size={16} />
              {submitting ? 'Evaluating...' : (questionIndex >= (session?.totalQuestions || 3) ? 'Complete Round' : 'Next Question')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
