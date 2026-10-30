import React, { useState, useEffect, useRef } from 'react';
import { LocationData } from '../types/weather';
import {
  searchLocations,
  ALL_KARNATAKA_DISTRICTS,
  DEFAULT_LOCATION,
  KARNATAKA_DEFAULT_LOCATION,
  reverseGeocodeLocation,
} from '../services/geocodingService';
import { PWAInstallButton } from './PWAInstallButton';
import { Language, TRANSLATIONS } from '../services/languageService';
import {
  Satellite,
  Search,
  MapPin,
  RefreshCw,
  Moon,
  Sun,
  Settings,
  Navigation,
  X,
  Sparkles,
  Check,
} from 'lucide-react';

interface NavbarProps {
  currentLocation: LocationData;
  onSelectLocation: (loc: LocationData) => void;
  onRefresh: () => void;
  isLoading: boolean;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  onOpenSettings: () => void;
  onOpenAI?: () => void;
  lang?: Language;
  isVisible?: boolean;
  onReveal?: () => void;
  onSearchFocusChange?: (focused: boolean) => void;
  onHeaderHover?: (hovering: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLocation,
  onSelectLocation,
  onRefresh,
  isLoading,
  theme,
  setTheme,
  onOpenSettings,
  onOpenAI,
  lang = 'en',
  isVisible = true,
  onReveal,
  onSearchFocusChange,
  onHeaderHover,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const setDropdownOpen = (open: boolean) => {
    setIsDropdownOpen(open);
    onSearchFocusChange?.(open);
  };

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([KARNATAKA_DEFAULT_LOCATION, ...ALL_KARNATAKA_DISTRICTS.slice(0, 10)]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchLocations(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRequestUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocating(false);
        try {
          const userLoc = await reverseGeocodeLocation(pos.coords.latitude, pos.coords.longitude);
          onSelectLocation(userLoc);
          localStorage.setItem('skycast_location_approved', 'true');
          localStorage.setItem('skycast_user_location', JSON.stringify(userLoc));
        } catch {
          const userLoc: LocationData = {
            id: `custom-coords-${pos.coords.latitude.toFixed(3)}`,
            name: lang === 'kn' ? 'ಪ್ರಸ್ತುತ ಸ್ಥಳ' : 'Current Location',
            district: lang === 'kn' ? 'ಪತ್ತೆಯಾದ ಸ್ಥಳ' : 'Detected Location',
            state: 'Karnataka',
            country: 'India',
            latitude: Number(pos.coords.latitude.toFixed(4)),
            longitude: Number(pos.coords.longitude.toFixed(4)),
          };
          onSelectLocation(userLoc);
          localStorage.setItem('skycast_location_approved', 'true');
          localStorage.setItem('skycast_user_location', JSON.stringify(userLoc));
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Location permission denied, retaining Karnataka focus.', err);
      },
      { timeout: 8000 }
    );
  };

  // Curated prominent Karnataka pills
  const featuredPills: LocationData[] = [
    KARNATAKA_DEFAULT_LOCATION,
    ALL_KARNATAKA_DISTRICTS.find((d) => d.id === 'tumakuru-ka') || ALL_KARNATAKA_DISTRICTS[0],
    ALL_KARNATAKA_DISTRICTS.find((d) => d.id === 'bengaluru-urban-ka') || ALL_KARNATAKA_DISTRICTS[1],
    ALL_KARNATAKA_DISTRICTS.find((d) => d.id === 'mysuru-ka') || ALL_KARNATAKA_DISTRICTS[3],
    ALL_KARNATAKA_DISTRICTS.find((d) => d.id === 'mangaluru-ka') || ALL_KARNATAKA_DISTRICTS[4],
    ALL_KARNATAKA_DISTRICTS.find((d) => d.id === 'shivamogga-ka') || ALL_KARNATAKA_DISTRICTS[7],
    ALL_KARNATAKA_DISTRICTS.find((d) => d.id === 'belagavi-ka') || ALL_KARNATAKA_DISTRICTS[23],
    ALL_KARNATAKA_DISTRICTS.find((d) => d.id === 'dharwad-ka') || ALL_KARNATAKA_DISTRICTS[22],
    ALL_KARNATAKA_DISTRICTS.find((d) => d.id === 'kalaburagi-ka') || ALL_KARNATAKA_DISTRICTS[28],
    ALL_KARNATAKA_DISTRICTS.find((d) => d.id === 'ballari-ka') || ALL_KARNATAKA_DISTRICTS[18],
    ALL_KARNATAKA_DISTRICTS.find((d) => d.id === 'udupi-ka') || ALL_KARNATAKA_DISTRICTS[5],
  ];

  return (
    <>
      {/* Invisible top edge tap sensor when header is collapsed */}
      {!isVisible && !isDropdownOpen && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onReveal?.();
          }}
          className="fixed top-0 inset-x-0 h-5 z-40 cursor-pointer pointer-events-auto"
          title="Tap top edge to reveal header"
          aria-label="Reveal header"
        />
      )}

      <header
        onMouseEnter={() => onHeaderHover?.(true)}
        onMouseLeave={() => onHeaderHover?.(false)}
        className={`fixed top-0 inset-x-0 z-40 w-full pt-[env(safe-area-inset-top)] bg-white/80 dark:bg-[#050b18]/80 backdrop-blur-2xl border-b border-[#D8E4ED]/80 dark:border-cyan-500/20 shadow-[0_4px_30px_rgba(23,43,58,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out ${
          isVisible || isDropdownOpen
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-x-3 gap-y-2 py-2 sm:py-0 sm:h-20">
          {/* Logo & Branding */}
          <div
            onClick={() => onSelectLocation(DEFAULT_LOCATION)}
            className="order-1 flex items-center gap-3 cursor-pointer group flex-shrink-0"
            title="SkyCast — Reset to Whole State of Karnataka"
          >
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-[1px] shadow-lg shadow-cyan-900/30">
              <div className="w-full h-full bg-[#071022] rounded-[11px] flex items-center justify-center relative overflow-hidden">
                <Satellite className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-ping opacity-60"></span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-lg sm:text-xl font-bold text-[#172B3A] dark:text-white tracking-tight">
                  SkyCast<span className="text-[#00AFCB] dark:text-cyan-400">.</span>IN
                </span>
                <span className="px-1.5 py-0.2 rounded bg-[#E6F8FA] text-[#007A8E] dark:bg-cyan-950 dark:text-cyan-300 text-[10px] font-mono border border-[#00AFCB]/40 dark:border-cyan-500/30 font-bold">
                  {lang === 'kn' ? 'ಕರ್ನಾಟಕ ಲೈವ್' : 'KARNATAKA LIVE'}
                </span>
              </div>
              <p className="text-[10px] text-[#526779] dark:text-slate-400 tracking-wider uppercase font-semibold hidden sm:block">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Search Bar with Autocomplete Dropdown */}
          <div ref={searchContainerRef} className="relative order-2 w-full sm:w-auto sm:flex-1 sm:max-w-md sm:mx-4">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-[#00AFCB] dark:text-cyan-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setDropdownOpen(true)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-16 sm:pr-20 py-2 sm:py-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-[#D8E4ED] dark:border-cyan-500/25 focus:border-[#00AFCB] text-xs sm:text-sm text-[#172B3A] dark:text-slate-100 placeholder-[#687D8F] focus:outline-none transition shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-9 sm:right-10 p-1 text-[#687D8F] hover:text-[#172B3A] dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={handleRequestUserLocation}
                disabled={isLocating}
                className="absolute right-2.5 p-1 rounded-lg text-[#007A8E] dark:text-cyan-400 hover:text-[#005B6A] dark:hover:text-cyan-200 transition cursor-pointer"
                title={lang === 'kn' ? 'ನನ್ನ ಸ್ಥಳ ಪತ್ತೆಮಾಡಿ' : 'Detect My Location'}
              >
                <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 mt-2 max-h-80 overflow-y-auto rounded-xl bg-white dark:bg-[#09152b] border border-[#D8E4ED] dark:border-cyan-500/30 shadow-2xl p-2 z-50 animate-in fade-in">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#007A8E] dark:text-cyan-400 flex items-center justify-between border-b border-[#D8E4ED] dark:border-slate-800">
                  <span>{searchQuery ? (lang === 'kn' ? 'ಹುಡುಕಾಟದ ಫಲಿತಾಂಶಗಳು' : 'Search Results') : (lang === 'kn' ? 'ಕರ್ನಾಟಕ 31 ಜಿಲ್ಲೆಗಳು' : 'Karnataka 31 Districts & Hotspots')}</span>
                  {isSearching && <span className="text-[#00AFCB] dark:text-cyan-400 animate-pulse">{t.syncing}</span>}
                </div>

                <div className="mt-1 space-y-1">
                  {searchResults.map((loc) => {
                    const isSelected =
                      Math.abs(loc.latitude - currentLocation.latitude) < 0.01 &&
                      Math.abs(loc.longitude - currentLocation.longitude) < 0.01;

                    return (
                      <button
                        key={loc.id}
                        onClick={() => {
                          onSelectLocation(loc);
                          setDropdownOpen(false);
                          setSearchQuery('');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#E6F8FA] dark:bg-cyan-500/20 text-[#007A8E] dark:text-cyan-300 font-semibold'
                            : 'hover:bg-[#F4F8FC] dark:hover:bg-slate-800 text-[#172B3A] dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-[#00AFCB] dark:text-cyan-400' : 'text-[#687D8F]'}`} />
                          <div>
                            <span className="font-display font-medium block">{loc.name}</span>
                            <span className="text-[10px] text-[#526779] dark:text-slate-400 font-normal">
                              {loc.district}, {loc.state}
                            </span>
                          </div>
                        </div>

                        {isSelected && <Check className="w-4 h-4 text-[#00AFCB] dark:text-cyan-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Action Icons: Download App, Live Refresh, Theme Toggle, Settings
              On phones these move to the fixed bottom MobileActionBar */}
          <div className="hidden sm:block order-3 flex-none">
          <div className="flex items-center gap-2 p-1">
            {/* Download App for Android / Desktop - Hidden once downloaded */}
            <PWAInstallButton />

            {/* Bilingual AI Assistant Button */}
            <button
              onClick={onOpenAI}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#00AFCB]/15 to-cyan-500/20 hover:from-[#00AFCB]/25 hover:to-cyan-500/30 dark:bg-cyan-500/20 dark:hover:bg-cyan-500/30 border border-[#00AFCB]/40 dark:border-cyan-400/40 text-[#007A8E] dark:text-cyan-300 font-bold text-xs transition active:scale-95 cursor-pointer shadow-sm"
              title={t.aiAssistant}
            >
              <Sparkles className="w-4 h-4 text-[#00AFCB] dark:text-cyan-400 animate-pulse" />
              <span className="hidden md:inline">{t.askAI}</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 sm:p-2.5 rounded-xl bg-white hover:bg-[#F4F8FC] dark:bg-slate-900/80 dark:hover:bg-cyan-950 border border-[#D8E4ED] dark:border-slate-800 text-[#172B3A] dark:text-slate-300 hover:text-[#007A8E] dark:hover:text-cyan-300 transition active:scale-95 cursor-pointer shadow-sm relative"
              title={t.refresh}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#00AFCB] dark:text-cyan-400' : ''}`} />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </button>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 sm:p-2.5 rounded-xl bg-white hover:bg-[#F4F8FC] dark:bg-slate-900/80 dark:hover:bg-cyan-950 border border-[#D8E4ED] dark:border-slate-800 text-[#172B3A] dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-300 transition active:scale-95 cursor-pointer shadow-sm"
              title={theme === 'dark' ? t.lightTheme : t.darkTheme}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-[#00AFCB]" />}
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 sm:p-2.5 rounded-xl bg-white hover:bg-[#F4F8FC] dark:bg-slate-900/80 dark:hover:bg-cyan-950 border border-[#D8E4ED] dark:border-slate-800 text-[#172B3A] dark:text-slate-300 hover:text-[#007A8E] dark:hover:text-cyan-300 transition active:scale-95 cursor-pointer shadow-sm"
              title={t.settings}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
          </div>
        </div>

        {/* Quick Karnataka District Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar text-xs border-t border-[#D8E4ED] dark:border-slate-800/60">
          <span className="text-[10px] text-[#007A8E] dark:text-cyan-400 uppercase tracking-wider font-bold mr-1 flex-shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {t.quickPillsLabel}
          </span>
          {featuredPills.map((loc) => {
            const isCurrent =
              Math.abs(loc.latitude - currentLocation.latitude) < 0.01 &&
              Math.abs(loc.longitude - currentLocation.longitude) < 0.01;

            return (
              <button
                key={loc.id}
                onClick={() => onSelectLocation(loc)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-lg transition cursor-pointer text-xs ${
                  isCurrent
                    ? 'bg-[#E6F8FA] dark:bg-cyan-500/25 text-[#007A8E] dark:text-cyan-300 border border-[#00AFCB] font-bold shadow-sm'
                    : 'bg-white dark:bg-slate-900/60 hover:bg-[#F4F8FC] hover:border-[#00AFCB] dark:hover:bg-slate-800 text-[#172B3A] dark:text-slate-300 font-semibold border border-[#D8E4ED] dark:border-slate-800'
                }`}
              >
                {loc.name}
              </button>
            );
          })}
        </div>
      </div>
    </header>
    </>
  );
};
