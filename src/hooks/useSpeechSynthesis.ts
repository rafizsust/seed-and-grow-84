import { useState, useRef, useCallback, useEffect } from 'react';

interface SpeechSynthesisConfig {
  voiceName?: string;
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
  onBoundary?: (charIndex: number) => void;
}

export function useSpeechSynthesis(config: SpeechSynthesisConfig = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechQueueRef = useRef<string[]>([]);

  // Load available voices
  useEffect(() => {
    if (!window.speechSynthesis) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Try to find a good British English male voice
      const preferredVoices = [
        'Google UK English Male',
        'Microsoft George - English (United Kingdom)',
        'Daniel',
        'en-GB-George',
        'en-GB',
      ];

      let voice: SpeechSynthesisVoice | null = null;

      // First try to match by config voiceName
      if (config.voiceName) {
        voice = availableVoices.find(v => 
          v.name.toLowerCase().includes(config.voiceName!.toLowerCase())
        ) || null;
      }

      // Then try preferred voices
      if (!voice) {
        for (const preferred of preferredVoices) {
          voice = availableVoices.find(v => 
            v.name.includes(preferred) || v.lang.includes(preferred)
          ) || null;
          if (voice) break;
        }
      }

      // Fallback to any British English voice
      if (!voice) {
        voice = availableVoices.find(v => 
          v.lang === 'en-GB' || v.lang.startsWith('en-GB')
        ) || null;
      }

      // Final fallback to any English voice
      if (!voice) {
        voice = availableVoices.find(v => 
          v.lang.startsWith('en')
        ) || null;
      }

      if (voice) {
        setSelectedVoice(voice);
        console.log('Selected TTS voice:', voice.name, voice.lang);
      }
    };

    // Voices may load asynchronously
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [config.voiceName]);

  // Speak text
  const speak = useCallback((text: string, options?: Partial<SpeechSynthesisConfig>) => {
    if (!window.speechSynthesis) {
      config.onError?.(new Error('Speech synthesis not supported'));
      return;
    }

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.lang = options?.lang ?? config.lang ?? 'en-GB';
    utterance.rate = options?.rate ?? config.rate ?? 0.95; // Slightly slower for clarity
    utterance.pitch = options?.pitch ?? config.pitch ?? 1;
    utterance.volume = options?.volume ?? config.volume ?? 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      config.onStart?.();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      config.onEnd?.();
      
      // Process next in queue
      if (speechQueueRef.current.length > 0) {
        const next = speechQueueRef.current.shift()!;
        speak(next, options);
      }
    };

    utterance.onerror = (event) => {
      // Ignore 'canceled' errors as they're intentional (barge-in)
      if (event.error === 'canceled') {
        setIsSpeaking(false);
        return;
      }
      
      const err = new Error(`Speech synthesis error: ${event.error}`);
      config.onError?.(err);
      setIsSpeaking(false);
    };

    utterance.onboundary = (event) => {
      config.onBoundary?.(event.charIndex);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [selectedVoice, config]);

  // Queue text for speaking
  const queueSpeak = useCallback((text: string) => {
    if (isSpeaking) {
      speechQueueRef.current.push(text);
    } else {
      speak(text);
    }
  }, [isSpeaking, speak]);

  // Cancel all speech (barge-in support)
  const cancel = useCallback(() => {
    window.speechSynthesis?.cancel();
    speechQueueRef.current = [];
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  // Pause speech
  const pause = useCallback(() => {
    window.speechSynthesis?.pause();
    setIsPaused(true);
  }, []);

  // Resume speech
  const resume = useCallback(() => {
    window.speechSynthesis?.resume();
    setIsPaused(false);
  }, []);

  // Get British male voices
  const getBritishVoices = useCallback(() => {
    return voices.filter(v => 
      v.lang === 'en-GB' || v.lang.startsWith('en-GB')
    );
  }, [voices]);

  // Set voice by name
  const setVoiceByName = useCallback((name: string) => {
    const voice = voices.find(v => v.name.includes(name));
    if (voice) {
      setSelectedVoice(voice);
    }
  }, [voices]);

  return {
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    selectedVoice,
    speak,
    queueSpeak,
    cancel,
    pause,
    resume,
    getBritishVoices,
    setVoiceByName
  };
}
