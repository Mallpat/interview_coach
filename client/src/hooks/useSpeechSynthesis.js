import { useState, useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

/**
 * Filter and select the most natural sounding English voice available
 */
const pickBestEnglishVoice = (voiceList) => {
  if (!voiceList || voiceList.length === 0) return null;

  return (
    // Priority 1: Google Natural / Premium English voices
    voiceList.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium') || v.name.includes('Online'))) ||
    // Priority 2: US English native system voices
    voiceList.find(v => (v.lang === 'en-US' || v.lang === 'en_US') && !v.name.includes('Desktop')) ||
    // Priority 3: Any English US / GB / AU / IN voice
    voiceList.find(v => v.lang.startsWith('en-US')) ||
    voiceList.find(v => v.lang.startsWith('en-GB')) ||
    voiceList.find(v => v.lang.startsWith('en')) ||
    // Fallback to first available
    voiceList[0]
  );
};

export const useSpeechSynthesis = () => {
  const [status, setStatus] = useState('idle'); // 'idle' | 'speaking' | 'paused' | 'finished' | 'unavailable'
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('interview_tts_muted') === 'true');
  const [supported, setSupported] = useState(true);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);

  const activeUtteranceRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const isPausedRef = useRef(false);
  const audioFallbackRef = useRef(null);
  const isMutedRef = useRef(isMuted);
  const onEndCallbackRef = useRef(null);
  const isCancelledRef = useRef(false);

  const isNative = Capacitor.isNativePlatform();
  const hasBrowserSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Sync mute state to ref and localStorage
  useEffect(() => {
    isMutedRef.current = isMuted;
    try {
      localStorage.setItem('interview_tts_muted', isMuted ? 'true' : 'false');
    } catch (e) { }
  }, [isMuted]);

  // 9. Load available voices correctly using speechSynthesis.getVoices() and voiceschanged
  useEffect(() => {
    if (!hasBrowserSpeech) {
      if (!isNative) {
        setSupported(false);
        setStatus('unavailable');
      }
      return;
    }

    const updateVoices = () => {
      try {
        const available = window.speechSynthesis.getVoices();
        if (available && available.length > 0) {
          setVoices(available);
          const best = pickBestEnglishVoice(available);
          setSelectedVoice(prev => prev || best);
        }
      } catch (err) {
        console.warn('Speech synthesis voice fetch notice:', err);
      }
    };

    updateVoices();

    // Listen for async voice loading event
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
    };
  }, [hasBrowserSpeech, isNative]);

  // 8. Cancel previous speech before speaking a new question / clean stop
  const cancel = useCallback(async () => {
    isSpeakingRef.current = false;
    isPausedRef.current = false;
    setStatus('idle');

    // 1. Native mobile plugin cancel
    if (isNative) {
      try {
        await TextToSpeech.stop();
      } catch (err) { }
    }

    // 2. Web Speech cancel
    if (hasBrowserSpeech) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) { }
    }

    // 3. Audio fallback cancel
    if (audioFallbackRef.current) {
      try {
        audioFallbackRef.current.pause();
        audioFallbackRef.current.currentTime = 0;
      } catch (e) { }
      audioFallbackRef.current = null;
    }

    activeUtteranceRef.current = null;
    if (onEndCallbackRef.current) {
      const cb = onEndCallbackRef.current;
      onEndCallbackRef.current = null;
      cb();
    }
  }, [isNative, hasBrowserSpeech]);

  // Pause speech
  const pause = useCallback(() => {
    if (!isSpeakingRef.current || isPausedRef.current) return;

    if (hasBrowserSpeech) {
      try {
        window.speechSynthesis.pause();
        isPausedRef.current = true;
        setStatus('paused');
      } catch (e) { }
    } else if (audioFallbackRef.current) {
      try {
        audioFallbackRef.current.pause();
        isPausedRef.current = true;
        setStatus('paused');
      } catch (e) { }
    }
  }, [hasBrowserSpeech]);

  // Resume speech
  const resume = useCallback(() => {
    if (!isPausedRef.current) return;

    if (hasBrowserSpeech) {
      try {
        window.speechSynthesis.resume();
        isPausedRef.current = false;
        setStatus('speaking');
      } catch (e) { }
    } else if (audioFallbackRef.current) {
      try {
        audioFallbackRef.current.play();
        isPausedRef.current = false;
        setStatus('speaking');
      } catch (e) { }
    }
  }, [hasBrowserSpeech]);

  // Mute / Unmute toggle
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (next) {
        cancel();
      }
      return next;
    });
  }, [cancel]);

  // Audio stream fallback
  const playAudioFallback = useCallback((cleanText, onEnd) => {
    try {
      const chunk = cleanText.length > 180 ? cleanText.slice(0, 180) : cleanText;
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(chunk)}`;
      const audio = new Audio(audioUrl);
      audioFallbackRef.current = audio;

      audio.onended = () => {
        isSpeakingRef.current = false;
        isPausedRef.current = false;
        setStatus('finished');
        audioFallbackRef.current = null;
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        isSpeakingRef.current = false;
        isPausedRef.current = false;
        setStatus('finished');
        audioFallbackRef.current = null;
      };

      audio.play().catch(e => {
        console.warn('Audio fallback playback blocked or failed:', e);
        isSpeakingRef.current = false;
        isPausedRef.current = false;
        setStatus('finished');
        audioFallbackRef.current = null;
      });
    } catch (e) {
      isSpeakingRef.current = false;
      isPausedRef.current = false;
      setStatus('finished');
      audioFallbackRef.current = null;
    }
  }, []);

  // 1 & 2. Speak method with auto-cancellation & quote cleaning
  const speak = useCallback(async (text, onEnd) => {
    if (!text) return;

    // 5. If muted, do not speak
    if (isMutedRef.current) {
      if (onEnd) onEnd();
      return;
    }

    // Clean nested quotes, markdown symbols, and extra whitespace for clear delivery
    const cleanText = text
      .replace(/^["'\s]+|["'\s]+$/g, '')
      .replace(/[*_#`]/g, '')
      .replace(/"/g, '')
      .trim();

    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    // 7 & 8. Prevent overlapping speech: Cancel any ongoing speech first!
    await cancel();

    isSpeakingRef.current = true;
    isPausedRef.current = false;
    setStatus('speaking');
    onEndCallbackRef.current = onEnd || null;

    // Method 1: Android / iOS native Capacitor engine
    if (isNative) {
      try {
        await TextToSpeech.speak({
          text: cleanText,
          lang: 'en-US',
          rate: rate,
          pitch: pitch,
          volume: 1.0,
          category: 'playback'
        });

        isSpeakingRef.current = false;
        setStatus('finished');
        if (onEnd) onEnd();
        return;
      } catch (err) {
        console.warn('Capacitor native TTS error, using audio fallback:', err);
        playAudioFallback(cleanText, onEnd);
        return;
      }
    }

    // Method 2: Browser SpeechSynthesis API
    if (hasBrowserSpeech) {
      try {
        // Resume engine if paused by browser
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);
        activeUtteranceRef.current = utterance; // Prevent garbage collection mid-speech

        // 10. Select a suitable English voice when available
        const currentVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
        const voiceToUse = selectedVoice || pickBestEnglishVoice(currentVoices);
        if (voiceToUse) {
          utterance.voice = voiceToUse;
        }

        utterance.lang = voiceToUse?.lang || 'en-US';
        utterance.rate = rate;
        utterance.pitch = pitch;

        utterance.onstart = () => {
          if (isSpeakingRef.current) {
            setStatus('speaking');
          }
        };

        utterance.onpause = () => {
          isPausedRef.current = true;
          setStatus('paused');
        };

        utterance.onresume = () => {
          isPausedRef.current = false;
          setStatus('speaking');
        };

        utterance.onend = () => {
          activeUtteranceRef.current = null;
          isSpeakingRef.current = false;
          isPausedRef.current = false;
          setStatus('finished');
          if (onEnd) onEnd();
        };

        utterance.onerror = (e) => {
          console.warn('SpeechSynthesisUtterance error notice:', e.error);
          activeUtteranceRef.current = null;
          isSpeakingRef.current = false;
          isPausedRef.current = false;
          setStatus('finished');
          // If speech synthesis was blocked by browser or failed, fallback to audio stream
          if (e.error !== 'canceled' && e.error !== 'interrupted') {
            playAudioFallback(cleanText, onEnd);
          }
        };

        window.speechSynthesis.speak(utterance);

        // Chrome browser bug workaround: long utterances occasionally freeze without this keepalive interval
        const keepAliveTimer = setInterval(() => {
          if (!isSpeakingRef.current) {
            clearInterval(keepAliveTimer);
          } else if (window.speechSynthesis.speaking && window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        }, 2500);

        return;
      } catch (err) {
        console.warn('Browser SpeechSynthesis initiation error:', err);
      }
    }

    // Method 3: Audio fallback
    playAudioFallback(cleanText, onEnd);
  }, [cancel, isNative, hasBrowserSpeech, voices, selectedVoice, rate, pitch, playAudioFallback]);

  // 13. Clean up speech events when the component unmounts
  useEffect(() => {
    isCancelledRef.current = false;
    return () => {
      isCancelledRef.current = true;
      cancel();
    };
  }, [cancel]);

  return {
    // States
    status, // 'idle' | 'speaking' | 'paused' | 'finished' | 'unavailable'
    isSpeaking: status === 'speaking',
    isPaused: status === 'paused',
    isFinished: status === 'finished',
    isAvailable: supported && (hasBrowserSpeech || isNative),
    isMuted,

    // Voices & settings
    voices,
    selectedVoice,
    setSelectedVoice,
    rate,
    setRate,
    pitch,
    setPitch,

    // Controls
    speak,
    pause,
    resume,
    cancel,
    stop: cancel, // convenient alias
    toggleMute,
    setIsMuted
  };
};
