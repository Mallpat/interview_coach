import { useState, useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const activeUtteranceRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const audioFallbackRef = useRef(null);

  // Stop any active speech across all engines (native, web speech, audio fallback)
  const cancel = useCallback(async () => {
    isSpeakingRef.current = false;
    setIsSpeaking(false);

    // 1. Stop native TTS if on native platform
    if (Capacitor.isNativePlatform()) {
      try {
        await TextToSpeech.stop();
      } catch (err) {
        console.warn('Native TTS stop error:', err);
      }
    }

    // 2. Stop browser web speech
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) { }
    }

    // 3. Stop audio fallback if playing
    if (audioFallbackRef.current) {
      try {
        audioFallbackRef.current.pause();
        audioFallbackRef.current.currentTime = 0;
      } catch (e) { }
      audioFallbackRef.current = null;
    }

    activeUtteranceRef.current = null;
  }, []);

  const playAudioFallback = (cleanText, onEnd) => {
    try {
      const chunk = cleanText.length > 180 ? cleanText.slice(0, 180) : cleanText;
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(chunk)}`;
      const audio = new Audio(audioUrl);
      audioFallbackRef.current = audio;

      audio.onended = () => {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        audioFallbackRef.current = null;
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        audioFallbackRef.current = null;
      };

      audio.play().catch(e => {
        console.warn('Audio playback error:', e);
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        audioFallbackRef.current = null;
      });
    } catch (e) {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      audioFallbackRef.current = null;
    }
  };

  const speak = useCallback(async (text, onEnd) => {
    if (!text) return;
    // Clean nested quotes, markdown syntax, and extra whitespace for crisp speech delivery
    const cleanText = text
      .replace(/^["'\s]+|["'\s]+$/g, '')
      .replace(/[*_#`]/g, '')
      .replace(/"/g, '')
      .trim();
    if (!cleanText) return;

    // Stop any ongoing speech first
    await cancel();

    isSpeakingRef.current = true;
    setIsSpeaking(true);

    // Method 1: On Native Android / iOS, use Capacitor Text-to-Speech plugin (hooks to Android TextToSpeech)
    if (Capacitor.isNativePlatform()) {
      try {
        await TextToSpeech.speak({
          text: cleanText,
          lang: 'en-US',
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
          category: 'playback'
        });
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        if (onEnd) onEnd();
        return;
      } catch (err) {
        console.warn('Capacitor native TTS error, using safe audio fallback:', err);
        // On native Android/iOS WebView, avoid window.speechSynthesis to prevent WebView renderer crashes
        playAudioFallback(cleanText, onEnd);
        return;
      }
    }

    // Method 2: Browser SpeechSynthesis API with Chrome workarounds
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);
        activeUtteranceRef.current = utterance; // Prevent garbage collection mid-speech

        const availableVoices = window.speechSynthesis.getVoices() || [];
        const preferred = availableVoices.find(v =>
          (v.name.includes('Google') && v.lang.startsWith('en')) ||
          (v.name.includes('Natural') && v.lang.startsWith('en')) ||
          (v.lang === 'en-US' && !v.name.includes('Desktop'))
        ) || availableVoices.find(v => v.lang.startsWith('en'));

        if (preferred) {
          utterance.voice = preferred;
        }

        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
          if (isSpeakingRef.current) setIsSpeaking(true);
        };

        utterance.onend = () => {
          activeUtteranceRef.current = null;
          isSpeakingRef.current = false;
          setIsSpeaking(false);
          if (onEnd) onEnd();
        };

        utterance.onerror = (e) => {
          console.warn('Web speech synthesis error:', e);
          activeUtteranceRef.current = null;
          isSpeakingRef.current = false;
          setIsSpeaking(false);
          // If web speech fails, try fallback
          playAudioFallback(cleanText, onEnd);
        };

        window.speechSynthesis.speak(utterance);

        // Resume if Chrome paused unexpectedly
        const interval = setInterval(() => {
          if (!isSpeakingRef.current) {
            clearInterval(interval);
          } else if (window.speechSynthesis.speaking && window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        }, 3000);

        return;
      } catch (err) {
        console.warn('Web speech synthesis initiation error:', err);
      }
    }

    // Method 3: Online Audio Fallback
    playAudioFallback(cleanText, onEnd);
  }, [cancel]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    isSpeaking,
    supported,
    speak,
    cancel
  };
};
