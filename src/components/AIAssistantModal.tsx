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
  CloudRain,
  HelpCircle,
  ShieldAlert,
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
          ? `ನಮಸ್ಕಾರ! ನಾನು **ಸ್ಕೈಕಾಸ್ಟ್ ಎಐ (SkyCast AI)** ಹವಾಮಾನ ಸಹಾಯಕ. ನಾನು ಕರ್ನಾಟಕದ ಎಲ್ಲಾ 31 ಜಿಲ್ಲೆಗಳ ಮಳೆ ಸಂಭವನೀಯತೆ, ಉಪಗ್ರಹ ಮೋಡಗಳು, ತಾಪಮಾನ, ಗಾಳಿ, UV ಸೂಚ್ಯಂಕ ಮತ್ತು ${currentLocation.name} ಸ್ಥಳದ ನೇರ ಹವಾಮಾನದ ಬಗ್ಗೆ ಮಾತ್ರ ಉತ್ತರಿಸಲು ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ವಿಶೇಷ ಸಹಾಯಕ.\n\nಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ, ವಾಯ್ಸ್ ಮೆಸೇಜ್ ಕಳುಹಿಸಿ ಅಥವಾ ಲೈವ್ ಧ್ವನಿ ಸಂಭಾಷಣೆ ಆರಂಭಿಸಿ!`
          : `Hello! I am **SkyCast AI**, your bilingual weather meteorologist. I specialize strictly in weather, forecasts, satellite telemetry, Doppler radar, and all 31 Karnataka district rain probabilities for ${currentLocation.name}.\n\nAsk me anything about the weather in English or ಕನ್ನಡ using text, voice messages, or live hands-free voice!`,
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

  const handleClearChat = () => {
    stopSpeaking();
    setSpeakingMessageId(null);
    setMessages([
      {
        id: 'welcome-reset',
        role: 'model',
        text:
          lang === 'kn'
            ? `ಸಂಭಾಷಣೆಯನ್ನು ಮರುಹೊಂದಿಸಲಾಗಿದೆ. ಕರ್ನಾಟಕದ ಹವಾಮಾನ, ಮಳೆ ಅಥವಾ ${currentLocation.name} ಬಗ್ಗೆ ಹೊಸ ಪ್ರಶ್ನೆ ಕೇಳಿ!`
            : `Conversation reset. Ask any new question about Karnataka weather, rain probability, or ${currentLocation.name}!`,
        timestamp: Date.now(),
        detectedLang: lang,
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-assistant-modal-title"
    >
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl max-h-[92vh] h-[660px] flex flex-col rounded-3xl bg-white/95 dark:bg-[#071328]/95 backdrop-blur-2xl border border-[#D8E4ED] dark:border-cyan-500/35 shadow-[0_25px_60px_-15px_rgba(23,43,58,0.3)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] overflow-hidden">
        {/* Header */}
        <div className="px-3.5 sm:px-6 py-3 border-b border-[#D8E4ED] dark:border-slate-800 flex items-center justify-between gap-2 bg-white/50 dark:bg-[#050e1f]/60 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative p-2 rounded-2xl bg-gradient-to-tr from-[#00AFCB] to-cyan-400 text-white shadow-md shadow-cyan-500/20">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2
                  id="ai-assistant-modal-title"
                  className="font-display text-xs sm:text-base font-bold text-[#172B3A] dark:text-white"
                >
                  {t.aiAssistant}
                </h2>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-[#E6F8FA] dark:bg-cyan-500/20 text-[#007A8E] dark:text-cyan-300 border border-[#00AFCB]/30">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-[10px] text-[#526779] dark:text-slate-400 line-clamp-1">
                {t.aiAssistantDesc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Language Selection Buttons (Visible on Mobile & Desktop) */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-[#D8E4ED] dark:border-slate-800 text-[10px] font-semibold">
              <button
                type="button"
                onClick={() => setSelectedLangMode('auto')}
                className={`px-1.5 sm:px-2 py-1 rounded-lg transition cursor-pointer ${
                  selectedLangMode === 'auto'
                    ? 'bg-[#00AFCB] text-white shadow-sm'
                    : 'text-[#526779] dark:text-slate-400 hover:text-[#172B3A] dark:hover:text-white'
                }`}
                title="Auto-detect language"
              >
                Auto
              </button>
              <button
                type="button"
                onClick={() => setSelectedLangMode('en')}
                className={`px-1.5 sm:px-2 py-1 rounded-lg transition cursor-pointer ${
                  selectedLangMode === 'en'
                    ? 'bg-[#00AFCB] text-white shadow-sm'
                    : 'text-[#526779] dark:text-slate-400 hover:text-[#172B3A] dark:hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setSelectedLangMode('kn')}
                className={`px-1.5 sm:px-2 py-1 rounded-lg transition cursor-pointer ${
                  selectedLangMode === 'kn'
                    ? 'bg-[#00AFCB] text-white shadow-sm'
                    : 'text-[#526779] dark:text-slate-400 hover:text-[#172B3A] dark:hover:text-white'
                }`}
              >
                ಕನ್ನಡ
              </button>
            </div>

            {/* Clear conversation */}
            <button
              type="button"
              onClick={handleClearChat}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-[#526779] dark:text-slate-400 hover:text-[#172B3A] dark:hover:text-white transition cursor-pointer"
              title="Reset conversation"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-[#526779] dark:text-slate-400 hover:text-[#172B3A] dark:hover:text-white transition cursor-pointer"
              title={t.close}
              aria-label={t.close}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Status & Options sub-bar */}
        <div className="px-3.5 sm:px-6 py-2 bg-[#F8FAFC]/80 dark:bg-slate-900/50 border-b border-[#D8E4ED] dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs flex-shrink-0">
          {/* Grounding Telemetry Chip & Strict Weather Scope Label */}
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#526779] dark:text-slate-400">
            <Compass className="w-3.5 h-3.5 text-[#00AFCB]" />
            <span className="font-semibold text-[#172B3A] dark:text-slate-200">
              {currentLocation.name}
            </span>
            <span className="hidden sm:inline">• 31 Districts Rain Radar Grounded</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-600/40">
              {lang === 'kn' ? 'ಹವಾಮಾನ ವಿಷಯಗಳಿಗೆ ಮಾತ್ರ ಸೀಮಿತ' : 'Weather & SkyCast Focus Only'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Voice Hands-free Toggle */}
            <button
              type="button"
              onClick={toggleLiveVoiceMode}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                isLiveVoiceMode
                  ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                  : 'bg-slate-200/80 dark:bg-slate-800 text-[#526779] dark:text-slate-300 hover:bg-[#E6F8FA] dark:hover:bg-cyan-950/60'
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
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                speakReplies
                  ? 'text-[#00AFCB] dark:text-cyan-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Toggle automatic spoken replies"
            >
              {speakReplies ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{t.speakReplies}</span>
            </button>
          </div>
        </div>

        {/* Live Voice Mode Banner if active */}
        {isLiveVoiceMode && (
          <div className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white flex items-center justify-between text-xs flex-shrink-0 animate-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-85"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              <span className="font-bold">
                {lang === 'kn' ? 'ನೈಜ ಧ್ವನಿ ಸಂವಾದ ಸಕ್ರಿಯವಾಗಿದೆ (Live Voice Active)' : 'Live Voice Conversation Active (Hands-free)'}
              </span>
              <span className="text-[10px] opacity-80 hidden sm:inline">
                {isListening ? (lang === 'kn' ? 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದೆ...' : 'Listening to you...') : (lang === 'kn' ? 'ಉತ್ತರಿಸುತ್ತಿದೆ...' : 'Speaking reply...')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsLiveVoiceMode(false)}
              className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/25 hover:bg-black/40 text-white cursor-pointer"
            >
              Exit Live Mode
            </button>
          </div>
        )}

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isSpeakingThis = speakingMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-2xl bg-[#00AFCB]/15 text-[#00AFCB] dark:text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 border border-[#00AFCB]/30">
                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] sm:max-w-[78%] rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-[13px] leading-relaxed shadow-sm transition-all ${
                    isUser
                      ? 'bg-gradient-to-r from-[#00AFCB] to-[#0092AB] text-white rounded-br-xs font-medium'
                      : 'bg-[#F4F8FC] dark:bg-slate-900/90 text-[#172B3A] dark:text-slate-100 rounded-bl-xs border border-[#D8E4ED] dark:border-slate-800'
                  } ${isSpeakingThis ? 'ring-2 ring-cyan-400 dark:ring-cyan-300' : ''}`}
                >
                  {/* Message formatted body */}
                  <div className="whitespace-pre-wrap space-y-1.5 font-body">
                    {msg.text.split('\n').map((line, i) => {
                      if (!line.trim()) return <div key={i} className="h-1.5" />;

                      // Render basic bold formatting
                      const parts = line.split(/(\*\*.*?\*\*)/g);
                      return (
                        <p key={i}>
                          {parts.map((p, j) => {
                            if (p.startsWith('**') && p.endsWith('**')) {
                              return (
                                <strong key={j} className="font-bold">
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

                  {/* Actions under AI message (Speak aloud button & timestamp) */}
                  {!isUser && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-[#687D8F] dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSpeakSingleMessage(msg)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-[#E6F8FA] dark:hover:bg-cyan-950/60 transition cursor-pointer font-bold ${
                            isSpeakingThis ? 'text-[#00AFCB] dark:text-cyan-300 animate-pulse' : ''
                          }`}
                          title="Read message aloud"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>{isSpeakingThis ? t.speaking : 'Listen'}</span>
                        </button>
                      </div>

                      <span className="text-[10px] opacity-75">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-2xl bg-slate-200 dark:bg-slate-800 text-[#172B3A] dark:text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading indicator when waiting for Gemini 3.8 Flash */}
          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-[#00AFCB] dark:text-cyan-400">
              <div className="w-8 h-8 rounded-2xl bg-[#00AFCB]/15 text-[#00AFCB] dark:text-cyan-400 flex items-center justify-center shrink-0 border border-[#00AFCB]/30">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-[#F4F8FC] dark:bg-slate-900/90 border border-[#D8E4ED] dark:border-slate-800 flex items-center gap-2">
                <span className="flex space-x-1">
                  <span className="w-2 h-2 rounded-full bg-[#00AFCB] animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 rounded-full bg-[#00AFCB] animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 rounded-full bg-[#00AFCB] animate-bounce"></span>
                </span>
                <span className="text-[11px] text-[#526779] dark:text-slate-400 font-medium">
                  {lang === 'kn'
                    ? 'ಕರ್ನಾಟಕದ ಹವಾಮಾನ ಮತ್ತು ಉಪಗ್ರಹ ಡೇಟಾ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...'
                    : 'Analyzing live Karnataka weather telemetry...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt suggestions */}
        <div className="px-3.5 sm:px-6 py-2 border-t border-[#D8E4ED] dark:border-slate-800/80 bg-white/40 dark:bg-[#071328]/60 overflow-x-auto no-scrollbar flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] uppercase font-bold text-[#687D8F] dark:text-slate-400 whitespace-nowrap flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-[#00AFCB]" />
            Suggestions:
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
              className="px-2.5 py-1 rounded-full text-[11px] bg-[#F4F8FC] dark:bg-slate-900 hover:bg-[#E6F8FA] dark:hover:bg-cyan-950/70 border border-[#D8E4ED] dark:border-slate-800 text-[#172B3A] dark:text-slate-300 hover:text-[#007A8E] dark:hover:text-cyan-300 whitespace-nowrap transition cursor-pointer"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-[#D8E4ED] dark:border-slate-800 bg-white/95 dark:bg-[#071328]/95 backdrop-blur-md flex-shrink-0">
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

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Mic Button */}
            <button
              type="button"
              onClick={() => {
                if (isListening) {
                  stopSpeechRecognition();
                } else {
                  startSpeechRecognition(false);
                }
              }}
              className={`p-2.5 sm:p-3 rounded-2xl transition cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
                  : 'bg-[#F4F8FC] dark:bg-slate-900 hover:bg-[#E6F8FA] dark:hover:bg-cyan-950/60 border border-[#D8E4ED] dark:border-slate-800 text-[#00AFCB] dark:text-cyan-400'
              }`}
              title={isListening ? 'Stop listening' : t.tapToSpeak}
              aria-label={isListening ? 'Stop listening' : t.tapToSpeak}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Input Field */}
            <div className="relative flex-1">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={t.typePromptPlaceholder}
                className="w-full py-2.5 sm:py-3 pl-3.5 pr-10 rounded-2xl bg-[#F4F8FC] dark:bg-slate-900 border border-[#D8E4ED] dark:border-slate-800 text-[#172B3A] dark:text-white placeholder-[#8B9EA8] dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-[#00AFCB] dark:focus:border-cyan-400 transition"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className={`p-2.5 sm:p-3 rounded-2xl font-bold transition flex items-center justify-center cursor-pointer ${
                inputQuery.trim() && !isLoading
                  ? 'bg-gradient-to-r from-[#00AFCB] to-[#0092AB] text-white shadow-md shadow-cyan-500/25 active:scale-95'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
              title="Send question"
              aria-label="Send question"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          {/* Footer note with strict weather purpose disclosure */}
          <div className="mt-2 text-center text-[10px] text-[#687D8F] dark:text-slate-400">
            {t.aiDisclaimer} • {lang === 'kn' ? 'ಕೇವಲ ಹವಾಮಾನ ವಿಷಯಗಳಿಗೆ ಮಾತ್ರ ಉತ್ತರಿಸುತ್ತದೆ' : 'Strictly restricted to weather topics & SkyCast features'}
          </div>
        </div>
      </div>
    </div>
  );
};
