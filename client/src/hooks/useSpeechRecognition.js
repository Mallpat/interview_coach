import { useState, useEffect, useRef, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition as NativeSpeechRecognition } from '@capgo/capacitor-speech-recognition';

const COMMON_FILLERS = ['um', 'uh', 'like', 'actually', 'basically', 'you know', 'sort of', 'kind of', 'literally', 'right', 'i mean', 'so'];

/**
 * Appends a newly finalized transcript segment to the existing accumulated text,
 * preventing duplicated sentences, phrases, or repeated words at the junction.
 */
export const appendDeduplicatedTranscript = (existingText, newSegment) => {
  if (!newSegment || !newSegment.trim()) return existingText || '';
  if (!existingText || !existingText.trim()) return newSegment.trim();

  const cleanExisting = existingText.trim();
  const cleanNew = newSegment.trim();

  // 1. If newSegment is already an exact match or trailing substring
  if (cleanExisting.toLowerCase().endsWith(cleanNew.toLowerCase())) {
    return cleanExisting;
  }

  // 2. Check for overlapping words at the boundary
  const existingWords = cleanExisting.split(/\s+/);
  const newWords = cleanNew.split(/\s+/);

  const maxOverlap = Math.min(existingWords.length, newWords.length, 12);
  let overlapLength = 0;

  for (let len = maxOverlap; len > 0; len--) {
    const existingSuffix = existingWords.slice(-len).map(w => w.toLowerCase().replace(/[^a-z0-9]/g, '')).join(' ');
    const newPrefix = newWords.slice(0, len).map(w => w.toLowerCase().replace(/[^a-z0-9]/g, '')).join(' ');
    if (existingSuffix && existingSuffix === newPrefix) {
      overlapLength = len;
      break;
    }
  }

  if (overlapLength > 0) {
    const nonOverlapping = newWords.slice(overlapLength);
    if (nonOverlapping.length === 0) return cleanExisting;
    return `${cleanExisting} ${nonOverlapping.join(' ')}`;
  }

  // 3. Prevent duplicate trailing single word at boundary (e.g. "systems" + "systems and architectures")
  const lastWord = existingWords[existingWords.length - 1].toLowerCase().replace(/[^a-z0-9]/g, '');
  const firstNewWord = newWords[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  if (lastWord && lastWord === firstNewWord) {
    return `${cleanExisting} ${newWords.slice(1).join(' ')}`;
  }

  return `${cleanExisting} ${cleanNew}`;
};

export const useSpeechRecognition = (options = {}) => {
  const [language, setLanguage] = useState(options.language || 'en-US');
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'starting' | 'recording' | 'paused' | 'error'
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt' | 'granted' | 'denied'
  const [error, setError] = useState(null);

  // Separate final confirmed transcript from interim live transcription
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');

  // Audio level and speech metrics
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [fillerWordCount, setFillerWordCount] = useState(0);
  const [detectedFillers, setDetectedFillers] = useState([]);

  // Platform capabilities
  const isNative = Capacitor.isNativePlatform();
  const SpeechRecognitionAPI = typeof window !== 'undefined'
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : null;
  const isSupported = Boolean(isNative || SpeechRecognitionAPI);

  // Concurrency & Lifecycle References
  const isListeningRef = useRef(false);
  const isStartingRef = useRef(false);
  const isCancelledRef = useRef(false);
  const webRecognitionRef = useRef(null);
  const restartTimerRef = useRef(null);
  const retryCounterRef = useRef(0);
  const languageRef = useRef(language);

  // Native plugin listener handles
  const partialListenerRef = useRef(null);
  const segmentListenerRef = useRef(null);
  const stateListenerRef = useRef(null);
  const levelListenerRef = useRef(null);

  // Synchronize language ref
  useEffect(() => {
    languageRef.current = language;
    if (webRecognitionRef.current) {
      try {
        webRecognitionRef.current.lang = language;
      } catch (e) { }
    }
  }, [language]);

  // Helper to count fillers across confirmed transcripts
  const processTranscript = (fullText) => {
    if (!fullText) {
      setFillerWordCount(0);
      setDetectedFillers([]);
      return;
    }
    const words = fullText.toLowerCase().split(/\s+/);
    const found = words.filter(w => COMMON_FILLERS.includes(w.replace(/[^a-z]/g, '')));
    setFillerWordCount(found.length);
    setDetectedFillers(Array.from(new Set(found)));
  };

  // Request & check microphone permissions across platforms
  const requestMicPermission = useCallback(async () => {
    if (isNative) {
      try {
        const check = await NativeSpeechRecognition.checkPermissions();
        if (check.speechRecognition === 'granted') {
          setPermissionStatus('granted');
          return true;
        }
        const req = await NativeSpeechRecognition.requestPermissions();
        const granted = req.speechRecognition === 'granted';
        setPermissionStatus(granted ? 'granted' : 'denied');
        if (!granted) {
          setError('Microphone permission was denied on your mobile device. Please allow microphone access in Settings.');
        }
        return granted;
      } catch (e) {
        console.warn('Native mic permission check notice:', e);
        return false;
      }
    } else {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        return true;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop()); // Immediately release probe stream
        setPermissionStatus('granted');
        return true;
      } catch (err) {
        console.warn('Web microphone access prompt error:', err);
        setPermissionStatus('denied');
        setError('Microphone access was denied. Please allow microphone access in your browser address bar.');
        return false;
      }
    }
  }, [isNative]);

  // Web Speech API Initialization
  const initWebRecognition = useCallback(() => {
    if (!SpeechRecognitionAPI) return null;

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = languageRef.current || 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isStartingRef.current = false;
        isListeningRef.current = true;
        setIsListening(true);
        setStatus('recording');
        setError(null);
        retryCounterRef.current = 0;
      };

      recognition.onresult = (event) => {
        retryCounterRef.current = 0; // Reset restart counter on successful speech event
        let currentInterim = '';
        let finalizedChunk = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const segment = result[0]?.transcript || '';
          if (result.isFinal) {
            finalizedChunk += segment + ' ';
          } else {
            currentInterim += segment;
          }
        }

        if (finalizedChunk.trim()) {
          setFinalTranscript(prev => {
            const updated = appendDeduplicatedTranscript(prev, finalizedChunk);
            processTranscript(updated);
            return updated;
          });
          setInterimTranscript('');
          setIsSpeaking(true);
        } else if (currentInterim) {
          setInterimTranscript(currentInterim);
          setIsSpeaking(true);
        }
      };

      recognition.onerror = (event) => {
        const errCode = event.error;
        console.warn('Web Speech recognition event notice:', errCode);

        if (errCode === 'no-speech') {
          // Normal silence pause: keep state active, do not discard candidate transcript
          return;
        }

        if (errCode === 'not-allowed' || errCode === 'service-not-allowed') {
          isListeningRef.current = false;
          setIsListening(false);
          setStatus('error');
          setPermissionStatus('denied');
          setError('Microphone access was denied. Please allow microphone permissions in your browser.');
          return;
        }

        if (errCode === 'audio-capture') {
          isListeningRef.current = false;
          setIsListening(false);
          setStatus('error');
          setError('No microphone was detected, or the microphone is busy with another application.');
          return;
        }

        if (errCode === 'network') {
          // Network interruption: preserve transcript, notify gracefully
          setError('Speech recognition network glitch. Previous sentences preserved. You can resume speaking or edit below.');
          return;
        }

        if (errCode === 'aborted') {
          return;
        }

        setError(`Speech recognition notice: ${errCode}. You can continue by typing.`);
      };

      recognition.onend = () => {
        // Auto-restart if candidate is still recording and session was not explicitly stopped
        if (isListeningRef.current && !isCancelledRef.current && retryCounterRef.current < 6) {
          retryCounterRef.current++;
          restartTimerRef.current = setTimeout(() => {
            if (isListeningRef.current && !isCancelledRef.current) {
              try {
                recognition.start();
              } catch (e) { }
            }
          }, 350);
        } else {
          setIsListening(false);
          setStatus('idle');
          setIsSpeaking(false);
          setInterimTranscript('');
        }
      };

      return recognition;
    } catch (e) {
      console.warn('Web Speech recognition init error:', e);
      return null;
    }
  }, [SpeechRecognitionAPI]);

  // Setup platform recognition listeners
  useEffect(() => {
    isCancelledRef.current = false;

    if (isNative) {
      // 1. Android/iOS Capacitor Native Setup
      const setupNativeRecognition = async () => {
        try {
          const avail = await NativeSpeechRecognition.available();
          if (isCancelledRef.current) return;
          if (!avail.available) {
            setError('Native Speech Recognition is currently unavailable on this device. You can type your answer manually.');
          }

          // Listen for streaming partial results
          partialListenerRef.current = await NativeSpeechRecognition.addListener('partialResults', (data) => {
            if (isCancelledRef.current || !isListeningRef.current) return;
            const matches = data?.matches || [];
            const interim = matches[0] || '';
            const fullText = data?.accumulatedText || (data?.accumulated ? `${data.accumulated} ${interim}`.trim() : interim);

            if (fullText) {
              setFinalTranscript(prev => appendDeduplicatedTranscript(prev, fullText));
              setInterimTranscript(interim);
              setIsSpeaking(true);
              processTranscript(fullText);
            }
          });

          // Listen for segmented results across speech pauses
          segmentListenerRef.current = await NativeSpeechRecognition.addListener('segmentResults', (data) => {
            if (isCancelledRef.current || !isListeningRef.current) return;
            const matches = data?.matches || [];
            if (matches.length > 0 && matches[0]) {
              setFinalTranscript(prev => {
                const updated = appendDeduplicatedTranscript(prev, matches[0]);
                processTranscript(updated);
                return updated;
              });
              setInterimTranscript('');
              setIsSpeaking(true);
            }
          });

          // Listen for live audio meter levels
          levelListenerRef.current = await NativeSpeechRecognition.addListener('audioLevel', (data) => {
            if (isCancelledRef.current || !isListeningRef.current) return;
            const lvl = Math.min(100, Math.max(0, Math.round((data?.level || 0) * 100)));
            setAudioLevel(lvl);
            if (lvl > 14) setIsSpeaking(true);
          });

          // Listen for session lifecycle transitions
          stateListenerRef.current = await NativeSpeechRecognition.addListener('listeningState', (state) => {
            if (isCancelledRef.current) return;
            const isStarted = state?.status === 'started' || state?.state === 'started' || state?.status === true;
            const isStopped = state?.status === 'stopped' || state?.state === 'stopped' || state?.status === false;

            if (isStarted) {
              setIsListening(true);
              setStatus('recording');
            } else if (isStopped) {
              setIsListening(false);
              // Auto-restart if candidate is still actively recording
              if (isListeningRef.current) {
                setTimeout(() => {
                  if (isListeningRef.current && !isCancelledRef.current) {
                    NativeSpeechRecognition.start({
                      language: languageRef.current || 'en-US',
                      partialResults: true,
                      popup: false,
                      maxResults: 5,
                      continuousPTT: true,
                      muteRecognizerBeep: true,
                      allowForSilence: 2800
                    }).catch(() => {});
                  }
                }, 350);
              } else {
                setStatus('idle');
              }
            }
          });
        } catch (err) {
          console.warn('Native speech initialization notice:', err);
        }
      };
      setupNativeRecognition();
    } else {
      // 2. Desktop Web Speech Setup
      webRecognitionRef.current = initWebRecognition();
    }

    return () => {
      isCancelledRef.current = true;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);

      if (isNative) {
        try {
          if (partialListenerRef.current?.remove) partialListenerRef.current.remove();
          if (segmentListenerRef.current?.remove) segmentListenerRef.current.remove();
          if (levelListenerRef.current?.remove) levelListenerRef.current.remove();
          if (stateListenerRef.current?.remove) stateListenerRef.current.remove();
          NativeSpeechRecognition.stop().catch(() => {});
        } catch (e) { }
      } else if (webRecognitionRef.current) {
        try {
          webRecognitionRef.current.abort();
        } catch (e) { }
      }
    };
  }, [isNative, initWebRecognition]);

  // Start Recording Session (with concurrency mutex & permission check)
  const startListening = useCallback(async () => {
    // 17. Prevent multiple recording sessions from running simultaneously
    if (isListeningRef.current || isStartingRef.current) {
      return;
    }

    if (!isSupported) {
      setError('Speech recognition is not supported in this browser. Please type your response directly into the text area.');
      setStatus('error');
      return;
    }

    isStartingRef.current = true;
    setStatus('starting');
    setError(null);

    // 3. Request microphone permission and handle permission denial
    const permitted = await requestMicPermission();
    if (!permitted) {
      isStartingRef.current = false;
      setStatus('error');
      return;
    }

    if (isNative) {
      try {
        isListeningRef.current = true;
        setIsListening(true);
        setStatus('recording');
        await NativeSpeechRecognition.start({
          language: languageRef.current || 'en-US',
          partialResults: true,
          popup: false,
          maxResults: 5,
          continuousPTT: true,
          muteRecognizerBeep: true,
          allowForSilence: 2800
        });
      } catch (err) {
        console.warn('Native speech start error:', err);
        setError('Could not start microphone recording. You can enter your answer by typing.');
        isListeningRef.current = false;
        setIsListening(false);
        setStatus('error');
      } finally {
        isStartingRef.current = false;
      }
    } else {
      try {
        if (!webRecognitionRef.current) {
          webRecognitionRef.current = initWebRecognition();
        }
        if (webRecognitionRef.current) {
          webRecognitionRef.current.lang = languageRef.current || 'en-US';
          webRecognitionRef.current.start();
        }
      } catch (err) {
        // If already started, smoothly transition
        if (err.name === 'InvalidStateError') {
          setIsListening(true);
          setStatus('recording');
        } else {
          console.warn('Web speech start error:', err);
          setError(`Failed to start recording: ${err.message || 'Microphone error'}.`);
          setStatus('error');
        }
      } finally {
        isStartingRef.current = false;
      }
    }
  }, [isSupported, isNative, requestMicPermission, initWebRecognition]);

  // Stop Recording Session (preserves final confirmed transcript)
  const stopListening = useCallback(async () => {
    isListeningRef.current = false;
    isStartingRef.current = false;
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);

    setIsListening(false);
    setStatus('idle');
    setIsSpeaking(false);

    // If an interim transcript was pending, cleanly commit it into final before stopping
    if (interimTranscript.trim()) {
      setFinalTranscript(prev => {
        const updated = appendDeduplicatedTranscript(prev, interimTranscript);
        processTranscript(updated);
        return updated;
      });
      setInterimTranscript('');
    }

    if (isNative) {
      try {
        await NativeSpeechRecognition.stop();
      } catch (err) {
        console.warn('Native speech stop notice:', err);
      }
    } else if (webRecognitionRef.current) {
      try {
        webRecognitionRef.current.stop();
      } catch (err) { }
    }
  }, [isNative, interimTranscript]);

  // 11. Retry Recording button: resets transcript and restarts clean recording
  const retryRecording = useCallback(async () => {
    await stopListening();
    setFinalTranscript('');
    setInterimTranscript('');
    setError(null);
    setFillerWordCount(0);
    setDetectedFillers([]);
    setIsSpeaking(false);

    // Short debounce before restart to ensure audio hardware clean release
    setTimeout(() => {
      startListening();
    }, 280);
  }, [stopListening, startListening]);

  // Reset transcript without restarting
  const resetTranscript = useCallback(() => {
    setFinalTranscript('');
    setInterimTranscript('');
    setError(null);
    setFillerWordCount(0);
    setDetectedFillers([]);
    setIsSpeaking(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    if (status === 'error') setStatus('idle');
  }, [status]);

  // 14. Combined full transcript (final confirmed + interim streaming)
  const fullTranscript = (
    finalTranscript + (interimTranscript ? (finalTranscript ? ' ' : '') + interimTranscript : '')
  ).trim();

  return {
    isListening,
    isStarting: status === 'starting',
    status,
    isSupported,
    permissionStatus,
    error,
    clearError,

    // Transcripts
    finalTranscript,
    interimTranscript,
    interimText: interimTranscript, // backward-compatibility alias
    transcript: fullTranscript,
    setTranscript: (text) => {
      setFinalTranscript(text || '');
      setInterimTranscript('');
      processTranscript(text || '');
    },

    // Language configuration
    language,
    setLanguage,

    // Metrics & Audio
    audioLevel,
    isSpeaking,
    fillerWordCount,
    detectedFillers,

    // Controls
    startListening,
    stopListening,
    retryRecording,
    resetTranscript,
    requestMicPermission
  };
};
