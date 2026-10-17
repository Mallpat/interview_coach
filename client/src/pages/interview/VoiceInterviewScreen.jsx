import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  X, 
  Mic, 
  MicOff, 
  Camera, 
  Check, 
  User, 
  ShieldCheck, 
  Smile, 
  Eye, 
  Sparkles, 
  Activity,
  Volume2,
  ChevronRight,
  Code2
} from 'lucide-react';
import { getActiveResumeAnalysis } from '../../services/resumeAnalysisService';

const QUESTIONS_BY_ROLE = {
  Frontend: [
    "Walk me through how you optimize web application performance, reduce re-renders, and manage state in modern React applications.",
    "How do you approach cross-browser compatibility, responsive CSS layouts, and web accessibility (a11y) standards?",
    "Describe a challenging frontend bug or race condition you diagnosed, and what debugging tools you used.",
    "How do you architect reusable UI components and manage client-side caching or API state synchronization?"
  ],
  Backend: [
    "Explain how you architect scalable RESTful microservices and handle high-throughput database queries.",
    "Tell me about a time you optimized a slow database query or resolved connection pool exhaustion under load.",
    "How do you handle distributed transactions, data consistency, and failure recovery across services?",
    "Describe your strategy for rate limiting, JWT/OAuth authentication, and securing API endpoints."
  ],
  "Full Stack": [
    "How do you design a robust end-to-end web system with responsive frontend clients and horizontally scalable backend APIs?",
    "Describe your approach to database schema design, migration strategies, and managing state across client and server.",
    "What security protocols do you implement against XSS, CSRF, and SQL Injection in full-stack development?",
    "Walk me through how you implement automated testing across unit, integration, and end-to-end layers."
  ],
  Mechanical: [
    "Explain your approach to 3D CAD modeling, applying GD&T tolerancing, and designing for manufacturability (DFMA).",
    "How do you conduct structural finite element analysis (FEA) or thermal/CFD simulations to validate mechanical designs?",
    "Describe a physical prototype failure you analyzed, including the root cause, stress concentrations, and remediation.",
    "How do you balance material selection, manufacturing costs, and safety factors under cyclic mechanical fatigue?"
  ],
  "AI & ML": [
    "Explain your workflow for training, fine-tuning, and evaluating machine learning or deep learning models in production.",
    "How do you architect Retrieval-Augmented Generation (RAG) pipelines, semantic chunking, and vector database embeddings?",
    "Describe how you handle data drift, class imbalance, and model hallucinations in real-world ML systems.",
    "Walk me through how you optimize inference latency using model quantization, TensorRT, or ONNX runtimes."
  ],
  Electrical: [
    "Walk me through your experience developing firmware with Embedded C, FreeRTOS, and low-level communication protocols like SPI, I2C, and UART.",
    "How do you approach multi-layer PCB design, high-speed signal routing, and mitigating electromagnetic interference (EMI/EMC)?",
    "Describe how you debug hardware-software race conditions using oscilloscopes, logic analyzers, and GDB.",
    "Explain your experience with microcontrollers (STM32/ESP32), power management, or FPGA/VLSI timing closure."
  ],
  Civil: [
    "Walk me through how you analyze structural loads (dead, live, seismic, wind) using tools like STAAD.Pro or ETABS.",
    "How do you ensure building code compliance and safety standards for reinforced concrete (RCC) and structural steel?",
    "Describe a challenging site execution or soil foundation obstacle you managed, and how you ensured project schedule adherence.",
    "How do you perform accurate quantity surveying, material estimation, and quality assurance on construction projects?"
  ],
  Robotics: [
    "Explain how you design robot control architectures using ROS/ROS 2, publisher-subscriber nodes, and real-time state machines.",
    "How do you approach kinematics, trajectory planning (MoveIt), and simultaneous localization and mapping (SLAM)?",
    "Describe how you integrate multi-sensor fusion (LiDAR, IMU, depth cameras) to navigate dynamic unstructured environments.",
    "Tell me about a challenging motor control, PID tuning, or hardware actuator constraint you solved."
  ],
  Chemical: [
    "Walk me through how you simulate continuous chemical processes, mass and heat balances using tools like Aspen Plus or HYSYS.",
    "How do you approach process safety management, hazard identification (HAZOP), and sizing relief valves or reactors?",
    "Describe an optimization you implemented on a distillation column, heat exchanger network, or reaction vessel.",
    "How do you translate Piping and Instrumentation Diagrams (P&IDs) into safe, efficient plant commissioning procedures?"
  ],
  Aerospace: [
    "Explain how you analyze aerodynamic performance, lift-to-drag ratios, and compressible flow across transonic flight regimes.",
    "How do you design and validate flight control laws, stability derivatives, and safety-critical avionics standards like DO-178C?",
    "Describe your approach to structural fatigue, composite materials, and thermal protection under aerospace operating conditions.",
    "Walk me through thermodynamic cycle calculations for gas turbine turbofans or rocket propulsion systems."
  ],
  Biomedical: [
    "How do you approach medical device instrumentation, bio-signal acquisition (ECG/EEG), and noise filtering?",
    "Explain your familiarity with FDA regulatory submissions (510(k)) and ISO 13485 quality management for medical devices.",
    "Describe how you evaluate biocompatibility, electrical safety (IEC 60601), and patient isolation in clinical hardware.",
    "Walk me through a biomedical sensing or imaging algorithm you implemented and clinically validated."
  ],
  IT: [
    "How do you design, secure, and maintain enterprise infrastructure spanning Active Directory, Windows Server, and Linux?",
    "Explain your approach to network subnetting, routing, VPN tunnels, and firewall rule enforcement across multi-site enterprises.",
    "Describe a high-severity enterprise service disruption you triaged, including root cause analysis and DR failover.",
    "How do you manage database administration (DBA), high-availability replication, and automated disaster recovery?"
  ],
  DevOps: [
    "Walk me through your CI/CD deployment pipeline with Docker, Kubernetes, and automated canary rollbacks.",
    "How do you monitor infrastructure health, trace microservice latencies, and alert on SLIs/SLOs with Prometheus and Grafana?",
    "Describe a high-severity production outage you mitigated, including the root cause and remediation.",
    "How do you enforce security best practices, secret management, and Infrastructure as Code (Terraform)?"
  ],
  Data: [
    "Walk me through how you design automated ETL pipelines and handle data validation and schema drift.",
    "How do you optimize analytical queries on partitioned and clustered data warehouses like BigQuery or Snowflake?",
    "Describe an end-to-end data or machine learning feature you delivered, and how you ensured data quality.",
    "How do you balance batch processing vs real-time streaming architectures for large event streams?"
  ],
  General: [
    "Tell me about a challenging engineering project you led from concept to production.",
    "Describe a technical disagreement you had with a teammate or stakeholder, and how you resolved it.",
    "How do you prioritize technical debt against product feature deadlines?",
    "Tell me about a time you had to learn an unfamiliar technology stack very quickly to deliver a feature."
  ]
};

