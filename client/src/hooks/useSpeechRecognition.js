import { useState, useEffect, useRef, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capgo/capacitor-speech-recognition';

const COMMON_FILLERS = ['um', 'uh', 'like', 'actually', 'basically', 'you know', 'sort of', 'kind of', 'literally', 'right'];

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [fillerWordCount, setFillerWordCount] = useState(0);
  const [detectedFillers, setDetectedFillers] = useState([]);
  const [supported, setSupported] = useState(true);

  const isListeningRef = useRef(false);
  const webRecognitionRef = useRef(null);
  const partialListenerRef = useRef(null);
  const segmentListenerRef = useRef(null);
  const stateListenerRef = useRef(null);
  const levelListenerRef = useRef(null);
  const isNative = Capacitor.isNativePlatform();

  // Helper to count fillers
  const processTranscript = (newFullText) => {
    if (!newFullText) return;
    const words = newFullText.toLowerCase().split(/\s+/);
    const found = words.filter(w => COMMON_FILLERS.includes(w.replace(/[^a-z]/g, '')));
    setFillerWordCount(found.length);
    setDetectedFillers(Array.from(new Set(found)));
  };

  const ensurePermissions = async () => {
    if (!isNative) return true;
    try {
      const perm = await SpeechRecognition.checkPermissions();
      if (perm.speechRecognition !== 'granted') {
        const req = await SpeechRecognition.requestPermissions();
        return req.speechRecognition === 'granted';
      }
      return true;
    } catch (e) {
      console.warn('Native speech permission check error:', e);
      return false;
    }
  };

  useEffect(() => {
    let isCancelled = false;

    if (isNative) {
      // 1. Native Android Speech Recognition via @capgo/capacitor-speech-recognition
      const setupNative = async () => {
        try {
          const avail = await SpeechRecognition.available();
          if (isCancelled) return;
          setSupported(avail.available !== false);

          await ensurePermissions();

          // Listen for partial (streaming) speech results
          partialListenerRef.current = await SpeechRecognition.addListener('partialResults', (data) => {
            if (isCancelled || !isListeningRef.current) return;
            const matches = data?.matches || [];
            const interim = matches[0] || '';
            const fullText = data?.accumulatedText || (data?.accumulated ? `${data.accumulated} ${interim}`.trim() : interim);

            if (fullText) {
              setTranscript(fullText);
              setInterimText(interim);
              setIsSpeaking(true);
              processTranscript(fullText);
            }
          });

          // Listen for segmented results (Android continuous silence segmentation)
          segmentListenerRef.current = await SpeechRecognition.addListener('segmentResults', (data) => {
            if (isCancelled || !isListeningRef.current) return;
            const matches = data?.matches || [];
            if (matches.length > 0 && matches[0]) {
              setTranscript(prev => {
                const updated = prev ? `${prev} ${matches[0]}`.trim() : matches[0];
                processTranscript(updated);
                return updated;
              });
              setInterimText('');
              setIsSpeaking(true);
            }
          });

          // Listen for live native audio levels to animate waveform meters
          levelListenerRef.current = await SpeechRecognition.addListener('audioLevel', (data) => {
            if (isCancelled || !isListeningRef.current) return;
            const lvl = Math.min(100, Math.max(0, Math.round((data?.level || 0) * 100)));
            setAudioLevel(lvl);
            if (lvl > 12) {
              setIsSpeaking(true);
            }
          });

          // Listen for listening state transitions
          stateListenerRef.current = await SpeechRecognition.addListener('listeningState', (state) => {
            if (isCancelled) return;
            const isStarted = state?.status === 'started' || state?.state === 'started' || state?.status === true;
            const isStopped = state?.status === 'stopped' || state?.state === 'stopped' || state?.status === false;

            if (isStarted) {
              setIsListening(true);
            } else if (isStopped) {
              setIsListening(false);
              // Auto-restart if candidate is still actively recording (e.g. silence timeout on Android)
              if (isListeningRef.current) {
                setTimeout(() => {
                  if (isListeningRef.current && !isCancelled) {
                    SpeechRecognition.start({
                      language: 'en-US',
                      partialResults: true,
                      popup: false,
                      maxResults: 5,
                      continuousPTT: true,
                      muteRecognizerBeep: true,
                      allowForSilence: 2500
                    }).catch(() => {});
                  }
                }, 300);
              }
            }
          });
        } catch (e) {
          console.warn('Native speech recognition init notice:', e);
        }
      };
      setupNative();

      return () => {
        isCancelled = true;
        try {
          if (partialListenerRef.current?.remove) partialListenerRef.current.remove();
          if (segmentListenerRef.current?.remove) segmentListenerRef.current.remove();
          if (levelListenerRef.current?.remove) levelListenerRef.current.remove();
          if (stateListenerRef.current?.remove) stateListenerRef.current.remove();
          SpeechRecognition.stop().catch(() => {});
        } catch (e) { }
      };
    } else {
      // 2. Desktop Web Speech API fallback
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        setSupported(true);
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let currentInterim = '';
          let fullFinal = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const res = event.results[i];
            if (res.isFinal) {
              fullFinal += res[0].transcript + ' ';
            } else {
              currentInterim += res[0].transcript;
            }
          }

          if (fullFinal) {
            setTranscript((prev) => {
              const updated = (prev + ' ' + fullFinal).trim();
              processTranscript(updated);
              return updated;
            });
          }
          setInterimText(currentInterim);
          setIsSpeaking(true);
        };

        recognition.onerror = (event) => {
          console.warn('Web Speech recognition notice:', event.error);
        };

        recognition.onend = () => {
          if (isListeningRef.current && !isCancelled) {
            try {
              recognition.start();
            } catch (e) { }
          } else {
            setIsListening(false);
            isListeningRef.current = false;
          }
        };

        webRecognitionRef.current = recognition;
      } else {
        setSupported(false);
      }

      return () => {
        isCancelled = true;
        if (webRecognitionRef.current) {
          try {
            webRecognitionRef.current.stop();
          } catch (e) { }
        }
      };
    }
  }, [isNative]);

  const startListening = useCallback(async () => {
    isListeningRef.current = true;
    setIsListening(true);

    if (isNative) {
      try {
        await ensurePermissions();
        await SpeechRecognition.start({
          language: 'en-US',
          partialResults: true,
          popup: false,
          maxResults: 5,
          continuousPTT: true,
          muteRecognizerBeep: true,
          allowForSilence: 2500
        });
      } catch (err) {
        console.warn('Native speech recognition start notice:', err);
      }
    } else if (webRecognitionRef.current) {
      try {
        webRecognitionRef.current.start();
      } catch (err) { }
    }
  }, [isNative]);

  const stopListening = useCallback(async () => {
    isListeningRef.current = false;
    setIsListening(false);
    setIsSpeaking(false);

    if (isNative) {
      try {
        await SpeechRecognition.stop();
      } catch (err) {
        console.warn('Native speech recognition stop notice:', err);
      }
    } else if (webRecognitionRef.current) {
      try {
        webRecognitionRef.current.stop();
      } catch (err) { }
    }
  }, [isNative]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimText('');
    setFillerWordCount(0);
    setDetectedFillers([]);
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    transcript,
    setTranscript,
    interimText,
    setInterimText,
    audioLevel,
    isSpeaking,
    fillerWordCount,
    detectedFillers,
    supported,
    startListening,
    stopListening,
    resetTranscript
  };
};
