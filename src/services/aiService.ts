import { Language } from './languageService';
import { LocationData, WeatherData, WeatherAlert, DistrictRainData } from '../types/weather';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  detectedLang?: 'en' | 'kn';
}

export interface AIContextPayload {
  currentLocation?: LocationData;
  currentWeather?: {
    temperature: number;
    feelsLike: number;
    condition: string;
    rainChance: number;
    humidity: number;
    windSpeed: number;
    pressure: number;
    uvIndex?: number;
    cloudCover?: number;
    visibility?: number;
  };
  dailyForecastSummary?: Array<{
    date: string;
    condition: string;
    tempMax: number;
    tempMin: number;
    rainProb: number;
  }>;
  hourlyForecastSummary?: Array<{
    time: string;
    temp: number;
    rainProb: number;
    condition: string;
  }>;
  districtsRain?: DistrictRainData[];
  alerts?: WeatherAlert[];
}

export interface ChatResponse {
  reply: string;
  model: string;
  detectedLanguage?: 'en' | 'kn';
  errorNotice?: string;
}

/**
 * Sends a weather query to the SkyCast backend proxy which calls Gemini 3.8 Flash
 */
export async function askSkyCastAI(
  message: string,
  language: 'auto' | Language,
  history: { role: 'user' | 'model'; text: string }[],
  context: AIContextPayload
): Promise<ChatResponse> {
  const response = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      language,
      history,
      context,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP ${response.status}: Failed to communicate with SkyCast AI`);
  }

  return await response.json();
}

/**
 * Browser Speech Recognition helper (Web Speech API)
 * Supports Kannada ('kn-IN') and Indian/Global English ('en-IN', 'en-US')
 */
export function getSpeechRecognition(): any {
  if (typeof window === 'undefined') return null;
  const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  return SpeechRec ? new SpeechRec() : null;
}

/**
 * Text-to-Speech audio playback using browser SpeechSynthesis
 */
export function playSpokenReply(
  text: string,
  preferredLang: Language | 'auto',
  onStart?: () => void,
  onEnd?: () => void
): () => void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd?.();
    return () => {};
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Strip markdown formatting characters for natural speech
  const cleanText = text
    .replace(/[*_#`~]/g, '')
    .replace(/•\s*/g, '. ')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\n+/g, '. ')
    .trim();

  if (!cleanText) {
    onEnd?.();
    return () => {};
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);

  // Check language detection
  const hasKannada = /[\u0C80-\u0CFF]/.test(text) || preferredLang === 'kn';
  utterance.lang = hasKannada ? 'kn-IN' : 'en-IN';
  utterance.rate = hasKannada ? 0.95 : 1.0;
  utterance.pitch = 1.0;

  // Try to locate a matching voice if available
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    if (hasKannada) {
      const knVoice = voices.find((v) => v.lang.startsWith('kn') || v.name.toLowerCase().includes('kannada'));
      if (knVoice) utterance.voice = knVoice;
    } else {
      const enVoice = voices.find(
        (v) =>
          v.lang === 'en-IN' ||
          v.lang === 'en-GB' ||
          v.lang === 'en-US' ||
          v.name.toLowerCase().includes('indian')
      );
      if (enVoice) utterance.voice = enVoice;
    }
  }

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = (e) => {
    console.warn('SpeechSynthesis error:', e);
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance);

  // Return cancel function
  return () => {
    window.speechSynthesis.cancel();
    onEnd?.();
  };
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