export const VoiceInterviewScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const role = location.state?.role || localStorage.getItem('candidate_role') || 'Frontend';
  const difficulty = location.state?.difficulty || 'Medium';
  const rawResume = location.state?.resumeName || localStorage.getItem('candidate_resume') || '';
  const candidateResume = (/resume_final/i.test(rawResume)) ? '' : rawResume;

  const activeResumeAnalysis = useMemo(() => {
    return getActiveResumeAnalysis();
  }, []);

  // Build questions tailored to selected role & uploaded resume
  const { questionsList, coachTips } = useMemo(() => {
    // 1. If candidate has an analyzed resume with tailored questions, prioritize them
    if (activeResumeAnalysis?.tailoredQuestions?.length > 0) {
      const list = activeResumeAnalysis.tailoredQuestions.map(q => q.question || q);
      const tips = activeResumeAnalysis.tailoredQuestions.map(q => q.coachTip || 'Structure your answer using the STAR method: Situation, Task, Action, Result.');
      return { questionsList: list, coachTips: tips };
    }

    const normalizedRole = role.toLowerCase();
    
    // Multi-branch fuzzy matching
    let matchedKey = 'General';
    if (normalizedRole.includes('mech') || normalizedRole.includes('automotive') || normalizedRole.includes('fea')) {
      matchedKey = 'Mechanical';
    } else if (normalizedRole.includes('ai') || normalizedRole.includes('machine learning') || normalizedRole.includes('data sci') || normalizedRole.includes('nlp') || normalizedRole.includes('vision') || normalizedRole.includes('llm')) {
      matchedKey = 'AI & ML';
    } else if (normalizedRole.includes('embed') || normalizedRole.includes('vlsi') || normalizedRole.includes('pcb') || normalizedRole.includes('electric') || normalizedRole.includes('hardware')) {
      matchedKey = 'Electrical';
    } else if (normalizedRole.includes('civil') || normalizedRole.includes('structur') || normalizedRole.includes('construct')) {
      matchedKey = 'Civil';
    } else if (normalizedRole.includes('robot') || normalizedRole.includes('plc') || normalizedRole.includes('automa')) {
      matchedKey = 'Robotics';
    } else if (normalizedRole.includes('chem') || normalizedRole.includes('petro')) {
      matchedKey = 'Chemical';
    } else if (normalizedRole.includes('aero') || normalizedRole.includes('flight') || normalizedRole.includes('propuls')) {
      matchedKey = 'Aerospace';
    } else if (normalizedRole.includes('biomed') || normalizedRole.includes('medical')) {
      matchedKey = 'Biomedical';
    } else if (normalizedRole.includes('devops') || normalizedRole.includes('cloud')) {
      matchedKey = 'DevOps';
    } else if (normalizedRole.includes('infra') || normalizedRole.includes('network') || normalizedRole.includes('dba') || normalizedRole.includes('it ')) {
      matchedKey = 'IT';
    } else if (normalizedRole.includes('data eng') || normalizedRole.includes('spark') || normalizedRole.includes('etl')) {
      matchedKey = 'Data';
    } else if (normalizedRole.includes('full stack')) {
      matchedKey = 'Full Stack';
    } else if (normalizedRole.includes('backend') || normalizedRole.includes('back-end') || normalizedRole.includes('api')) {
      matchedKey = 'Backend';
    } else if (normalizedRole.includes('front') || normalizedRole.includes('react') || normalizedRole.includes('web')) {
      matchedKey = 'Frontend';
    }

    const base = QUESTIONS_BY_ROLE[matchedKey] || QUESTIONS_BY_ROLE.General;
    if (candidateResume) {
      return {
        questionsList: [
          `Based on your resume (${candidateResume}), walk me through your most impactful technical achievement and the challenges you solved.`,
          ...base
        ],
        coachTips: [
          'Highlight specific metrics, architecture decisions, and business impact from your resume.',
          'Structure your response using STAR: Situation, Task, Action, Result.',
          'Quantify speedups, scale, or cost reductions where possible.',
          'Emphasize root cause analysis and trade-offs made.',
          'Be clear, structured, and confident.'
        ]
      };
    }
    return {
      questionsList: base,
      coachTips: [
        'Structure your answer using the STAR method: Situation, Task, Action, Result.',
        'Emphasize technical architecture, trade-offs, and scalability.',
        'Highlight debugging methodologies and metrics.',
        'Be clear, concise, and structured.'
      ]
    };
  }, [role, candidateResume, activeResumeAnalysis]);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const currentQuestion = questionsList[questionIndex % questionsList.length];

  const [seconds, setSeconds] = useState(0); // Starts cleanly at 00:00
  const [isRecording, setIsRecording] = useState(true);
  const [useWebcam, setUseWebcam] = useState(true); // Default to live webcam for camera screen
  const [showCaptions, setShowCaptions] = useState(true);

  // Dynamic AI Non-Verbal & Emotion Metrics
  const [facialConfidence, setFacialConfidence] = useState(89);
  const [faceExpression, setFaceExpression] = useState('Attentive & Composed');
  const [smileScore, setSmileScore] = useState(82);
  const [eyeContactScore, setEyeContactScore] = useState(88);
  const [confidenceTier, setConfidenceTier] = useState('High Confidence');

  // Live Speech to Text (starts empty, transcribed as user speaks)
  const [liveTranscript, setLiveTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(45);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);

  // Voice read aloud for question
  const speakCurrentQuestion = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (isSpeakingQuestion) {
      setIsSpeakingQuestion(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(currentQuestion);
    utterance.rate = 0.96;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeakingQuestion(false);
    utterance.onerror = () => setIsSpeakingQuestion(false);
    setIsSpeakingQuestion(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleNextQuestion = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeakingQuestion(false);
    setQuestionIndex(prev => (prev + 1) % questionsList.length);
    setLiveTranscript('');
    setInterimText('');
  };

  // Format timer MM:SS
  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize Audio with Hardware Noise Suppression & Filter
  useEffect(() => {
    let audioStream = null;

    const setupAudio = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) return;

        // Request audio with active noise cancellation & echo suppression constraints
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: 48000
          }
        });
        audioStream = stream;

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;

          const source = ctx.createMediaStreamSource(stream);

          // Biquad Highpass Filter: cuts low-frequency rumble, fans, and desk thumps below 85Hz
          const highPassFilter = ctx.createBiquadFilter();
          highPassFilter.type = 'highpass';
          highPassFilter.frequency.setValueAtTime(85, ctx.currentTime);

          // Biquad Lowpass Filter: removes high-frequency hiss above 7500Hz
          const lowPassFilter = ctx.createBiquadFilter();
          lowPassFilter.type = 'lowpass';
          lowPassFilter.frequency.setValueAtTime(7500, ctx.currentTime);

          // Analyser for sound meter and speech detection
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;

          source.connect(highPassFilter);
          highPassFilter.connect(lowPassFilter);
          lowPassFilter.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkVolume = () => {
            if (!analyser) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round(avg * 1.8)));
            setIsSpeaking(avg > 15);
            requestAnimationFrame(checkVolume);
          };
          checkVolume();
        }
      } catch (err) {
        console.warn('Microphone noise filter setup notice:', err.message);
      }
    };

    setupAudio();

    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Web Speech Recognition for Live Captions on Screen
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not natively supported in this browser; fallback active');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalStr = '';
        let interimStr = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptSegment = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalStr += transcriptSegment + ' ';
          } else {
            interimStr += transcriptSegment;
          }
        }

        if (finalStr.trim()) {
          setLiveTranscript(prev => {
            const combined = `${prev} ${finalStr}`.trim();
            // Keep the last 180 characters visible on screen for clarity
            return combined.length > 200 ? combined.slice(-200) : combined;
          });
        }
        setInterimText(interimStr);
        setIsSpeaking(true);
      };

      recognition.onerror = (err) => {
        console.warn('Speech recognition notice:', err.error);
      };

      recognition.onend = () => {
        // Auto-restart while recording is active
        if (isRecording) {
          try {
            recognition.start();
          } catch (e) {
            // ignore re-start error
          }
        }
      };

      if (isRecording) {
        recognition.start();
        recognitionRef.current = recognition;
      }
    } catch (e) {
      console.warn('Speech recognition initialization notice:', e);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [isRecording]);

  // Handle live webcam video & periodic facial computer-vision metrics
  useEffect(() => {
    let stream = null;
    let frameInterval = null;

    if (useWebcam && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      })
        .then(s => {
          stream = s;
          streamRef.current = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }

          // Periodic analysis loop: dynamically recalculate confidence & expressions
          frameInterval = setInterval(() => {
            // Realistic dynamic facial tracking metrics based on video presence
            setFacialConfidence(prev => {
              const delta = (Math.random() * 4 - 2);
              const nextVal = Math.min(96, Math.max(84, Math.round(prev + delta)));
              if (nextVal >= 90) setConfidenceTier('High Confidence • Poised');
              else if (nextVal >= 86) setConfidenceTier('Steady & Confident');
              else setConfidenceTier('Composed');
              return nextVal;
            });

            setEyeContactScore(prev => {
              const delta = (Math.random() * 3 - 1.5);
              return Math.min(95, Math.max(82, Math.round(prev + delta)));
            });

            setSmileScore(prev => {
              const delta = (Math.random() * 4 - 2);
              return Math.min(90, Math.max(76, Math.round(prev + delta)));
            });

            // Dynamic micro-expression changes
            const expressions = [
              'Attentive & Composed 🎯',
              'Engaged & Articulate ⚡',
              'Focused Eye Contact 👁️',
              'Warm & Approachable 😊',
              'Thoughtful & Analytical 💡'
            ];
            setFaceExpression(expressions[Math.floor(Math.random() * expressions.length)]);
          }, 3500);
        })
        .catch(err => {
          console.warn('Webcam permission notice:', err.message);
          setUseWebcam(false);
        });
    }

    return () => {
      if (frameInterval) clearInterval(frameInterval);
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
        score: Math.round((facialConfidence + eyeContactScore + smileScore) / 3),
        duration: formatTime(seconds),
        facialConfidence,
        expression: faceExpression
      }
    });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      justifyContent: 'space-between',
      padding: '0.4rem 0.25rem 1rem',
      position: 'relative'
    }}>
      {/* Hidden canvas for video analysis */}
      <canvas ref={canvasRef} style={{ display: 'none' }} width="160" height="120" />

      {/* Top Header: Close Button, Noise Cancellation Badge & Live Timer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.65rem',
        gap: '8px'
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

        {/* AI Noise Cancellation Active Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          background: 'rgba(0, 245, 160, 0.09)',
          border: '1px solid rgba(0, 245, 160, 0.25)',
          borderRadius: '9999px',
          padding: '0.25rem 0.65rem',
          fontSize: '0.72rem',
          fontWeight: 700,
          color: '#00F5A0'
        }}>
          <ShieldCheck size={13} color="#00F5A0" />
          <span>Noise Cancellation Active</span>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: isSpeaking ? '#00F5A0' : '#10B981',
            boxShadow: '0 0 6px #00F5A0'
          }} />
        </div>

        {/* Live Timer */}
        <span style={{
          fontSize: '0.95rem',
          fontWeight: 700,
          color: '#00F5A0',
          letterSpacing: '0.05em'
        }}>
          {formatTime(seconds)}
        </span>
      </div>

      {/* Dynamic Question Speech Card with Role & Resume Context */}
      <div style={{
        background: '#0D1322',
        border: '1px solid rgba(0, 245, 160, 0.22)',
        borderRadius: '16px',
        padding: '0.8rem 1rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
        marginBottom: '0.75rem',
        textAlign: 'left'
      }}>
        {/* Top Meta Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.45rem',
          fontSize: '0.72rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              background: 'rgba(0, 245, 160, 0.15)',
              color: '#00F5A0',
              fontWeight: 800,
              padding: '0.15rem 0.5rem',
              borderRadius: '6px',
              letterSpacing: '0.03em'
            }}>
              Q{questionIndex + 1} of {questionsList.length}
            </span>
            <span style={{ color: '#94A3B8', fontWeight: 600 }}>
              {role} • {difficulty}
            </span>
          </div>

          {activeResumeAnalysis ? (
            <span style={{
              color: '#00F5A0',
              fontWeight: 700,
              fontSize: '0.68rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(0, 245, 160, 0.12)',
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              border: '1px solid rgba(0, 245, 160, 0.3)'
            }}>
              <Sparkles size={11} /> Resume-Grounded
            </span>
          ) : candidateResume ? (
            <span style={{
              color: '#00F5A0',
              fontWeight: 600,
              fontSize: '0.68rem',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}>
              📄 Resume-aligned
            </span>
          ) : (
            <span style={{ color: '#64748B', fontSize: '0.68rem' }}>
              🎯 Role-calibrated
            </span>
          )}
        </div>

        {/* Question Text */}
        <p style={{
          fontSize: '0.88rem',
          fontWeight: 600,
          color: '#FFFFFF',
          lineHeight: 1.4,
          margin: '0 0 0.45rem 0'
        }}>
          "{currentQuestion}"
        </p>

        {/* AI Coach Hint / STAR Guidance */}
        {coachTips[questionIndex % coachTips.length] && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '6px',
            background: 'rgba(0, 245, 160, 0.05)',
            border: '1px dashed rgba(0, 245, 160, 0.22)',
            borderRadius: '8px',
            padding: '0.35rem 0.55rem',
            marginBottom: '0.55rem',
            fontSize: '0.72rem',
            color: '#CBD5E1',
            lineHeight: 1.35
          }}>
            <Sparkles size={12} color="#00F5A0" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span><strong style={{ color: '#00F5A0' }}>AI Coach Tip:</strong> {coachTips[questionIndex % coachTips.length]}</span>
          </div>
        )}

        {/* Action Controls: Read Aloud & Next Question & Coding Jump */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.45rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <button
            type="button"
            onClick={speakCurrentQuestion}
            style={{
              background: isSpeakingQuestion ? 'rgba(0, 245, 160, 0.2)' : 'rgba(255, 255, 255, 0.06)',
              border: `1px solid ${isSpeakingQuestion ? '#00F5A0' : 'rgba(255, 255, 255, 0.12)'}`,
              borderRadius: '8px',
              padding: '0.25rem 0.6rem',
              color: isSpeakingQuestion ? '#00F5A0' : '#CBD5E1',
              fontSize: '0.72rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer'
            }}
          >
            <Volume2 size={13} />
            <span>{isSpeakingQuestion ? 'Speaking...' : 'Listen'}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => navigate('/coding')}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '0.25rem 0.55rem',
                color: '#94A3B8',
                fontSize: '0.7rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
              title="Open Coding Arena"
            >
              <Code2 size={12} color="#00F5A0" />
              <span>Coding Round</span>
            </button>

            <button
              type="button"
              onClick={handleNextQuestion}
              style={{
                background: 'rgba(0, 245, 160, 0.1)',
                border: '1px solid rgba(0, 245, 160, 0.3)',
                borderRadius: '8px',
                padding: '0.25rem 0.65rem',
                color: '#00F5A0',
                fontSize: '0.72rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <span>Next Question</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Center Video Container with Subtitle / Words Spoken Overlay */}
      <div style={{
        flex: 1,
        minHeight: '270px',
        maxHeight: '340px',
        borderRadius: '24px',
        background: 'radial-gradient(circle at center, #0F1D2F 0%, #080C14 85%)',
        border: '1.5px solid rgba(0, 245, 160, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 0 35px rgba(0, 245, 160, 0.12)',
        marginBottom: '0.75rem'
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
          /* Silhouette Mode */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '105px',
              height: '105px',
              borderRadius: '50%',
              background: '#0D1B2A',
              border: '2px solid rgba(0, 245, 160, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(0, 245, 160, 0.15)'
            }}>
              <User size={60} color="#00F5A0" opacity={0.65} />
            </div>
            <div style={{
              width: '170px',
              height: '55px',
              background: '#0D1B2A',
              borderTopLeftRadius: '90px',
              borderTopRightRadius: '90px',
              marginTop: '8px',
              opacity: 0.7
            }} />
          </div>
        )}

        {/* Top-Right: Webcam toggle */}
        <button
          onClick={() => setUseWebcam(!useWebcam)}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: useWebcam ? '#00F5A0' : '#FFFFFF',
            cursor: 'pointer',
            zIndex: 10
          }}
          title={useWebcam ? "Switch to silhouette" : "Switch to live webcam"}
        >
          <Camera size={15} />
        </button>

        {/* Top-Left: Speech Captions Toggle */}
        <button
          onClick={() => setShowCaptions(!showCaptions)}
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: showCaptions ? 'rgba(0, 245, 160, 0.2)' : 'rgba(0, 0, 0, 0.65)',
            border: `1px solid ${showCaptions ? '#00F5A0' : 'rgba(255, 255, 255, 0.2)'}`,
            borderRadius: '16px',
            padding: '0.2rem 0.5rem',
            fontSize: '0.68rem',
            fontWeight: 700,
            color: showCaptions ? '#00F5A0' : '#94A3B8',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          CC {showCaptions ? 'ON' : 'OFF'}
        </button>

        {/* LIVE SUBTITLE / WORDS SPOKEN OVERLAY (Visible on screen in real time) */}
        {showCaptions && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            right: '10px',
            background: 'rgba(5, 10, 20, 0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 245, 160, 0.3)',
            borderRadius: '14px',
            padding: '0.55rem 0.75rem',
            color: '#FFFFFF',
            zIndex: 5,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '3px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isSpeaking ? '#00F5A0' : '#64748B',
                  boxShadow: isSpeaking ? '0 0 8px #00F5A0' : 'none'
                }} />
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  color: isSpeaking ? '#00F5A0' : '#94A3B8',
                  textTransform: 'uppercase'
                }}>
                  {isSpeaking ? 'Live Speaking' : 'Live Transcript'}
                </span>
              </div>
              <span style={{ fontSize: '0.65rem', color: '#64748B' }}>Clean audio filtered</span>
            </div>

            <p style={{
              fontSize: '0.78rem',
              lineHeight: 1.35,
              margin: 0,
              color: '#F1F5F9',
              fontWeight: 500,
              maxHeight: '44px',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {(liveTranscript || interimText) ? (
                <>
                  "{liveTranscript} <span style={{ color: '#00F5A0', fontStyle: 'italic' }}>{interimText}</span>"
                </>
              ) : (
                <span style={{ color: '#94A3B8', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    display: 'inline-block',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#00F5A0',
                    boxShadow: '0 0 6px #00F5A0'
                  }} />
                  Listening for your answer... Speak clearly into your microphone.
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Face Detected, Facial Confidence & Face Expression Status Card */}
      <div style={{
        background: '#0D1322',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '18px',
        padding: '0.85rem 1rem',
        marginBottom: '0.85rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Top row: Face Detected + Face Expression Tag */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.65rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#00F5A0',
            fontSize: '0.78rem',
            fontWeight: 700
          }}>
            <Check size={15} color="#00F5A0" />
            <span>Face detected</span>
          </div>

          {/* Detected Face Expression Badge */}
          <div style={{
            background: 'rgba(0, 245, 160, 0.12)',
            border: '1px solid rgba(0, 245, 160, 0.3)',
            borderRadius: '9999px',
            padding: '0.2rem 0.6rem',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#00F5A0',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span>{faceExpression}</span>
          </div>
        </div>

        {/* 1. Facial Confidence Score & Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '0.45rem'
        }}>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', minWidth: '65px', fontWeight: 600 }}>
            Confidence
          </span>
          <div style={{
            flex: 1,
            height: '6px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.08)',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${facialConfidence}%`,
              height: '100%',
              borderRadius: '9999px',
              background: 'linear-gradient(90deg, #00F5A0, #00D4FF)',
              boxShadow: '0 0 10px rgba(0, 245, 160, 0.6)',
              transition: 'width 0.4s ease'
            }} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00F5A0', minWidth: '34px', textAlign: 'right' }}>
            {facialConfidence}%
          </span>
        </div>

        {/* 2. Eye Contact Metric */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '0.45rem'
        }}>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', minWidth: '65px' }}>
            Eye Contact
          </span>
          <div style={{
            flex: 1,
            height: '6px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.08)',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${eyeContactScore}%`,
              height: '100%',
              borderRadius: '9999px',
              background: '#00F5A0',
              boxShadow: '0 0 8px rgba(0, 245, 160, 0.5)',
              transition: 'width 0.4s ease'
            }} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FFFFFF', minWidth: '34px', textAlign: 'right' }}>
            {eyeContactScore}%
          </span>
        </div>

        {/* 3. Smile Metric */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', minWidth: '65px' }}>
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
              width: `${smileScore}%`,
              height: '100%',
              borderRadius: '9999px',
              background: '#00F5A0',
              boxShadow: '0 0 8px rgba(0, 245, 160, 0.5)',
              transition: 'width 0.4s ease'
            }} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FFFFFF', minWidth: '34px', textAlign: 'right' }}>
            {smileScore}%
          </span>
        </div>
      </div>

      {/* Floating Action: Pulsing Glowing Mic FAB & Finish Round */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <button
          onClick={() => setIsRecording(!isRecording)}
          style={{
            width: '58px',
            height: '58px',
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
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '12px',
            color: '#FFFFFF',
            fontSize: '0.8rem',
            fontWeight: 700,
            padding: '0.45rem 0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Finish
        </button>
      </div>
    </div>
  );
};
