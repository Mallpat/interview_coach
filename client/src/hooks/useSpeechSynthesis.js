import { useState, useEffect, useCallback, useRef } from 'react';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState([]);
  const selectedVoiceRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);

      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);

        // Pick preferred natural English voice
        const preferred = availableVoices.find(v => 
          (v.name.includes('Google') && v.lang.startsWith('en')) ||
          (v.name.includes('Natural') && v.lang.startsWith('en')) ||
          (v.lang === 'en-US' && !v.name.includes('Desktop'))
        ) || availableVoices.find(v => v.lang.startsWith('en'));

        selectedVoiceRef.current = preferred || availableVoices[0];
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const speak = useCallback((text) => {
    if (!supported || !text) return;

    window.speechSynthesis.cancel(); // cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoiceRef.current) {
      utterance.voice = selectedVoiceRef.current;
    }
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [supported]);

  const cancel = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [supported]);

  return {
    isSpeaking,
    supported,
    speak,
    cancel
  };
};
