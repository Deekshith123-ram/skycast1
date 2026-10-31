import React, { useState, useEffect, useRef } from 'react';
import {
  Moon,
  Sun,
  RefreshCw,
  Settings,
  SlidersHorizontal,
  ChevronUp,
  X,
  Check,
  Sparkles,
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../services/languageService';

interface MobileActionBarProps {
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  onRefresh: () => void;
  isLoading: boolean;
  onOpenSettings: () => void;
  onOpenAI?: () => void;
  lang?: Language;
  isSearchFocused?: boolean;
}

/**
 * Fixed Control Button with suitable glassy effect.
 * Positioned fixed at the bottom center. When tapped, it displays the
 * glassmorphic options card allowing the user to select Dark Mode, Light Mode,
 * Live Refresh, or Settings.
 * Automatically hidden when user is searching or typing with the on-screen keyboard.
 */
export const MobileActionBar: React.FC<MobileActionBarProps> = ({
  theme,
  setTheme,
  onRefresh,
  isLoading,
  onOpenSettings,
  onOpenAI,
  lang = 'en',
  isSearchFocused = false,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect when user focuses an input/textarea so button does NOT appear above keyboard while typing
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.getAttribute('contenteditable') === 'true')
      ) {
        setIsTyping(true);
        setIsOpen(false);
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.getAttribute('contenteditable') === 'true')
      ) {
        setIsTyping(false);
      }
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);
    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  // Close options when clicking anywhere outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [isOpen]);

  // When scrolling, collapse options back into the fixed button so content is not blocked
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  // If user is searching or typing with the virtual keyboard, hide completely
  if (isSearchFocused || isTyping) {
    return null;
  }

  return (
    <aside
      ref={containerRef}
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-auto select-none transition-all duration-200"
      aria-label="SkyCast Control Center"
    >
      {/* 1. Expanded Glass Options Card (Appears when Control Button is tapped) */}
      {isOpen && (
        <div className="water-droplet-dropdown mb-2.5 p-3 sm:p-3.5 rounded-2xl animate-in zoom-in-95 fade-in slide-in-from-bottom-3 duration-200 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] sm:w-auto">
          {/* Header inside options */}
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#D8E4ED]/60 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-full bg-[#E6F8FA] dark:bg-cyan-500/20 text-[#00AFCB] dark:text-cyan-400">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold text-[#172B3A] dark:text-white">
                {t.controlCenter}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="water-droplet-btn p-1.5 rounded-full text-[#687D8F] hover:text-[#172B3A] dark:hover:text-white transition cursor-pointer"
              title="Close options"
              aria-label="Close options"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {/* A. Theme Switcher (Dark / Light Mode) */}
            <div>
              <span className="text-[10px] uppercase font-bold text-[#687D8F] dark:text-slate-400 tracking-wider block mb-1.5">
                {t.theme}
              </span>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/40 dark:bg-black/20 border border-white/30 dark:border-white/10">
                <button
                  onClick={() => {
                    setTheme('dark');
                  }}
                  aria-pressed={theme === 'dark'}
                  className={`water-droplet-pill flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                    theme === 'dark'
                      ? 'water-droplet-pill-active text-cyan-300'
                      : 'text-[#526779] dark:text-slate-400 hover:text-[#172B3A] dark:hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t.darkTheme}</span>
                  {theme === 'dark' && <Check className="w-3 h-3 ml-0.5 stroke-[3]" />}
                </button>
                <button
                  onClick={() => {
                    setTheme('light');
                  }}
                  aria-pressed={theme === 'light'}
                  className={`water-droplet-pill flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                    theme === 'light'
                      ? 'water-droplet-pill-active text-amber-700 dark:text-amber-300'
                      : 'text-[#526779] dark:text-slate-400 hover:text-[#172B3A] dark:hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t.lightTheme}</span>
                  {theme === 'light' && <Check className="w-3 h-3 ml-0.5 stroke-[3]" />}
                </button>
              </div>
            </div>

            {/* AI Assistant Quick Option */}
            <button
              onClick={() => {
                onOpenAI?.();
                setIsOpen(false);
              }}
              className="water-droplet-btn w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-[#172B3A] dark:text-white transition cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00AFCB] dark:text-cyan-400 animate-pulse" />
                <span>{t.aiAssistant}</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#00AFCB]/20 text-[#007A8E] dark:text-cyan-300 font-bold">
                Gemini
              </span>
            </button>

            {/* B. Action Buttons: Refresh & Settings */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#D8E4ED]/60 dark:border-white/10">
              <button
                onClick={() => {
                  onRefresh();
                }}
                disabled={isLoading}
                className="water-droplet-btn flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-[#172B3A] dark:text-slate-200 hover:text-[#00AFCB] dark:hover:text-cyan-300 transition cursor-pointer shadow-sm"
                title={t.refresh}
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    isLoading ? 'animate-spin text-[#00AFCB] dark:text-cyan-400' : 'text-[#00AFCB]'
                  }`}
                />
                <span>{isLoading ? t.syncing : t.refresh}</span>
              </button>

              <button
                onClick={() => {
                  onOpenSettings();
                  setIsOpen(false);
                }}
                className="water-droplet-btn flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-[#172B3A] dark:text-slate-200 hover:text-[#00AFCB] dark:hover:text-cyan-300 transition cursor-pointer shadow-sm"
                title={t.settings}
              >
                <Settings className="w-3.5 h-3.5 text-[#00AFCB]" />
                <span>{t.settings}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Dual Glass Control Bar: Quick AI Assistant + Controls Menu */}
      <div className="flex items-center gap-2">
        {/* Direct 1-Tap AI Assistant Pill - Water Droplet Effect */}
        <button
          onClick={onOpenAI}
          aria-label="Open SkyCast AI Weather Assistant"
          className="water-droplet-btn group flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-full cursor-pointer shadow-lg"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-[#00AFCB] dark:text-cyan-200 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
            <span className="absolute -inset-1 rounded-full bg-cyan-300/20 blur-xs animate-ping pointer-events-none" />
          </div>
          <span className="text-xs font-extrabold tracking-tight text-[#172B3A] dark:text-white">{t.askAI}</span>
        </button>

        {/* Controls Center Trigger - Water Droplet Effect */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Toggle SkyCast control options"
          className={`water-droplet-btn group flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-full transition-all duration-300 cursor-pointer shadow-lg ${
            isOpen
              ? 'water-droplet-pill-active text-[#007A8E] dark:text-cyan-200 ring-2 ring-[#00AFCB]/40'
              : 'text-[#172B3A] dark:text-slate-100'
          }`}
        >
          <span className="p-1 rounded-full bg-[#00AFCB]/15 text-[#00AFCB] dark:text-cyan-400 flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </span>

          <span className="text-xs font-bold tracking-tight">{t.controls}</span>

          {/* Live sync pulse dot */}
          <span className="relative flex h-2 w-2 ml-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>

          <ChevronUp
            className={`w-3.5 h-3.5 text-[#00AFCB] dark:text-cyan-400 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : 'group-hover:-translate-y-0.5'
            }`}
          />
        </button>
      </div>
    </aside>
  );
};
