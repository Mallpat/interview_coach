import { useState, useEffect, useRef, useCallback } from 'react';

const COMMON_FILLERS = ['um', 'uh', 'like', 'actually', 'basically', 'you know', 'sort of', 'kind of', 'literally', 'right'];

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [fillerWordCount, setFillerWordCount] = useState(0);
  const [detectedFillers, setDetectedFillers] = useState([]);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      const recognition = new SpeechRecognition();
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
            // Count fillers
            const words = updated.toLowerCase().split(/\s+/);
            const found = words.filter(w => COMMON_FILLERS.includes(w.replace(/[^a-z]/g, '')));
            setFillerWordCount(found.length);
            setDetectedFillers(Array.from(new Set(found)));
            return updated;
          });
        }
        setInterimText(currentInterim);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition status:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Failed to start speech recognition:', err);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (err) {
        console.warn('Failed to stop speech recognition:', err);
      }
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimText('');
    setFillerWordCount(0);
    setDetectedFillers([]);
  }, []);

  return {
    isListening,
    transcript,
    setTranscript,
    interimText,
    fillerWordCount,
    detectedFillers,
    supported,
    startListening,
    stopListening,
    resetTranscript
  };
};
