import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  RefreshCw,
  Languages,
  Check,
  Bot,
  User,
  Compass,
  MapPin,
  CloudRain,
  HelpCircle,
  ShieldCheck,
  Copy,
  Info,
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../services/languageService';
import { LocationData, WeatherData, DistrictRainData, WeatherAlert } from '../types/weather';
import {
  ChatMessage,
  AIContextPayload,
  askSkyCastAI,
  getSpeechRecognition,
  playSpokenReply,
  stopSpeaking,
} from '../services/aiService';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentLocation: LocationData;
  weatherData: WeatherData | null;
  districtsRainData: DistrictRainData[];
  alerts: WeatherAlert[];
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentLocation,
  weatherData,
  districtsRainData,
  alerts,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Assistant language mode: 'auto' | 'en' | 'kn'
  const [selectedLangMode, setSelectedLangMode] = useState<'auto' | 'en' | 'kn'>('auto');

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const isKn = lang === 'kn';
    return [
      {
        id: 'welcome',
        role: 'model',
        text: isKn
          ? `ನಮಸ್ಕಾರ! ನಾನು **ಸ್ಕೈಕಾಸ್ಟ್ ಅನಾಮಧೇಯ ಹವಾಮಾನ ಸಹಾಯಕ (SkyCast Anonymous Weather AI)**.\n\nನಿಮ್ಮ ಪ್ರಶ್ನೆಗಳು 100% ಅನಾಮಧೇಯ ಮತ್ತು ಖಾಸಗಿಯಾಗಿವೆ. ಯಾವುದೇ ವೈಯಕ್ತಿಕ ಖಾತೆ ಅಥವಾ ವಿವರಗಳನ್ನು ಸಂಗ್ರಹಿಸಲಾಗುವುದಿಲ್ಲ.\n\nಕರ್ನಾಟಕದ ಎಲ್ಲಾ 31 ಜಿಲ್ಲೆಗಳ ಮಳೆ ಸಂಭವನೀಯತೆ, ಉಪಗ್ರಹ ಮೋಡಗಳು, ತಾಪಮಾನ, ಗಾಳಿ, UV ಸೂಚ್ಯಂಕ ಮತ್ತು **${currentLocation.name}** ಸ್ಥಳದ ನೇರ ಹವಾಮಾನದ ಬಗ್ಗೆ ಖಚಿತ ಹಾಗೂ ನಿಖರ ಮಾಹಿತಿಯನ್ನು ನೀಡಲು ನಾನು ಸಿದ್ಧನಿದ್ದೇನೆ.\n\nಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮೈಕ್ ಬಟನ್ ಒತ್ತಿ ಮಾತನಾಡಿ!`
          : `Hello! I am **SkyCast Anonymous Weather AI**, your dedicated privacy-first meteorological assistant.\n\nAll your inquiries are 100% anonymous and private with zero identity tracking. I am trained strictly to provide definite, highly accurate weather forecasts, precipitation probabilities, cloud movements, and telemetry for **${currentLocation.name}** and across Karnataka.\n\nAsk me any weather question in English or ಕನ್ನಡ using text or voice!`,
        timestamp: Date.now(),
        detectedLang: isKn ? 'kn' : 'en',
      },
    ];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLiveVoiceMode, setIsLiveVoiceMode] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(true);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const cancelSpeechRef = useRef<(() => void) | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Clean up speech synthesis & speech recognition on unmount or close
  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      cancelSpeechRef.current?.();
      setSpeakingMessageId(null);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      setIsListening(false);
      setIsLiveVoiceMode(false);
    }
  }, [isOpen]);

  // Stop speaking when user toggles speakReplies off
  useEffect(() => {
    if (!speakReplies) {
      stopSpeaking();
      setSpeakingMessageId(null);
    }
  }, [speakReplies]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle Speech Recognition initiation
  const startSpeechRecognition = (continuousMode = false) => {
    stopSpeaking();
    setSpeakingMessageId(null);

    const SpeechRec = getSpeechRecognition();
    if (!SpeechRec) {
      alert(
        lang === 'kn'
          ? 'ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ (Speech Recognition) ಬೆಂಬಲಿತವಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು Google Chrome ಅಥವಾ Edge ಬಳಸಿ.'
          : 'Speech recognition is not supported in this browser. Please use Google Chrome or Edge.'
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;

      // Select speech language: Kannada if kn mode or Kannada selected, otherwise en-IN
      const targetLangCode =
        selectedLangMode === 'kn' || (selectedLangMode === 'auto' && lang === 'kn')
          ? 'kn-IN'
          : 'en-IN';
      recognition.lang = targetLangCode;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setInputQuery(transcript);

        if (event.results[event.results.length - 1].isFinal) {
          const finalQuery = transcript.trim();
          if (finalQuery) {
            handleSendMessage(finalQuery, continuousMode);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
        setIsListening(false);
        if (continuousMode && event.error === 'not-allowed') {
          setIsLiveVoiceMode(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
    setIsLiveVoiceMode(false);
  };

  // Toggle live hands-free conversation mode
  const toggleLiveVoiceMode = () => {
    if (isLiveVoiceMode) {
      setIsLiveVoiceMode(false);
      stopSpeechRecognition();
    } else {
      setIsLiveVoiceMode(true);
      startSpeechRecognition(true);
    }
  };

  // Send message
  const handleSendMessage = async (textToSend?: string, isFromLiveVoice = false) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    setInputQuery('');
    stopSpeaking();
    setSpeakingMessageId(null);

    const userMessageId = 'u-' + Date.now();
    const newUserMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      text: query,
      timestamp: Date.now(),
      detectedLang: /[\u0C80-\u0CFF]/.test(query) ? 'kn' : 'en',
    };

    const nextMessages = [...messages, newUserMsg];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      // Build comprehensive context payload from current live state
      const contextPayload: AIContextPayload = {
        currentLocation,
        currentWeather: weatherData
          ? {
              temperature: weatherData.current.temperature,
              feelsLike: weatherData.current.apparentTemperature,
              condition: weatherData.current.weatherDescription,
              rainChance: weatherData.daily[0]?.precipitationProbabilityMax ?? weatherData.current.precipitation,
              humidity: weatherData.current.relativeHumidity,
              windSpeed: weatherData.current.windSpeed,
              pressure: weatherData.current.surfacePressure,
              uvIndex: weatherData.current.uvIndex,
              cloudCover: weatherData.current.cloudCover,
              visibility: weatherData.current.visibility,
            }
          : undefined,
        dailyForecastSummary: weatherData?.daily?.slice(0, 7).map((d) => ({
          date: d.date,
          condition: d.weatherDescription,
          tempMax: d.tempMax,
          tempMin: d.tempMin,
          rainProb: d.precipitationProbabilityMax,
        })),
        hourlyForecastSummary: weatherData?.hourly?.slice(0, 12).map((h) => ({
          time: h.time,
          temp: h.temperature,
          rainProb: h.precipitationProbability,
          condition: h.weatherDescription,
        })),
        districtsRain: districtsRainData,
        alerts,
      };

      const historyPayload = nextMessages.slice(-6).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const preferredLangParam =
        selectedLangMode === 'auto' ? (lang === 'kn' ? 'kn' : 'auto') : selectedLangMode;

      const res = await askSkyCastAI(query, preferredLangParam, historyPayload, contextPayload);

      const aiMessageId = 'ai-' + Date.now();
      const newAIMsg: ChatMessage = {
        id: aiMessageId,
        role: 'model',
        text: res.reply,
        timestamp: Date.now(),
        detectedLang: res.detectedLanguage || (lang === 'kn' ? 'kn' : 'en'),
      };

      setMessages((prev) => [...prev, newAIMsg]);

      // Speak reply aloud if enabled or if in Live Voice Mode
      if (speakReplies || isFromLiveVoice || isLiveVoiceMode) {
        setSpeakingMessageId(aiMessageId);
        cancelSpeechRef.current = playSpokenReply(
          res.reply,
          res.detectedLanguage || lang,
          () => setSpeakingMessageId(aiMessageId),
          () => {
            setSpeakingMessageId(null);
            // If in continuous live voice mode, automatically resume listening after speech completes
            if (isLiveVoiceMode || isFromLiveVoice) {
              setTimeout(() => {
                if (isOpen) {
                  startSpeechRecognition(true);
                }
              }, 600);
            }
          }
        );
      }
    } catch (err: any) {
      console.error('SkyCast AI chat error:', err);
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        role: 'model',
        text:
          lang === 'kn'
            ? 'ಕ್ಷಮಿಸಿ, ಹವಾಮಾನ ಡೇಟಾ ಪಡೆಯುವಲ್ಲಿ ಅಡಚಣೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.'
            : 'Apologies, unable to process weather telemetry at this moment. Please try again in a few seconds.',
        timestamp: Date.now(),
        detectedLang: lang,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakSingleMessage = (msg: ChatMessage) => {
    if (speakingMessageId === msg.id) {
      stopSpeaking();
      setSpeakingMessageId(null);
      return;
    }

    setSpeakingMessageId(msg.id);
    cancelSpeechRef.current = playSpokenReply(
      msg.text,
      msg.detectedLang || lang,
      () => setSpeakingMessageId(msg.id),
      () => setSpeakingMessageId(null)
    );
  };

  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleClearChat = () => {
    stopSpeaking();
    setSpeakingMessageId(null);
    setMessages([
      {
        id: 'welcome-reset',
        role: 'model',
        text:
          lang === 'kn'
            ? `ಸಂಭಾಷಣೆಯನ್ನು ಮರುಹೊಂದಿಸಲಾಗಿದೆ. ನಿಮ್ಮ ಸಂವಾದ 100% ಅನಾಮಧೇಯವಾಗಿದೆ. ಕರ್ನಾಟಕದ ಹವಾಮಾನ, ಮಳೆ ಅಥವಾ **${currentLocation.name}** ಬಗ್ಗೆ ಹೊಸ ಖಚಿತ ಪ್ರಶ್ನೆ ಕೇಳಿ!`
            : `Conversation reset. All queries remain 100% anonymous. Ask any new question about Karnataka weather, rain probability, or **${currentLocation.name}**!`,
        timestamp: Date.now(),
        detectedLang: lang,
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-assistant-modal-title"
    >
      {/* Modal Container with Crystal-Clear Liquid Glass Frame */}
      <div className="relative w-full max-w-3xl max-h-[92vh] h-[680px] flex flex-col rounded-3xl bg-white/95 dark:bg-[#071328]/95 backdrop-blur-2xl border border-white/50 dark:border-cyan-500/30 shadow-[0_25px_60px_-15px_rgba(23,43,58,0.3)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] overflow-hidden">
        {/* Header - Neat Aligned Controls with Prominent Close Button */}
        <div className="px-3.5 sm:px-6 py-3 sm:py-3.5 border-b border-[#D8E4ED]/60 dark:border-white/10 flex items-center justify-between gap-2 sm:gap-3 bg-white/60 dark:bg-[#040a18]/70 flex-shrink-0">
          {/* Left Title & Status Badges */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#00AFCB] via-cyan-500 to-blue-600 p-[1px] shadow-md shadow-cyan-500/25 flex-shrink-0">
              <div className="w-full h-full bg-[#071328] rounded-[15px] flex items-center justify-center relative overflow-hidden">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2
                  id="ai-assistant-modal-title"
                  className="font-display text-sm sm:text-base font-bold text-[#172B3A] dark:text-white tracking-tight"
                >
                  SkyCast AI
                </h2>
                {/* Anonymous Privacy Badge */}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span>{lang === 'kn' ? '100% ಅನಾಮಧೇಯ' : '100% Anonymous'}</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-700 dark:text-slate-300 font-medium truncate hidden xs:block sm:block">
                {lang === 'kn'
                  ? 'ಖಚಿತ ಹಾಗೂ ನಿಖರ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ • ವೈಯಕ್ತಿಕ ವಿವರ ಸಂಗ್ರಹಿಸುವುದಿಲ್ಲ'
                  : 'Definite & accurate weather intelligence with zero identity tracking'}
              </p>
            </div>
          </div>

          {/* Right Toolbar - Perfectly Aligned Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Segmented Language Selector (Desktop / Tablet) */}
            <div className="hidden sm:flex items-center p-0.5 rounded-full bg-slate-100/80 dark:bg-black/30 border border-[#D8E4ED]/60 dark:border-white/10 text-[10px] font-semibold h-8 sm:h-9">
              <button
                type="button"
                onClick={() => setSelectedLangMode('auto')}
                className={`px-2.5 h-7 sm:h-8 rounded-full transition cursor-pointer flex items-center justify-center ${
                  selectedLangMode === 'auto'
                    ? 'water-droplet-pill-active text-[#007A8E] dark:text-cyan-200 font-bold'
                    : 'text-slate-800 dark:text-slate-200 font-semibold hover:text-[#0F1D2E] dark:hover:text-white'
                }`}
                title="Auto-detect language"
              >
                Auto
              </button>
              <button
                type="button"
                onClick={() => setSelectedLangMode('en')}
                className={`px-2.5 h-7 sm:h-8 rounded-full transition cursor-pointer flex items-center justify-center ${
                  selectedLangMode === 'en'
                    ? 'water-droplet-pill-active text-[#007A8E] dark:text-cyan-200 font-bold'
                    : 'text-slate-800 dark:text-slate-200 font-semibold hover:text-[#0F1D2E] dark:hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setSelectedLangMode('kn')}
                className={`px-2.5 h-7 sm:h-8 rounded-full transition cursor-pointer flex items-center justify-center ${
                  selectedLangMode === 'kn'
                    ? 'water-droplet-pill-active text-[#007A8E] dark:text-cyan-200 font-bold'
                    : 'text-slate-800 dark:text-slate-200 font-semibold hover:text-[#0F1D2E] dark:hover:text-white'
                }`}
              >
                ಕನ್ನಡ
              </button>
            </div>

            {/* Reset Chat Button */}
            <button
              type="button"
              onClick={handleClearChat}
              className="water-droplet-btn w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[#526779] dark:text-slate-300 hover:text-[#00AFCB] dark:hover:text-cyan-300 transition cursor-pointer"
              title="Reset conversation"
              aria-label="Reset conversation"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Dedicated Prominent Close / Wrong Mark (X) Button */}
            <button
              type="button"
              onClick={onClose}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500 active:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white dark:hover:text-white border border-rose-500/25 hover:border-rose-500 transition-all duration-150 cursor-pointer shadow-sm hover:shadow-md hover:scale-105 active:scale-95 shrink-0"
              title={lang === 'kn' ? 'ಕಿಟಕಿಯನ್ನು ಮುಚ್ಚಿ (Close)' : 'Close Ask AI (Esc)'}
              aria-label={lang === 'kn' ? 'ಕಿಟಕಿಯನ್ನು ಮುಚ್ಚಿ (Close)' : 'Close Ask AI'}
            >
              <X className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.75] transition-transform duration-150 group-hover:rotate-90" />
              <span className="text-xs font-bold leading-none">
                {lang === 'kn' ? 'ಮುಚ್ಚಿ' : 'Close'}
              </span>
            </button>
          </div>
        </div>

        {/* Status Sub-bar: Grounding Telemetry & Mode Toggles */}
        <div className="px-3.5 sm:px-6 py-2 bg-[#F8FAFC]/70 dark:bg-[#040c1a]/60 border-b border-[#D8E4ED]/60 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs flex-shrink-0">
          {/* Grounding Telemetry Chip */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#526779] dark:text-slate-400 flex-wrap">
            <span className="flex items-center gap-1 font-bold text-[#172B3A] dark:text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-[#00AFCB] dark:text-cyan-400 shrink-0" />
              {currentLocation.name}
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-500/10 text-[#007A8E] dark:text-cyan-300 border border-cyan-500/20">
              31 Districts
            </span>
            {/* Mobile language switch */}
            <div className="sm:hidden flex items-center p-0.5 rounded-full bg-slate-200/80 dark:bg-black/40 border border-[#D8E4ED]/60 dark:border-white/10 text-[9px] font-semibold h-6">
              <button
                type="button"
                onClick={() => setSelectedLangMode('auto')}
                className={`px-1.5 h-5 rounded-full transition cursor-pointer ${
                  selectedLangMode === 'auto'
                    ? 'water-droplet-pill-active text-[#007A8E] dark:text-cyan-200 font-bold'
                    : 'text-slate-800 dark:text-slate-200 font-semibold'
                }`}
              >
                Auto
              </button>
              <button
                type="button"
                onClick={() => setSelectedLangMode('en')}
                className={`px-1.5 h-5 rounded-full transition cursor-pointer ${
                  selectedLangMode === 'en'
                    ? 'water-droplet-pill-active text-[#007A8E] dark:text-cyan-200 font-bold'
                    : 'text-slate-800 dark:text-slate-200 font-semibold'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setSelectedLangMode('kn')}
                className={`px-1.5 h-5 rounded-full transition cursor-pointer ${
                  selectedLangMode === 'kn'
                    ? 'water-droplet-pill-active text-[#007A8E] dark:text-cyan-200 font-bold'
                    : 'text-slate-800 dark:text-slate-200 font-semibold'
                }`}
              >
                ಕನ್ನಡ
              </button>
            </div>
          </div>

          {/* Sub-bar Right Toggles with Neat Alignments */}
          <div className="flex items-center gap-2">
            {/* Live Voice Hands-free Toggle */}
            <button
              type="button"
              onClick={toggleLiveVoiceMode}
              className={`water-droplet-pill h-7 sm:h-8 flex items-center gap-1.5 px-3 rounded-full text-[11px] font-bold cursor-pointer transition ${
                isLiveVoiceMode
                  ? 'water-droplet-pill-active text-rose-500 dark:text-rose-400 animate-pulse'
                  : 'text-slate-800 dark:text-slate-300 font-semibold'
              }`}
              title="Hands-free continuous voice conversation"
            >
              <Radio className="w-3 h-3" />
              <span>{t.liveVoiceMode}</span>
            </button>

            {/* Speak Replies Toggle */}
            <button
              type="button"
              onClick={() => setSpeakReplies(!speakReplies)}
              className={`water-droplet-pill h-7 sm:h-8 flex items-center gap-1.5 px-2.5 rounded-full text-[11px] font-semibold cursor-pointer transition ${
                speakReplies
                  ? 'text-[#007A8E] dark:text-cyan-300'
                  : 'text-slate-400'
              }`}
              title="Toggle automatic spoken replies"
            >
              {speakReplies ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{t.speakReplies}</span>
            </button>
          </div>
        </div>

        {/* Live Voice Active Banner */}
        {isLiveVoiceMode && (
          <div className="px-4 py-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white flex items-center justify-between text-xs flex-shrink-0 animate-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-85"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              <span className="font-bold">
                {lang === 'kn' ? 'ನೈಜ ಧ್ವನಿ ಸಂವಾದ ಸಕ್ರಿಯವಾಗಿದೆ (Live Voice Active)' : 'Live Hands-Free Voice Mode Active'}
              </span>
              <span className="text-[10px] opacity-85 hidden sm:inline">
                {isListening ? (lang === 'kn' ? 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದೆ...' : 'Listening...') : (lang === 'kn' ? 'ಉತ್ತರಿಸುತ್ತಿದೆ...' : 'Speaking reply...')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsLiveVoiceMode(false)}
              className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/30 hover:bg-black/50 text-white cursor-pointer"
            >
              Exit Live Mode
            </button>
          </div>
        )}

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isSpeakingThis = speakingMessageId === msg.id;
            const isCopied = copiedMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 sm:gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-2xl bg-[#00AFCB]/15 text-[#00AFCB] dark:text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 border border-[#00AFCB]/30 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-[13px] leading-relaxed shadow-sm transition-all ${
                    isUser
                      ? 'bg-gradient-to-r from-[#00AFCB] to-[#008DA4] text-white rounded-br-xs font-medium'
                      : 'bg-white/80 dark:bg-slate-900/85 text-[#172B3A] dark:text-slate-100 rounded-bl-xs border border-[#D8E4ED] dark:border-slate-800'
                  } ${isSpeakingThis ? 'ring-2 ring-cyan-400 dark:ring-cyan-300' : ''}`}
                >
                  {/* Sender Header for AI */}
                  {!isUser && (
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/70 dark:border-slate-800 text-[10px] text-[#526779] dark:text-slate-400">
                      <span className="font-bold flex items-center gap-1 text-[#007A8E] dark:text-cyan-300">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        SkyCast AI • {lang === 'kn' ? 'ಅನಾಮಧೇಯ ವರದಿ' : 'Anonymous Verdict'}
                      </span>
                      <span className="opacity-75 font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}

                  {/* Message formatted body */}
                  <div className="whitespace-pre-wrap space-y-1.5 font-body">
                    {msg.text.split('\n').map((line, i) => {
                      if (!line.trim()) return <div key={i} className="h-1.5" />;

                      // Render bold highlights
                      const parts = line.split(/(\*\*.*?\*\*)/g);
                      return (
                        <p key={i}>
                          {parts.map((p, j) => {
                            if (p.startsWith('**') && p.endsWith('**')) {
                              return (
                                <strong key={j} className="font-bold text-[#0f2334] dark:text-white">
                                  {p.slice(2, -2)}
                                </strong>
                              );
                            }
                            return p;
                          })}
                        </p>
                      );
                    })}
                  </div>

                  {/* Actions under AI message (Listen Aloud & Copy Report) */}
                  {!isUser && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-[11px] text-[#687D8F] dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        {/* Listen Button */}
                        <button
                          type="button"
                          onClick={() => handleSpeakSingleMessage(msg)}
                          className={`water-droplet-pill flex items-center gap-1 px-2.5 py-1 rounded-lg transition cursor-pointer font-semibold ${
                            isSpeakingThis ? 'water-droplet-pill-active text-[#007A8E] dark:text-cyan-300 animate-pulse' : ''
                          }`}
                          title="Read weather report aloud"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{isSpeakingThis ? t.speaking : 'Listen'}</span>
                        </button>

                        {/* Copy Button */}
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.text)}
                          className="water-droplet-pill flex items-center gap-1 px-2.5 py-1 rounded-lg transition cursor-pointer font-semibold"
                          title="Copy weather report to clipboard"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <span className="text-[10px] font-mono opacity-65">
                        Definite Telemetry
                      </span>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-2xl bg-slate-200 dark:bg-slate-800 text-[#172B3A] dark:text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading indicator when analyzing telemetry */}
          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-[#00AFCB] dark:text-cyan-400">
              <div className="w-8 h-8 rounded-2xl bg-[#00AFCB]/15 text-[#00AFCB] dark:text-cyan-400 flex items-center justify-center shrink-0 border border-[#00AFCB]/30">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white/80 dark:bg-slate-900/90 border border-[#D8E4ED] dark:border-slate-800 flex items-center gap-2.5 shadow-xs">
                <span className="flex space-x-1">
                  <span className="w-2 h-2 rounded-full bg-[#00AFCB] animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 rounded-full bg-[#00AFCB] animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 rounded-full bg-[#00AFCB] animate-bounce"></span>
                </span>
                <span className="text-[11px] text-[#526779] dark:text-slate-400 font-medium">
                  {lang === 'kn'
                    ? 'ಅನಾಮಧೇಯವಾಗಿ ಹವಾಮಾನ ಮತ್ತು ಉಪಗ್ರಹ ಡೇಟಾ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...'
                    : 'Analyzing live Karnataka weather telemetry anonymously...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt suggestions Carousel */}
        <div className="px-4 sm:px-6 py-2 border-t border-[#D8E4ED]/60 dark:border-white/10 bg-white/40 dark:bg-[#071328]/60 overflow-x-auto no-scrollbar flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap flex items-center gap-1 mr-1">
            <HelpCircle className="w-3.5 h-3.5 text-[#00AFCB]" />
            {lang === 'kn' ? 'ಪ್ರಶ್ನೆಗಳು:' : 'Quick Questions:'}
          </span>
          {[
            t.samplePrompt1,
            t.samplePrompt2,
            t.samplePrompt3,
            t.samplePrompt4,
          ].map((promptText, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => handleSendMessage(promptText)}
              disabled={isLoading}
              className="water-droplet-pill px-3 py-1 rounded-full text-[11px] text-[#0F1D2E] dark:text-slate-200 font-medium whitespace-nowrap cursor-pointer hover:border-[#00AFCB]/40 transition"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Input Bar with Impeccable Button Alignments */}
        <div className="p-3.5 sm:p-4 border-t border-[#D8E4ED]/60 dark:border-white/10 bg-white/60 dark:bg-[#071328]/60 backdrop-blur-md flex-shrink-0">
          {/* Active Voice Listening Banner if mic is recording */}
          {isListening && (
            <div className="mb-2 p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/40 flex items-center justify-between text-xs text-[#007A8E] dark:text-cyan-300 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <span className="font-bold">{t.listening}</span>
              </div>
              <button
                type="button"
                onClick={stopSpeechRecognition}
                className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
              >
                Stop
              </button>
            </div>
          )}

          {/* Form Container with Exactly Aligned Centered Row */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 sm:gap-2.5 h-11 sm:h-12"
          >
            {/* Mic Button - Circular Water Droplet */}
            <button
              type="button"
              onClick={() => {
                if (isListening) {
                  stopSpeechRecognition();
                } else {
                  startSpeechRecognition(false);
                }
              }}
              className={`water-droplet-btn w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 transition cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
                  : 'text-[#00AFCB] dark:text-cyan-300'
              }`}
              title={isListening ? 'Stop listening' : t.tapToSpeak}
              aria-label={isListening ? 'Stop listening' : t.tapToSpeak}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Input Field - Liquid Glass Search Container */}
            <div className="water-droplet-search h-11 sm:h-12 flex-1 flex items-center px-3.5 sm:px-4 gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={t.typePromptPlaceholder}
                className="w-full h-full bg-transparent border-none text-[#172B3A] dark:text-white placeholder-[#8B9EA8] dark:placeholder-slate-400 text-xs sm:text-sm focus:outline-none"
              />
              {inputQuery.trim() && (
                <button
                  type="button"
                  onClick={() => setInputQuery('')}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                  title="Clear input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Send Button - Circular Water Droplet */}
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className={`water-droplet-btn w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 font-bold transition cursor-pointer ${
                inputQuery.trim() && !isLoading
                  ? 'text-[#00AFCB] dark:text-cyan-300 shadow-md'
                  : 'opacity-40 cursor-not-allowed text-slate-400'
              }`}
              title="Send weather question"
              aria-label="Send weather question"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          {/* Footer note with Anonymous & Definite Meteorological Assurance */}
          <div className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-[10px] text-[#687D8F] dark:text-slate-400">
            <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
            <span>
              {lang === 'kn'
                ? '100% ಅನಾಮಧೇಯ ಮತ್ತು ಖಾಸಗಿ • ಹವಾಮಾನ ವಿಷಯಗಳಿಗೆ ಮಾತ್ರ ಸೀಮಿತ • ಲೈವ್ ಉಪಗ್ರಹ ಡೇಟಾ ಆಧಾರಿತ'
                : '100% Anonymous & Private Inquiries • Strict Weather Focus • Live Satellite & Radar Grounded'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
