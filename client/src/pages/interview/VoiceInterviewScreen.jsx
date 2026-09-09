import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Mic, MicOff, Camera, Check, User, ChevronRight } from 'lucide-react';

export const VoiceInterviewScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const role = location.state?.role || 'Frontend';
  const difficulty = location.state?.difficulty || 'Medium';

  const [seconds, setSeconds] = useState(134); // starts at 02:14
  const [isRecording, setIsRecording] = useState(true);
  const [useWebcam, setUseWebcam] = useState(false);
  const videoRef = useRef(null);

  // Format timer MM:SS
  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle optional live camera
  useEffect(() => {
    let stream = null;
    if (useWebcam && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(err => {
          console.warn('Webcam permission not granted or unavailable:', err);
          setUseWebcam(false);
        });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [useWebcam]);

  const handleFinish = () => {
    navigate('/feedback-report', {
      state: {
        role,
        difficulty,
        score: 82,
        duration: formatTime(seconds)
      }
    });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      justifyContent: 'space-between',
      padding: '0.5rem 0.25rem 1.25rem',
      position: 'relative'
    }}>
      {/* Top Header: Close Button & Timer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.75rem'
      }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            cursor: 'pointer'
          }}
          title="Exit Interview"
        >
          <X size={18} />
        </button>

        {/* Live Timer (02:14) */}
        <span style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: '#00F5A0',
          letterSpacing: '0.05em'
        }}>
          {formatTime(seconds)}
        </span>
      </div>

      {/* Question Speech Card */}
      <div style={{
        background: '#0D1322',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '0.9rem 1.2rem',
        textAlign: 'center',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
        marginBottom: '1rem'
      }}>
        <p style={{
          fontSize: '0.925rem',
          fontWeight: 600,
          color: '#FFFFFF',
          lineHeight: 1.4
        }}>
          "Tell me about a challenging project."
        </p>
      </div>

      {/* Center Video / Camera Container */}
      <div style={{
        flex: 1,
        minHeight: '260px',
        maxHeight: '340px',
        borderRadius: '24px',
        background: 'radial-gradient(circle at center, #0F1D2F 0%, #080C14 85%)',
        border: '1px solid rgba(0, 245, 160, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 0 30px rgba(0, 245, 160, 0.08)',
        marginBottom: '1rem'
      }}>
        {useWebcam ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          /* Sleek Silhouette User */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              background: '#0D1B2A',
              border: '2px solid rgba(0, 245, 160, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(0, 245, 160, 0.15)'
            }}>
              <User size={65} color="#00F5A0" opacity={0.65} />
            </div>
            {/* Body silhouette arc */}
            <div style={{
              width: '180px',
              height: '60px',
              background: '#0D1B2A',
              borderTopLeftRadius: '90px',
              borderTopRightRadius: '90px',
              marginTop: '8px',
              opacity: 0.7
            }} />
          </div>
        )}

        {/* Webcam toggle button */}
        <button
          onClick={() => setUseWebcam(!useWebcam)}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: useWebcam ? '#00F5A0' : '#FFFFFF',
            cursor: 'pointer'
          }}
          title={useWebcam ? "Switch to silhouette" : "Switch to live webcam"}
        >
          <Camera size={16} />
        </button>
      </div>

      {/* Face Detected & Non-Verbal Status Card */}
      <div style={{
        background: '#0D1322',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '18px',
        padding: '1rem 1.25rem',
        marginBottom: '1.25rem'
      }}>
        {/* Face detected status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#00F5A0',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginBottom: '0.75rem'
        }}>
          <Check size={16} color="#00F5A0" />
          <span>Face detected</span>
        </div>

        {/* Smile metric */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '0.5rem'
        }}>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', minWidth: '40px' }}>
            Smile
          </span>
          <div style={{
            flex: 1,
            height: '6px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.08)',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '82%',
              height: '100%',
              borderRadius: '9999px',
              background: '#00F5A0',
              boxShadow: '0 0 8px rgba(0, 245, 160, 0.5)'
            }} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FFFFFF', minWidth: '32px', textAlign: 'right' }}>
            82%
          </span>
        </div>

        {/* Eyes metric */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', minWidth: '40px' }}>
            Eyes
          </span>
          <div style={{
            flex: 1,
            height: '6px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.08)',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '88%',
              height: '100%',
              borderRadius: '9999px',
              background: '#00F5A0',
              boxShadow: '0 0 8px rgba(0, 245, 160, 0.5)'
            }} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FFFFFF', minWidth: '32px', textAlign: 'right' }}>
            88%
          </span>
        </div>
      </div>

      {/* Floating Action: Pulsing Glowing Mic FAB */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <button
          onClick={() => setIsRecording(!isRecording)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#00F5A0',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 0 25px rgba(0, 245, 160, 0.6)',
            animation: isRecording ? 'micPulseGlow 2s infinite' : 'none'
          }}
          title={isRecording ? "Mute Microphone" : "Unmute Microphone"}
        >
          {isRecording ? <Mic size={26} color="#050B14" /> : <MicOff size={26} color="#050B14" />}
        </button>

        {/* Complete Round Button */}
        <button
          onClick={handleFinish}
          style={{
            position: 'absolute',
            right: 0,
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            color: '#FFFFFF',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.4rem 0.75rem',
            cursor: 'pointer'
          }}
        >
          Finish
        </button>
      </div>
    </div>
  );
};
